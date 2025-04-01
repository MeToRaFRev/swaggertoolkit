// utils/specResolvers/sharedResolver.js

/**
 * Resolves a single $ref using the provided shared definitions/components.
 * @param {object} shared - The shared definitions/components object.
 * @param {string} ref - The reference string (e.g., "#/definitions/User" or "#/components/schemas/User").
 * @returns {object|null} - The resolved object or null if not found.
 */
export const resolveRef = (shared, ref) => {
    if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
    // Remove the initial "#/" and split the remaining path.
    const parts = ref.substring(2).split('/');
    // If the first part is "definitions" or "components", drop it since `shared` is already provided.
    if (parts[0] === 'definitions' || parts[0] === 'components') {
      parts.shift();
    }
    // Traverse the shared object using the remaining parts.
    return parts.reduce((acc, part) => acc?.[part], shared);
  };
  
  /**
   * Recursively resolves all $refs in the given object using the provided shared definitions/components.
   * @param {object} shared - The shared definitions/components object.
   * @param {object|array} obj - The object or array to resolve.
   * @returns {object|array} - The resolved object or array without $refs.
   */
  export const resolveRefs = (shared, obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => resolveRefs(shared, item));
    } else if (obj && typeof obj === 'object') {
      if (obj.$ref) {
        const resolved = resolveRef(shared, obj.$ref);
        return resolveRefs(shared, resolved);
      }
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, resolveRefs(shared, value)])
      );
    }
    return obj;
  };
  