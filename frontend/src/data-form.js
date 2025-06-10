import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from "axios";


const endpointMapping = {
  Notion: "notion",
  Airtable: "airtable",
};

export const DataForm = ({ integrationType, credentials }) => {
  const [loadedData, setLoadedData] = useState(null);
  const endpoint = endpointMapping[integrationType];

  const handleLoad = async () => {
    try {
      const formData = new FormData();
      formData.append("credentials", JSON.stringify(credentials));
      const response = await axios.post(
        `http://localhost:8000/integrations/${endpoint}/load`,
        formData
      );
      const data = response.data;
      setLoadedData(data);
    } catch (e) {
      alert(e?.response?.data?.detail);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      width="100%"
    >
      <Box display="flex" flexDirection="column" width="100%">
        {/* <TextField
                    label="Loaded Data"
                    value={loadedData ? JSON.stringify(loadedData, null, 2) : '' || ''}
                    sx={{mt: 2}}
                    InputLabelProps={{ shrink: true }}
                    disabled
                    multiline
                    maxRows={10}
                /> */}
        <Box sx={{ mt: 2, width: "100%" }}>
          {loadedData ? (
            <Box
              sx={{
                maxHeight: 300,
                overflow: "auto",
                border: "1px solid #ccc",
                p: 2,
              }}
            >
              {loadedData.map((item, index) => (
                <Box key={index} sx={{ mb: 2, p: 1, bgcolor: "#f5f5f5" }}>
                  <div>
                    <strong>Type:</strong> {item.type}
                  </div>
                  <div>
                    <strong>Name:</strong> {item.name}
                  </div>
                  <div>
                    <strong>ID:</strong> {item.id}
                  </div>
                  {item.parent_id && (
                    <div>
                      <strong>Parent:</strong> {item.parent_name} (ID:{" "}
                      {item.parent_id})
                    </div>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No data loaded yet.
            </Typography>
          )}
        </Box>
        <Button onClick={handleLoad} sx={{ mt: 2 }} variant="contained">
          Load Data
        </Button>
        <Button
          onClick={() => setLoadedData(null)}
          sx={{ mt: 1 }}
          variant="contained"
        >
          Clear Data
        </Button>
      </Box>
    </Box>
  );
};
