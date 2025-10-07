import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Download, FileText, X, ArrowLeft } from 'lucide-react';
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
  const [currentTicket, setCurrentTicket] = useState(ticket);
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

  // Update local ticket when prop changes
  useEffect(() => {
    setCurrentTicket(ticket);
  }, [ticket]);

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
      const agents = users.filter((u: UserType) => u.role === 'support-agent' || u.role === 'administrator');
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
    console.log('📨 TicketDetail - handleSendMessage called');
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      console.log('📨 TicketDetail - Sending message to ticket:', currentTicket.id);
      const ticketService = TicketService.getInstance();
      const message = await ticketService.addMessage(
        currentTicket.id,
        newMessage.trim(),
        user.id,
        user.name,
        false
      );
      
      if (message) {
        console.log('✅ TicketDetail - Message sent successfully, updating local state');
        setNewMessage('');
        // Update local ticket state with new message instead of reloading everything
        setCurrentTicket(prev => ({
          ...prev,
          messages: [...(prev.messages || []), message]
        }));
        console.log('✅ TicketDetail - Local state updated, NOT calling onUpdate()');
      }
    } catch (error) {
      console.error('❌ TicketDetail - Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      console.log('✅ TicketDetail - handleSendMessage finished');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const ticketService = TicketService.getInstance();
      await ticketService.updateTicket(
        currentTicket.id,
        { status: newStatus as 'open' | 'in-progress' | 'resolved' | 'closed' },
        user.id,
        user.name
      );
      setTicketStatus(newStatus as 'open' | 'in-progress' | 'resolved' | 'closed');
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignmentChange = async (newAssignedTo: string) => {
    console.log('Assignment change requested:', { ticketId: currentTicket.id, newAssignedTo, currentUser: user });
    
    setIsUpdatingAssignment(true);
    try {
      const ticketService = TicketService.getInstance();
      const updatedTicket = await ticketService.updateTicket(
        currentTicket.id,
        { assignedTo: newAssignedTo || undefined },
        user.id,
        user.name
      );
      
      console.log('Assignment update result:', updatedTicket);
      
      if (updatedTicket) {
        setAssignedTo(newAssignedTo);
        
        // Show success toast
        const toastService = ToastService.getInstance();
        if (newAssignedTo) {
          const agentName = availableAgents.find(a => a.id === newAssignedTo)?.name || 'Agent';
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
        currentTicket.id,
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
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/20 dark:bg-dark-800 dark:text-gray-200 dark:hover:bg-dark-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
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
            <span className="text-gray-900 dark:text-white font-medium">#{currentTicket.id}</span>
          </div>
        </div>
      </div>

      {/* Main Layout - Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentTicket.title}
            </h1>
          </div>



          {/* Conversation Card */}
          <div className="bg-white dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-dark-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation</h2>
            </div>

            <div className="p-4 sm:p-6 space-y-3 max-h-[600px] overflow-y-auto bg-gray-50 dark:bg-dark-950/50">
              {currentTicket.messages && currentTicket.messages.length > 0 ? (
                currentTicket.messages.map((message, index) => {
                const isCurrentUser = message.userId === user.id;
                const isAgent = message.userName.includes('Agent') || user.role === 'support-agent' || user.role === 'administrator';
                const showAvatar = index === 0 || currentTicket.messages[index - 1]?.userId !== message.userId;
                
                return (
                  <div key={message.id} className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    {/* Left Avatar (for received messages) */}
                    {!isCurrentUser && (
                      <div className="flex-shrink-0 self-end">
                        {showAvatar ? (
                          message.userAvatar ? (
                            <img 
                              src={message.userAvatar} 
                              alt={message.userName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm bg-gradient-to-br from-blue-500 to-blue-600">
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8"></div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {/* Sender name (only show if different from previous message or first message) */}
                      {showAvatar && !isCurrentUser && (
                        <div className="flex items-center gap-2 mb-1 px-2">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {message.userName}
                          </span>
                          {isAgent && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                              Agent
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-dark-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-dark-700 rounded-bl-sm'
                      }`}>
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Timestamp */}
                        <div className={`flex items-center gap-1 mt-1 ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-[11px] ${
                            isCurrentUser 
                              ? 'text-blue-100' 
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          {isCurrentUser && (
                            <svg className="w-4 h-4 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Avatar (for sent messages) */}
                    {isCurrentUser && (
                      <div className="flex-shrink-0 self-end">
                        {showAvatar ? (
                          message.userAvatar ? (
                            <img 
                              src={message.userAvatar} 
                              alt={message.userName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm bg-gradient-to-br from-green-500 to-green-600">
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8"></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation below.
                </div>
              )}
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
              
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                    style={{ minHeight: '48px' }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newMessage.trim()}
                  className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-dark-700 dark:disabled:to-dark-700 text-white rounded-full transition-all disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column - Ticket Details */}
        <div className="space-y-6">
          {/* Actions Card - Email Customer (Top Priority) */}
          {(user.role === 'support-agent' || user.role === 'administrator') && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 overflow-hidden shadow-lg">
              <div className="p-6 border-b border-green-200 dark:border-green-800 bg-white/50 dark:bg-dark-900/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                  Quick Actions
                </h2>
              </div>
              
              <div className="p-6">
                {/* Email Customer Button with Animation */}
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="relative w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden group"
                  title="Send email notification to customer"
                >
                  {/* Animated background shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  
                  {/* Button content */}
                  <Send className="w-5 h-5 relative z-10 animate-pulse" />
                  <span className="relative z-10">Send Email to Customer</span>
                </button>
              </div>
            </div>
          )}
          
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
                        return {
                          value: agent.id,
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
                  {typeof ticket.customerId === 'object' && ticket.customerId ? (ticket.customerId as UserType).name : 'Unknown'}
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
              {currentTicket.description.includes('#') && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Related Order
                  </label>
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    #{currentTicket.description.match(/#(\d+)/)?.[1] || '5678'}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {currentTicket.attachments && currentTicket.attachments.length > 0 && (
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

      {/* Email Customer Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg border border-white/20 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Email to Customer
              </h3>
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
                  {typeof ticket.customerId === 'object' && (ticket.customerId as UserType)?.email || 'No email available'}
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