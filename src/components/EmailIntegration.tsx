import { useState } from 'react';
import { Mail, Plus, CheckCircle, X } from 'lucide-react';

interface EmailTicket {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
  converted: boolean;
}

export default function EmailIntegration() {
  const [emails, setEmails] = useState<EmailTicket[]>([
    {
      id: '1',
      from: 'customer@example.com',
      subject: 'Login Issues',
      body: 'I cannot access my account. Getting error message when trying to log in.',
      timestamp: new Date().toISOString(),
      converted: false
    },
    {
      id: '2', 
      from: 'user@company.com',
      subject: 'Payment Problem',
      body: 'My payment was declined but I was still charged. Please help resolve this.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      converted: false
    }
  ]);

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
    setEmails(prev => prev.map(e => 
      e.id === emailId ? { ...e, converted: true } : e
    ));
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Email Integration</h1>
        <p className="text-gray-300">Convert emails into support tickets</p>
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

      {/* Email List */}
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
    </div>
  );
}