import React, { useState } from 'react';
import { Container, Card, Box } from '@mui/material';
import FileUploader from './components/FileUploader';
import APINavigation from './components/APINavigation';
import EndpointDetails from './components/EndpointDetails';
import SplitPane from './components/SplitPane';
import '@fontsource/roboto/500.css';

export default function App() {
  const [apiSpec, setApiSpec] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleSpecUpload = (specData) => {
    try {
      // Simply set the spec data returned by FileUploader.
      // specData now contains a `parsedSpec` property for downstream usage.
      setApiSpec(specData);
    } catch (error) {
      console.error('Error saving API spec:', error);
    }
  };

  const handleEndpointSelect = (endpoint, method) => {
    setSelectedEndpoint(endpoint);
    setSelectedMethod(method);
  };

  if (!apiSpec) {
    return (
      <Container maxWidth="md" sx={{ p: 3 }}>
        <Card sx={{ mx: 'auto', maxWidth: 800, p: 2 }}>
          <FileUploader onSpecUpload={handleSpecUpload} />
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 2rem)', m: 2 }}>
      <SplitPane>
        <APINavigation 
          spec={apiSpec}
          setSpec={setApiSpec}
          onEndpointSelect={handleEndpointSelect}
          selectedEndpoint={selectedEndpoint}
          selectedMethod={selectedMethod}
        />
        <EndpointDetails
          spec={apiSpec}
          endpoint={selectedEndpoint}
          method={selectedMethod}
        />
      </SplitPane>
    </Box>
  );
}
