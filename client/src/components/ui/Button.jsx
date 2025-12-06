export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-charcoal text-white hover:bg-gray-800',
    secondary: 'border border-gray-300 text-charcoal hover:bg-gray-50',
    text: 'text-gray-600 hover:text-charcoal',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded',
    default: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
