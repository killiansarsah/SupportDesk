import { Ticket, User } from '../types';
import TicketService from './ticketService';
import ToastService from './toastService';

export interface AppNotification {
  id: string;
  type: 'new-ticket' | 'ticket-update' | 'new-message' | 'status-change' | 'assignment';
  title: string;
  message: string;
  ticketId: string;
  timestamp: string;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
}

type NotificationCallback = (notifications: AppNotification[]) => void;

class NotificationPollingService {
  private static instance: NotificationPollingService;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastTicketStates: Map<string, { status: string; messageCount: number }> = new Map();
  private callbacks: Set<NotificationCallback> = new Set();
  private notifications: AppNotification[] = [];
  private isPolling: boolean = false;

  static getInstance(): NotificationPollingService {
    if (!NotificationPollingService.instance) {
      NotificationPollingService.instance = new NotificationPollingService();
    }
    return NotificationPollingService.instance;
  }

  async startPolling(user: User) {
    if (this.isPolling) return;
    
    this.isPolling = true;
    
    // Load existing notifications from localStorage
    this.loadNotifications();
    
    // Initialize baseline on first start (don't notify for existing tickets)
    await this.initializeBaseline(user);

    // Perform an immediate check so the UI updates right away
    this.checkForUpdates(user).catch((error) => {
      console.error('Notification polling check failed:', error);
    });
    
    // Poll every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates(user).catch((error) => {
        console.error('Notification polling interval failed:', error);
      });
    }, 10000);
  }

  private async initializeBaseline(user: User) {
    try {
      const ticketService = TicketService.getInstance();
      const tickets = await ticketService.getTickets(undefined, user.id, user.role);
      
      const snapshot = new Map<string, { status: string; messageCount: number }>();
      tickets.forEach(ticket => {
        snapshot.set(ticket.id, {
          status: ticket.status,
          messageCount: ticket.messages?.length || 0
        });
      });
      this.lastTicketStates = snapshot;
      
    } catch (error) {
      console.error('Failed to initialize baseline:', error);
    }
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  subscribe(callback: NotificationCallback) {
    this.callbacks.add(callback);
    // Immediately call with current notifications
    callback(this.notifications);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notifySubscribers() {
    this.callbacks.forEach(callback => callback(this.notifications));
  }

  private async checkForUpdates(user: User) {
    try {
      const ticketService = TicketService.getInstance();
      const tickets = await ticketService.getTickets(undefined, user.id, user.role);
      
      // Check for new tickets (not seen in previous snapshot)
      const updatedStates = new Map<string, { status: string; messageCount: number }>();

      const newTickets = tickets.filter(ticket => !this.lastTicketStates.has(ticket.id));
      newTickets.forEach(ticket => {
        if (this.shouldNotifyAboutTicket(ticket, user)) {
          this.addNotification({
            id: `new-ticket-${ticket.id}-${Date.now()}`,
            type: 'new-ticket',
            title: '🎫 New Ticket Created',
            message: `${ticket.title}`,
            ticketId: ticket.id,
            timestamp: new Date().toISOString(),
            read: false,
            priority: (ticket.priority === 'urgent' ? 'high' : ticket.priority) as 'low' | 'medium' | 'high'
          });
        }
      });
      
      // Check for updates in existing tickets
      tickets.forEach(ticket => {
        const lastState = this.lastTicketStates.get(ticket.id);
        
        if (lastState) {
          // Check for status changes
          if (lastState.status !== ticket.status && this.shouldNotifyAboutTicket(ticket, user)) {
            this.addNotification({
              id: `status-${ticket.id}-${Date.now()}`,
              type: 'status-change',
              title: '📊 Ticket Status Updated',
              message: `#${ticket.id}: ${lastState.status} → ${ticket.status}`,
              ticketId: ticket.id,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
          
          // Check for new messages
          const currentMessageCount = ticket.messages?.length || 0;
          if (currentMessageCount > lastState.messageCount && this.shouldNotifyAboutMessage(ticket, user)) {
            const newMessageCount = currentMessageCount - lastState.messageCount;
            this.addNotification({
              id: `message-${ticket.id}-${Date.now()}`,
              type: 'new-message',
              title: '💬 New Message',
              message: `${newMessageCount} new message${newMessageCount > 1 ? 's' : ''} in #${ticket.id}`,
              ticketId: ticket.id,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        }
        
        // Update state
        updatedStates.set(ticket.id, {
          status: ticket.status,
          messageCount: ticket.messages?.length || 0
        });
      });
      this.lastTicketStates = updatedStates;
    } catch (error) {
      console.error('Error checking for notifications:', error);
    }
  }

  private shouldNotifyAboutTicket(ticket: Ticket, user: User): boolean {
    // Admins get notified about everything
    if (user.role === 'administrator') return true;
    
    // Agents get notified about tickets assigned to them or unassigned tickets
    if (user.role === 'support-agent') {
      return !ticket.assignedTo || ticket.assignedTo === user.id;
    }
    
    // Customers get notified about their own tickets
    if (user.role === 'customer') {
      return ticket.customerId === user.id;
    }
    
    return false;
  }

  private shouldNotifyAboutMessage(ticket: Ticket, user: User): boolean {
    if (!ticket.messages || ticket.messages.length === 0) return false;
    
    // Get the last message
    const lastMessage = ticket.messages[ticket.messages.length - 1];
    
    // Don't notify about your own messages
    if (lastMessage.userId === user.id) return false;
    
    return this.shouldNotifyAboutTicket(ticket, user);
  }

  private addNotification(notification: AppNotification) {
    // Check if notification already exists (prevent duplicates)
    const exists = this.notifications.some(n => 
      n.type === notification.type && 
      n.ticketId === notification.ticketId &&
      Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 5000
    );
    
    if (exists) {
      return;
    }
    
    // Add to beginning of array
    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    // Save to localStorage
    this.saveNotifications();
    
    // Notify subscribers
    this.notifySubscribers();
    
    // Show toast notification
    this.showToastNotification(notification);
  }

  private showToastNotification(notification: AppNotification) {
    const toastService = ToastService.getInstance();
    
    switch (notification.type) {
      case 'new-ticket':
        toastService.info(notification.title, notification.message);
        break;
      case 'new-message':
        toastService.info(notification.title, notification.message);
        break;
      case 'status-change':
        toastService.success(notification.title, notification.message);
        break;
      default:
        toastService.info(notification.title, notification.message);
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifySubscribers();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifySubscribers();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifySubscribers();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  private saveNotifications() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('app_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private loadNotifications() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('app_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }
}

export default NotificationPollingService;

