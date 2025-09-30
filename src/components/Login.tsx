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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-6 lg:space-y-8 order-2 lg:order-1">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6">
              <span className="text-white font-bold text-xl sm:text-2xl">S</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              Support<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Desk</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
              Advanced customer support ticketing system with real-time collaboration and intelligent automation.
            </p>
          </div>


        </div>

        {/* Right Side - Login Form */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl order-1 lg:order-2">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm sm:text-base text-gray-300">
              {isLoginMode ? 'Sign in to your account' : 'Create a customer support account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 backdrop-blur-lg bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Enter your email"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 sm:py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  style={{ transform: 'translateY(-50%)', pointerEvents: 'auto' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>



            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  <span>{isLoginMode ? 'Sign In' : 'Sign Up'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-sm text-gray-300 bg-transparent">or</span>
            <div className="flex-1 border-t border-white/20"></div>
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
            <p className="text-xs text-gray-400 text-center px-2">
              By signing {isLoginMode ? 'in' : 'up'} with Google, you agree to our Terms of Service and Privacy Policy. 
              We only access your basic profile information.
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setEmail('');
                setPassword('');
                setName('');
                setPhone('');
                // Role is always 'customer' for new registrations
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isLoginMode ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;