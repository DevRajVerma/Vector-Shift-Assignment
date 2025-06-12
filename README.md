# Integration Platform

A powerful integration platform that allows you to connect and manage data from multiple services including HubSpot, Notion, and Airtable. This platform provides a unified interface to view and manage your data across different services.

## Features

- **Multi-Service Integration**: Connect with HubSpot, Notion, and Airtable
- **Unified Data View**: View all your data in a consistent, organized format
- **Real-time Data Loading**: Load and refresh data on demand
- **User-friendly Interface**: Clean, modern UI with intuitive controls
- **Secure Authentication**: OAuth2-based authentication for all services

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Python 3.8+**
2. **Node.js 14+ and npm**
3. **Redis Server**
4. **Git**

### Setting up Redis

#### For Windows Users (WSL):
1. Install WSL2 and Ubuntu:
   ```bash
   wsl --install -d Ubuntu
   ```
2. Open Ubuntu terminal and install Redis:
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```
3. Start Redis server:
   ```bash
   sudo service redis-server start
   ```

#### For Linux Users:
```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

#### For macOS Users:
```bash
brew install redis
brew services start redis
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Vector-Shift-Assignment-main
   ```
   You don't have to clone anything as you get this in zip folder

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

## Configuration - I am currently providing my developer credentials for configuration, You can use them to run the app, but If I remove then You have to add your own credentials, You can skip this section for now

### HubSpot Configuration
1. Create a HubSpot developer account
2. Create a new app in the HubSpot developer portal
3. Set the redirect URI to: `http://localhost:8000/integrations/hubspot/oauth2callback`
4. Update the `CLIENT_ID` and `CLIENT_SECRET` in `backend/integrations/hubspot.py`

### Notion Configuration
1. Create a Notion integration at https://www.notion.so/my-integrations
2. Set the redirect URI to: `http://localhost:8000/integrations/notion/oauth2callback`
3. Update the `CLIENT_ID` and `CLIENT_SECRET` in `backend/integrations/notion.py`

### Airtable Configuration
1. Create an Airtable account
2. Create a new app in the Airtable developer portal
3. Set the redirect URI to: `http://localhost:8000/integrations/airtable/oauth2callback`
4. Update the `CLIENT_ID` and `CLIENT_SECRET` in `backend/integrations/airtable.py`

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python -m uvicorn main:app
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   Make Sure no other app running on `http://localhost:3000`, as backend can only be accessed using 3000

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Connecting to Services**:
   - Select the service you want to connect to (HubSpot, Notion, or Airtable)
   - Click "Connect" and follow the OAuth flow
   - Authorize the application to access your data

2. **Loading Data**:
   - After connecting, click "Load Data" to fetch your data
   - The data will be displayed in a table format
   - Use the refresh button to update the data

3. **Viewing Data**:
   - Data is organized in a table with sortable columns
   - Click on "View" links to open items in their respective services
   - Use the search functionality to filter data

## Project Structure

```
integrations_technical_assessment/
├── backend/
│   ├── integrations/
│   │   ├── hubspot.py
│   │   ├── notion.py
│   │   ├── airtable.py
│   │   └── integration_item.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── integrations/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Troubleshooting

1. **Redis Connection Issues**:
   - Ensure Redis server is running
   - Check Redis connection settings in the backend
   - Verify Redis port (default: 6379) is not blocked

2. **OAuth Issues**:
   - Verify redirect URIs match exactly
   - Check client IDs and secrets
   - Ensure proper scopes are requested

3. **Data Loading Issues**:
   - Check browser console for errors
   - Verify API credentials are valid
   - Check network tab for API responses

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact drverma2704@gmail.com