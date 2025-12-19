/**
 * Card Component for Hooomz OS
 *
 * Provides consistent card styling with optional interactive states.
 * Interactive cards have hover effects, cursor changes, and press feedback.
 */

/**
 * Card component with optional interactive states
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.interactive - Force interactive styles (auto-detected from onClick)
 * @param {boolean} props.hover - Legacy prop for hover effect (deprecated, use interactive)
 * @param {Function} props.onClick - Click handler (makes card interactive)
 * @param {boolean} props.disabled - Disable interactions
 */
export function Card({
  children,
  className = '',
  interactive,
  hover = false,
  onClick,
  disabled = false,
  ...props
}) {
  // Auto-detect interactive if onClick is provided, or use legacy hover prop
  const isInteractive = (interactive ?? (!!onClick || hover)) && !disabled;

  const baseClasses = 'bg-white rounded-lg shadow-card border border-gray-200';

  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:shadow-elevated active:scale-[0.99] transition-all duration-150'
    : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : '';

  const handleClick = (e) => {
    if (disabled || !onClick) return;
    onClick(e);
  };

  const handleKeyDown = (e) => {
    if (disabled || !onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${disabledClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader - Optional header section for cards
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardContent - Main content area for cards
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * CardFooter - Optional footer section for cards
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}

export default Card;
