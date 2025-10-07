import { useState } from 'react';
import { Database, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import ApiService from '../services/apiService';

export default function DataMigration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not checked');

  const checkConnection = async () => {
    try {
      const apiService = ApiService.getInstance();
      const health = await apiService.healthCheck();
      setIsConnected(health.database === 'Connected');
      setConnectionStatus(health.database === 'Connected' ? 'Connected to MongoDB' : 'Database disconnected');
    } catch {
      setIsConnected(false);
      setConnectionStatus('Backend server not running');
    }
  };

  const migrateData = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      // Get data from localStorage
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');

      const apiService = ApiService.getInstance();
      
      // Migrate tickets to MongoDB
      await apiService.migrateData({ tickets });

      setMigrationResult({
        success: true,
        message: `Successfully migrated ${tickets.length} tickets to MongoDB`
      });

      // Optionally clear localStorage after successful migration
      // localStorage.removeItem('tickets');
      // localStorage.removeItem('email-notifications');
      // localStorage.removeItem('screenshots');

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setMigrationResult({
        success: false,
        message: `Migration failed: ${message}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Data Migration</h1>
        <p className="text-gray-300">Migrate your data from localStorage to MongoDB</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Database Connection</h3>
          </div>
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Check Connection
          </button>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
          isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {isConnected ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="font-medium">{connectionStatus}</span>
        </div>
      </div>

      {/* Migration Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Data Migration</h3>
          </div>
          <button
            onClick={migrateData}
            disabled={!isConnected || isMigrating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isMigrating ? 'Migrating...' : 'Migrate to MongoDB'}
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-300">
          <p>• Migrate tickets from localStorage to MongoDB</p>
          <p>• Preserve all ticket data, messages, and history</p>
          <p>• Keep localStorage as backup (not automatically cleared)</p>
        </div>

        {migrationResult && (
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
            migrationResult.success 
              ? 'bg-green-500/20 text-green-300' 
              : 'bg-red-500/20 text-red-300'
          }`}>
            {migrationResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{migrationResult.message}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Setup Instructions</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Start the backend server: <code className="bg-black/30 px-2 py-1 rounded">cd backend && npm run dev</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Check database connection using the button above</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Click "Migrate to MongoDB" to transfer your localStorage data</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">4.</span>
            <span>Your application will automatically use MongoDB for new data</span>
          </div>
        </div>
      </div>
    </div>
  );
}