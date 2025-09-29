import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import ToastService from '../services/toastService';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<any[]>([]);

  useEffect(() => {
    const toastService = ToastService.getInstance();
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const handleClose = (id: string) => {
    const toastService = ToastService.getInstance();
    toastService.remove(id);
  };

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={handleClose}
        />
      ))}
    </div>,
    document.body
  );
}