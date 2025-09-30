# Google OAuth Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the SupportDesk application.

## 🔧 Prerequisites

- Node.js and npm installed
- MongoDB running locally or in the cloud
- Google Cloud Console access

## 📋 Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `SupportDesk OAuth`
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Google+ API** (for user profile access)
   - **Google Identity Services** (for OAuth authentication)

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type (for testing)
3. Fill in the required fields:
   - **App name**: `SupportDesk`
   - **User support email**: Your email
   - **App logo**: Optional
   - **App domain**: `http://localhost:5173` (for development)
   - **Developer contact email**: Your email
4. Add scopes:
   - `openid`
   - `profile`
   - `email`
5. Add test users (your email and any other test accounts)
6. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Configure:
   - **Name**: `SupportDesk Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:5173
     http://localhost:5174
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/google/callback
     http://localhost:5173/auth/google/callback
     http://localhost:5174/auth/google/callback
     ```
5. Click "Create"
6. **Copy the Client ID and Client Secret** - you'll need these!

## 🔐 Environment Configuration

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Update Environment Variables

Open `.env` file and update with your Google OAuth credentials:

```env
# Replace with your actual Google OAuth credentials
# Frontend variables (Vite requires VITE_ prefix)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Backend variables
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here

# Generate secure secrets (use openssl rand -base64 32)
JWT_SECRET=your-secure-jwt-secret-here
CSRF_SECRET=your-secure-csrf-secret-here
SESSION_SECRET=your-secure-session-secret-here
OAUTH_STATE_SECRET=your-secure-oauth-state-secret-here
```

### Step 3: Generate Secure Secrets

Generate secure secrets using OpenSSL:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate CSRF secret
openssl rand -base64 32

# Generate Session secret
openssl rand -base64 32

# Generate OAuth State secret
openssl rand -base64 32
```

## 📦 Installation and Setup

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### Step 2: Database Setup

Ensure MongoDB is running and accessible via the URI in your `.env` file.

### Step 3: Start the Application

```bash
# Start backend server (from backend directory)
cd backend
npm start

# Start frontend (from root directory - new terminal)
cd ..
npm run dev
```

## 🧪 Testing Google OAuth

### Test Sign-In Flow

1. Open `http://localhost:5173` in your browser
2. Click "Sign in with Google" button
3. Complete Google OAuth flow
4. Verify user is created/logged in successfully

### Test Sign-Up Flow

1. On login page, click "Don't have an account? Sign up"
2. Click "Sign up with Google" button
3. Complete Google OAuth flow
4. Verify new user account is created

## 🛡️ Security Considerations

### Production Deployment

Before deploying to production:

1. **Update OAuth URLs**: Add your production domain to Google Console
2. **Secure Environment Variables**: Use secure secret management
3. **Enable HTTPS**: Google OAuth requires HTTPS in production
4. **Update CORS Origins**: Restrict to your production domains
5. **Rate Limiting**: Configure appropriate rate limits
6. **Monitor Logs**: Set up logging and monitoring

### Security Best Practices

- ✅ Client Secret never exposed to frontend
- ✅ Server-side token verification with Google
- ✅ CSRF protection tokens
- ✅ Secure JWT token generation
- ✅ Rate limiting on OAuth endpoints
- ✅ Input validation and sanitization
- ✅ Secure session management

## 🐛 Troubleshooting

### Common Issues

**Error: "redirect_uri_mismatch"**

- Solution: Ensure redirect URIs in Google Console exactly match your app URLs

**Error: "invalid_client"**

- Solution: Check Client ID and Client Secret are correct

**Error: "access_denied"**

- Solution: User cancelled OAuth flow or app not approved

**Error: "Failed to load Google Identity Services"**

- Solution: Check internet connection and Google services availability

**Error: "Token verification failed"**

- Solution: Check server-side Google OAuth configuration

### Debug Mode

Enable debug logging by adding to `.env`:

```env
NODE_ENV=development
DEBUG=google-oauth,auth-service
```

### Vite Environment Variables

**Important:** This project uses Vite, which requires environment variables exposed to the frontend to be prefixed with `VITE_`.

- ✅ **Correct**: `VITE_GOOGLE_CLIENT_ID`
- ❌ **Incorrect**: `REACT_APP_GOOGLE_CLIENT_ID`

Make sure your `.env` file uses the correct prefixes for frontend variables.

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

## 🎯 Features Included

- ✅ Google Sign-In integration
- ✅ Google Sign-Up (automatic account creation)
- ✅ Server-side token verification
- ✅ CSRF protection
- ✅ Error handling and user feedback
- ✅ Responsive Google Sign-In buttons
- ✅ Secure session management
- ✅ User account linking/unlinking
- ✅ Privacy compliance

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify Google Cloud Console configuration
3. Check browser console for error messages
4. Verify environment variables are set correctly
5. Ensure all dependencies are installed
