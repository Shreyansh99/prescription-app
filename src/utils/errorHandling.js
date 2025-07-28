/**
 * Utility functions for error handling throughout the application
 * Provides consistent error handling, validation, and reporting
 */

/**
 * Error codes for the application
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_OPERATION_ERROR: 'FILE_OPERATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  EXPORT_ERROR: 'EXPORT_ERROR',
  PRINT_ERROR: 'PRINT_ERROR',
  IPC_ERROR: 'IPC_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Safely handles IPC communication by ensuring objects are serializable
 * Prevents "An object could not be cloned" errors in Electron IPC
 * 
 * @param {Function} ipcFunction - The IPC function to call (e.g., window.api.savePrescription)
 * @param {any} data - The data to send through IPC
 * @param {Object} options - Additional options
 * @returns {Promise<any>} - The result from the IPC call
 */
export const safeIpcCall = async (ipcFunction, data, options = {}) => {
  try {
    // First, ensure the data is serializable by converting to and from JSON
    // This prevents sending non-serializable objects like functions, DOM nodes, etc.
    const serializedData = data ? JSON.parse(JSON.stringify(data)) : undefined;
    
    // Call the IPC function with the serialized data
    const result = await ipcFunction(serializedData);
    
    // Check if the result indicates an error from the main process
    if (result && result.error && result.success === false) {
      console.warn('IPC call returned an error:', result.error);
      
      // If toast notification is requested, show it
      if (options.showErrorToast && window.toast) {
        window.toast({
          title: options.errorTitle || 'Operation Failed',
          description: result.error.message || result.message || 'An error occurred',
          variant: 'destructive'
        });
      }
      
      return result;
    }
    
    return result;
  } catch (error) {
    // Handle specific error types
    if (error.message && error.message.includes('could not be cloned')) {
      console.error('IPC serialization error:', error);
      const errorObj = createErrorObject(
        ErrorCodes.IPC_ERROR,
        'Data contains values that cannot be sent between processes. Please check for circular references or non-serializable objects.',
        error
      );
      
      // If toast notification is requested, show it
      if (options.showErrorToast && window.toast) {
        window.toast({
          title: options.errorTitle || 'Communication Error',
          description: errorObj.message,
          variant: 'destructive'
        });
      }
      
      return { success: false, error: errorObj };
    }
    
    // Log the error
    console.error('IPC call error:', error);
    
    // Create standardized error response
    const errorObj = createErrorObject(
      ErrorCodes.IPC_ERROR,
      error.message || 'Failed to communicate with the application',
      error
    );
    
    // If toast notification is requested, show it
    if (options.showErrorToast && window.toast) {
      window.toast({
        title: options.errorTitle || 'Communication Error',
        description: errorObj.message,
        variant: 'destructive'
      });
    }
    
    return { success: false, error: errorObj };
  }
};

/**
 * Safely reads and parses JSON data
 * 
 * @param {Function} readFunction - Function that reads JSON data (e.g., window.api.getPrescriptions)
 * @param {Object} options - Additional options
 * @returns {Promise<any>} - The parsed data
 */
export const safeDataRead = async (readFunction, options = {}) => {
  try {
    const result = await readFunction();
    
    // Check if result is null or undefined
    if (result === null || result === undefined) {
      console.warn('Data read returned null or undefined');
      
      if (options.defaultValue !== undefined) {
        return options.defaultValue;
      }
      
      // If no default value is provided, return empty array or object based on expected type
      return options.expectedType === 'array' ? [] : {};
    }
    
    return result;
  } catch (error) {
    console.error('Data read error:', error);
    
    // Create standardized error response
    const errorObj = createErrorObject(
      ErrorCodes.FILE_OPERATION_ERROR,
      `Failed to read data: ${error.message}`,
      error
    );
    
    // If toast notification is requested, show it
    if (options.showErrorToast && window.toast) {
      window.toast({
        title: options.errorTitle || 'Data Read Error',
        description: errorObj.message,
        variant: 'destructive'
      });
    }
    
    // Return default value or empty structure if error occurs
    if (options.defaultValue !== undefined) {
      return options.defaultValue;
    }
    
    return options.expectedType === 'array' ? [] : {};
  }
};

/**
 * Safely accesses nested properties in an object without throwing errors
 * Prevents "Cannot read property of undefined" errors
 * 
 * @param {Object} obj - The object to read from
 * @param {string|Array} path - The property path to read (e.g., 'user.profile.name' or ['user', 'profile', 'name'])
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} - The value at the path or the default value
 */
export const safeObjectAccess = (obj, path, defaultValue = null) => {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }
  
  // Handle array path or string path
  const parts = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current === undefined ? defaultValue : current;
};

/**
 * Validates required fields in an object
 * 
 * @param {Object} data - The data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} - Object with isValid flag and errors object
 */
export const validateRequiredFields = (data, requiredFields, options = {}) => {
  const errors = {};
  let isValid = true;
  
  // Check if data is null or undefined
  if (data === null || data === undefined) {
    return { 
      isValid: false, 
      errors: { _form: 'No data provided' } 
    };
  }
  
  requiredFields.forEach(field => {
    // Handle field with custom validation
    if (typeof field === 'object' && field.name) {
      const fieldName = field.name;
      const fieldValue = data[fieldName];
      
      // Check if field exists
      if (fieldValue === undefined || fieldValue === null || 
          (typeof fieldValue === 'string' && !fieldValue.trim())) {
        errors[fieldName] = field.message || `${fieldName} is required`;
        isValid = false;
      } 
      // If custom validator function is provided, use it
      else if (field.validator && typeof field.validator === 'function') {
        const validationResult = field.validator(fieldValue, data);
        if (validationResult !== true) {
          errors[fieldName] = validationResult || `Invalid ${fieldName}`;
          isValid = false;
        }
      }
    } 
    // Handle simple field name string
    else {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors[field] = `${field} is required`;
        isValid = false;
      }
    }
  });
  
  // If toast notification is requested and there are errors, show it
  if (!isValid && options.showErrorToast && window.toast) {
    window.toast({
      title: options.errorTitle || 'Validation Error',
      description: options.errorMessage || 'Please check the form for errors',
      variant: 'destructive'
    });
  }
  
  return { isValid, errors };
};

/**
 * Creates a standardized error object for consistent error handling
 * 
 * @param {string} code - Error code
 * @param {string} message - User-friendly error message
 * @param {Error} originalError - The original error object
 * @returns {Object} - Standardized error object
 */
export const createErrorObject = (code, message, originalError = null) => {
  return {
    code,
    message,
    timestamp: new Date().toISOString(),
    originalError: originalError ? originalError.toString() : null,
    stack: originalError?.stack || null
  };
};

/**
 * Wraps an async function with error handling
 * 
 * @param {Function} fn - The async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} - Wrapped function with error handling
 */
export const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${options.functionName || 'function'}:`, error);
      
      // Create standardized error response
      const errorObj = createErrorObject(
        options.errorCode || ErrorCodes.UNKNOWN_ERROR,
        options.errorMessage || error.message || 'An unexpected error occurred',
        error
      );
      
      // If toast notification is requested, show it
      if (options.showErrorToast && window.toast) {
        window.toast({
          title: options.errorTitle || 'Error',
          description: errorObj.message,
          variant: 'destructive'
        });
      }
      
      // If a custom error handler is provided, call it
      if (options.onError && typeof options.onError === 'function') {
        options.onError(error, ...args);
      }
      
      return { success: false, error: errorObj };
    }
  };
};