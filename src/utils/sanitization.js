/**
 * Utility functions for sanitizing user input to prevent XSS attacks
 */

/**
 * Sanitizes a string by removing HTML tags and special characters
 * 
 * @param {string} input - The string to sanitize
 * @returns {string} - The sanitized string
 */
const sanitizeString = (input) => {
  if (!input) return '';
  
  // Convert to string if not already
  const str = String(input);
  
  // Replace HTML tags and special characters
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes an object by sanitizing all string properties
 * 
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - A new object with sanitized properties
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? sanitizeString(item) : 
          typeof item === 'object' ? sanitizeObject(item) : 
          item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

// Export for CommonJS (Node.js)
module.exports = {
  sanitizeString,
  sanitizeObject
};

// Export for ES modules (Browser)
if (typeof window !== 'undefined') {
  window.sanitizationUtils = {
    sanitizeString,
    sanitizeObject
  };
}