import { Card } from '../../ui';

/**
 * CalculatorCard - Consistent wrapper for all calculator tools
 *
 * Provides:
 * - Title with optional icon
 * - Sectioned layout (inputs, results, diagram)
 * - Action bar (copy, export, save)
 */
export function CalculatorCard({
  title,
  icon: Icon,
  description,
  children,
  headerActions,
  className = '',
}) {
  return (
    <Card className={`calculator-card p-4 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="w-5 h-5 text-charcoal" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
              {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      </div>

      {/* Content */}
      {children}
    </Card>
  );
}

/**
 * InputSection - Group of input fields
 */
export function InputSection({ title, children, className = '' }) {
  return (
    <div className={`input-section mb-6 ${className}`}>
      {title && (
        <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * InputRow - Horizontal row of inputs
 */
export function InputRow({ children, className = '' }) {
  return (
    <div className={`input-row grid grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ResultsSection - Calculation results display
 */
export function ResultsSection({ title = 'Results', children, className = '' }) {
  return (
    <div className={`results-section bg-gray-50 -mx-4 px-4 py-4 border-t border-gray-100 ${className}`}>
      {title && (
        <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/**
 * CutListSection - Formatted cut list display
 */
export function CutListSection({ title = 'Cut List', items, className = '' }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`cut-list-section mt-4 ${className}`}>
      {title && (
        <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
          {title}
        </h3>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <tr key={index} className={item.highlight ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                <td className="px-3 py-2.5 text-charcoal font-medium">
                  {item.name}
                  {item.note && (
                    <div className="text-xs text-gray-500 font-normal mt-0.5">{item.note}</div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-charcoal">{item.length}</td>
                <td className="px-3 py-2.5 text-center text-charcoal">{item.qty}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.material}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * WarningBanner - Code violations or important warnings
 */
export function WarningBanner({ type = 'warning', children, className = '' }) {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    success: 'bg-green-50 border-green-400 text-green-800',
  };

  return (
    <div className={`warning-banner border-l-4 p-3 mb-4 rounded-r ${styles[type]} ${className}`}>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

/**
 * ActionBar - Bottom actions (copy, export, etc.)
 */
export function ActionBar({ children, className = '' }) {
  return (
    <div className={`action-bar flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

/**
 * SelectInput - Styled select dropdown for calculators
 */
export function SelectInput({
  value,
  onChange,
  options,
  label,
  required = false,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`select-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
          hover:border-gray-400
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * ToggleInput - Toggle switch for boolean options
 */
export function ToggleInput({
  value,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`toggle-input flex items-center justify-between ${className}`}>
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${value ? 'bg-charcoal' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${value ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}

export default CalculatorCard;
