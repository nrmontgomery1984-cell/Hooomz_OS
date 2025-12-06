import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

/**
 * Select - Dropdown select component
 *
 * @param {string} label - Field label
 * @param {string} value - Selected value
 * @param {function} onChange - Called with new value
 * @param {Array} options - Array of { value, label, group? }
 * @param {string} placeholder - Placeholder text
 * @param {boolean} searchable - Enable type-to-filter
 * @param {boolean} clearable - Show clear button
 * @param {string} error - Error message
 * @param {boolean} disabled - Disable the select
 */
export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  searchable = false,
  clearable = false,
  error,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options by search
  const filteredOptions = search
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Group options if they have group property
  const hasGroups = options.some(opt => opt.group);
  const groupedOptions = hasGroups
    ? filteredOptions.reduce((acc, opt) => {
        const group = opt.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
      }, {})
    : null;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
    if (e.key === 'Enter' && filteredOptions.length === 1) {
      handleSelect(filteredOptions[0].value);
    }
  };

  return (
    <div className={`space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2 text-sm text-left
            border rounded-md transition-colors bg-white
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-charcoal ring-offset-1' : ''}
          `}
        >
          <span className={selectedOption ? 'text-charcoal' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {clearable && value && (
              <span
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type to filter..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-charcoal"
                />
              </div>
            )}

            {/* Options */}
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No options found
                </div>
              ) : groupedOptions ? (
                // Grouped options
                Object.entries(groupedOptions).map(([group, groupOpts]) => (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                      {group}
                    </div>
                    {groupOpts.map((opt) => (
                      <OptionItem
                        key={opt.value}
                        option={opt}
                        isSelected={opt.value === value}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                ))
              ) : (
                // Flat options
                filteredOptions.map((opt) => (
                  <OptionItem
                    key={opt.value}
                    option={opt}
                    isSelected={opt.value === value}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function OptionItem({ option, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      className={`
        w-full flex items-center justify-between px-3 py-2 text-sm text-left
        transition-colors
        ${isSelected ? 'bg-gray-100 text-charcoal' : 'text-gray-700 hover:bg-gray-50'}
      `}
    >
      <span>{option.label}</span>
      {isSelected && <Check className="w-4 h-4 text-charcoal" />}
    </button>
  );
}

/**
 * MultiSelect - Select multiple values
 */
export function MultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = 'Select...',
  searchable = true,
  error,
  disabled = false,
  className = '',
  maxDisplay = 2,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter options by search
  const filteredOptions = search
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (e, optionValue) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  // Get labels for selected values
  const selectedLabels = value
    .map(v => options.find(opt => opt.value === v)?.label)
    .filter(Boolean);

  const displayText = selectedLabels.length === 0
    ? placeholder
    : selectedLabels.length <= maxDisplay
      ? selectedLabels.join(', ')
      : `${selectedLabels.slice(0, maxDisplay).join(', ')} +${selectedLabels.length - maxDisplay}`;

  return (
    <div className={`space-y-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2 text-sm text-left
            border rounded-md transition-colors bg-white min-h-[38px]
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-charcoal ring-offset-1' : ''}
          `}
        >
          <span className={value.length > 0 ? 'text-charcoal' : 'text-gray-400'}>
            {displayText}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-charcoal"
                  autoFocus
                />
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggle(opt.value)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                      transition-colors hover:bg-gray-50
                    `}
                  >
                    <div className={`
                      w-4 h-4 border rounded flex items-center justify-center
                      ${value.includes(opt.value)
                        ? 'bg-charcoal border-charcoal'
                        : 'border-gray-300'
                      }
                    `}>
                      {value.includes(opt.value) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-gray-700">{opt.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected tags (optional visual) */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedLabels.map((label, i) => (
            <span
              key={value[i]}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-xs text-gray-700 rounded"
            >
              {label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-gray-900"
                onClick={(e) => handleRemove(e, value[i])}
              />
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
