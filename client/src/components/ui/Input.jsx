export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 text-sm border rounded-md transition-colors
          focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export function DateInput({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type="date"
        className={`
          w-full px-3 py-2 text-sm border rounded-md transition-colors
          focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export function TextArea({ label, error, className = '', rows = 3, ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`
          w-full px-3 py-2 text-sm border rounded-md transition-colors resize-none
          focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-1
          ${error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
