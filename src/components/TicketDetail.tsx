import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, Download, Clock, User, Tag, AlertCircle, Users, FileText, X } from 'lucide-react';
import { Ticket, User as UserType } from '../types';
import TicketService from '../services/ticketService';
import ApiService from '../services/apiService';
import ToastService from '../services/toastService';
import TemplateManager from './TemplateManager';
import CustomSelect from './CustomSelect';

interface TicketDetailProps {
  ticket: Ticket;
  user: UserType;
  onBack: () => void;
  onUpdate: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, user, onBack, onUpdate }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<UserType[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
    loadAvailableAgents();
    // Update local state when ticket prop changes
    setTicketStatus(ticket.status);
    setAssignedTo(ticket.assignedTo || '');
  }, [ticket]);

  const loadAvailableAgents = async () => {
    try {
      const apiService = ApiService.getInstance();
      const users = await apiService.getUsers();
      const agents = users.filter(u => u.role === 'support-agent' || u.role === 'administrator');
      setAvailableAgents(agents);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketService = TicketService.getInstance();
      const message = await ticketService.addMessage(
        ticket.id,
        newMessage.trim(),
        user._id || user.id,
        user.name,
        false
      );
      
      if (message) {
        setNewMessage('');
        // Force refresh of ticket data
        onUpdate();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const ticketService = TicketService.getInstance();
      await ticketService.updateTicket(
        ticket.id,
        { status: newStatus as any },
        user.id,
        user.name
      );
      setTicketStatus(newStatus as any);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignmentChange = async (newAssignedTo: string) => {
    console.log('Assignment change requested:', { ticketId: ticket.id, newAssignedTo, currentUser: user });
    
    setIsUpdatingAssignment(true);
    try {
      const ticketService = TicketService.getInstance();
      const updatedTicket = await ticketService.updateTicket(
        ticket.id,
        { assignedTo: newAssignedTo || null },
        user._id || user.id,
        user.name
      );
      
      console.log('Assignment update result:', updatedTicket);
      
      if (updatedTicket) {
        setAssignedTo(newAssignedTo);
        
        // Show success toast
        const toastService = ToastService.getInstance();
        if (newAssignedTo) {
          const agentName = availableAgents.find(a => (a._id || a.id) === newAssignedTo)?.name || 'Agent';
          toastService.success('Ticket Assigned', `Ticket assigned to ${agentName} successfully`);
        } else {
          toastService.success('Ticket Unassigned', 'Ticket has been unassigned successfully');
        }
        
        // Force a complete refresh of the parent component
        setTimeout(() => {
          onUpdate();
        }, 500);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      const toastService = ToastService.getInstance();
      toastService.error('Assignment Failed', 'Failed to update ticket assignment. Please try again.');
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  const handleSendResolutionEmail = async () => {
    setIsSendingEmail(true);
    try {
      const apiService = ApiService.getInstance();
      const result = await apiService.sendResolutionEmail(
        ticket.id,
        resolutionMessage || 'Your ticket has been resolved by our support team. If you need any further assistance, please don\'t hesitate to contact us.',
        user.name
      );
      
      if (result.success) {
        ToastService.getInstance().success('Email Sent', 'Resolution email sent to customer successfully!');
        setShowEmailModal(false);
        setResolutionMessage('');
      } else {
        ToastService.getInstance().error('Email Failed', result.message || 'Failed to send resolution email');
      }
    } catch (error) {
      console.error('Error sending resolution email:', error);
      ToastService.getInstance().error('Email Failed', 'Failed to send resolution email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in-progress':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const canChangeStatus = user.role === 'administrator' || user.role === 'support-agent';
  const canAssignTickets = user.role === 'administrator' || user.role === 'support-agent';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        {/* Title Section */}
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200 flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{ticket.title}</h1>
            <p className="text-gray-300 text-sm">Ticket #{ticket.id}</p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 lg:flex-shrink-0 w-full sm:w-auto max-w-full overflow-visible">
          {canChangeStatus && (
            <CustomSelect
              value={ticketStatus}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              options={[
                { value: 'open', label: 'Open' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' }
              ]}
              className="w-full sm:w-auto backdrop-blur-lg bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400/50"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%)',
              }}
            />
          )}
          
          {canAssignTickets && (
            <CustomSelect
              value={assignedTo}
              onChange={handleAssignmentChange}
              disabled={isUpdatingAssignment}
              placeholder="Unassigned"
              options={[
                { value: '', label: 'Unassigned' },
                ...availableAgents.map((agent) => {
                  const agentId = (agent as any)._id || agent.id;
                  return {
                    value: agentId,
                    label: agent.name
                  };
                })
              ]}
              className="w-full sm:w-auto backdrop-blur-lg bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400/50"
              style={{
                backgroundImage: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(79, 70, 229, 0.8) 100%)',
              }}
            />
          )}
          
          {/* Email Resolution Button */}
          {canChangeStatus && (ticketStatus === 'resolved' || ticketStatus === 'closed') && (
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-700/80 hover:to-emerald-700/80 text-white rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-lg border border-green-400/30 hover:border-green-400/50"
              title="Send resolution email to customer"
            >
              <Send className="w-4 h-4" />
              Email Customer
            </button>
          )}
        </div>
      </div>

      {/* Ticket Info */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="flex items-center space-x-2 min-w-0">
            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-sm flex-shrink-0">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border truncate ${getStatusColor(ticketStatus)}`}>
              {ticketStatus.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 min-w-0">
            <AlertCircle className={`w-4 h-4 flex-shrink-0 ${getPriorityColor(ticket.priority)}`} />
            <span className="text-gray-300 text-sm flex-shrink-0">Priority:</span>
            <span className={`font-medium capitalize truncate ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 min-w-0">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-sm flex-shrink-0">Category:</span>
            <span className="text-white truncate">{ticket.category}</span>
          </div>
          
          <div className="flex items-center space-x-2 min-w-0">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-sm flex-shrink-0">Assigned:</span>
            <span className="text-white truncate">
              {assignedTo ? 
                availableAgents.find(a => (a._id || a.id) === assignedTo)?.name || 'Loading...' : 
                'Unassigned'
              }
            </span>
          </div>
          
          <div className="flex items-center space-x-2 min-w-0 sm:col-span-2 lg:col-span-1">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-300 text-sm flex-shrink-0">Created:</span>
            <span className="text-white truncate">{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="text-white font-medium mb-2">Description</h3>
          <p className="text-gray-300">{ticket.description}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments.length > 0 && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-white font-medium mb-2">Attachments</h3>
            <div className="space-y-2">
              {ticket.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm">{attachment.name}</span>
                  </div>
                  <button className="p-1 rounded hover:bg-white/10 transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Conversation</h2>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.userId === user.id
                    ? 'bg-blue-500/20 text-white'
                    : 'bg-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{message.userName}</span>
                  <span className="text-xs opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          {/* Template Selector */}
          {(user.role === 'support-agent' || user.role === 'administrator') && (
            <div className="mb-4">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg border border-green-400/30 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                {showTemplates ? 'Hide Templates' : 'Use Template'}
              </button>
              
              {showTemplates && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <TemplateManager 
                    type="response" 
                    onTemplateSelect={(template) => {
                      setNewMessage(template.content);
                      setShowTemplates(false);
                    }}
                  />
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:self-end"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      {ticket.history.length > 0 && (
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ticket History</h2>
          <div className="space-y-3">
            {ticket.history.map((entry) => (
              <div key={entry.id} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">
                  {formatTimestamp(entry.timestamp)}
                </span>
                <span className="text-white">
                  {entry.userName} {entry.details}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Resolution Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Send Resolution Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Email
                </label>
                <div className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300">
                  {typeof ticket.customerId === 'object' && (ticket.customerId as any)?.email || 'No email available'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Message
                </label>
                <textarea
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  placeholder="Enter a custom resolution message (optional)"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to use the default resolution message.
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResolutionEmail}
                  disabled={isSendingEmail}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSendingEmail ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;