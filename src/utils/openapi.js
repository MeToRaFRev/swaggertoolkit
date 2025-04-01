// openapi3.js

import { resolveRefs } from './sharedResolver.js';


export function getRequestBodyData(parsedEndpoint) {
    // OpenAPI 3: Prefer requestBody property if available.
    if (parsedEndpoint.requestBody) {
        return parsedEndpoint.requestBody;
    }
    // Fallback for cases where requestBody might not be present (not common in OAS3)
    const allParameters = parsedEndpoint.parameters || [];
    const bodyParameters = allParameters.filter(
        (param) => param.in === 'body' || param.in === 'formData'
    );
    console.log('Body Parameters:', bodyParameters);
    return bodyParameters
}
