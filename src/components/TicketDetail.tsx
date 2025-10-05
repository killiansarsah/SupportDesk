import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Download, FileText, X } from 'lucide-react';
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



  const canChangeStatus = user.role === 'administrator' || user.role === 'support-agent';
  const canAssignTickets = user.role === 'administrator' || user.role === 'support-agent';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <button 
          onClick={onBack}
          className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          Tickets
        </button>
        <span>/</span>
        <span>{ticketStatus === 'open' ? 'Open' : ticketStatus === 'closed' ? 'Closed' : 'Open'}</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">#{ticket.id}</span>
      </div>

      {/* Main Layout - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {ticket.title}
            </h1>
          </div>



          {/* Conversation Card */}
          <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-dark-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation</h2>
            </div>

            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
              {ticket.messages.map((message) => {
                const isAgent = message.userName.includes('Agent') || message.userName.includes('Agent');
                
                return (
                  <div key={message.id} className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        isAgent 
                          ? 'bg-gradient-to-br from-orange-400 to-orange-500' 
                          : 'bg-gradient-to-br from-blue-400 to-blue-500'
                      }`}>
                        {message.userName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {message.userName}
                        </span>
                        {isAgent && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">(Agent)</span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(message.timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        isAgent
                          ? 'bg-gray-50 dark:bg-dark-800/50'
                          : 'bg-white dark:bg-dark-800'
                      } ${!isAgent && 'border border-gray-200 dark:border-dark-700'}`}>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Section */}
            <div className="p-6 border-t border-gray-200 dark:border-dark-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Reply</h3>
              
              {/* Template Selector */}
              {(user.role === 'support-agent' || user.role === 'administrator') && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-300 dark:border-green-700 transition-colors text-sm"
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
              
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newMessage.trim()}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-dark-700 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column - Ticket Details */}
        <div className="space-y-6">
          {/* Ticket Details Card */}
          <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-dark-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Details</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Status
                </label>
                {canChangeStatus ? (
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
                    className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    ticketStatus === 'open' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : ticketStatus === 'closed'
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {ticketStatus.charAt(0).toUpperCase() + ticketStatus.slice(1)}
                  </span>
                )}
              </div>

              {/* Assignee */}
              {canAssignTickets && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Assignee
                  </label>
                  <CustomSelect
                    value={assignedTo}
                    onChange={handleAssignmentChange}
                    disabled={isUpdatingAssignment}
                    placeholder="Unassigned"
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...availableAgents.map((agent) => {
                        const agentId = (agent as UserType)._id || agent.id;
                        return {
                          value: agentId,
                          label: agent.name
                        };
                      })
                    ]}
                    className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Customer
                </label>
                <div className="text-gray-900 dark:text-white font-medium">
                  {typeof ticket.customerId === 'object' ? (ticket.customerId as UserType).name : 'Unknown'}
                </div>
              </div>

              {/* Created */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Created
                </label>
                <div className="text-gray-900 dark:text-white">
                  {new Date(ticket.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour12: false
                  })}
                </div>
              </div>

              {/* Last Update */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Last Update
                </label>
                <div className="text-gray-900 dark:text-white">
                  {new Date(ticket.updatedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour12: false
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Priority
                </label>
                <div className="text-gray-900 dark:text-white font-medium capitalize">
                  {ticket.priority}
                </div>
              </div>

              {/* Related Order */}
              {ticket.description.includes('#') && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Related Order
                  </label>
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    #{ticket.description.match(/#(\d+)/)?.[1] || '5678'}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          {canChangeStatus && (
            <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-dark-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Actions</h2>
              </div>
              
              <div className="p-6 space-y-3">
                {canChangeStatus && (
                  <CustomSelect
                    value={ticketStatus}
                    onChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                    options={[
                      { value: 'open', label: 'Change Status' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'resolved', label: 'Resolved' },
                      { value: 'closed', label: 'Closed' }
                    ]}
                    className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                )}
                
                {canAssignTickets && (
                  <CustomSelect
                    value={assignedTo}
                    onChange={handleAssignmentChange}
                    disabled={isUpdatingAssignment}
                    placeholder="Change Assignee"
                    options={[
                      { value: '', label: 'Change Assignee' },
                      ...availableAgents.map((agent) => {
                        const agentId = (agent as UserType)._id || agent.id;
                        return {
                          value: agentId,
                          label: agent.name
                        };
                      })
                    ]}
                    className="w-full bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                )}
                
                {(ticketStatus === 'resolved' || ticketStatus === 'closed') && (
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Email Customer
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-dark-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
              </div>
              <div className="p-6 space-y-2">
                {ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{attachment.name}</span>
                    </div>
                    <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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