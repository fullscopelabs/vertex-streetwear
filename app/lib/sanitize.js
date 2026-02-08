/**
 * Security utilities for input validation and sanitization
 * Addresses StackHawk findings: Format String Error (Medium Risk)
 */

/**
 * Sanitize input to prevent format string vulnerabilities
 * Removes or escapes format specifiers like %s, %n, %x, etc.
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export function sanitizeFormatString(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove format string specifiers that could be exploited
  // This prevents %s, %n, %x, %d, and similar format codes
  return input.replace(/%[sdxnfp!]/gi, '');
}

/**
 * Sanitize URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} - Sanitized parameters object
 */
export function sanitizeSearchParams(searchParams) {
  const sanitized = {};
  
  for (const [key, value] of searchParams.entries()) {
    // Sanitize both key and value
    const cleanKey = sanitizeFormatString(key);
    const cleanValue = sanitizeFormatString(value);
    
    if (cleanKey) {
      sanitized[cleanKey] = cleanValue;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize form input
 * @param {FormData} formData - Form data to sanitize
 * @returns {Object} - Sanitized form data as object
 */
export function sanitizeFormData(formData) {
  const sanitized = {};
  
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      sanitized[sanitizeFormatString(key)] = sanitizeFormatString(value);
    } else {
      // Keep non-string values (like File objects) as-is
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Safe query parameter extraction with validation
 * @param {Request} request - Request object
 * @param {string} paramName - Parameter name to extract
 * @param {string} defaultValue - Default value if parameter is missing
 * @returns {string} - Sanitized parameter value
 */
export function getSafeQueryParam(request, paramName, defaultValue = '') {
  const url = new URL(request.url);
  const value = url.searchParams.get(paramName);
  
  if (!value) {
    return defaultValue;
  }
  
  return sanitizeFormatString(value);
}

/**
 * Validate input length to prevent DoS attacks
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateInputLength(input, maxLength = 1000) {
  return typeof input === 'string' && input.length <= maxLength;
}

/**
 * Comprehensive input sanitization for security-sensitive operations
 * @param {string} input - Input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(
  input,
  options = {
    maxLength: 1000,
    allowFormatStrings: false,
    trim: true,
  },
) {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Trim whitespace if requested
  if (options.trim) {
    sanitized = sanitized.trim();
  }

  // Validate length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  // Remove format string specifiers unless explicitly allowed
  if (!options.allowFormatStrings) {
    sanitized = sanitizeFormatString(sanitized);
  }

  return sanitized;
}
