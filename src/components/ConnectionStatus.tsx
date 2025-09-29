import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, AlertCircle } from 'lucide-react';
import ApiService from '../services/apiService';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const apiService = ApiService.getInstance();
      const result = await apiService.testConnection();
      
      setIsConnected(result.connected);
      setIsDatabaseConnected(result.database);
      setLastCheck(new Date());
    } catch (error) {
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
    if (isConnected && !isDatabaseConnected) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isConnected && isDatabaseConnected) return 'Connected';
    if (isConnected && !isDatabaseConnected) return 'DB Issue';
    return 'Offline';
  };

  const getStatusIcon = () => {
    if (isChecking) return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
    if (isConnected && isDatabaseConnected) return <Wifi className="w-4 h-4" />;
    if (isConnected && !isDatabaseConnected) return <AlertCircle className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {!isConnected && !isChecking && (
        <div className="flex items-center space-x-1 text-red-400">
          <Database className="w-4 h-4" />
          <span className="text-xs">Backend Offline</span>
        </div>
      )}
      
      {lastCheck && (
        <span className="text-xs text-white/60">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;