
import { resolveRefs } from './sharedResolver';


// swagger2.js
export function getRequestBodyData(spec,parsedEndpoint) {
  // Swagger 2.0: request body is defined within parameters.
  const allParameters = parsedEndpoint.parameters || [];
  const bodyParameters = allParameters.filter(
    (param) => param.in === 'body' || param.in === 'formData'
  );
  if(bodyParameters.length === 0) {
    return null; // No body parameters found
  }
  // If there are body parameters, resolve any $refs within them.
  const shared = spec.definitions;
  if (!shared) {
    console.warn('No shared definitions found in the parsed endpoint.');
    return bodyParameters; // Return as is if no shared definitions
  }

  //if bodyParameters has a in : body then use it only
  const bodyParameter = bodyParameters.find(param => param.in === 'body')[0]
  if (bodyParameter) {
    console.log('Body Parameter:', bodyParameter[0]);
    const resolvedBody = resolveRefs(shared, bodyParameter.schema);
    return resolvedBody; // Return the resolved body parameter schema
  }
  // If no body parameter is found, and formData is present, formData can be a bunch of parameters
  const formDataParameters = bodyParameters.filter(param => param.in === 'formData');
  if (formDataParameters.length > 0) {
    return formDataParameters.map(param => resolveRefs(shared, param.schema));
  }
  return null; // No body parameters found
}
