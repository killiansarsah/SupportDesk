import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, Bell, Settings, BookOpen, FileText, MessageSquare, StickyNote, Home, Star, BarChart3, Mail } from 'lucide-react';
import { User as UserType } from '../types';
import LiveChat from './LiveChat';
import NotificationSystem from './NotificationSystem';


interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentPage = 'dashboard' }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      try {
        const target = event.target as Node;
        const containsInWrapper = !!(userMenuRef.current && userMenuRef.current.contains(target));
        const containsInDropdown = !!(dropdownRef.current && dropdownRef.current.contains(target));
        if (!containsInWrapper && !containsInDropdown) {
          setShowUserMenu(false);
        }
      } catch (err) {
        // defensive
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      // use 'click' so that menu item mouse/click handlers run first
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(false);
    onLogout();
  };

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      'administrator': 'Administrator',
      'support-agent': 'Support Agent',
      'customer': 'Customer'
    };
    return roleMap[role as keyof typeof roleMap] || 'User';
  };

  const renderUserAvatar = () => (
    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
      <User className="w-4 h-4 text-white" />
    </div>
  );

  const renderUserInfo = () => (
    <div className="text-left">
      <p className="text-sm font-medium text-white">{user.name}</p>
      <p className="text-xs text-gray-300">{getRoleDisplay(user.role)}</p>
    </div>
  );

  // NOTE: handleSettingsClick was unused — navigation is handled inline in the dropdown.

  const renderDropdownMenu = () => {
    const handleSettingsNavigation = () => {
      if (onNavigate) {
        onNavigate('settings');
      }
      setShowUserMenu(false);
    };
    const menu = (
      <div
        ref={(el) => { dropdownRef.current = el; }}
        style={menuPos ? { position: 'absolute', top: menuPos.top, left: menuPos.left, width: 192 } : undefined}
        className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl py-2 z-[999999] pointer-events-auto"
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSettingsNavigation();
          }}
          className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-3" />
          <span>Settings</span>
        </button>
      </div>
    );

    if (typeof document !== 'undefined' && menuPos) {
      return createPortal(menu, document.body);
    }

    // fallback when document not available (SSR)
    return menu;
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

      {/* Header */}
      <header className="relative z-10 backdrop-blur-lg bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SupportDesk</h1>
                <p className="text-sm text-gray-300">Customer Support System</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Dashboard - Always First */}
              <button 
                onClick={() => onNavigate?.('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  currentPage === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Dashboard"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              
              {/* Agent Tools */}
              {user.role !== 'customer' && (
                <>
                  <button 
                    onClick={() => onNavigate?.('templates')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      currentPage === 'templates'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Ticket Templates"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onNavigate?.('canned-responses')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      currentPage === 'canned-responses'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Canned Responses"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </>
              )}
              
              <button 
                onClick={() => onNavigate?.('knowledge-base')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 'knowledge-base'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Help Center"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => onNavigate?.('csat')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  currentPage === 'csat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Customer Satisfaction"
              >
                <Star className="w-4 h-4" />
              </button>
              
              {user.role !== 'customer' && (
                <>
                  <button 
                    onClick={() => onNavigate?.('performance')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      currentPage === 'performance'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Performance Dashboard"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => onNavigate?.('email-integration')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      currentPage === 'email-integration'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Email Integration"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </>
              )}
              

              

              
              <NotificationSystem 
                user={user} 
                onNavigateToTicket={(ticketId) => {
                  onNavigate?.('dashboard');
                  setTimeout(() => {
                    const appState = require('../services/appState').default.getInstance();
                    appState.openTicket(ticketId);
                  }, 50);
                }}
              />
              
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 text-red-300" />
                <span className="text-sm text-red-300">Logout</span>
              </button>
              
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const next = !showUserMenu;
                    if (next && userMenuRef.current) {
                      const rect = userMenuRef.current.getBoundingClientRect();
                      const menuWidth = 192; // approx 12rem (w-48)
                      const left = Math.max(8, rect.right + window.scrollX - menuWidth);
                      const top = rect.bottom + window.scrollY + 8; // small offset
                      setMenuPos({ top, left });
                    }
                    setShowUserMenu(next);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
                >
                  {renderUserAvatar()}
                  {renderUserInfo()}
                </button>
                {showUserMenu && renderDropdownMenu()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        {children}
      </main>
      
      {/* Live Chat Widget */}
      <LiveChat />
    </div>
  );
};

export default Layout;