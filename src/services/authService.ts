import { User, AuthState } from '../types';

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null,
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const result = await apiService.login(email, password);
      
      if (result.success && result.user) {
        const transformedUser = {
          ...result.user,
          id: result.user._id || result.user.id
        };
        
        this.authState = {
          user: transformedUser,
          isAuthenticated: true,
          token: result.token,
        };

        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(transformedUser));

        return { success: true, user: transformedUser, token: result.token };
      } else {
        return { success: false, error: result.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection error' };
    }
  }

  async register(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'> & { password?: string }): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const result = await apiService.register(userData);
      
      if (result.success && result.user) {
        const transformedUser = {
          ...result.user,
          id: result.user._id || result.user.id
        };
        
        this.authState = {
          user: transformedUser,
          isAuthenticated: true,
          token: result.token,
        };

        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(transformedUser));

        return { success: true, user: transformedUser, token: result.token };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  logout(): void {
    this.authState = {
      user: null,
      isAuthenticated: false,
      token: null,
    };
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getToken(): string | null {
    return this.authState.token;
  }

  // Restore session from localStorage
  restoreSession(): boolean {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.authState = {
          user,
          isAuthenticated: true,
          token,
        };
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }

    return false;
  }



  async registerWithRole(email: string, password: string, name: string, phone: string, role: 'customer' | 'support-agent' | 'administrator'): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    return this.register({ email, name, phone, role, password });
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      const result = await apiService.getUsers();
      return result.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export default AuthService;