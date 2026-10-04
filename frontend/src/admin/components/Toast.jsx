import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(window.__cobToast);
    window.__cobToast = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && <div className={`toast ${toast.type === 'error' ? 'toast--error' : ''}`}>{toast.message}</div>}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) || (() => {});
}
