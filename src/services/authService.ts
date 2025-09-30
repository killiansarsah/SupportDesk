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
      } catch {
        this.logout();
        return false;
      }
    }

    return false;
  }



  async registerWithRole(email: string, password: string, name: string, phone: string, role: 'customer'): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
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

  /**
   * Google OAuth Sign-In
   * Authenticates user with Google ID token via backend verification
   * 
   * Security Features:
   * - Server-side token verification
   * - CSRF protection
   * - Secure session establishment
   * 
   * @param googleCredential - JWT token from Google Sign-In
   * @param csrfToken - Optional CSRF protection token
   * @returns Authentication result with user data and JWT token
   */
  async googleSignIn(googleCredential: string, csrfToken?: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      console.log('🔐 Processing Google sign-in...');

      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      // Send Google credential to backend for verification
      const result = await apiService.googleSignIn(googleCredential, csrfToken);
      
      if (result.success && result.user) {
        // Transform user data to match frontend interface
        const transformedUser = {
          ...result.user,
          id: result.user._id || result.user.id
        };
        
        // Update authentication state
        this.authState = {
          user: transformedUser,
          isAuthenticated: true,
          token: result.token,
        };

        // Store session data
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(transformedUser));
        localStorage.setItem('auth_provider', 'google');

        console.log('✅ Google sign-in successful');
        return { success: true, user: transformedUser, token: result.token };
        
      } else {
        console.log('❌ Google sign-in failed:', result.error);
        return { success: false, error: result.error || 'Google authentication failed' };
      }

    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      return { success: false, error: 'Google authentication error' };
    }
  }

  /**
   * Google OAuth Sign-Up
   * Registers new user with Google account information
   * 
   * Note: For OAuth providers, sign-up and sign-in are typically the same process
   * 
   * @param googleCredential - JWT token from Google Sign-In
   * @param csrfToken - Optional CSRF protection token
   * @returns Registration result with user data and JWT token
   */
  async googleSignUp(googleCredential: string, csrfToken?: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      console.log('📝 Processing Google sign-up...');

      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      // Send Google credential to backend for registration
      const result = await apiService.googleSignUp(googleCredential, csrfToken);
      
      if (result.success && result.user) {
        // Transform user data to match frontend interface
        const transformedUser = {
          ...result.user,
          id: result.user._id || result.user.id
        };
        
        // Update authentication state
        this.authState = {
          user: transformedUser,
          isAuthenticated: true,
          token: result.token,
        };

        // Store session data
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(transformedUser));
        localStorage.setItem('auth_provider', 'google');

        console.log('✅ Google sign-up successful');
        return { success: true, user: transformedUser, token: result.token };
        
      } else {
        console.log('❌ Google sign-up failed:', result.error);
        return { success: false, error: result.error || 'Google registration failed' };
      }

    } catch (error) {
      console.error('❌ Google sign-up error:', error);
      return { success: false, error: 'Google registration error' };
    }
  }

  /**
   * Get CSRF Token for OAuth Security
   * Retrieves a CSRF token from the backend to prevent cross-site request forgery
   * 
   * @returns Promise with CSRF token or error
   */
  async getCSRFToken(): Promise<{ success: boolean; csrfToken?: string; error?: string }> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const result = await apiService.getCSRFToken();
      
      if (result.success && result.csrfToken) {
        // Store CSRF token temporarily in session storage
        sessionStorage.setItem('csrf_token', result.csrfToken);
        return { success: true, csrfToken: result.csrfToken };
      }
      
      return { success: false, error: 'Failed to get CSRF token' };

    } catch (error) {
      console.error('❌ CSRF token error:', error);
      return { success: false, error: 'CSRF token request failed' };
    }
  }

  /**
   * Unlink Google Account
   * Removes Google OAuth linkage from user account
   * 
   * @param userId - User ID to unlink
   * @returns Success status
   */
  async unlinkGoogleAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const result = await apiService.unlinkGoogleAccount(userId);
      
      if (result.success) {
        // Update stored user data to remove Google linkage
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          // Remove Google-specific fields (if any)
          localStorage.setItem('user_data', JSON.stringify(user));
        }
        
        console.log('✅ Google account unlinked successfully');
      }
      
      return result;

    } catch (error) {
      console.error('❌ Google unlink error:', error);
      return { success: false, error: 'Failed to unlink Google account' };
    }
  }

  /**
   * Check Authentication Provider
   * Determines how the user authenticated (email/password vs Google OAuth)
   * 
   * @returns Authentication provider ('email' | 'google' | null)
   */
  getAuthProvider(): string | null {
    return localStorage.getItem('auth_provider') || 'email';
  }

  /**
   * Enhanced Logout with OAuth Support
   * Clears all authentication data including OAuth provider information
   */
  logout(): void {
    // Clear authentication state
    this.authState = {
      user: null,
      isAuthenticated: false,
      token: null,
    };

    // Clear all stored authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_provider');
    sessionStorage.removeItem('csrf_token');

    console.log('✅ User logged out successfully');
  }
}

export default AuthService;