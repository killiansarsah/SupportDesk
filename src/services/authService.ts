import { User, AuthState } from '../types';

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'administrator',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '2',
    email: 'agent@company.com',
    name: 'Support Agent',
    role: 'support-agent',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
  {
    id: '3',
    email: 'customer@email.com',
    name: 'John Customer',
    role: 'customer',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
    isActive: true,
  },
];

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // In a real app, you'd validate the password hash
    if (password !== 'password123') {
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate mock JWT token
    const token = `mock_jwt_token_${user.id}_${Date.now()}`;
    
    this.authState = {
      user: { ...user, lastLogin: new Date().toISOString() },
      isAuthenticated: true,
      token,
    };

    // Store in localStorage for persistence
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(this.authState.user));

    return { success: true, user: this.authState.user ?? undefined, token };
  }

  async register(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'>): Promise<{ success: boolean; user?: User; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    if (MOCK_USERS.find(u => u.email === userData.email)) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    MOCK_USERS.push(newUser);
    return { success: true, user: newUser };
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

  getAllUsers(): User[] {
    return MOCK_USERS;
  }
}

export default AuthService;