const API_BASE_URL = 'http://localhost:3002/api';

class ApiService {
  private static instance: ApiService;
  private isConnected = false;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 10000,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      this.isConnected = true;
      return response.json();
    } catch (error) {
      this.isConnected = false;
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; name: string; phone: string; role: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User API
  async getUsers() {
    return this.request('/users');
  }

  // Ticket API
  async getTickets(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tickets?${queryString}`);
  }

  async createTicket(ticketData: any) {
    console.log('=== FRONTEND SENDING TICKET DATA ===');
    console.log('Ticket data:', JSON.stringify(ticketData, null, 2));
    
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id: string, updates: any) {
    console.log('ApiService.updateTicket called:', { id, updates });
    
    const result = await this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    console.log('ApiService.updateTicket result:', result);
    return result;
  }

  // Migration API
  async migrateData(data: { tickets?: any[], users?: any[] }) {
    return this.request('/migrate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.request('/health');
      this.isConnected = result.status === 'OK';
      return result;
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<{ connected: boolean; database: boolean; error?: string }> {
    try {
      const health = await this.healthCheck();
      return {
        connected: true,
        database: health.database === 'Connected'
      };
    } catch (error) {
      return {
        connected: false,
        database: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default ApiService;