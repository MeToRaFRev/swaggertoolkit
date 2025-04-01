import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  Box,
  Chip
} from '@mui/material';
import { Search, Shield } from 'lucide-react';
import { getRequestBodyData as getRequestBodyDataOAS3 } from '../utils/openapi';
import { getRequestBodyData as getRequestBodyDataSwagger2 } from '../utils/swagger';

function TabPanel(props) {
  const { value, index, children, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

// Function to convert request schema to JSON Schema v4
const convertToJSONSchemaV4 = (data) => {
  if (!data) return null;
  // For demonstration, we add the $schema attribute.
  // Replace or extend this logic to perform a full conversion.
  return {
    ...data,
    $schema: "http://json-schema.org/draft-04/schema#"
  };
};

// Function to extract a single path swagger from the full spec
const extractSinglePathSwagger = (spec, endpoint, method, parsedEndpoint) => {
  if (!spec) return null;
  return {
    ...spec,
    paths: {
      [endpoint]: {
        [method]: parsedEndpoint
      }
    }
  };
};

export default function EndpointDetails({ spec, endpoint, method }) {
  const [parsedEndpoint, setParsedEndpoint] = React.useState(null);
  const [tabValue, setTabValue] = React.useState('schema');

  React.useEffect(() => {
    if (spec && endpoint && method) {
      try {
        // Use the fully resolved spec from FileUploader
        const endpointData = spec.paths[endpoint][method];
        setParsedEndpoint(endpointData);
      } catch (error) {
        console.error('Error parsing endpoint details:', error);
        setParsedEndpoint(null);
      }
    } else {
      setParsedEndpoint(null);
    }
  }, [spec, endpoint, method]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!endpoint || !method || !parsedEndpoint) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
        <Box>
          <Search style={{ width: 48, height: 48, marginBottom: 16 }} />
          <Typography variant="body1">
            Select an endpoint to view its details
          </Typography>
        </Box>
      </Box>
    );
  }

  // Determine requestBodyData based on the spec type.
  let requestBodyData = null;
  if (spec && parsedEndpoint) {
    if (spec.openapi) {
      requestBodyData = getRequestBodyDataOAS3(spec,parsedEndpoint);
    } else if (spec.swagger) {
      requestBodyData = getRequestBodyDataSwagger2(spec,parsedEndpoint);
    }
  }

  // Transform request data into JSON Schema v4
  const jsonSchemaV4 = convertToJSONSchemaV4(requestBodyData);

  // Extract single path swagger spec
  const singlePathSwagger = extractSinglePathSwagger(spec, endpoint, method, parsedEndpoint);

  return (
    <Box sx={{ height: '100%', p: 3, overflowY: 'auto' }}>
      <Box
        sx={{
          maxWidth: '960px',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label={method.toUpperCase()} sx={{
            backgroundColor: {
              get: '#DBEAFE',
              post: '#DCFCE7',
              put: '#FFEDD5',
              delete: '#FEE2E2',
              patch: '#FEF9C3'
            }[method.toLowerCase()] || {}
          }} />
          <Typography
            component="code"
            sx={{ fontSize: '1.125rem', fontFamily: 'monospace' }}
          >
            {endpoint}
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Endpoint Details Tabs">
          <Tab
            label="schema v4"
            value="schema"
            id="tab-schema"
            aria-controls="tabpanel-schema"
          />
          <Tab
            label="singleout"
            value="singleout"
            id="tab-singleout"
            aria-controls="tabpanel-singleout"
          />
        </Tabs>

        {/* schema v4 Tab */}
        <TabPanel value={tabValue} index="schema">
          <Card>
            <CardHeader title={<Typography variant="h6">JSON Schema v4</Typography>} />
            <CardContent>
              {jsonSchemaV4 ? (
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto'
                  }}
                >
                  <code>{JSON.stringify(jsonSchemaV4, null, 2)}</code>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No request body data to convert
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* singleout Tab */}
        <TabPanel value={tabValue} index="singleout">
          <Card>
            <CardHeader title={<Typography variant="h6">Single Path Swagger</Typography>} />
            <CardContent>
              {singlePathSwagger ? (
                <Box
                  component="pre"
                  sx={{
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto'
                  }}
                >
                  <code>{JSON.stringify(singlePathSwagger, null, 2)}</code>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unable to extract single path swagger
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
}
