import { useState, useEffect } from 'react';
import { Mail, Plus, CheckCircle, X, AlertCircle } from 'lucide-react';
import EmailService from '../services/emailService';

interface EmailTicket {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
  converted: boolean;
}

interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed';
  timestamp: string;
}

export default function EmailIntegration() {
  const [emails, setEmails] = useState<EmailTicket[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'emails' | 'notifications'>('emails');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmailData();
  }, []);

  const loadEmailData = async () => {
    try {
      setLoading(true);
      
      // Load incoming emails from localStorage or API
      const storedEmails = localStorage.getItem('incoming-emails');
      if (storedEmails) {
        setEmails(JSON.parse(storedEmails));
      }
      
      // Load email notifications
      const emailService = EmailService.getInstance();
      setNotifications(emailService.getNotificationHistory());
    } catch (error) {
      console.error('Failed to load email data:', error);
    } finally {
      setLoading(false);
    }
  };





  const convertToTicket = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    // Create ticket from email
    const ticket = {
      id: `TICKET-${Date.now()}`,
      title: email.subject,
      description: `Email from: ${email.from}\n\n${email.body}`,
      category: 'Email',
      priority: 'medium' as const,
      status: 'open' as const,
      customerId: 'email-customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      messages: [],
      history: []
    };

    // Save to tickets
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // Mark email as converted
    const updatedEmails = emails.map(e => 
      e.id === emailId ? { ...e, converted: true } : e
    );
    setEmails(updatedEmails);
    localStorage.setItem('incoming-emails', JSON.stringify(updatedEmails));
  };

  const deleteEmail = (emailId: string) => {
    const updatedEmails = emails.filter(e => e.id !== emailId);
    setEmails(updatedEmails);
    localStorage.setItem('incoming-emails', JSON.stringify(updatedEmails));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Integration</h1>
          <p className="text-gray-300">Bidirectional email notifications and ticket conversion</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'emails'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Incoming Emails
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Email Notifications
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Total Emails</p>
          </div>
          <p className="text-2xl font-bold text-white">{emails.length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Plus className="w-5 h-5 text-green-400" />
            <p className="text-gray-400 text-sm">Converted</p>
          </div>
          <p className="text-2xl font-bold text-white">{emails.filter(e => e.converted).length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-yellow-400" />
            <p className="text-gray-400 text-sm">Pending</p>
          </div>
          <p className="text-2xl font-bold text-white">{emails.filter(e => !e.converted).length}</p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading email data...</p>
          </div>
        </div>
      ) : activeTab === 'emails' ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">Incoming Emails</h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {emails.map((email) => (
            <div key={email.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">{email.from}</span>
                    {email.converted && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                        <CheckCircle className="w-3 h-3" />
                        Converted
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-white font-medium mb-2">{email.subject}</h3>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{email.body}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(email.timestamp).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {!email.converted ? (
                    <button
                      onClick={() => convertToTicket(email.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Create Ticket
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-green-500/20 text-green-300 text-sm rounded">
                      Ticket Created
                    </span>
                  )}
                  
                  <button
                    onClick={() => deleteEmail(email.id)}
                    className="p-2 text-gray-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {emails.length === 0 && (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No emails to process</p>
          </div>
        )}
      </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white">Email Notifications</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {notification.status === 'sent' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white font-medium">{notification.to}</span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        notification.status === 'sent'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {notification.status}
                      </span>
                    </div>
                    
                    <h3 className="text-white font-medium mb-2">{notification.subject}</h3>
                    <p className="text-gray-500 text-xs">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {notifications.length === 0 && (
            <div className="p-12 text-center">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No email notifications sent</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}