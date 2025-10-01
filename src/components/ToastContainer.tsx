import { useState, useEffect } from 'react';
import ToastService from '../services/toastService';
import Toast from './Toast';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const toastService = ToastService.getInstance();
    const unsubscribe = toastService.subscribe((newToasts) => {
      setToasts(newToasts);
    });

    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    const toastService = ToastService.getInstance();
    toastService.remove(id);
  };

  return (
    <div className="fixed top-4 right-4 z-[99999] space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="relative"
          style={{
            marginTop: index > 0 ? '8px' : '0',
          }}
        >
          <Toast
            message={toast.message || toast.title}
            type={toast.type}
            duration={toast.duration || 4000}
            onClose={() => handleClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}