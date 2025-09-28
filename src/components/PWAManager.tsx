import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Smartphone, RotateCw, CheckCircle, AlertCircle } from 'lucide-react';
import { PWAStatus } from '../types';

const PWAManager = () => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    syncPending: false
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    
    setPwaStatus(prev => ({ ...prev, isInstalled }));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaStatus(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for online/offline status
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setPwaStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      }
      setDeferredPrompt(null);
    }
  };

  const handleSyncData = () => {
    setPwaStatus(prev => ({ ...prev, syncPending: true }));
    // Simulate sync process
    setTimeout(() => {
      setPwaStatus(prev => ({ ...prev, syncPending: false }));
    }, 2000);
  };

  const getOfflineData = () => {
    const offlineTickets = localStorage.getItem('offline-tickets');
    const offlineResponses = localStorage.getItem('offline-responses');
    return {
      tickets: offlineTickets ? JSON.parse(offlineTickets).length : 0,
      responses: offlineResponses ? JSON.parse(offlineResponses).length : 0
    };
  };

  const offlineData = getOfflineData();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Progressive Web App</h1>
        <p className="text-gray-300">Offline capabilities and app installation</p>
      </div>

      {/* Connection Status */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            {pwaStatus.isOnline ? (
              <Wifi className="w-6 h-6 text-green-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-400" />
            )}
            <h3 className="text-lg font-semibold text-white">Connection Status</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            pwaStatus.isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}>
            {pwaStatus.isOnline ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="font-medium">
              {pwaStatus.isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
          {!pwaStatus.isOnline && (
            <p className="text-gray-400 text-sm mt-2">
              Working offline. Changes will sync when connection is restored.
            </p>
          )}
        </div>

        {/* App Installation */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">App Installation</h3>
          </div>
          {pwaStatus.isInstalled ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-300 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">App Installed</span>
            </div>
          ) : pwaStatus.canInstall ? (
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          ) : (
            <p className="text-gray-400 text-sm">
              App installation not available in this browser.
            </p>
          )}
        </div>
      </div>

      {/* Offline Data */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RotateCw className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Offline Data</h3>
          </div>
          <button
            onClick={handleSyncData}
            disabled={pwaStatus.syncPending || !pwaStatus.isOnline}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${pwaStatus.syncPending ? 'animate-spin' : ''}`} />
            {pwaStatus.syncPending ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-2xl font-bold text-white">{offlineData.tickets}</p>
            <p className="text-gray-400 text-sm">Offline Tickets</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-2xl font-bold text-white">{offlineData.responses}</p>
            <p className="text-gray-400 text-sm">Cached Responses</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-2xl font-bold text-white">
              {pwaStatus.isOnline ? '0' : '1'}
            </p>
            <p className="text-gray-400 text-sm">Pending Sync</p>
          </div>
        </div>
      </div>

      {/* PWA Features */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">PWA Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white">Offline ticket viewing</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white">Cached canned responses</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white">Background sync</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white">Push notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAManager;