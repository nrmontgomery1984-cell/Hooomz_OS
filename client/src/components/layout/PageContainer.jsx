import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PageContainer({
  children,
  title,
  subtitle,
  backTo,
  action,
  className = '',
}) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-full bg-white overflow-x-hidden ${className}`}>
      {/* Header */}
      {(title || backTo || action) && (
        <header className="px-4 lg:px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {backTo && (
                <button
                  onClick={() => navigate(backTo)}
                  className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                {title && (
                  <h1 className="text-xl font-semibold text-charcoal">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>
        </header>
      )}

      {/* Content */}
      <main className="px-4 lg:px-6">{children}</main>
    </div>
  );
}
