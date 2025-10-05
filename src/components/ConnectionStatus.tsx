import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import ApiService from '../services/apiService';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const apiService = ApiService.getInstance();
      const result = await apiService.testConnection();
      
      setIsConnected(result.connected);
      setIsDatabaseConnected(result.database);
    } catch {
      setIsConnected(false);
      setIsDatabaseConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-400';
    if (isConnected && isDatabaseConnected) return 'text-green-400';
    if (isConnected && !isDatabaseConnected) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    if (isChecking) return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
    if (isConnected && isDatabaseConnected) return <Wifi className="w-4 h-4" />;
    if (isConnected && !isDatabaseConnected) return <AlertCircle className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getTooltipText = () => {
    if (isChecking) return 'Checking connection...';
    if (isConnected && isDatabaseConnected) return 'Connected to server';
    if (isConnected && !isDatabaseConnected) return 'Database connection issue';
    return 'Server offline';
  };

  return (
    <div className={`flex items-center ${className}`} title={getTooltipText()}>
      <div className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </div>
    </div>
  );
};

export default ConnectionStatus;