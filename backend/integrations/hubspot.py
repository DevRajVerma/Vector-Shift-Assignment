# slack.py

import json
import secrets
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
import base64
import requests
from datetime import datetime
from typing import List, Optional
from integrations.integration_item import IntegrationItem
from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

# HubSpot OAuth credentials
CLIENT_ID = 'a4600bf9-2c4b-4209-aa7f-7b6c49b93c71'
CLIENT_SECRET = 'ecc69f7c-b759-45f9-be8d-d44c2e82489a'
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'

# HubSpot OAuth endpoints
SCOPES = [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.companies.read',
    'crm.objects.deals.read',
    'crm.schemas.contacts.read',
    'crm.schemas.companies.read',
    'crm.schemas.deals.read'
]
AUTHORIZATION_URL = f'https://app-na2.hubspot.com/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope={"%20".join(SCOPES)}'

class HubSpotError(Exception):
    """Custom exception for HubSpot integration errors"""
    pass

async def authorize_hubspot(user_id: str, org_id: str) -> str:
    """Initialize HubSpot OAuth flow"""
    try:
        state_data = {
            'state': secrets.token_urlsafe(32),
            'user_id': user_id,
            'org_id': org_id
        }
        encoded_state = json.dumps(state_data)
        await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', encoded_state, expire=600)
        return f'{AUTHORIZATION_URL}&state={encoded_state}'
    except Exception as e:
        raise HubSpotError(f"Failed to initialize HubSpot authorization: {str(e)}")

async def oauth2callback_hubspot(request: Request) -> HTMLResponse:
    """Handle HubSpot OAuth callback"""
    try:
        params = dict(request.query_params)
        state = json.loads(params.get('state', '{}'))
        code = params.get('code')
        
        if not code:
            raise HubSpotError("No authorization code received")

        user_id = state.get('user_id')
        org_id = state.get('org_id')
        
        if not user_id or not org_id:
            raise HubSpotError("Invalid state data")

        # Exchange code for access token
        token_url = 'https://api.hubapi.com/oauth/v1/token'
        data = {
            'grant_type': 'authorization_code',
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'redirect_uri': REDIRECT_URI,
            'code': code
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            
            if response.status_code != 200:
                raise HubSpotError(f"Failed to get access token: {response.text}")

            token_data = response.json()
            await add_key_value_redis(
                f'hubspot_credentials:{org_id}:{user_id}',
                json.dumps(token_data),
                expire=token_data.get('expires_in', 3600)
            )

        return HTMLResponse("""
            <html>
                <body>
                    <h1>HubSpot Integration Successful!</h1>
                    <p>You can close this window and return to the application.</p>
                    <script>window.close();</script>
                </body>
            </html>
        """)
    except Exception as e:
        raise HubSpotError(f"OAuth callback failed: {str(e)}")

async def get_hubspot_credentials(user_id: str, org_id: str) -> dict:
    """Get stored HubSpot credentials"""
    try:
        credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
        if not credentials:
            raise HubSpotError("No credentials found")
        return json.loads(credentials)
    except Exception as e:
        raise HubSpotError(f"Failed to get credentials: {str(e)}")

async def get_items_hubspot(credentials: str) -> List[IntegrationItem]:
    """Fetch contacts from HubSpot and return them as IntegrationItem objects"""
    if not credentials:
        raise HubSpotError("No credentials provided")

    try:
        credentials = json.loads(credentials)
        access_token = credentials.get('access_token')
        if not access_token:
            raise HubSpotError("No access token found in credentials")

        # Get contacts from HubSpot
        base_url = 'https://api.hubapi.com/crm/v3/objects/contacts'
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                base_url,
                headers=headers,
                params={
                    'limit': 100,
                    'properties': [
                        'firstname', 'lastname', 'email', 'phone',
                        'company', 'jobtitle', 'lifecyclestage'
                    ]
                }
            )
            
            if response.status_code != 200:
                raise HubSpotError(f"API request failed: {response.text}")

            data = response.json()
            contacts = data.get('results', [])
            
            if not contacts:
                return []

            # Use create_integration_item_metadata_object to create items
            items = []
            for contact in contacts:
                item = await create_integration_item_metadata_object(contact)
                items.append(item)

            return items

    except json.JSONDecodeError as e:
        raise HubSpotError(f"Invalid credentials format: {str(e)}")
    except Exception as e:
        raise HubSpotError(f"Failed to fetch contacts: {str(e)}")

async def create_integration_item_metadata_object(response_json):
    """Creates an IntegrationItem object from HubSpot API response data"""
    try:
        # Extract properties from the response
        properties = response_json.get('properties', {})
        
        # Get basic contact information
        first_name = properties.get('firstname', '')
        last_name = properties.get('lastname', '')
        email = properties.get('email', '')
        
        # Create a descriptive name
        name = f"{first_name} {last_name}".strip() or email or 'Unnamed Contact'
        
        # Create and return the IntegrationItem
        return IntegrationItem(
            id=response_json.get('id'),
            type='contact',
            name=name,
            creation_time=response_json.get('createdAt'),
            last_modified_time=response_json.get('updatedAt'),
            url=f"https://app.hubspot.com/contacts/{response_json.get('id')}",
            visibility=True
        )
    except Exception as e:
        raise HubSpotError(f"Failed to create integration item metadata: {str(e)}")