/**
 * Google Sign-In Component
 * 
 * Provides Google OAuth authentication buttons with proper error handling,
 * loading states, and integration with the existing authentication system.
 * 
 * Features:
 * - Official Google Sign-In button with proper branding
 * - Loading states and error handling
 * - CSRF protection
 * - Responsive design
 * - Accessibility compliance
 */

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import GoogleOAuthService from '../services/googleAuthService';

interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  givenName?: string;
  familyName?: string;
  emailVerified?: boolean;
}

type GoogleSignInSuccessEvent = CustomEvent<{
  userInfo: GoogleUserInfo;
  credential: string;
}>;

type GoogleSignInErrorEvent = CustomEvent<{
  error: string;
}>;

// Google Sign-In Button Props Interface
interface GoogleSignInProps {
  /**
   * Callback function called on successful authentication
   * @param userInfo - User information from Google
   * @param credential - Google JWT credential
   */
  onSuccess: (userInfo: GoogleUserInfo, credential: string) => Promise<void>;
  
  /**
   * Callback function called on authentication error
   * @param error - Error message
   */
  onError: (error: string) => void;
  
  /**
   * Button text configuration
   * - 'signin_with': "Sign in with Google"
   * - 'signup_with': "Sign up with Google"  
   * - 'continue_with': "Continue with Google"
   */
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  
  /**
   * Button theme following Google's branding guidelines
   * - 'outline': White background with border
   * - 'filled_blue': Blue background
   * - 'filled_black': Black background
   */
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  
  /**
   * Button size
   * - 'large': 40px height (recommended)
   * - 'medium': 32px height
   * - 'small': 24px height
   */
  size?: 'large' | 'medium' | 'small';
  
  /**
   * Additional CSS classes for custom styling
   */
  className?: string;
  
  /**
   * Disable the button (useful during loading states)
   */
  disabled?: boolean;
}

/**
 * Google Sign-In Component
 * 
 * Renders the official Google Sign-In button and handles the OAuth flow
 */
const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  className = '',
  disabled = false
}) => {
  // Refs and state for component management
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleService] = useState(() => GoogleOAuthService.getInstance());
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Keep callback refs up to date without re-running effects that depend on them
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * Initialize Google OAuth service and render button
   */
  useEffect(() => {
    const initializeGoogle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize Google OAuth service
        const initialized = await googleService.initialize();
        
        if (!initialized) {
          throw new Error('Failed to initialize Google authentication');
        }

        setIsInitialized(true);

        // Render the Google Sign-In button
        if (buttonContainerRef.current) {
          googleService.renderSignInButton('google-signin-button', {
            type: 'standard',
            theme: theme,
            size: size,
            text: text,
            shape: 'rectangular'
          });
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Google Sign-In';
        console.error('❌ Google Sign-In initialization error:', errorMessage);
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogle();
  }, [googleService, theme, size, text]);

  /**
   * Set up event listeners for Google authentication events
   */
  useEffect(() => {
    // Handle successful Google sign-in
    const handleGoogleSuccess = async (event: GoogleSignInSuccessEvent) => {
      try {
        setIsLoading(true);
        setError(null);

        const { userInfo, credential } = event.detail;
        console.log('🎉 Google sign-in success event received');

        // Call the success callback with user information
        await onSuccessRef.current?.(userInfo, credential);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication processing failed';
        console.error('❌ Error processing Google sign-in:', errorMessage);
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Handle Google sign-in errors
    const handleGoogleError = (event: GoogleSignInErrorEvent) => {
      const { error } = event.detail;
      console.error('❌ Google sign-in error event:', error);
      setError(error);
      onErrorRef.current?.(error);
      setIsLoading(false);
    };

    const successListener = (event: Event) => {
      void handleGoogleSuccess(event as GoogleSignInSuccessEvent);
    };

    const errorListener = (event: Event) => {
      handleGoogleError(event as GoogleSignInErrorEvent);
    };

    // Add event listeners
    window.addEventListener('googleSignInSuccess', successListener);
    window.addEventListener('googleSignInError', errorListener);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('googleSignInSuccess', successListener);
      window.removeEventListener('googleSignInError', errorListener);
    };
  }, [googleService]);

  /**
   * Retry initialization if it failed
   */
  const handleRetry = () => {
    setError(null);
    setIsInitialized(false);
    
    // Re-trigger initialization
    const initializeGoogle = async () => {
      try {
        setIsLoading(true);
        const initialized = await googleService.initialize();
        
        if (initialized && buttonContainerRef.current) {
          googleService.renderSignInButton('google-signin-button', {
            type: 'standard',
            theme: theme,
            size: size,
            text: text,
            shape: 'rectangular'
          });
          setIsInitialized(true);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Retry failed';
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogle();
  };

  // Render loading state
  if (isLoading && !isInitialized) {
    return (
      <div className={`flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-white ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-600 mr-2" />
        <span className="text-gray-600 text-sm">Loading Google Sign-In...</span>
      </div>
    );
  }

  // Render error state
  if (error && !isInitialized) {
    return (
      <div className={`p-4 border border-red-300 rounded-lg bg-red-50 ${className}`}>
        <div className="flex items-center mb-2">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">Google Sign-In Unavailable</span>
        </div>
        <p className="text-red-700 text-sm mb-3">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Render the Google Sign-In button container
  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && isInitialized && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
        </div>
      )}
      
      {/* Error message overlay */}
      {error && isInitialized && (
        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Google Sign-In button container */}
      <div
        ref={buttonContainerRef}
        id="google-signin-button"
        className={`min-h-[40px] ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{
          // Ensure proper sizing for Google button
          width: '100%',
          minHeight: size === 'large' ? '40px' : size === 'medium' ? '32px' : '24px'
        }}
      />

      {/* Accessibility note */}
      <div className="sr-only">
        Sign in with your Google account for secure authentication
      </div>
    </div>
  );
};

export default GoogleSignIn;