/**
 * Google OAuth Service
 * Handles Google Sign-In integration, token verification, and user data extraction
 * 
 * This service manages the complete OAuth flow:
 * 1. Initialize Google Sign-In
 * 2. Handle authentication responses
 * 3. Verify tokens with Google
 * 4. Extract user information
 * 5. Integrate with existing auth system
 */

import { FRONTEND_GOOGLE_CONFIG } from '../config/google';
import { User } from '../types';

// Google Sign-In response interface
interface GoogleSignInResponse {
  credential: string;  // JWT token from Google
  select_by: string;   // How user was selected (e.g., 'btn', 'one_tap')
}

// Decoded Google JWT payload interface
interface GoogleJWTPayload {
  iss: string;         // Issuer (should be accounts.google.com)
  aud: string;         // Audience (your client ID)
  sub: string;         // Subject (Google user ID)
  email: string;       // User email
  email_verified: boolean;  // Email verification status
  name: string;        // Full name
  picture: string;     // Profile picture URL
  given_name: string;  // First name
  family_name: string; // Last name
  iat: number;         // Issued at timestamp
  exp: number;         // Expiration timestamp
}

class GoogleOAuthService {
  private static instance: GoogleOAuthService;
  private isInitialized = false;
  private google: any = null;

  /**
   * Singleton pattern implementation
   * Ensures only one instance of the service exists
   */
  static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  /**
   * Initialize Google Sign-In
   * Loads the Google Identity Services library and configures it
   * 
   * @returns Promise<boolean> - Success status of initialization
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if already initialized
      if (this.isInitialized && window.google) {
        return true;
      }

      // Load Google Identity Services script dynamically
      await this.loadGoogleScript();

      // Wait for Google object to be available
      await this.waitForGoogle();

      // Initialize Google Identity Services
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: FRONTEND_GOOGLE_CONFIG.CLIENT_ID,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,                    // Don't auto-select accounts
          cancel_on_tap_outside: true,          // Cancel on outside click
          use_fedcm_for_prompt: false          // Use traditional popup
        });

        this.google = window.google;
        this.isInitialized = true;
        console.log('✅ Google OAuth initialized successfully');
        return true;
      }

      throw new Error('Google Identity Services not available');

    } catch (error) {
      console.error('❌ Failed to initialize Google OAuth:', error);
      return false;
    }
  }

  /**
   * Dynamically load Google Identity Services script
   * Prevents blocking the initial page load
   */
  private async loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="accounts.google.com"]')) {
        resolve();
        return;
      }

      // Create and append script element
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('📜 Google Identity Services script loaded');
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Google object to be available in window
   * Implements retry logic with timeout
   */
  private async waitForGoogle(maxAttempts = 50): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const checkGoogle = () => {
        attempts++;
        
        if (window.google?.accounts?.id) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Timeout waiting for Google object'));
        } else {
          setTimeout(checkGoogle, 100); // Check every 100ms
        }
      };

      checkGoogle();
    });
  }

  /**
   * Handle Google Sign-In credential response
   * This is the callback function triggered when user completes OAuth
   * 
   * @param response - Google Sign-In response containing JWT credential
   */
  private async handleCredentialResponse(response: GoogleSignInResponse) {
    try {
      console.log('🔐 Received Google credential response');
      
      // Verify and decode the JWT token
      const userInfo = await this.verifyGoogleToken(response.credential);
      
      if (userInfo) {
        // Trigger custom event with user information
        // This allows other parts of the app to listen for successful authentication
        const event = new CustomEvent('googleSignInSuccess', {
          detail: { userInfo, credential: response.credential }
        });
        window.dispatchEvent(event);
      }

    } catch (error) {
      console.error('❌ Error handling Google credential:', error);
      
      // Trigger error event
      const event = new CustomEvent('googleSignInError', {
        detail: { error: error.message }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Verify Google JWT token and extract user information
   * In production, this verification should happen on the backend
   * 
   * @param credential - JWT token from Google
   * @returns Promise<GoogleJWTPayload | null> - Decoded user information
   */
  private async verifyGoogleToken(credential: string): Promise<GoogleJWTPayload | null> {
    try {
      // Decode JWT token (for demo purposes - in production, verify on backend)
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload: GoogleJWTPayload = JSON.parse(jsonPayload);

      // Basic validation
      if (!payload.email || !payload.email_verified) {
        throw new Error('Invalid or unverified email from Google');
      }

      if (payload.aud !== FRONTEND_GOOGLE_CONFIG.CLIENT_ID) {
        throw new Error('Token audience mismatch');
      }

      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('Google token has expired');
      }

      console.log('✅ Google token verified successfully');
      return payload;

    } catch (error) {
      console.error('❌ Failed to verify Google token:', error);
      return null;
    }
  }

  /**
   * Render Google Sign-In button
   * Creates and displays the official Google Sign-In button
   * 
   * @param containerId - ID of the container element for the button
   * @param options - Additional button configuration options
   */
  renderSignInButton(containerId: string, options: {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  } = {}) {
    if (!this.isInitialized || !this.google?.accounts?.id) {
      console.error('❌ Google OAuth not initialized');
      return;
    }

    // Default button configuration following Google's branding guidelines
    const buttonConfig = {
      type: options.type || 'standard',
      theme: options.theme || 'outline',
      size: options.size || 'large',
      text: options.text || 'signin_with',
      shape: options.shape || 'rectangular'
      // Removed width property to avoid Google validation error
    };

    try {
      // Render the button in the specified container
      this.google.accounts.id.renderButton(
        document.getElementById(containerId),
        buttonConfig
      );
      console.log('🎨 Google Sign-In button rendered');

    } catch (error) {
      console.error('❌ Failed to render Google Sign-In button:', error);
    }
  }

  /**
   * Trigger One Tap prompt
   * Shows Google's One Tap sign-in prompt for returning users
   */
  showOneTap() {
    if (!this.isInitialized || !this.google?.accounts?.id) {
      console.error('❌ Google OAuth not initialized');
      return;
    }

    try {
      this.google.accounts.id.prompt((notification: any) => {
        console.log('One Tap prompt notification:', notification);
      });
    } catch (error) {
      console.error('❌ Failed to show One Tap:', error);
    }
  }

  /**
   * Convert Google user info to application User interface
   * Maps Google's user data structure to your app's User interface
   * 
   * @param googleUser - Google user payload
   * @returns User - Application user object
   */
  convertGoogleUserToAppUser(googleUser: GoogleJWTPayload): Omit<User, 'id' | 'createdAt' | 'lastLogin' | 'isActive'> {
    return {
      email: googleUser.email,
      name: googleUser.name,
      phone: '', // Google doesn't provide phone in basic scope
      role: 'customer', // Default role for Google sign-ups
      avatar: googleUser.picture
    };
  }

  /**
   * Sign out from Google
   * Revokes Google authentication tokens
   */
  async signOut(): Promise<void> {
    try {
      if (this.google?.accounts?.id) {
        // Google Sign-In doesn't have a traditional sign out
        // We'll clear any stored Google tokens
        await this.google.accounts.id.disableAutoSelect();
        console.log('✅ Google sign-out completed');
      }
    } catch (error) {
      console.error('❌ Error during Google sign-out:', error);
    }
  }
}

// Global interface extension for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default GoogleOAuthService;