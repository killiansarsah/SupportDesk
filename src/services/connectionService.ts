class ConnectionService {
  private static instance: ConnectionService;
  private isBackendConnected = false;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  async checkBackendConnection(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3002/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isBackendConnected = data.status === 'OK' && data.database === 'Connected';
        return this.isBackendConnected;
      }
      
      this.isBackendConnected = false;
      return false;
    } catch (error) {
      console.error('Backend connection check failed:', error);
      this.isBackendConnected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.isBackendConnected;
  }

  startConnectionMonitoring(): void {
    // Check connection immediately
    this.checkBackendConnection();
    
    // Then check every 30 seconds
    this.connectionCheckInterval = setInterval(() => {
      this.checkBackendConnection();
    }, 30000);
  }

  stopConnectionMonitoring(): void {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }
}

export default ConnectionService;