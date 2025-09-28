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
    await new Promise(resolve => setTimeout(resolve, 500));

    let tickets = [...MOCK_TICKETS];

    // Filter by user role and access
    if (userRole === 'customer' && userId) {
      tickets = tickets.filter(ticket => ticket.customerId === userId);
    } else if (userRole === 'support-agent' && userId) {
      tickets = tickets.filter(ticket => ticket.assignedTo === userId || !ticket.assignedTo);
    }

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        tickets = tickets.filter(ticket => filters.status!.includes(ticket.status));
      }
      if (filters.priority && filters.priority.length > 0) {
        tickets = tickets.filter(ticket => filters.priority!.includes(ticket.priority));
      }
      if (filters.category) {
        tickets = tickets.filter(ticket => ticket.category === filters.category);
      }
      if (filters.assignedTo) {
        tickets = tickets.filter(ticket => ticket.assignedTo === filters.assignedTo);
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
    await new Promise(resolve => setTimeout(resolve, 800));

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

    // Auto-assign to available agent (simple round-robin)
    if (!newTicket.assignedTo) {
      const agents = ['2']; // In real app, get from user service
      newTicket.assignedTo = agents[MOCK_TICKETS.length % agents.length];
    }

    MOCK_TICKETS.push(newTicket);
    saveTicketsToStorage();
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>, userId: string, userName: string): Promise<Ticket | null> {
    await new Promise(resolve => setTimeout(resolve, 500));

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
    await new Promise(resolve => setTimeout(resolve, 300));

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

    // Add history entry
    const historyEntry: HistoryEntry = {
      id: `history_${Date.now()}`,
      ticketId,
      userId,
      userName,
      action: 'message_added',
      details: isInternal ? 'Internal note added' : 'Message added',
      timestamp: new Date().toISOString(),
    };
    MOCK_TICKETS[ticketIndex].history.push(historyEntry);

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