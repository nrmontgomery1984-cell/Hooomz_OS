import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { logger } from '../../utils/logger';

/**
 * Toast notification system
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Message', 'success'); // 'success' | 'error' | 'info'
 */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  // Clean up all timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      const timeout = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        timeoutsRef.current.delete(id);
      }, duration);
      timeoutsRef.current.set(id, timeout);
    }
  }, []);

  const dismissToast = useCallback((id) => {
    // Clear the timeout if it exists
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op if not wrapped in provider (graceful degradation)
    return {
      showToast: (message, type) => logger.info(`Toast [${type}]: ${message}`),
      dismissToast: () => {},
    };
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right ${backgrounds[type] || backgrounds.info}`}
      role="alert"
    >
      {icons[type] || icons.info}
      <p className="text-sm text-gray-700 flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

export default Toast;
