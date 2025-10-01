import { useState, useEffect } from 'react';
import { User } from './types';
import AuthService from './services/authService';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

import KnowledgeBase from './components/KnowledgeBase';
import TicketTemplates from './components/TicketTemplates';
import CannedResponses from './components/CannedResponses';

import PermissionsManager from './components/PermissionsManager';
import PWAManager from './components/PWAManager';
import ScreenshotCapture from './components/ScreenshotCapture';
import CustomerSatisfaction from './components/CustomerSatisfaction';
import PerformanceDashboard from './components/PerformanceDashboard';
import EmailIntegration from './components/EmailIntegration';
import DataMigration from './components/DataMigration';
import ToastContainer from './components/ToastContainer';
import ToastService from './services/toastService';


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Try to restore session from localStorage
    const authService = AuthService.getInstance();
    const restored = authService.restoreSession();
    if (restored) {
      setUser(authService.getCurrentUser());
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const authService = AuthService.getInstance();
      const result = await authService.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        const toastService = ToastService.getInstance();
        toastService.success('Login Successful', `Welcome back, ${result.user.name}!`);

      } else {
        const errorMessage = result.error || 'Login failed';
        setLoginError(errorMessage);
        const toastService = ToastService.getInstance();
        toastService.error('Login Failed', errorMessage);
      }
    } catch {
      const errorMessage = 'An unexpected error occurred';
      setLoginError(errorMessage);
      const toastService = ToastService.getInstance();
      toastService.error('Login Error', errorMessage);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, phone: string, role: 'customer') => {
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const authService = AuthService.getInstance();
      const result = await authService.registerWithRole(email, password, name, phone, role);
      
      if (result.success && result.user) {
        setUser(result.user);
        const toastService = ToastService.getInstance();
        toastService.success('Registration Successful', `Welcome to SupportDesk, ${result.user.name}!`);

      } else {
        const errorMessage = result.error || 'Registration failed';
        setLoginError(errorMessage);
        const toastService = ToastService.getInstance();
        toastService.error('Registration Failed', errorMessage);
      }
    } catch {
      const errorMessage = 'An unexpected error occurred';
      setLoginError(errorMessage);
      const toastService = ToastService.getInstance();
      toastService.error('Registration Error', errorMessage);
    } finally {
      setIsLoginLoading(false);
    }
  };

  /**
   * Google Sign-In Handler
   * Processes Google OAuth authentication for existing users
   * 
   * @param googleCredential - JWT token from Google Sign-In
   */
  const handleGoogleSignIn = async (googleCredential: string) => {
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const authService = AuthService.getInstance();
      
      // Get CSRF token for security (optional but recommended)
      const csrfResult = await authService.getCSRFToken();
      const csrfToken = csrfResult.success ? csrfResult.csrfToken : undefined;
      
      // Process Google sign-in
      const result = await authService.googleSignIn(googleCredential, csrfToken);
      
      if (result.success && result.user) {
        setUser(result.user);
        const toastService = ToastService.getInstance();
        toastService.success('Google Sign-In Successful', `Welcome back, ${result.user.name}!`);
        console.log('✅ Google sign-in successful:', result.user.name);
      } else {
        const errorMessage = result.error || 'Google sign-in failed';
        setLoginError(errorMessage);
        const toastService = ToastService.getInstance();
        toastService.error('Google Sign-In Failed', errorMessage);
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      const errorMessage = 'Google authentication failed';
      setLoginError(errorMessage);
      const toastService = ToastService.getInstance();
      toastService.error('Google Sign-In Error', errorMessage);
    } finally {
      setIsLoginLoading(false);
    }
  };

  /**
   * Google Sign-Up Handler
   * Processes Google OAuth registration for new users
   * 
   * @param googleCredential - JWT token from Google Sign-In
   */
  const handleGoogleSignUp = async (googleCredential: string) => {
    setIsLoginLoading(true);
    setLoginError(null);

    try {
      const authService = AuthService.getInstance();
      
      // Get CSRF token for security (optional but recommended)
      const csrfResult = await authService.getCSRFToken();
      const csrfToken = csrfResult.success ? csrfResult.csrfToken : undefined;
      
      // Process Google sign-up
      const result = await authService.googleSignUp(googleCredential, csrfToken);
      
      if (result.success && result.user) {
        setUser(result.user);
        const toastService = ToastService.getInstance();
        toastService.success('Google Registration Successful', `Welcome to SupportDesk, ${result.user.name}!`);
        console.log('✅ Google sign-up successful:', result.user.name);
      } else {
        const errorMessage = result.error || 'Google registration failed';
        setLoginError(errorMessage);
        const toastService = ToastService.getInstance();
        toastService.error('Google Registration Failed', errorMessage);
      }
    } catch (error) {
      console.error('❌ Google sign-up error:', error);
      const errorMessage = 'Google registration failed';
      setLoginError(errorMessage);
      const toastService = ToastService.getInstance();
      toastService.error('Google Registration Error', errorMessage);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout function called');
    try {
      const authService = AuthService.getInstance();
      authService.logout();
      setUser(null);
      setCurrentPage('dashboard');
      const toastService = ToastService.getInstance();
      toastService.info('Logged Out', 'You have been successfully logged out');
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      const toastService = ToastService.getInstance();
      toastService.error('Logout Error', 'An error occurred while logging out');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'templates':
        return <TicketTemplates />;
      case 'canned-responses':
        return <CannedResponses />;
      case 'permissions':
        return <PermissionsManager />;
      case 'pwa':
        return <PWAManager />;
      case 'screenshots':
        return <ScreenshotCapture userId={user!.id} userName={user!.name} />;
      case 'csat':
        return <CustomerSatisfaction />;
      case 'performance':
        return <PerformanceDashboard />;
      case 'email-integration':
        return <EmailIntegration />;
      case 'data-migration':
        return <DataMigration />;
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">User Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={user!.name}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user!.email}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Role</label>
                  <input 
                    type="text" 
                    value={user!.role}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return <Dashboard user={user!} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Login
          onLogin={handleLogin}
          onRegister={handleRegister}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignUp={handleGoogleSignUp}
          isLoading={isLoginLoading}
          error={loginError}
        />
      ) : (
        <Layout user={user} onLogout={handleLogout} onNavigate={handleNavigate} currentPage={currentPage}>
          {renderCurrentPage()}
        </Layout>
      )}
      <ToastContainer />
    </>
  );
}

export default App;