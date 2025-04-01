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
import { FileJson, Search, Shield } from 'lucide-react';

const getMethodChipStyles = (method) => {
  const lower = method.toLowerCase();
  switch (lower) {
    case 'get':
      return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
    case 'post':
      return { backgroundColor: '#DCFCE7', color: '#166534' };
    case 'put':
      return { backgroundColor: '#FFEDD5', color: '#C2410C' };
    case 'delete':
      return { backgroundColor: '#FEE2E2', color: '#991B1B' };
    case 'patch':
      return { backgroundColor: '#FEF9C3', color: '#92400E' };
    default:
      return {};
  }
};

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

// Helper function to format schema details
const formatSchema = (schema) => {
  if (!schema) return 'unknown';
  if (schema.type) {
    if (schema.type === 'array' && schema.items) {
      return `array of ${schema.items.type || 'object'}`;
    }
    return schema.type;
  }
  return JSON.stringify(schema);
};

export default function EndpointDetails({ spec, endpoint, method }) {
  const [parsedEndpoint, setParsedEndpoint] = React.useState(null);
  const [tabValue, setTabValue] = React.useState('params');

  React.useEffect(() => {
    if (spec && endpoint && method) {
      try {
        // Use the fully resolved spec from FileUploader
        const endpointData = spec.parsedSpec.paths[endpoint][method];
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

  // Separate parameters into non-body and body parameters
  const allParameters = parsedEndpoint.parameters || [];
  const nonBodyParameters = allParameters.filter(param => param.in !== 'body');
  const bodyParameters = allParameters.filter(param => param.in === 'body');

  // For request body, prefer OpenAPI 3's requestBody if available,
  // otherwise fallback to a body parameter (common in Swagger 2.0)
  const requestBodyData = parsedEndpoint.requestBody || (bodyParameters.length > 0 ? bodyParameters[0] : null);

  return (
    <Box sx={{ height: '100%', p: 3, overflowY: 'auto' }}>
      <Box sx={{ maxWidth: '960px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label={method.toUpperCase()} sx={getMethodChipStyles(method)} />
          <Typography component="code" sx={{ fontSize: '1.125rem', fontFamily: 'monospace' }}>
            {endpoint}
          </Typography>
        </Box>

        {parsedEndpoint.description && (
          <Typography variant="body2" color="text.secondary">
            {parsedEndpoint.description}
          </Typography>
        )}

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Endpoint Details Tabs">
          <Tab label="Parameters" value="params" />
          <Tab label="Request Body" value="body" />
          <Tab label="Responses" value="responses" />
          <Tab label="Security" value="security" />
        </Tabs>

        {/* Parameters Tab */}
        <TabPanel value={tabValue} index="params">
          <Card>
            <CardHeader title={<Typography variant="h6">Parameters</Typography>} />
            <CardContent>
              {nonBodyParameters.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {nonBodyParameters.map((param, index) => (
                    <Box key={index} sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {param.name}
                        </Typography>
                        <Chip label={param.in} variant="outlined" size="small" />
                        {param.required && <Chip label="Required" color="error" size="small" />}
                      </Box>
                      {param.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {param.description}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        Type: {param.type || (param.schema && formatSchema(param.schema))}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No non-body parameters defined
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Request Body Tab */}
        <TabPanel value={tabValue} index="body">
          <Card>
            <CardHeader title={<Typography variant="h6">Request Body</Typography>} />
            <CardContent>
              {requestBodyData ? (
                // OpenAPI 3: requestBody typically has a "content" field
                requestBodyData.content ? (
                  Object.entries(requestBodyData.content).map(([mediaType, mediaObj], idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">{mediaType}</Typography>
                      <Box
                        component="pre"
                        sx={{
                          bgcolor: 'grey.50',
                          p: 2,
                          borderRadius: 1,
                          overflow: 'auto'
                        }}
                      >
                        <code>{JSON.stringify(mediaObj, null, 2)}</code>
                      </Box>
                    </Box>
                  ))
                ) : (
                  // Swagger 2.0: body parameter with a schema
                  <Box
                    component="pre"
                    sx={{
                      bgcolor: 'grey.50',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto'
                    }}
                  >
                    <code>{JSON.stringify(requestBodyData, null, 2)}</code>
                  </Box>
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No request body defined
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Responses Tab */}
        <TabPanel value={tabValue} index="responses">
          <Card>
            <CardHeader title={<Typography variant="h6">Responses</Typography>} />
            <CardContent>
              {parsedEndpoint.responses ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(parsedEndpoint.responses).map(([code, response]) => (
                    <Box key={code} sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={code}
                          color={code.startsWith('2') ? 'default' : 'error'}
                          size="small"
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {response.description}
                        </Typography>
                      </Box>
                      {response.content && (
                        <Box
                          component="pre"
                          sx={{
                            bgcolor: 'grey.50',
                            p: 2,
                            borderRadius: 1,
                            overflow: 'auto'
                          }}
                        >
                          <code>{JSON.stringify(response.content, null, 2)}</code>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No responses defined
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index="security">
          <Card>
            <CardHeader title={<Typography variant="h6">Security</Typography>} />
            <CardContent>
              {parsedEndpoint.security ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {parsedEndpoint.security.map((scheme, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Shield style={{ width: 16, height: 16, color: '#6c757d' }} />
                      <Typography variant="body2">
                        {Object.keys(scheme)[0]}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No security schemes defined
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
}
