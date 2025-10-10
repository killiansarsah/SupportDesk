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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Handle browser back button
  useEffect(() => {
    // Push a new state when ticket detail opens
    window.history.pushState({ ticketDetail: true }, '');
    
    const handlePopState = (e: PopStateEvent) => {
      // If user presses back, go back to dashboard
      if (!e.state?.ticketDetail) {
        onBack();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
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
        if (textareaRef.current) {
          textareaRef.current.style.height = '52px';
        }
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

      {/* Main Layout - Single Column on Mobile, Two Column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Section - Full Width on Mobile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Mobile Status Bar */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {currentTicket.title}
            </h1>
            
            {/* Mobile-Only Status Bar */}
            <div className="lg:hidden mb-4">
              {/* Customers: Simple Status Badges */}
              {user.role === 'customer' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                    ticketStatus === 'open' 
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                      : ticketStatus === 'closed'
                      ? 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30'
                      : ticketStatus === 'in-progress'
                      ? 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                  }`}>
                    {ticketStatus ? ticketStatus.replace('-', ' ').toUpperCase() : 'UNKNOWN'}
                  </span>
                  <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold capitalize backdrop-blur-sm border ${
                    ticket.priority === 'urgent'
                      ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
                      : ticket.priority === 'high'
                      ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
                      : ticket.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
                      : 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {/* Agents & Admins: Quick Controls */}
              {(user.role === 'support-agent' || user.role === 'administrator') && (
                <div className="space-y-3 backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 rounded-2xl p-4 border-2 border-white/60 dark:border-white/20 shadow-lg">
                  {/* Status & Assignment Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                        Status
                      </label>
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
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                        Assignee
                      </label>
                      <CustomSelect
                        value={assignedTo}
                        onChange={handleAssignmentChange}
                        disabled={isUpdatingAssignment}
                        placeholder="Unassigned"
                        options={[
                          { value: '', label: 'Unassigned' },
                          ...availableAgents.map((agent) => ({
                            value: agent.id,
                            label: agent.name
                          }))
                        ]}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Customer & Priority Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {typeof ticket.customerId === 'object' && ticket.customerId ? (ticket.customerId as UserType).name : 'Unknown'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize backdrop-blur-sm border ${
                      ticket.priority === 'urgent'
                        ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
                        : ticket.priority === 'high'
                        ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
                        : ticket.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
                        : 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  
                  {/* Send Email Button */}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-4 h-4" />
                    Email Customer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Card - WhatsApp Style with Fixed Input */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-900/60 dark:via-gray-800/40 dark:to-gray-900/60 rounded-3xl border-2 border-white/60 dark:border-white/20 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.6)] flex flex-col h-[calc(100vh-280px)] min-h-[500px]">

            <div className="conversation-messages flex-1 p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-gray-50/50 via-white/30 to-gray-50/50 dark:from-gray-950/30 dark:via-gray-900/20 dark:to-gray-950/30">
              {currentTicket.messages && currentTicket.messages.length > 0 ? (
                currentTicket.messages.map((message, index) => {
                const isCurrentUser = message.userId === user.id;
                // Check if message sender is an agent based on isInternal flag or if assigned agent sent it
                const isAgent = message.isInternal === true || message.userId === currentTicket.assignedTo;
                const showAvatar = index === 0 || currentTicket.messages[index - 1]?.userId !== message.userId;
                
                return (
                  <div key={message.id} className={`flex gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    {/* Left Avatar (for received messages) */}
                    {!isCurrentUser && (
                      <div className="flex-shrink-0 self-end">
                        {showAvatar ? (
                          message.userAvatar ? (
                            <img 
                              src={message.userAvatar} 
                              alt={message.userName}
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-white/50 dark:ring-white/20 shadow-md"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-md ring-2 ring-white/50 dark:ring-white/20">
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-7 h-7"></div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {/* Sender name (only show if different from previous message or first message) */}
                      {showAvatar && !isCurrentUser && (
                        <div className="flex items-center gap-2 mb-2 px-3">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {message.userName}
                          </span>
                          {isAgent && (
                            <span className="text-[10px] px-2 py-1 backdrop-blur-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-700 dark:text-orange-300 rounded-full font-bold border border-orange-400/30 shadow-sm">
                              Agent
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Message Content - Claymorphism Style */}
                      <div className={`rounded-3xl px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                        isCurrentUser
                          ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white border-blue-400/50 dark:border-blue-500/30 shadow-blue-500/20'
                          : 'bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-800/90 dark:via-gray-800/80 dark:to-gray-700/90 text-gray-900 dark:text-gray-100 border-white/60 dark:border-white/20'
                      }`}>
                        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap font-medium">
                          {message.content}
                        </p>
                        
                        {/* Timestamp - WhatsApp Style */}
                        <div className={`flex items-center gap-1 mt-1 ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-[10px] opacity-70 ${
                            isCurrentUser 
                              ? 'text-white' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          {isCurrentUser && (
                            <svg className="w-3 h-3 text-white opacity-70" fill="currentColor" viewBox="0 0 20 20">
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
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-white/50 dark:ring-white/20 shadow-md"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 shadow-md ring-2 ring-white/50 dark:ring-white/20">
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-7 h-7"></div>
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

            {/* Reply Section - Fixed at Bottom */}
            <div className="flex-shrink-0 p-6 border-t border-white/40 dark:border-white/10 backdrop-blur-xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5">
              

              
              <form onSubmit={handleSendMessage} className="relative">
                <div className="flex items-center gap-3 p-3 backdrop-blur-2xl bg-gradient-to-r from-white/80 via-white/60 to-white/80 dark:from-gray-800/60 dark:via-gray-700/40 dark:to-gray-800/60 border-2 border-white/60 dark:border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={handleTextareaChange}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-6 py-3.5 pr-14 backdrop-blur-xl bg-white/70 dark:bg-gray-900/50 border-2 border-white/40 dark:border-white/10 rounded-3xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-400/60 dark:focus:border-blue-500/40 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] resize-none transition-all font-medium"
                      style={{ minHeight: '52px', height: '52px', maxHeight: '200px', overflow: 'auto' }}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all p-2 hover:bg-white/70 dark:hover:bg-white/10 rounded-full backdrop-blur-xl shadow-lg hover:scale-110"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newMessage.trim()}
                    className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full transition-all disabled:cursor-not-allowed flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.6)] hover:scale-110 disabled:shadow-none disabled:scale-100 disabled:opacity-50 border-2 border-white/30"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column - Ticket Details (Hidden on Mobile for Customers Only) */}
        <div className={`${user.role === 'customer' ? 'hidden lg:block' : ''} space-y-6`}>
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
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border ${
                    ticketStatus === 'open' 
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                      : ticketStatus === 'closed'
                      ? 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30'
                      : 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
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
                <div className="px-3 py-2 backdrop-blur-sm bg-white/50 dark:bg-white/5 rounded-lg border border-white/30 dark:border-white/10 text-gray-900 dark:text-white font-medium">
                  {typeof ticket.customerId === 'object' && ticket.customerId ? (ticket.customerId as UserType).name : 'Unknown'}
                </div>
              </div>

              {/* Created */}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Created
                </label>
                <div className="px-3 py-2 backdrop-blur-sm bg-white/50 dark:bg-white/5 rounded-lg border border-white/30 dark:border-white/10 text-gray-900 dark:text-white">
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
                <div className="px-3 py-2 backdrop-blur-sm bg-white/50 dark:bg-white/5 rounded-lg border border-white/30 dark:border-white/10 text-gray-900 dark:text-white">
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
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold capitalize backdrop-blur-sm border ${
                  ticket.priority === 'urgent'
                    ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
                    : ticket.priority === 'high'
                    ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30'
                    : ticket.priority === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
                    : 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30'
                }`}>
                  {ticket.priority}
                </span>
              </div>

              {/* Related Order */}
              {currentTicket.description.includes('#') && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Related Order
                  </label>
                  <a href="#" className="inline-flex px-3 py-2 backdrop-blur-sm bg-blue-500/10 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all">
                    #{currentTicket.description.match(/#(\d+)/)?.[1] || '5678'}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Attachments */}
          {currentTicket.attachments && currentTicket.attachments.length > 0 && (
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gradient-to-br dark:from-white/5 dark:to-white/10 rounded-xl border border-white/40 dark:border-white/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <div className="p-6 border-b border-white/30 dark:border-white/10 backdrop-blur-sm bg-white/50 dark:bg-white/5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
              </div>
              <div className="p-6 space-y-2">
                {ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 backdrop-blur-sm bg-white/50 dark:bg-white/5 rounded-lg border border-white/30 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{attachment.name}</span>
                    </div>
                    <button className="p-1 rounded hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 dark:from-gray-900/95 dark:to-gray-800/95 border border-white/20 rounded-xl p-6 w-full max-w-lg shadow-[0_20px_60px_rgb(0,0,0,0.5)]">
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
                <div className="px-3 py-2 backdrop-blur-sm bg-white/5 border border-white/20 rounded-lg text-gray-300">
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
                  className="w-full px-3 py-2 backdrop-blur-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50"
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to use the default resolution message.
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendResolutionEmail}
                  disabled={isSendingEmail}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-600/50 disabled:to-emerald-600/50 text-white rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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