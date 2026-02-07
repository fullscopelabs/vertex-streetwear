/**
 * Shared validation & sanitization utilities for account forms.
 *
 * Defence-in-depth: these run server-side in the action, complementing
 * the HTML5 constraint-validation attributes on the client. Values that
 * reach the Shopify Customer Account API mutations are therefore always
 * trimmed, length-capped, and pattern-checked before the GraphQL call.
 */

// ───────────────────────────── Sanitisation ─────────────────────────────

/**
 * Strip HTML / script tags, trim, collapse internal whitespace, cap length.
 * @param {string} raw
 * @param {number} [maxLen=200]
 * @returns {string}
 */
export function sanitizeText(raw, maxLen = 200) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&[#\w]+;/g, '') // strip HTML entities (&amp; &#123; etc.)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .replace(/\s{2,}/g, ' ') // collapse whitespace
    .slice(0, maxLen);
}

/**
 * Extract + sanitise a single string from FormData.
 * Returns empty string if the key is absent or not a string.
 * @param {FormData} form
 * @param {string} key
 * @param {number} [maxLen=200]
 * @returns {string}
 */
export function getFormString(form, key, maxLen = 200) {
  const raw = form.get(key);
  if (typeof raw !== 'string') return '';
  return sanitizeText(raw, maxLen);
}

// ──────────────────────────── Field Validators ──────────────────────────

/** @typedef {{ field: string; message: string }} FieldError */

/**
 * Validate a person name (first / last).
 * Allows Unicode letters, spaces, hyphens, apostrophes, periods.
 * @param {string} value
 * @param {string} label  e.g. "First name"
 * @returns {FieldError|null}
 */
export function validateName(value, label) {
  if (!value || value.length === 0) {
    return {field: label, message: `${label} is required.`};
  }
  // Check for whitespace-only input
  if (value.trim().length === 0) {
    return {field: label, message: `${label} cannot be empty or whitespace only.`};
  }
  if (value.length < 1 || value.length > 50) {
    return {field: label, message: `${label} must be between 1 and 50 characters.`};
  }
  // Allow letters (any script), spaces, hyphens, apostrophes, periods
  // Using Unicode property escapes (works server-side with Node.js)
  if (!/^[\p{L}\s\-'.]+$/u.test(value)) {
    return {
      field: label,
      message: `${label} contains invalid characters. Only letters, spaces, hyphens, apostrophes, and periods are allowed.`,
    };
  }
  // Prevent excessive consecutive special characters (e.g. "---", "...")
  if (/[\-'.]{3,}/.test(value)) {
    return {
      field: label,
      message: `${label} contains too many consecutive special characters.`,
    };
  }
  return null;
}

/**
 * Validate an optional company name.
 * @param {string} value
 * @returns {FieldError|null}
 */
export function validateCompany(value) {
  if (!value) return null; // optional
  if (value.length > 100) {
    return {field: 'Company', message: 'Company must be 100 characters or fewer.'};
  }
  // Allow letters, numbers, spaces, common punctuation
  if (!/^[\p{L}\p{N}\s\-'.&,()/#]+$/u.test(value)) {
    return {
      field: 'Company',
      message: 'Company contains invalid characters.',
    };
  }
  return null;
}

/**
 * Validate an address line (street).
 * @param {string} value
 * @param {string} label  e.g. "Address line 1"
 * @param {boolean} [required=true]
 * @returns {FieldError|null}
 */
export function validateAddressLine(value, label, required = true) {
  if (required && (!value || value.length === 0)) {
    return {field: label, message: `${label} is required.`};
  }
  if (!value) return null;
  if (required && value.trim().length === 0) {
    return {field: label, message: `${label} cannot be empty or whitespace only.`};
  }
  if (value.length > 200) {
    return {field: label, message: `${label} must be 200 characters or fewer.`};
  }
  return null;
}

/**
 * Validate a city name.
 * @param {string} value
 * @returns {FieldError|null}
 */
export function validateCity(value) {
  if (!value || value.length === 0) {
    return {field: 'City', message: 'City is required.'};
  }
  if (value.trim().length === 0) {
    return {field: 'City', message: 'City cannot be empty or whitespace only.'};
  }
  if (value.length > 100) {
    return {field: 'City', message: 'City must be 100 characters or fewer.'};
  }
  if (!/^[\p{L}\s\-'.]+$/u.test(value)) {
    return {field: 'City', message: 'City contains invalid characters.'};
  }
  return null;
}

/**
 * Validate a state / province code (e.g. "CA", "ON", "NSW").
 * @param {string} value
 * @returns {FieldError|null}
 */
export function validateZoneCode(value) {
  if (!value || value.length === 0) {
    return {field: 'State/Province', message: 'State / Province is required.'};
  }
  if (!/^[\p{L}\p{N}\-]{1,10}$/u.test(value)) {
    return {
      field: 'State/Province',
      message: 'State / Province code must be 1–10 alphanumeric characters.',
    };
  }
  return null;
}

/**
 * Validate a zip / postal code.
 * Flexible enough for US (12345 / 12345-6789), CA (K1A 0B1), UK (SW1A 1AA), etc.
 * @param {string} value
 * @returns {FieldError|null}
 */
export function validateZip(value) {
  if (!value || value.length === 0) {
    return {field: 'Zip', message: 'Zip / Postal Code is required.'};
  }
  if (value.length < 2 || value.length > 12) {
    return {field: 'Zip', message: 'Zip / Postal Code must be between 2 and 12 characters.'};
  }
  if (!/^[\p{L}\p{N}\s\-]+$/u.test(value)) {
    return {field: 'Zip', message: 'Zip / Postal Code contains invalid characters.'};
  }
  return null;
}

/**
 * Validate a 2-letter ISO 3166-1 alpha-2 country code.
 * @param {string} value
 * @returns {FieldError|null}
 */
export function validateTerritoryCode(value) {
  if (!value || value.length === 0) {
    return {field: 'Country', message: 'Country code is required.'};
  }
  if (!/^[A-Z]{2}$/.test(value.toUpperCase())) {
    return {
      field: 'Country',
      message: 'Country code must be a 2-letter ISO code (e.g. US, CA, GB).',
    };
  }
  return null;
}

/**
 * Validate an E.164 phone number (optional field).
 * Accepts formats: +1234567890, 1234567890, +1-234-567-8901, (123) 456-7890
 * Strips formatting before checking digit count (7–15 digits).
 * @param {string} value
 * @returns {FieldError|null}
 */
export function validatePhone(value) {
  if (!value) return null; // optional
  // Strip all non-digit chars except leading +
  const digits = value.replace(/^\+/, '').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    return {
      field: 'Phone',
      message: 'Phone number must contain 7–15 digits. Include country code (e.g. +1).',
    };
  }
  return null;
}

/**
 * Normalise phone to E.164 before sending to Shopify.
 * Strips formatting chars, ensures leading +.
 * @param {string} value
 * @returns {string}
 */
export function normalizePhone(value) {
  if (!value) return '';
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return hasPlus ? `+${digits}` : `+${digits}`;
}

// ──────────────────────────── Aggregate Runner ──────────────────────────

/**
 * Run an array of validation results and return the first error, or null.
 * @param {Array<FieldError|null>} results
 * @returns {FieldError|null}
 */
export function firstError(results) {
  return results.find((r) => r !== null) ?? null;
}

/**
 * Run an array of validation results and return ALL errors.
 * @param {Array<FieldError|null>} results
 * @returns {FieldError[]}
 */
export function allErrors(results) {
  return results.filter((r) => r !== null);
}

/**
 * Validate a complete address object. Returns all errors found.
 * @param {Record<string, string>} addr
 * @returns {FieldError[]}
 */
export function validateAddress(addr) {
  return allErrors([
    validateName(addr.firstName, 'First name'),
    validateName(addr.lastName, 'Last name'),
    validateCompany(addr.company),
    validateAddressLine(addr.address1, 'Address line 1', true),
    validateAddressLine(addr.address2, 'Address line 2', false),
    validateCity(addr.city),
    validateZoneCode(addr.zoneCode),
    validateZip(addr.zip),
    validateTerritoryCode(addr.territoryCode),
    validatePhone(addr.phoneNumber),
  ]);
}
