import React, { useEffect, useState } from 'react';
import { CheckCircle, Copy, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info':
        return <Copy className="w-5 h-5 text-blue-400" />;
      case 'error':
        return <X className="w-5 h-5 text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-400/30 text-green-300';
      case 'info':
        return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
      case 'error':
        return 'bg-red-500/20 border-red-400/30 text-red-300';
      default:
        return 'bg-green-500/20 border-green-400/30 text-green-300';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 backdrop-blur-lg border rounded-lg p-4 flex items-center gap-3 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${getColors()}`}
    >
      {getIcon()}
      <span className="font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;