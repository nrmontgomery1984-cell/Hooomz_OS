import { useEffect, useCallback } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';

/**
 * Confirmation Dialog Component
 *
 * Replaces window.confirm() and window.alert() with a proper modal dialog.
 *
 * Usage:
 *   const { confirm, alert } = useConfirmDialog();
 *
 *   // For confirmations
 *   const confirmed = await confirm({
 *     title: 'Delete Project',
 *     message: 'Are you sure? This action cannot be undone.',
 *     confirmText: 'Delete',
 *     variant: 'danger'
 *   });
 *   if (confirmed) { ... }
 *
 *   // For alerts
 *   await alert({
 *     title: 'Success',
 *     message: 'Project created successfully!',
 *     variant: 'success'
 *   });
 */

const VARIANTS = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50',
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
  default: {
    icon: Info,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-50',
    buttonClass: 'bg-charcoal hover:bg-charcoal/90 text-white',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  showCancel = true,
  loading = false,
}) {
  const config = VARIANTS[variant] || VARIANTS.default;
  const Icon = config.icon;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-elevated max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              {title}
            </h3>
            {message && (
              <p className="text-sm text-gray-600 mb-6">
                {message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className={`flex gap-3 ${showCancel ? 'justify-end' : 'justify-center'}`}>
            {showCancel && (
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${config.buttonClass}`}
            >
              {loading ? 'Please wait...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Alert Dialog - simplified version for non-confirmation alerts
 */
export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title={title}
      message={message}
      confirmText={buttonText}
      variant={variant}
      showCancel={false}
    />
  );
}

export default ConfirmDialog;
