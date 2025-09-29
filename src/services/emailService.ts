interface EmailConfig {
  from: string;
  replyTo?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface Ticket {
  id: string;
  title: string;
  priority: string;
  category: string;
  description: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
}

interface User {
  email: string;
}

interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  timestamp: string;
}

class EmailService {
  private static instance: EmailService;
  private config: EmailConfig;
  private templates: Map<string, EmailTemplate> = new Map();

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  constructor() {
    this.config = {
      from: 'support@company.com',
      replyTo: 'noreply@company.com'
    };
    
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // New Ticket Template
    this.templates.set('new-ticket', {
      subject: 'New Support Ticket Created - #{ticketId}',
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>Ticket ID:</strong> #{ticketId}</p>
        <p><strong>Customer:</strong> {customerName} ({customerEmail})</p>
        <p><strong>Subject:</strong> {title}</p>
        <p><strong>Priority:</strong> {priority}</p>
        <p><strong>Category:</strong> {category}</p>
        <hr>
        <h3>Description:</h3>
        <p>{description}</p>
        <hr>
        <p><a href="{ticketUrl}">View Ticket</a></p>
      `,
      text: `New Support Ticket\nTicket ID: #{ticketId}\nCustomer: {customerName}\nSubject: {title}\nPriority: {priority}\n\nDescription:\n{description}\n\nView: {ticketUrl}`
    });

    // Ticket Update Template
    this.templates.set('ticket-update', {
      subject: 'Ticket Update - #{ticketId}: {title}',
      html: `
        <h2>Ticket Update</h2>
        <p><strong>Ticket ID:</strong> #{ticketId}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Updated by:</strong> {updatedBy}</p>
        <hr>
        <h3>Latest Message:</h3>
        <p>{message}</p>
        <hr>
        <p><a href="{ticketUrl}">View Ticket</a></p>
        <p><small><a href="{unsubscribeUrl}">Unsubscribe</a></small></p>
      `,
      text: `Ticket Update\nTicket ID: #{ticketId}\nStatus: {status}\nUpdated by: {updatedBy}\n\nMessage:\n{message}\n\nView: {ticketUrl}\nUnsubscribe: {unsubscribeUrl}`
    });

    // Ticket Resolution Template
    this.templates.set('ticket-resolved', {
      subject: 'Ticket Resolved - #{ticketId}: {title}',
      html: `
        <h2>Ticket Resolved</h2>
        <p><strong>Ticket ID:</strong> #{ticketId}</p>
        <p><strong>Resolved by:</strong> {resolvedBy}</p>
        <p><strong>Resolution Time:</strong> {resolutionTime}</p>
        <hr>
        <h3>Resolution Notes:</h3>
        <p>{resolutionNotes}</p>
        <hr>
        <p>If you're satisfied with the resolution, please <a href="{feedbackUrl}">rate our service</a>.</p>
        <p><a href="{ticketUrl}">View Ticket</a></p>
      `,
      text: `Ticket Resolved\nTicket ID: #{ticketId}\nResolved by: {resolvedBy}\n\nResolution:\n{resolutionNotes}\n\nRate our service: {feedbackUrl}\nView: {ticketUrl}`
    });
  }

  async sendNewTicketNotification(ticket: Ticket, agent: User): Promise<boolean> {
    const template = this.templates.get('new-ticket')!;
    const variables = {
      ticketId: ticket.id,
      customerName: ticket.customerName || 'Customer',
      customerEmail: ticket.customerEmail || '',
      title: ticket.title,
      priority: ticket.priority,
      category: ticket.category,
      description: ticket.description,
      ticketUrl: `${window.location.origin}/tickets/${ticket.id}`
    };

    return this.sendEmail(agent.email, template, variables);
  }

  async sendTicketUpdateNotification(ticket: Ticket, customer: User, message: string): Promise<boolean> {
    const template = this.templates.get('ticket-update')!;
    const variables = {
      ticketId: ticket.id,
      title: ticket.title,
      status: ticket.status,
      updatedBy: 'Support Team',
      message: message,
      ticketUrl: `${window.location.origin}/tickets/${ticket.id}`,
      unsubscribeUrl: `${window.location.origin}/unsubscribe?email=${customer.email}`
    };

    return this.sendEmail(customer.email, template, variables);
  }

  async sendTicketResolutionNotification(ticket: Ticket, customer: User, resolutionNotes: string): Promise<boolean> {
    const template = this.templates.get('ticket-resolved')!;
    const variables = {
      ticketId: ticket.id,
      title: ticket.title,
      resolvedBy: 'Support Team',
      resolutionTime: new Date().toLocaleString(),
      resolutionNotes: resolutionNotes,
      ticketUrl: `${window.location.origin}/tickets/${ticket.id}`,
      feedbackUrl: `${window.location.origin}/feedback/${ticket.id}`
    };

    return this.sendEmail(customer.email, template, variables);
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    return result;
  }

  private async sendEmail(to: string, template: EmailTemplate, variables: Record<string, string>): Promise<boolean> {
    try {
      const subject = this.replaceVariables(template.subject, variables);
      const html = this.replaceVariables(template.html, variables);
      const text = this.replaceVariables(template.text, variables);

      // Mock email service - just log to console
      console.log('📧 Mock Email Sent:', { to, subject, html, text });
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.storeNotification(to, subject, 'sent');
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      this.storeNotification(to, template.subject, 'failed');
      return false;
    }
  }

  private storeNotification(to: string, subject: string, status: 'sent' | 'failed') {
    const notifications = JSON.parse(localStorage.getItem('email-notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      to,
      subject,
      status,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('email-notifications', JSON.stringify(notifications));
  }

  getNotificationHistory(): EmailNotification[] {
    return JSON.parse(localStorage.getItem('email-notifications') || '[]');
  }
}

export default EmailService;