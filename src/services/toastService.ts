interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

class ToastService {
  private static instance: ToastService;
  private listeners: ((toasts: ToastData[]) => void)[] = [];
  private toasts: ToastData[] = [];
  private counter: number = 0;

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  success(title: string, message?: string, duration?: number) {
    const toast: ToastData = {
      id: `toast_${Date.now()}_${this.counter++}`,
      type: 'success',
      title,
      message,
      duration
    };
    this.toasts.push(toast);
    this.notify();
  }

  error(title: string, message?: string, duration?: number) {
    const toast: ToastData = {
      id: `toast_${Date.now()}_${this.counter++}`,
      type: 'error',
      title,
      message,
      duration
    };
    this.toasts.push(toast);
    this.notify();
  }

  info(title: string, message?: string, duration?: number) {
    const toast: ToastData = {
      id: `toast_${Date.now()}_${this.counter++}`,
      type: 'info',
      title,
      message,
      duration
    };
    this.toasts.push(toast);
    this.notify();
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export default ToastService;