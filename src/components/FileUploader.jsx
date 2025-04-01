import React, { useState, useCallback } from 'react';
import { Button, Card, CardContent, CardHeader, Typography, TextField, Alert, Box } from '@mui/material';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import yaml from 'js-yaml'; // Make sure to install js-yaml: npm install js-yaml

// Helper function to resolve a $ref pointer in the spec
const resolveRef = (root, ref) => {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const parts = ref.substring(2).split('/');
  let result = root;
  for (let part of parts) {
    if (result && Object.prototype.hasOwnProperty.call(result, part)) {
      result = result[part];
    } else {
      return null;
    }
  }
  return result;
};

// Recursively resolve all $ref in the object
const resolveRefs = (obj, root) => {
  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, root));
  } else if (obj && typeof obj === 'object') {
    if (obj.$ref) {
      const resolved = resolveRef(root, obj.$ref);
      return resolveRefs(resolved, root);
    }
    const result = {};
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = resolveRefs(obj[key], root);
      }
    }
    return result;
  }
  return obj;
};

export default function FileUploader({ onSpecUpload }) {
  const [specContent, setSpecContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  // Manual parsing that supports Swagger 2.0.x and OpenAPI 3.0.x
  const validateAndParseSpec = async (content) => {
    setIsProcessing(true);
    try {
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (jsonErr) {
        // If JSON parsing fails, try YAML parsing
        try {
          parsed = yaml.load(content);
        } catch (yamlErr) {
          throw new Error("Unable to parse API specification as JSON or YAML");
        }
      }

      // Validate whether it's a Swagger 2.0.x or OpenAPI 3.0.x spec
      let specType = null;
      if (parsed.swagger && typeof parsed.swagger === 'string' && parsed.swagger.startsWith("2.")) {
        specType = "swagger";
      } else if (parsed.openapi && typeof parsed.openapi === 'string' && parsed.openapi.startsWith("3.")) {
        specType = "openapi";
      } else {
        throw new Error("API specification is neither Swagger 2.0.x nor OpenAPI 3.0.x");
      }

      // Recursively resolve $ref pointers
      const resolvedSpec = resolveRefs(parsed, parsed);

      // Extract API info (from the 'info' object)
      let title = "Untitled API";
      let version = "";
      let description = "";
      if (resolvedSpec.info) {
        title = resolvedSpec.info.title || title;
        version = resolvedSpec.info.version || version;
        description = resolvedSpec.info.description || description;
      } else {
        throw new Error("API specification missing 'info' object");
      }

      return {
        title,
        description,
        version,
        spec_type: specType,
        spec_content: content,
        parsedSpec: resolvedSpec, // Fully resolved spec for downstream usage
      };
    } catch (error) {
      throw new Error(error.message || "Failed to parse API specification");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const parsedSpec = await validateAndParseSpec(content);
          onSpecUpload(parsedSpec);
        } catch (error) {
          setError(error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target.result;
          const parsedSpec = await validateAndParseSpec(content);
          onSpecUpload(parsedSpec);
        } catch (error) {
          setError(error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = async () => {
    try {
      const parsedSpec = await validateAndParseSpec(specContent);
      onSpecUpload(parsedSpec);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <FileJson style={{ width: 24, height: 24, color: '#1976d2' }} />
            <Typography variant="h6">Upload API Specification</Typography>
          </Box>
        }
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity="error" icon={<AlertCircle style={{ width: 16, height: 16 }} />}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'grey.300',
            borderRadius: 1,
            p: 4,
            textAlign: 'center',
            transition: 'background-color 0.2s, border-color 0.2s',
            backgroundColor: isDragging ? 'primary.light' : 'transparent',
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload style={{ width: 48, height: 48, marginBottom: 16, color: 'grey' }} />
          <Typography variant="h6" gutterBottom>
            Drag and drop your OpenAPI/Swagger file here
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            or select a file from your computer
          </Typography>
          <Box>
            <input
              type="file"
              accept=".json,.yaml,.yml"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" disabled={isProcessing}>
                Browse Files
              </Button>
            </label>
          </Box>
        </Box>

        <Box>
          <TextField
            label="Or paste your OpenAPI/Swagger specification here..."
            multiline
            rows={8}
            value={specContent}
            onChange={(e) => setSpecContent(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{ style: { fontFamily: 'monospace', fontSize: 14 } }}
          />
          <Button 
            variant="contained" 
            onClick={handlePaste}
            disabled={!specContent.trim() || isProcessing}
            sx={{ mt: 2 }}
          >
            {isProcessing ? 'Processing...' : 'Parse Specification'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
