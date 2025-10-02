const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

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

  // Google OAuth API Methods
  
  /**
   * Google Sign-In API
   * Sends Google ID token to backend for verification and authentication
   * 
   * @param credential - Google ID token
   * @param csrfToken - Optional CSRF protection token
   * @returns Authentication result from backend
   */
  async googleSignIn(credential: string, csrfToken?: string) {
    return this.request('/auth/google/signin', {
      method: 'POST',
      body: JSON.stringify({ 
        credential, 
        csrfToken 
      }),
    });
  }

  /**
   * Google Sign-Up API
   * Registers new user with Google account information
   * 
   * @param credential - Google ID token
   * @param csrfToken - Optional CSRF protection token
   * @returns Registration result from backend
   */
  async googleSignUp(credential: string, csrfToken?: string) {
    return this.request('/auth/google/signup', {
      method: 'POST',
      body: JSON.stringify({ 
        credential, 
        csrfToken 
      }),
    });
  }

  /**
   * Get CSRF Token API
   * Retrieves CSRF protection token from backend
   * 
   * @returns CSRF token for secure OAuth flows
   */
  async getCSRFToken() {
    return this.request('/auth/csrf-token');
  }

  /**
   * Unlink Google Account API
   * Removes Google OAuth linkage from user account
   * 
   * @param userId - User ID to unlink
   * @returns Success status from backend
   */
  async unlinkGoogleAccount(userId: string) {
    return this.request('/auth/google/unlink', {
      method: 'POST',
      body: JSON.stringify({ userId }),
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

  async sendResolutionEmail(ticketId: string, message: string, resolvedBy: string) {
    return this.request(`/tickets/${ticketId}/send-resolution-email`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        resolvedBy
      })
    });
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }
}

export default ApiService;