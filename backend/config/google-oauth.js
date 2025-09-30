/**
 * Google OAuth Backend Configuration
 * Server-side configuration and validation for Google OAuth integration
 * 
 * Security Features:
 * - Server-side token verification
 * - CSRF protection
 * - Secure session management
 * - Rate limiting for OAuth endpoints
 */

// Google OAuth Configuration for Backend
const GOOGLE_OAUTH_CONFIG = {
  // Client ID (same as frontend, safe to use)
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
  
  // Client Secret (NEVER expose to frontend)
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  
  // Redirect URIs (must match Google Console configuration)
  REDIRECT_URIS: [
    'http://localhost:3001/auth/google/callback',
    'http://localhost:5173/auth/google/callback'
  ],
  
  // Token validation endpoint
  TOKEN_INFO_URL: 'https://oauth2.googleapis.com/tokeninfo',
  
  // User info endpoint
  USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo'
};

export default GOOGLE_OAUTH_CONFIG;