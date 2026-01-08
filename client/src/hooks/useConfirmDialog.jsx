import { useState, useCallback, createContext, useContext } from 'react';
import { ConfirmDialog, AlertDialog } from '../components/ui/ConfirmDialog';

/**
 * Hook for using confirmation dialogs
 *
 * Usage in a component:
 *   const { confirm, alert } = useConfirmDialog();
 *
 *   const handleDelete = async () => {
 *     const confirmed = await confirm({
 *       title: 'Delete Item',
 *       message: 'Are you sure?',
 *       variant: 'danger'
 *     });
 *     if (confirmed) {
 *       // proceed with deletion
 *     }
 *   };
 */

// Context for global dialog state
const ConfirmDialogContext = createContext(null);

/**
 * Provider component - wrap your app with this
 */
export function ConfirmDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' or 'alert'
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    loading: false,
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'confirm',
        title: options.title || 'Confirm',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'default',
        loading: false,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        type: 'alert',
        title: options.title || 'Alert',
        message: options.message || '',
        confirmText: options.buttonText || 'OK',
        variant: options.variant || 'info',
        loading: false,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [dialogState.resolve]);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, [dialogState.resolve]);

  const DialogComponent = dialogState.type === 'alert' ? AlertDialog : ConfirmDialog;

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}
      <DialogComponent
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
        loading={dialogState.loading}
      />
    </ConfirmDialogContext.Provider>
  );
}

/**
 * Hook to access the confirm dialog
 */
export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    // Fallback to browser dialogs if provider not available
    return {
      confirm: async (options) => {
        return window.confirm(options.message || options.title);
      },
      alert: async (options) => {
        window.alert(options.message || options.title);
        return true;
      },
    };
  }

  return context;
}

export default useConfirmDialog;
