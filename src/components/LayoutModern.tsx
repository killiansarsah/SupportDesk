import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, LogOut, Settings, BookOpen, FileText, MessageSquare, Home, Star, 
  BarChart3, Mail, Menu, X, Moon, Sun, ChevronLeft, ChevronRight, Users, ArrowLeft
} from 'lucide-react';
import { User as UserType } from '../types';
import LiveChat from './LiveChat';
import NotificationBell from './NotificationBell';
import ConnectionStatus from './ConnectionStatus';
import AppState from '../services/appState';
import ApiService from '../services/apiService';
import { navigationService } from '../services/navigationService';

interface LayoutModernProps {
  children: React.ReactNode;
  user: UserType;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const LayoutModern: React.FC<LayoutModernProps> = ({ 
  children, 
  user, 
  onLogout, 
  onNavigate, 
  currentPage = 'dashboard' 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userCount, setUserCount] = useState<number>(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user count for admins
  useEffect(() => {
    const fetchUserCount = async () => {
      if (user.role === 'administrator') {
        try {
          const api = ApiService.getInstance();
          const users = await api.getUsers();
          setUserCount(users.length);
        } catch (error) {
          console.error('Failed to fetch user count:', error);
        }
      }
    };
    fetchUserCount();
  }, [user.role]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, roles: ['customer', 'support-agent', 'administrator'] },
    { id: 'templates', name: 'Templates', icon: FileText, roles: ['support-agent', 'administrator'] },
    { id: 'canned-responses', name: 'Responses', icon: MessageSquare, roles: ['support-agent', 'administrator'] },
    { id: 'knowledge-base', name: 'Knowledge Base', icon: BookOpen, roles: ['customer', 'support-agent', 'administrator'] },
    { id: 'csat', name: 'Satisfaction', icon: Star, roles: ['support-agent', 'administrator'] },
    { id: 'performance', name: 'Performance', icon: BarChart3, roles: ['support-agent', 'administrator'] },
    { id: 'email-integration', name: 'Email', icon: Mail, roles: ['support-agent', 'administrator'] },
    { id: 'user-management', name: 'Users', icon: Users, roles: ['administrator'], badge: userCount > 0 ? userCount : undefined },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user.role));

  const NavItem = ({ item, mobile = false }: { item: typeof navigation[0]; mobile?: boolean }) => {
    const isActive = currentPage === item.id;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          onNavigate?.(item.id);
          if (mobile) setShowMobileMenu(false);
        }}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-primary-600 text-white shadow-lg' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
          }
          ${sidebarCollapsed && !mobile ? 'justify-center' : ''}
        `}
        title={sidebarCollapsed && !mobile ? item.name : ''}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {(!sidebarCollapsed || mobile) && (
          <>
            <span className="font-medium flex-1 text-left">{item.name}</span>
            {item.badge !== undefined && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-semibold
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                }
              `}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Dark/Light mode background */}
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
        
        {/* Sidebar - Desktop */}
        <aside 
          className={`
            fixed left-0 top-0 z-40 h-screen bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-800
            transition-all duration-300 hidden lg:block
            ${sidebarCollapsed ? 'w-20' : 'w-64'}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-800">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-gray-900 dark:text-white font-bold text-xl">S</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">SupportDesk</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Support System</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400"
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {filteredNav.map(item => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200 dark:border-dark-800">
              {!sidebarCollapsed ? (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-2 ${sidebarCollapsed ? 'flex-col' : ''}`}>
                <button
                  onClick={() => onNavigate?.('settings')}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                    bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700
                    text-gray-700 dark:text-gray-300 transition-colors
                    ${sidebarCollapsed ? 'w-full' : 'flex-1'}
                  `}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                  {!sidebarCollapsed && <span className="text-sm">Settings</span>}
                </button>
                <button
                  onClick={onLogout}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                    bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30
                    text-red-600 dark:text-red-400 transition-colors
                    ${sidebarCollapsed ? 'w-full' : 'flex-1'}
                  `}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  {!sidebarCollapsed && <span className="text-sm">Logout</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {showMobileMenu && (
          <>
            {createPortal(
              <div className="fixed inset-0 z-50 lg:hidden">
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowMobileMenu(false)}
                />
                
                {/* Menu Panel */}
                <div 
                  ref={mobileMenuRef}
                  className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-dark-900 shadow-xl"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <div>
                          <h1 className="text-lg font-bold text-gray-900 dark:text-white">SupportDesk</h1>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Support System</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowMobileMenu(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
                      >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                      {filteredNav.map(item => (
                        <NavItem key={item.id} item={item} mobile />
                      ))}
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-200 dark:border-dark-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onNavigate?.('settings');
                            setShowMobileMenu(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMobileMenu(false);
                            onLogout();
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </>
        )}

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
              {/* Left Side */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <div className="flex items-center gap-3">
                  {currentPage !== 'dashboard' && (
                    <button
                      onClick={() => navigationService.goToDashboard()}
                      className="back-btn-animate inline-flex items-center gap-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/20 dark:text-gray-200"
                      aria-label="Back to Dashboard"
                    >
                      <span className="back-btn-glass back-btn-animate inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
                        <ArrowLeft className="w-4 h-4 back-icon text-current" />
                      </span>
                      <span className="hidden sm:inline">Back to Dashboard</span>
                    </button>
                  )}
                  <div className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {filteredNav.find(item => item.id === currentPage)?.name || 'Dashboard'}
                    </h2>
                    <p className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
                      Welcome back, {user.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <ConnectionStatus />
                  
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400 transition-colors"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  <NotificationBell 
                    user={user} 
                    onNavigateToTicket={(ticketId) => {
                      onNavigate?.('dashboard');
                      setTimeout(() => {
                        const appState = AppState.getInstance();
                        appState.openTicket(ticketId);
                      }, 50);
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        
        <LiveChat />
      </div>
    </div>
  );
};

export default LayoutModern;
