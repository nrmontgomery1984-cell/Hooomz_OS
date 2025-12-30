import { useState, useEffect, useCallback } from 'react';
import { parseToDecimal, toFractionString } from '../../../lib/calculators/fractionUtils';

/**
 * FractionInput - Imperial measurement input component
 *
 * Accepts flexible input formats:
 * - "36" → 36 inches
 * - "36 1/2" → 36.5 inches
 * - "3'" → 36 inches
 * - "3' 6" → 42 inches
 * - "3' 6 1/2" → 42.5 inches
 *
 * Displays formatted output (e.g., "3' 6 1/2"")
 */
export function FractionInput({
  value,
  onChange,
  label,
  placeholder = 'e.g., 3\' 6 1/2"',
  min,
  max,
  required = false,
  disabled = false,
  className = '',
  showFeet = 'auto', // 'auto', 'always', 'never'
  precision = 16,
  helpText,
  error,
}) {
  // Display value (what user sees in input)
  const [displayValue, setDisplayValue] = useState('');
  // Whether input is focused (show raw input vs formatted)
  const [isFocused, setIsFocused] = useState(false);

  // Format the value for display when not focused
  useEffect(() => {
    if (!isFocused && value !== null && value !== undefined) {
      const formatted = toFractionString(value, {
        showFeet: showFeet === 'always',
        autoFeet: showFeet === 'auto',
        precision,
      });
      setDisplayValue(formatted);
    }
  }, [value, isFocused, showFeet, precision]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Parse and validate
    const parsed = parseToDecimal(inputValue);

    if (parsed !== null) {
      // Validate bounds
      let valid = true;
      if (min !== undefined && parsed < min) valid = false;
      if (max !== undefined && parsed > max) valid = false;

      if (valid) {
        onChange(parsed);
      }
    }
  }, [onChange, min, max]);

  // Handle focus - show raw/editable value
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle blur - format and validate
  const handleBlur = useCallback(() => {
    setIsFocused(false);

    // Parse current input
    const parsed = parseToDecimal(displayValue);

    if (parsed !== null) {
      // Clamp to bounds
      let finalValue = parsed;
      if (min !== undefined && parsed < min) finalValue = min;
      if (max !== undefined && parsed > max) finalValue = max;

      onChange(finalValue);

      // Format for display
      const formatted = toFractionString(finalValue, {
        showFeet: showFeet === 'always',
        autoFeet: showFeet === 'auto',
        precision,
      });
      setDisplayValue(formatted);
    } else if (displayValue.trim() === '' && !required) {
      onChange(null);
    }
  }, [displayValue, onChange, min, max, required, showFeet, precision]);

  // Determine if there's a validation error
  const hasError = error || (required && (value === null || value === undefined));

  return (
    <div className={`fraction-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md text-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
            ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />

        {/* Unit hint */}
        {!isFocused && value !== null && value !== undefined && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            ({value.toFixed(2)}")
          </span>
        )}
      </div>

      {/* Help text or error */}
      {(helpText || error) && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helpText}
        </p>
      )}
    </div>
  );
}

/**
 * FractionDisplay - Read-only formatted measurement display
 */
export function FractionDisplay({
  value,
  label,
  showFeet = 'auto',
  precision = 16,
  className = '',
  size = 'md', // 'sm', 'md', 'lg'
}) {
  const formatted = toFractionString(value, {
    showFeet: showFeet === 'always',
    autoFeet: showFeet === 'auto',
    precision,
  });

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold',
  };

  return (
    <div className={`fraction-display ${className}`}>
      {label && (
        <span className="text-sm text-gray-600 mr-2">{label}:</span>
      )}
      <span className={`font-mono ${sizeClasses[size]}`}>
        {formatted || '—'}
      </span>
    </div>
  );
}

export default FractionInput;
