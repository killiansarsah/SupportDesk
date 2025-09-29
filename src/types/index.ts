export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'administrator' | 'support-agent' | 'customer';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  customerId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  messages: Message[];
  history: HistoryEntry[];
  internalNotes: InternalNote[];
  templateId?: string;
  language: string;
}

export interface Message {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
  language?: string;
}

export interface BotResponse {
  message: string;
  suggestions?: string[];
  articles?: Article[];
  escalate?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  category?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: string;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string;
  messages: ChatMessage[];
  status: 'active' | 'waiting' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  isActive: boolean;
}

export interface InternalNote {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  language: string;
  isActive: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Theme {
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermissions {
  role: string;
  permissions: string[];
}

export interface PWAStatus {
  isInstalled: boolean;
  isInstallable?: boolean;
  canInstall?: boolean;
  deferredPrompt?: any;
  isOnline: boolean;
  syncPending: boolean;
}

export interface Screenshot {
  id: string;
  userId: string;
  userName: string;
  imageData: string;
  timestamp: string;
  description?: string;
}

export interface CSATSurvey {
  id: string;
  ticketId: string;
  customerId: string;
  rating: number;
  feedback?: string;
  timestamp: string;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  ticketsResolved: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  responseTime: number;
}