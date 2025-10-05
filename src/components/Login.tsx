import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, Phone } from 'lucide-react';
import GoogleSignIn from './GoogleSignIn';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister?: (email: string, password: string, name: string, phone: string, role: 'customer') => Promise<void>;
  onGoogleSignIn?: (googleCredential: string) => Promise<void>;
  onGoogleSignUp?: (googleCredential: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onGoogleSignIn, onGoogleSignUp, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState<'customer'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      await onLogin(email, password);
    } else {
      if (onRegister) {
        await onRegister(email, password, name, phone, role);
      }
    }
  };



  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
          <div className="inline-flex items-center justify-center lg:justify-start w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6">
              <span className="text-gray-900 dark:text-white font-bold text-2xl">S</span>
          </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Support<span className="text-primary-600">Desk</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
            Advanced customer support ticketing system with real-time collaboration and intelligent automation.
          </p>
          
          {/* Features List */}
          <div className="hidden lg:block space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-300">Real-time ticket tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-300">Team collaboration tools</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-900/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-300">Advanced analytics dashboard</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-dark-900 rounded-2xl border border-dark-800 p-8 shadow-soft-lg order-1 lg:order-2">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isLoginMode ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-gray-400">
              {isLoginMode ? 'Log in to access your support dashboard' : 'Join us and start managing your support tickets'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLoginMode && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-700 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-primary-400 hover:text-primary-300">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLoginMode ? 'Sign in' : 'Create account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-dark-800"></div>
            <span className="px-4 text-sm text-gray-400">or continue with</span>
            <div className="flex-1 border-t border-dark-800"></div>
          </div>

          {/* Google Sign-In Section */}
          <div className="space-y-3">
            {isLoginMode ? (
              // Google Sign-In Button
              <GoogleSignIn
                text="signin_with"
                theme="outline"
                size="large"
                className="w-full"
                disabled={isLoading}
                onSuccess={async (_userInfo, credential) => {
                  if (onGoogleSignIn) {
                    await onGoogleSignIn(credential);
                  }
                }}
                onError={(error) => {
                  console.error('Google Sign-In Error:', error);
                }}
              />
            ) : (
              // Google Sign-Up Button
              <GoogleSignIn
                text="signup_with"
                theme="outline"
                size="large"
                className="w-full"
                disabled={isLoading}
                onSuccess={async (_userInfo, credential) => {
                  if (onGoogleSignUp) {
                    await onGoogleSignUp(credential);
                  }
                }}
                onError={(error) => {
                  console.error('Google Sign-Up Error:', error);
                }}
              />
            )}
            
            {/* Privacy Notice for Google OAuth */}
            <p className="text-xs text-gray-400 text-center">
              By {isLoginMode ? 'signing in' : 'creating an account'}, you agree to our{' '}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Privacy Policy
              </a>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setPhone('');
                }}
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;