import { Ticket, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';

type CreateTicketPayload = {
  title: string;
  description: string;
  category: string;
  priority: Ticket['priority'];
  customerId: string;
  language?: string;
  assignedTo?: string;
};

type TicketUpdatePayload = Partial<Omit<Ticket, 'id' | 'messages' | 'history'>>;

type TicketQueryParams = Record<string, string>;

type ApiUser = User & { _id?: string };

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: ApiUser;
  error?: string;
}

interface CsrfResponse {
  success: boolean;
  csrfToken?: string;
  error?: string;
}

interface GenericResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class ApiService {
  private static instance: ApiService;
  private isConnected = false;

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      this.isConnected = true;
      return response.json() as Promise<T>;
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
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { email: string; name: string; phone: string; role: string }) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User API
  async getUsers() {
    return this.request<ApiUser[]>('/users');
  }

  // Ticket API
  async getTickets(params: TicketQueryParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<Ticket[]>(`/tickets?${queryString}`);
  }

  async createTicket(ticketData: CreateTicketPayload) {
    console.log('=== FRONTEND SENDING TICKET DATA ===');
    console.log('Ticket data:', JSON.stringify(ticketData, null, 2));
    
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id: string, updates: TicketUpdatePayload) {
    console.log('ApiService.updateTicket called:', { id, updates });
    
    const result = await this.request<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    console.log('ApiService.updateTicket result:', result);
    return result;
  }

  // Migration API
  async migrateData(data: { tickets?: Ticket[]; users?: User[] }) {
    return this.request<GenericResponse>('/migrate', {
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
    return this.request<AuthResponse>('/auth/google/signin', {
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
    return this.request<AuthResponse>('/auth/google/signup', {
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
    return this.request<CsrfResponse>('/auth/csrf-token');
  }

  /**
   * Unlink Google Account API
   * Removes Google OAuth linkage from user account
   * 
   * @param userId - User ID to unlink
   * @returns Success status from backend
   */
  async unlinkGoogleAccount(userId: string) {
    return this.request<GenericResponse>('/auth/google/unlink', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Health check
  async healthCheck() {
    try {
  const result = await this.request<{ status: string; database: string }>('/health');
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
    return this.request<GenericResponse>(`/tickets/${ticketId}/send-resolution-email`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        resolvedBy
      })
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
}

export default ApiService;