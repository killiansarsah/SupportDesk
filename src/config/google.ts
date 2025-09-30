/**
 * Google OAuth Configuration
 * Contains client IDs and configuration for Google Sign-In integration
 * 
 * Security Note: In production, these should be environment variables
 * and the client secret should NEVER be exposed to the frontend
 */

// Google OAuth Client Configuration
export const GOOGLE_CONFIG = {
  // Client ID for web application (safe to expose in frontend)
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
  
  // Redirect URI for OAuth callback (must match Google Console settings)
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  
  // Scopes requested from Google (minimal required permissions)
  SCOPES: [
    'openid',           // Required for OpenID Connect
    'profile',          // Access to basic profile info (name, picture)
    'email'             // Access to email address
  ],
  
  // OAuth response type
  RESPONSE_TYPE: 'code',
  
  // Additional security parameters
  ACCESS_TYPE: 'offline',  // Request refresh token for long-term access
  PROMPT: 'consent'        // Always show consent screen for security
};

// Frontend-safe configuration (excludes sensitive data)
export const FRONTEND_GOOGLE_CONFIG = {
  CLIENT_ID: GOOGLE_CONFIG.CLIENT_ID,
  SCOPES: GOOGLE_CONFIG.SCOPES
};