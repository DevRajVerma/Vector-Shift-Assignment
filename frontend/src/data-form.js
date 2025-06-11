import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from "axios";

const endpointMapping = {
  Notion: "notion",
  Airtable: "airtable",
  HubSpot: "hubspot",
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

const formatFieldName = (field) => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const renderData = (data, type) => {
  if (!data || data.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No data available
      </Alert>
    );
  }

  // Common fields across all integrations
  const commonFields = ['id', 'type', 'name', 'creation_time', 'last_modified_time', 'url'];
  
  // Get all unique fields from the data
  const allFields = [...new Set(data.flatMap(item => Object.keys(item)))];
  
  // Filter out common fields to get custom fields
  const customFields = allFields.filter(field => !commonFields.includes(field));

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2, 
        maxHeight: 400, 
        overflow: 'auto',
        boxShadow: 2,
        borderRadius: 2
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {commonFields.map(field => (
              <TableCell 
                key={field} 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              >
                {formatFieldName(field)}
              </TableCell>
            ))}
            {customFields.map(field => (
              <TableCell 
                key={field} 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }}
              >
                {formatFieldName(field)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id || index}
              sx={{ 
                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                '&:hover': { backgroundColor: 'action.selected' }
              }}
            >
              {commonFields.map(field => (
                <TableCell key={field}>
                  {field === 'url' ? (
                    <Tooltip title="Open in new tab">
                      <a 
                        href={item[field]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        View
                      </a>
                    </Tooltip>
                  ) : field.includes('time') ? (
                    formatDate(item[field])
                  ) : (
                    item[field]?.toString() || '-'
                  )}
                </TableCell>
              ))}
              {customFields.map(field => (
                <TableCell key={field}>
                  {item[field]?.toString() || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const DataForm = ({ integrationType, credentials }) => {
  const [loadedData, setLoadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endpoint = endpointMapping[integrationType];

  const handleLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("credentials", JSON.stringify(credentials));
      const response = await axios.post(
        `http://localhost:8000/integrations/${endpoint}/load`,
        formData
      );
      const data = response.data;
      setLoadedData(data);
    } catch (e) {
      setError(e?.response?.data?.detail || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center', 
        mb: 2,
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="contained" 
            onClick={handleLoad}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          >
            {loading ? 'Loading...' : 'Load Data'}
          </Button>
          {loadedData && (
            <Typography variant="body2" color="text.secondary">
              Loaded {loadedData.length} items
            </Typography>
          )}
        </Box>
        {loadedData && (
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleLoad} 
              disabled={loading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loadedData && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
            {integrationType} Data
          </Typography>
          {renderData(loadedData, integrationType)}
        </Box>
      )}
    </Box>
  );
};
