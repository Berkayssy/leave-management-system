// components/ui/Toast.tsx - GÜNCELLENMİŞ VERSİYON
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };
  
  // Global event listener ekle
  useEffect(() => {
    const handleToastEvent = (e: CustomEvent) => {
      const { message, type } = e.detail;
      addToast(message, type);
    };
    
    // TypeScript için type assertion
    window.addEventListener('show-toast', handleToastEvent as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleToastEvent as EventListener);
    };
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right fade-in duration-300 ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white border border-green-600' 
                : 'bg-red-500 text-white border border-red-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}