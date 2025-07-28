/**
 * Validates a password for strength requirements
 * 
 * @param {string} password - The password to validate
 * @returns {Object} - Object containing validation result and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: 'Password is strong' };
};

/**
 * Validates an Aadhar number (12 digits)
 * 
 * @param {string} aadhar - The Aadhar number to validate
 * @returns {Object} - Object containing validation result and message
 */
export const validateAadhar = (aadhar) => {
  // If empty, it's valid (since it's optional)
  if (!aadhar) {
    return { isValid: true, message: '' };
  }
  
  // Check if it's exactly 12 digits
  if (!/^\d{12}$/.test(aadhar)) {
    return { isValid: false, message: 'Aadhar number must be exactly 12 digits' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates a mobile number (10 digits)
 * 
 * @param {string} mobile - The mobile number to validate
 * @returns {Object} - Object containing validation result and message
 */
export const validateMobile = (mobile) => {
  // If empty, it's valid (since it's optional)
  if (!mobile) {
    return { isValid: true, message: '' };
  }
  
  // Check if it's exactly 10 digits
  if (!/^\d{10}$/.test(mobile)) {
    return { isValid: false, message: 'Mobile number must be exactly 10 digits' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates a username
 * 
 * @param {string} username - The username to validate
 * @returns {Object} - Object containing validation result and message
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (username.length < 4) {
    return { isValid: false, message: 'Username must be at least 4 characters long' };
  }
  
  // Check for valid characters (letters, numbers, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, underscore and hyphen' };
  }
  
  return { isValid: true, message: '' };
};