import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 5500),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => {
          const isError = item.type === 'error';
          const isInfo = item.type === 'info';
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm transition-all duration-150 ${
                isError
                  ? 'bg-[#FDF6F6] border-[#E8C5C5] text-[#8F2A2A]'
                  : isInfo
                  ? 'bg-[#F4F6FA] border-[#CAD5E6] text-[#29436A]'
                  : 'bg-[#F4FAF6] border-[#C2DFCE] text-[#1F543B]'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              ) : isInfo ? (
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                aria-label="Dismiss notification"
                className="p-0.5 rounded hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[#355482]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
