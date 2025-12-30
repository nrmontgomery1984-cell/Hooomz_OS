/**
 * Fraction Utilities for Construction Calculators
 *
 * Handles parsing, formatting, and arithmetic for imperial fractions
 * commonly used in construction (feet, inches, fractions of inches).
 */

// Common fraction values for quick lookup
const FRACTION_MAP = {
  '1/16': 0.0625,
  '1/8': 0.125,
  '3/16': 0.1875,
  '1/4': 0.25,
  '5/16': 0.3125,
  '3/8': 0.375,
  '7/16': 0.4375,
  '1/2': 0.5,
  '9/16': 0.5625,
  '5/8': 0.625,
  '11/16': 0.6875,
  '3/4': 0.75,
  '13/16': 0.8125,
  '7/8': 0.875,
  '15/16': 0.9375,
};

// Reverse lookup for decimal to fraction
const DECIMAL_TO_FRACTION = Object.entries(FRACTION_MAP).reduce((acc, [frac, dec]) => {
  acc[dec] = frac;
  return acc;
}, {});

/**
 * Parse a string input to decimal inches
 * Accepts formats:
 * - "36" → 36 inches
 * - "36 1/2" or "36-1/2" → 36.5 inches
 * - "3'" → 36 inches
 * - "3' 6" or "3'-6" or "3'6"" → 42 inches
 * - "3' 6 1/2" → 42.5 inches
 * - "3.5" → 3.5 inches (decimal)
 *
 * @param {string} input - User input string
 * @returns {number|null} - Decimal inches, or null if invalid
 */
export function parseToDecimal(input) {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  // Handle numeric input directly
  if (typeof input === 'number') {
    return input;
  }

  // Clean the input
  let str = String(input).trim().toLowerCase();

  // Remove trailing inch marks
  str = str.replace(/"$/g, '');

  // Check for feet notation
  const hasFeet = str.includes("'") || str.includes('ft');

  let feet = 0;
  let inches = 0;
  let fraction = 0;

  if (hasFeet) {
    // Split on feet marker
    const parts = str.split(/['']|ft/);

    // Parse feet
    feet = parseFloat(parts[0]) || 0;

    if (parts[1]) {
      // Parse inches portion
      const inchPart = parts[1].trim().replace(/"$/g, '');
      const inchResult = parseInchesWithFraction(inchPart);
      inches = inchResult.whole;
      fraction = inchResult.fraction;
    }
  } else {
    // No feet, just inches (possibly with fraction)
    const result = parseInchesWithFraction(str);
    inches = result.whole;
    fraction = result.fraction;
  }

  return (feet * 12) + inches + fraction;
}

/**
 * Parse inches string that may contain a fraction
 * @param {string} str - Inches string like "36", "36 1/2", "1/2"
 * @returns {{whole: number, fraction: number}}
 */
function parseInchesWithFraction(str) {
  if (!str || str.trim() === '') {
    return { whole: 0, fraction: 0 };
  }

  str = str.trim();

  // Check for fraction
  const fractionMatch = str.match(/(\d+)\s*\/\s*(\d+)/);

  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    const fractionValue = denominator !== 0 ? numerator / denominator : 0;

    // Get whole number before fraction
    const wholePart = str.substring(0, fractionMatch.index).trim().replace(/[-\s]+$/, '');
    const whole = parseFloat(wholePart) || 0;

    return { whole, fraction: fractionValue };
  }

  // No fraction, just a number (could be decimal)
  const whole = parseFloat(str) || 0;
  return { whole, fraction: 0 };
}

/**
 * Convert decimal inches to a formatted string
 *
 * @param {number} decimal - Decimal inches
 * @param {Object} options - Formatting options
 * @param {boolean} options.showFeet - Force feet-inches format
 * @param {boolean} options.autoFeet - Show feet for values >= 12" (default: true)
 * @param {number} options.precision - Fraction precision (16 = 1/16", 8 = 1/8", etc.)
 * @returns {string} - Formatted string like "3' 6 1/2"" or "42 1/2""
 */
export function toFractionString(decimal, options = {}) {
  const {
    showFeet = false,
    autoFeet = true,
    precision = 16,
  } = options;

  if (decimal === null || decimal === undefined || isNaN(decimal)) {
    return '';
  }

  const isNegative = decimal < 0;
  decimal = Math.abs(decimal);

  const useFeet = showFeet || (autoFeet && decimal >= 12);

  let feet = 0;
  let inches = decimal;

  if (useFeet) {
    feet = Math.floor(decimal / 12);
    inches = decimal - (feet * 12);
  }

  // Round to nearest fraction
  const roundedInches = roundToFraction(inches, precision);
  const wholeInches = Math.floor(roundedInches);
  const fractionalPart = roundedInches - wholeInches;

  // Build the string
  let result = '';

  if (isNegative) {
    result = '-';
  }

  if (useFeet && feet > 0) {
    result += `${feet}'`;
    if (wholeInches > 0 || fractionalPart > 0) {
      result += ' ';
    }
  }

  if (wholeInches > 0) {
    result += `${wholeInches}`;
  }

  if (fractionalPart > 0) {
    const fractionStr = decimalToFractionString(fractionalPart, precision);
    if (wholeInches > 0) {
      result += ` ${fractionStr}`;
    } else if (useFeet && feet > 0) {
      result += fractionStr;
    } else {
      result += fractionStr;
    }
  }

  // Add inch mark if we have inches
  if (wholeInches > 0 || fractionalPart > 0) {
    result += '"';
  } else if (useFeet && feet > 0) {
    // Just feet, no inches
    result += ' 0"';
  } else {
    result = '0"';
  }

  return result.trim();
}

/**
 * Convert a decimal fraction (0-1) to a fraction string
 * @param {number} decimal - Decimal between 0 and 1
 * @param {number} precision - Denominator precision (16, 8, 4, etc.)
 * @returns {string} - Fraction string like "1/2", "3/4", etc.
 */
function decimalToFractionString(decimal, precision = 16) {
  if (decimal === 0) return '';

  // Round to nearest fraction of precision
  const numerator = Math.round(decimal * precision);

  if (numerator === 0) return '';
  if (numerator === precision) return '1';

  // Reduce the fraction
  const gcd = greatestCommonDivisor(numerator, precision);
  const reducedNum = numerator / gcd;
  const reducedDen = precision / gcd;

  return `${reducedNum}/${reducedDen}`;
}

/**
 * Round a decimal to the nearest fraction
 * @param {number} decimal - Decimal number
 * @param {number} precision - Fraction precision (16 = nearest 1/16)
 * @returns {number} - Rounded decimal
 */
export function roundToFraction(decimal, precision = 16) {
  return Math.round(decimal * precision) / precision;
}

/**
 * Greatest common divisor for fraction reduction
 */
function greatestCommonDivisor(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Add two measurements (can be strings or decimals)
 * @param {string|number} a - First measurement
 * @param {string|number} b - Second measurement
 * @returns {number} - Sum in decimal inches
 */
export function addMeasurements(a, b) {
  const aDecimal = typeof a === 'number' ? a : parseToDecimal(a);
  const bDecimal = typeof b === 'number' ? b : parseToDecimal(b);
  return (aDecimal || 0) + (bDecimal || 0);
}

/**
 * Subtract two measurements
 * @param {string|number} a - First measurement
 * @param {string|number} b - Second measurement
 * @returns {number} - Difference in decimal inches
 */
export function subtractMeasurements(a, b) {
  const aDecimal = typeof a === 'number' ? a : parseToDecimal(a);
  const bDecimal = typeof b === 'number' ? b : parseToDecimal(b);
  return (aDecimal || 0) - (bDecimal || 0);
}

/**
 * Multiply a measurement by a number
 * @param {string|number} measurement - The measurement
 * @param {number} multiplier - The multiplier
 * @returns {number} - Product in decimal inches
 */
export function multiplyMeasurement(measurement, multiplier) {
  const decimal = typeof measurement === 'number' ? measurement : parseToDecimal(measurement);
  return (decimal || 0) * multiplier;
}

/**
 * Standard lumber actual dimensions (nominal → actual)
 */
export const LUMBER_DIMENSIONS = {
  '2x2': { width: 1.5, height: 1.5 },
  '2x3': { width: 1.5, height: 2.5 },
  '2x4': { width: 1.5, height: 3.5 },
  '2x6': { width: 1.5, height: 5.5 },
  '2x8': { width: 1.5, height: 7.25 },
  '2x10': { width: 1.5, height: 9.25 },
  '2x12': { width: 1.5, height: 11.25 },
  '1x2': { width: 0.75, height: 1.5 },
  '1x3': { width: 0.75, height: 2.5 },
  '1x4': { width: 0.75, height: 3.5 },
  '1x6': { width: 0.75, height: 5.5 },
  '1x8': { width: 0.75, height: 7.25 },
  '1x10': { width: 0.75, height: 9.25 },
  '1x12': { width: 0.75, height: 11.25 },
  'LVL-9.25': { width: 1.75, height: 9.25 },
  'LVL-11.25': { width: 1.75, height: 11.25 },
  'LVL-11.875': { width: 1.75, height: 11.875 },
  'LVL-14': { width: 1.75, height: 14 },
  'LVL-16': { width: 1.75, height: 16 },
};

/**
 * Get actual lumber dimension
 * @param {string} nominal - Nominal size like "2x4"
 * @param {string} dimension - 'width' or 'height'
 * @returns {number} - Actual dimension in inches
 */
export function getLumberDimension(nominal, dimension = 'height') {
  const lumber = LUMBER_DIMENSIONS[nominal];
  if (!lumber) return 0;
  return lumber[dimension];
}

/**
 * Common wall heights (to top of double top plate)
 */
export const WALL_HEIGHTS = {
  '8ft': 97.125,   // 97 1/8" - standard 8' ceiling
  '9ft': 109.125,  // 109 1/8" - 9' ceiling
  '10ft': 121.125, // 121 1/8" - 10' ceiling
};

/**
 * Convert decimal inches to decimal feet
 */
export function inchesToFeet(inches) {
  return inches / 12;
}

/**
 * Convert decimal feet to decimal inches
 */
export function feetToInches(feet) {
  return feet * 12;
}

/**
 * Format a number for display with optional unit
 */
export function formatNumber(value, decimals = 2, unit = '') {
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }
  const formatted = Number(value).toFixed(decimals).replace(/\.?0+$/, '');
  return unit ? `${formatted} ${unit}` : formatted;
}

export default {
  parseToDecimal,
  toFractionString,
  roundToFraction,
  addMeasurements,
  subtractMeasurements,
  multiplyMeasurement,
  LUMBER_DIMENSIONS,
  getLumberDimension,
  WALL_HEIGHTS,
  inchesToFeet,
  feetToInches,
  formatNumber,
};
