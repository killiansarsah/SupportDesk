import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Clock } from 'lucide-react';
import { User, Ticket } from '../types';

interface Notification {
  id: string;
  type: 'new-ticket' | 'ticket-update' | 'message';
  title: string;
  message: string;
  ticketId?: string;
  timestamp: string;
  read: boolean;
}

interface NotificationSystemProps {
  user: User;
  onNavigateToTicket?: (ticketId: string) => void;
}

export default function NotificationSystem({ user, onNavigateToTicket }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{top: number, left: number} | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    };

    loadNotifications();

    // Check for new tickets every 2 seconds
    const interval = setInterval(() => {
      if (user.role !== 'customer') {
        checkForNewTickets();
      }
    }, 2000);

    // Close dropdown when clicking outside (check both wrapper and portal dropdown)
    const handleClickOutside = (event: MouseEvent) => {
      try {
        const target = event.target as Node;
        const insideWrapper = !!(wrapperRef.current && wrapperRef.current.contains(target));
        const insideDropdown = !!(dropdownRef.current && dropdownRef.current.contains(target));
        if (!insideWrapper && !insideDropdown) {
          setShowDropdown(false);
        }
      } catch {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      // use 'click' so that pointer/mouse handlers on items run first
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [user.role, showDropdown]);

  const checkForNewTickets = () => {
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]') as Ticket[];
    const lastCheck = localStorage.getItem('lastNotificationCheck');
    const now = new Date().toISOString();
    
    if (!lastCheck) {
      localStorage.setItem('lastNotificationCheck', now);
      return;
    }

    const newTickets = tickets.filter((ticket) => 
      ticket.createdAt > lastCheck && ticket.status === 'open'
    );

    if (newTickets.length > 0) {
      const newNotifications = newTickets.map((ticket: Ticket) => ({
        id: `ticket-${ticket.id}-${Date.now()}`,
        type: 'new-ticket' as const,
        title: 'New Support Ticket',
        message: `${ticket.title} - Priority: ${ticket.priority}`,
        ticketId: ticket.id,
        timestamp: now,
        read: false
      }));

      const current = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updated = [...current, ...newNotifications];
      localStorage.setItem('notifications', JSON.stringify(updated));
      setNotifications(updated);
    }

    localStorage.setItem('lastNotificationCheck', now);
  };

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    if (notification.ticketId && onNavigateToTicket) {
      onNavigateToTicket(notification.ticketId);
    }
  };

  const clearAll = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const toggleDropdown = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !showDropdown;
    if (next) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const menuWidth = 320;
      const left = Math.max(8, rect.right - menuWidth);
      setDropdownPos({
        top: rect.bottom + 8,
        left: left
      });
    }
    setShowDropdown(next);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(-10).reverse();

  const renderDropdown = () => {
    if (!showDropdown || !dropdownPos) return null;

    const dropdown = (
      <div 
        ref={(el) => { dropdownRef.current = el; }}
        className="fixed w-80 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-xl"
        style={{ 
          top: dropdownPos.top, 
          left: dropdownPos.left, 
          zIndex: 999999,
          pointerEvents: 'auto'
        }}
      >
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">Notifications</h3>
            {unreadCount > 0 && (
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearAll();
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Mark all read
                  </button>
                )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification.id}
                onPointerDown={(ev) => {
                  ev.preventDefault();
                  ev.stopPropagation();
                  handleNotificationClick(notification);
                }}
                className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                  !notification.read ? 'bg-blue-500/10' : ''
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );

    return createPortal(dropdown, document.body);
  };

  return (
    <>
      <div className="relative notification-dropdown" ref={wrapperRef}>
         <button
           onPointerDown={(e: React.PointerEvent) => toggleDropdown(e)}
           className={`relative p-2 rounded-lg transition-colors duration-200 z-10 ${
             unreadCount > 0 
               ? 'bg-red-500/20 hover:bg-red-500/30' 
               : 'bg-white/10 hover:bg-white/20'
           }`}
           style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
         >
           <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-300' : 'text-white'}`} />
           {unreadCount > 0 && (
             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
               {unreadCount > 9 ? '9+' : unreadCount}
             </span>
           )}
         </button>
       </div>
       {renderDropdown()}
     </>
   );
 }