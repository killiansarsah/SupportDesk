import { Ticket, Message, Attachment, HistoryEntry, TicketFilters, User } from '../types';

// Load tickets from localStorage or use mock data
const loadTicketsFromStorage = (): Ticket[] => {
  const stored = localStorage.getItem('tickets');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading tickets from storage:', error);
    }
  }
  return [
    {
      id: '1',
      title: 'Login Issues',
      description: 'Unable to log into my account after password reset',
      category: 'Account',
      priority: 'high',
      status: 'open',
      customerId: '3',
      assignedTo: '2',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      attachments: [],
      messages: [],
      internalNotes: [],
      language: 'en',
      history: [
        {
          id: '1',
          ticketId: '1',
          userId: '3',
          userName: 'John Customer',
          action: 'created',
          details: 'Ticket created',
          timestamp: '2024-01-15T10:30:00Z',
        }
      ],
    },
  ];
};

let MOCK_TICKETS: Ticket[] = loadTicketsFromStorage();

// Save tickets to localStorage
const saveTicketsToStorage = () => {
  localStorage.setItem('tickets', JSON.stringify(MOCK_TICKETS));
};



class TicketService {
  private static instance: TicketService;

  static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  async getTickets(filters?: TicketFilters, userId?: string, userRole?: string): Promise<Ticket[]> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const params: any = {};
      if (userId) params.userId = userId;
      if (userRole) params.userRole = userRole;
      
      if (filters) {
        if (filters.status?.length) params.status = filters.status.join(',');
        if (filters.priority?.length) params.priority = filters.priority.join(',');
        if (filters.category) params.category = filters.category;
        if (filters.assignedTo) params.assignedTo = filters.assignedTo;
        if (filters.search) params.search = filters.search;
      }
      
      const tickets = await apiService.getTickets(params);
      return tickets;
    } catch (error) {
      console.error('Error fetching tickets from API:', error);
      return this.getTicketsFromStorage(filters, userId, userRole);
    }
  }

  private getTicketsFromStorage(filters?: TicketFilters, userId?: string, userRole?: string): Ticket[] {
    let tickets = [...MOCK_TICKETS];
    
    if (userRole === 'customer' && userId) {
      tickets = tickets.filter(ticket => ticket.customerId === userId);
    } else if (userRole === 'support-agent' && userId) {
      tickets = tickets.filter(ticket => ticket.assignedTo === userId || !ticket.assignedTo);
    }
    
    if (filters) {
      if (filters.status?.length) {
        tickets = tickets.filter(ticket => filters.status!.includes(ticket.status));
      }
      if (filters.priority?.length) {
        tickets = tickets.filter(ticket => filters.priority!.includes(ticket.priority));
      }
      if (filters.category) {
        tickets = tickets.filter(ticket => ticket.category === filters.category);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        tickets = tickets.filter(ticket => 
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower)
        );
      }
    }
    
    return tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getTicket(id: string): Promise<Ticket | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_TICKETS.find(ticket => ticket.id === id) || null;
  }

  async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'history'>): Promise<Ticket> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const newTicket = await apiService.createTicket({
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority,
        customerId: ticketData.customerId,
        language: ticketData.language || 'en'
      });
      
      return newTicket;
    } catch (error) {
      console.error('Error creating ticket via API:', error);
      return this.createTicketInStorage(ticketData);
    }
  }

  private async createTicketInStorage(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'history'>): Promise<Ticket> {
    const ticketId = `ticket_${Date.now()}`;
    const newTicket: Ticket = {
      ...ticketData,
      id: ticketId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      internalNotes: [],
      language: ticketData.language || 'en',
      history: [
        {
          id: `history_${Date.now()}`,
          ticketId: ticketId,
          userId: ticketData.customerId,
          userName: 'User',
          action: 'created',
          details: 'Ticket created',
          timestamp: new Date().toISOString(),
        }
      ],
    };

    MOCK_TICKETS.push(newTicket);
    saveTicketsToStorage();
    
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>, userId: string, userName: string): Promise<Ticket | null> {
    try {
      const ApiService = (await import('./apiService')).default;
      const apiService = ApiService.getInstance();
      
      const updatedTicket = await apiService.updateTicket(id, updates);
      return updatedTicket;
    } catch (error) {
      console.error('Error updating ticket via API:', error);
      return this.updateTicketInStorage(id, updates, userId, userName);
    }
  }

  private async updateTicketInStorage(id: string, updates: Partial<Ticket>, userId: string, userName: string): Promise<Ticket | null> {
    const ticketIndex = MOCK_TICKETS.findIndex(ticket => ticket.id === id);
    if (ticketIndex === -1) return null;

    const ticket = MOCK_TICKETS[ticketIndex];
    const oldStatus = ticket.status;
    
    MOCK_TICKETS[ticketIndex] = {
      ...ticket,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveTicketsToStorage();
    
    // Send email notification for status changes
    if (updates.status && updates.status !== oldStatus) {
      this.notifyCustomerOfUpdate(MOCK_TICKETS[ticketIndex], updates.status);
    }

    // Add history entry for status change
    if (updates.status && updates.status !== oldStatus) {
      const historyEntry: HistoryEntry = {
        id: `history_${Date.now()}`,
        ticketId: id,
        userId,
        userName,
        action: 'status_changed',
        details: `Status changed from ${oldStatus} to ${updates.status}`,
        timestamp: new Date().toISOString(),
      };
      MOCK_TICKETS[ticketIndex].history.push(historyEntry);
    }

    return MOCK_TICKETS[ticketIndex];
  }

  async addMessage(ticketId: string, content: string, userId: string, userName: string, isInternal: boolean = false): Promise<Message | null> {
    try {
      const response = await fetch(`http://localhost:3002/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: userId,
          senderName: userName,
          isInternal
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const message = await response.json();
      return {
        id: message.id,
        ticketId,
        userId,
        userName,
        content: message.content,
        timestamp: message.timestamp,
        isInternal: message.isInternal
      };
    } catch (error) {
      console.error('Error adding message via API:', error);
      return this.addMessageToStorage(ticketId, content, userId, userName, isInternal);
    }
  }

  private async addMessageToStorage(ticketId: string, content: string, userId: string, userName: string, isInternal: boolean = false): Promise<Message | null> {
    const ticketIndex = MOCK_TICKETS.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) return null;

    const message: Message = {
      id: `msg_${Date.now()}`,
      ticketId,
      userId,
      userName,
      content,
      timestamp: new Date().toISOString(),
      isInternal,
    };

    MOCK_TICKETS[ticketIndex].messages.push(message);
    MOCK_TICKETS[ticketIndex].updatedAt = new Date().toISOString();
    saveTicketsToStorage();

    return message;
  }

  async addAttachment(ticketId: string, file: File, userId: string): Promise<Attachment | null> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ticketIndex = MOCK_TICKETS.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) return null;

    // In a real app, you'd upload to a file storage service
    const attachment: Attachment = {
      id: `att_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Mock URL
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
    };

    MOCK_TICKETS[ticketIndex].attachments.push(attachment);
    MOCK_TICKETS[ticketIndex].updatedAt = new Date().toISOString();
    saveTicketsToStorage();

    return attachment;
  }

  async addInternalNote(ticketId: string, content: string, userId: string, userName: string): Promise<any | null> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const ticketIndex = MOCK_TICKETS.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex === -1) return null;

    const note = {
      id: `note_${Date.now()}`,
      ticketId,
      userId,
      userName,
      content,
      timestamp: new Date().toISOString(),
    };

    MOCK_TICKETS[ticketIndex].internalNotes.push(note);
    MOCK_TICKETS[ticketIndex].updatedAt = new Date().toISOString();
    saveTicketsToStorage();

    return note;
  }

  private async notifyAgentOfNewTicket(ticket: any) {
    try {
      const EmailService = (await import('./emailService')).default;
      const emailService = EmailService.getInstance();
      const mockAgent = { email: 'agent@company.com' };
      await emailService.sendNewTicketNotification(ticket, mockAgent);
    } catch (error) {
      console.error('Failed to send agent notification:', error);
    }
  }

  private async notifyCustomerOfUpdate(ticket: any, status: string) {
    try {
      const EmailService = (await import('./emailService')).default;
      const emailService = EmailService.getInstance();
      const mockCustomer = { email: 'customer@example.com' };
      const message = `Your ticket status has been updated to: ${status}`;
      
      if (status === 'resolved') {
        await emailService.sendTicketResolutionNotification(ticket, mockCustomer, 'Your issue has been resolved.');
      } else {
        await emailService.sendTicketUpdateNotification(ticket, mockCustomer, message);
      }
    } catch (error) {
      console.error('Failed to send customer notification:', error);
    }
  }

  getTicketStats(): { total: number; open: number; inProgress: number; resolved: number; closed: number } {
    return {
      total: MOCK_TICKETS.length,
      open: MOCK_TICKETS.filter(t => t.status === 'open').length,
      inProgress: MOCK_TICKETS.filter(t => t.status === 'in-progress').length,
      resolved: MOCK_TICKETS.filter(t => t.status === 'resolved').length,
      closed: MOCK_TICKETS.filter(t => t.status === 'closed').length,
    };
  }
}

export default TicketService;