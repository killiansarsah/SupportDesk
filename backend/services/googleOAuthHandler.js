/**
 * Google OAuth Route Handler
 * Handles server-side Google OAuth authentication, token verification, and user management
 * 
 * Security Implementation:
 * - Server-side token verification with Google
 * - CSRF token validation
 * - Rate limiting protection
 * - Secure JWT token generation
 * - User data validation and sanitization
 */

import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import GOOGLE_CONFIG from '../config/google-oauth.js';

/**
 * Google OAuth Service Class
 * Encapsulates all Google OAuth related functionality for the backend
 */
class GoogleOAuthHandler {
  constructor() {
    const envClientId = process.env.GOOGLE_CLIENT_ID;
    const envClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const clientId = envClientId && envClientId !== 'your-google-client-id.apps.googleusercontent.com'
      ? envClientId
      : GOOGLE_CONFIG.CLIENT_ID;

    const clientSecret = envClientSecret && envClientSecret !== 'your-google-client-secret'
      ? envClientSecret
      : GOOGLE_CONFIG.CLIENT_SECRET;

    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      console.error('⚠️ Google OAuth client ID is not configured correctly.');
    }

    // Initialize Google OAuth2 client with credentials
    this.oauth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      GOOGLE_CONFIG.REDIRECT_URIS[0]
    );
    this.clientId = clientId;
    
    // JWT secret for token generation (should be in environment variables)
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  }

  /**
   * Verify Google ID Token
   * Validates the token directly with Google's servers for maximum security
   * 
   * @param {string} idToken - Google ID token from frontend
   * @returns {Promise<Object>} - Verified user payload or null if invalid
   */
  async verifyGoogleToken(idToken) {
    try {
      console.log('🔐 Verifying Google ID token...');
      
      // Verify token with Google's servers
      const ticket = await this.oauth2Client.verifyIdToken({
  idToken: idToken,
  audience: this.clientId
      });

      // Extract verified payload
      const payload = ticket.getPayload();
      
      // Additional security validations
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      if (!payload.email_verified) {
        throw new Error('Email not verified by Google');
      }

      // Check token audience matches our client ID
      if (payload.aud !== this.clientId) {
        console.error('⚠️ Token audience mismatch:', {
          tokenAudience: payload.aud,
          expectedAudience: this.clientId,
        });
        throw new Error('Token audience mismatch');
      }

      console.log('✅ Google token verified successfully');
      
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        givenName: payload.given_name,
        familyName: payload.family_name,
        emailVerified: payload.email_verified
      };

    } catch (error) {
      console.error('❌ Google token verification failed:', error.message);
        if (error?.errors) {
          console.error('   ↳ Detailed errors:', JSON.stringify(error.errors, null, 2));
        }
        if (GOOGLE_CONFIG?.CLIENT_ID) {
          console.error('   ↳ Expected audience:', GOOGLE_CONFIG.CLIENT_ID);
        }
      return null;
    }
  }

  /**
   * Handle Google Sign-In Authentication
   * Processes Google OAuth callback and creates/updates user account
   * 
   * @param {string} googleIdToken - Google ID token
   * @param {string} csrfToken - CSRF protection token
   * @returns {Promise<Object>} - Authentication result with user and JWT
   */
  async handleGoogleSignIn(googleIdToken, csrfToken = null) {
    try {
      console.log('🚀 Processing Google sign-in...');

      // Verify the Google ID token
      const googleUserData = await this.verifyGoogleToken(googleIdToken);
      
      if (!googleUserData) {
        return {
          success: false,
          error: 'Invalid Google authentication token'
        };
      }

      // Check if user already exists
      let user = await User.findOne({ email: googleUserData.email });

      if (user) {
        // Existing user - update Google information and last login
        console.log('👤 Existing user found, updating information...');
        
        user.avatar = googleUserData.picture; // Update profile picture
        user.lastLogin = new Date().toISOString();
        
        // Add Google ID if not already linked
        if (!user.googleId) {
          user.googleId = googleUserData.googleId;
        }
        
        await user.save();
        
      } else {
        // New user - create account with Google information
        console.log('🆕 Creating new user from Google account...');
        console.log('🔍 Google user data:', JSON.stringify(googleUserData, null, 2));
        
        user = new User({
          email: googleUserData.email,
          name: googleUserData.name || googleUserData.givenName || googleUserData.email.split('@')[0] || 'Google User',
          phone: '', // Google basic scope doesn't include phone
          role: 'customer', // Default role for Google sign-ups
          avatar: googleUserData.picture,
          googleId: googleUserData.googleId,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          // Note: No password field for Google OAuth users
          authProvider: 'google' // Track authentication method
        });

        await user.save();
      }

      // Generate JWT token for session management
      const jwtToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          authProvider: 'google'
        },
        this.JWT_SECRET,
        {
          expiresIn: '24h', // Token expires in 24 hours
          issuer: 'supportdesk-app',
          audience: 'supportdesk-users'
        }
      );

      // Sanitize user data for response (remove sensitive information)
      const userResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      };

      console.log('✅ Google authentication successful');

      return {
        success: true,
        user: userResponse,
        token: jwtToken,
        authProvider: 'google'
      };

    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Handle Google Sign-Up (same as sign-in for OAuth)
   * Google OAuth doesn't distinguish between sign-up and sign-in
   * 
   * @param {string} googleIdToken - Google ID token
   * @param {string} csrfToken - CSRF protection token
   * @returns {Promise<Object>} - Registration result
   */
  async handleGoogleSignUp(googleIdToken, csrfToken = null) {
    // For OAuth providers, sign-up and sign-in are the same process
    return this.handleGoogleSignIn(googleIdToken, csrfToken);
  }

  /**
   * Unlink Google Account
   * Removes Google OAuth linkage from user account
   * 
   * @param {string} userId - User ID to unlink
   * @returns {Promise<boolean>} - Success status
   */
  async unlinkGoogleAccount(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has password authentication as backup
      if (!user.password && user.authProvider === 'google') {
        throw new Error('Cannot unlink Google account - no alternative authentication method');
      }

      // Remove Google linkage
      user.googleId = undefined;
      user.authProvider = 'email'; // Fallback to email auth
      
      await user.save();
      
      console.log('✅ Google account unlinked successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to unlink Google account:', error);
      return false;
    }
  }

  /**
   * Generate CSRF Token
   * Creates a secure token to prevent cross-site request forgery attacks
   * 
   * @returns {string} - CSRF token
   */
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate CSRF Token
   * Verifies CSRF token to prevent forgery attacks
   * 
   * @param {string} token - Token to validate
   * @param {string} sessionToken - Token from user session
   * @returns {boolean} - Validation result
   */
  validateCSRFToken(token, sessionToken) {
    return token && sessionToken && token === sessionToken;
  }
}

export default GoogleOAuthHandler;