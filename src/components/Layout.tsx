import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, Settings, BookOpen, FileText, MessageSquare, Home, Star, BarChart3, Mail, Menu, X } from 'lucide-react';
import { User as UserType } from '../types';
import LiveChat from './LiveChat';
import NotificationSystem from './NotificationSystem';
import ConnectionStatus from './ConnectionStatus';
import AppState from '../services/appState';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage = 'dashboard' }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        const target = event.target as Node;
        const containsInWrapper = !!(userMenuRef.current && userMenuRef.current.contains(target));
        const containsInDropdown = !!(dropdownRef.current && dropdownRef.current.contains(target));
        if (!containsInWrapper && !containsInDropdown) {
          setShowUserMenu(false);
        }
      } catch {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      'administrator': 'Administrator',
      'support-agent': 'Support Agent',
      'customer': 'Customer'
    };
    return roleMap[role as keyof typeof roleMap] || 'User';
  };

  const renderUserAvatar = () => {
    if (user.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
      );
    }
    return (
      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
    );
  };

  const renderUserInfo = () => (
    <div className="text-left">
      <p className="text-sm font-medium text-white">{user.name}</p>
      <p className="text-xs text-gray-300">{getRoleDisplay(user.role)}</p>
    </div>
  );

  const handleSettingsClick = () => {
    onNavigate?.('settings');
    setShowUserMenu(false);
  };



  const getButtonClass = (page: string) => 
    `p-2 rounded-lg transition-colors duration-200 ${
      currentPage === page
        ? 'bg-blue-600 text-white'
        : 'bg-white/10 hover:bg-white/20 text-white'
    }`;

  const NavButton = ({ page, icon: Icon, title }: { page: string; icon: React.ElementType; title: string }) => (
    <button 
      onClick={() => onNavigate?.(page)}
      className={`${getButtonClass(page)} relative z-20`}
      title={title}
      style={{ pointerEvents: 'auto' }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const renderDropdownMenu = () => {
    const menu = (
      <div
        ref={(el) => { dropdownRef.current = el; }}
        style={menuPos ? { 
          position: 'fixed', 
          top: menuPos.top, 
          left: menuPos.left, 
          width: 192,
          zIndex: 999999,
          pointerEvents: 'auto'
        } : undefined}
        className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl py-2"
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSettingsClick();
          }}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <Settings className="w-4 h-4 mr-3" />
          <span>Settings</span>
        </button>
      </div>
    );

    return menuPos && typeof document !== 'undefined' 
      ? createPortal(menu, document.body) 
      : menu;
  };

  const renderMobileMenu = () => {
    if (!showMobileMenu) return null;

    const mobileMenu = (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
        
        {/* Menu Panel */}
        <div 
          ref={mobileMenuRef}
          className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 shadow-xl transform transition-transform duration-300 ease-in-out"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">SupportDesk</h1>
                  <p className="text-sm text-gray-300">Support System</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-white/10">
              {renderUserAvatar()}
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-300">{getRoleDisplay(user.role)}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => {
                  onNavigate?.('dashboard');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              {user.role !== 'customer' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate?.('templates');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === 'templates'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Ticket Templates</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate?.('canned-responses');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === 'canned-responses'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Canned Responses</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  onNavigate?.('knowledge-base');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'knowledge-base'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Knowledge Base</span>
              </button>

              <button
                onClick={() => {
                  onNavigate?.('csat');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'csat'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Customer Satisfaction</span>
              </button>

              {user.role !== 'customer' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate?.('performance');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === 'performance'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Performance</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigate?.('email-integration');
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentPage === 'email-integration'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email Integration</span>
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  onNavigate?.('settings');
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              {/* Logout Button */}
              <div className="border-t border-white/20 pt-4 mt-4">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    );

    return typeof document !== 'undefined' ? createPortal(mobileMenu, document.body) : mobileMenu;
  };

  const renderAnimatedBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {renderAnimatedBackground()}

      <header className="relative z-[9999] backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white">SupportDesk</h1>
                <p className="text-xs sm:text-sm text-gray-300">Customer Support System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 sm:gap-2 relative z-[9999] min-h-[40px] sm:min-h-[44px] overflow-x-auto">
              <ConnectionStatus className="mr-2 sm:mr-4" />
              
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors duration-200 font-medium relative z-20 ${
                  currentPage === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Dashboard"
                style={{ pointerEvents: 'auto' }}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </button>
              
              {user.role !== 'customer' && (
                <>
                  <NavButton page="templates" icon={FileText} title="Ticket Templates" />
                  <NavButton page="canned-responses" icon={MessageSquare} title="Canned Responses" />
                </>
              )}
              
              <NavButton page="knowledge-base" icon={BookOpen} title="Help Center" />
              <NavButton page="csat" icon={Star} title="Customer Satisfaction" />
              
              {user.role !== 'customer' && (
                <>
                  <NavButton page="performance" icon={BarChart3} title="Performance Dashboard" />
                  <NavButton page="email-integration" icon={Mail} title="Email Integration" />
                </>
              )}
              


              <NotificationSystem 
                user={user} 
                onNavigateToTicket={(ticketId) => {
                  onNavigate?.('dashboard');
                  setTimeout(() => {
                    const appState = AppState.getInstance();
                    appState.openTicket(ticketId);
                  }, 50);
                }}
              />
              
              <div
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors duration-200 cursor-pointer relative"
                style={{ 
                  zIndex: 99999,
                  pointerEvents: 'auto',
                  minWidth: '60px',
                  minHeight: '40px'
                }}
                onMouseUp={() => onLogout()}
                onTouchEnd={() => onLogout()}
                onClick={() => onLogout()}
              >
                <LogOut className="w-4 h-4 text-red-300" />
                <span className="text-sm text-red-300">Logout</span>
              </div>
              
              <div className="relative z-40 shrink-0" ref={userMenuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = !showUserMenu;
                    if (next && userMenuRef.current) {
                      const rect = userMenuRef.current.getBoundingClientRect();
                      const menuWidth = 192;
                      const left = Math.max(8, rect.right + window.scrollX - menuWidth);
                      const top = rect.bottom + window.scrollY + 8;
                      setMenuPos({ top, left });
                    }
                    setShowUserMenu(next);
                  }}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                >
                  {renderUserAvatar()}
                  <div>
                    {renderUserInfo()}
                  </div>
                </button>
                {showUserMenu && renderDropdownMenu()}
              </div>
            </div>

            {/* Mobile Right Side - Just Notifications */}
            <div className="flex lg:hidden items-center gap-2">
              <NotificationSystem 
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

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
      
      {renderMobileMenu()}
      <LiveChat />
    </div>
  );
};

export default Layout;