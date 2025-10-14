import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Download, X, ArrowLeft } from 'lucide-react';
import { Ticket, User as UserType } from '../types';
import TicketService from '../services/ticketService';
import ApiService from '../services/apiService';
import ToastService from '../services/toastService';
import CustomSelect from './CustomSelect';

interface TicketDetailProps {
  ticket: Ticket;
  user: UserType;
  onBack: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, user, onBack }) => {
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<UserType[]>([]);
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

  /**
   * Handle browser/mobile back button navigation
   * Prevents users from exiting the app when pressing back
   * Instead, navigates back to the dashboard
   */
  useEffect(() => {
    // Push a new history state when ticket detail opens
    window.history.pushState({ ticketDetail: true }, '');
    
    const handlePopState = (e: PopStateEvent) => {
      // If user presses back, navigate to dashboard instead of exiting
      if (!e.state?.ticketDetail) {
        onBack();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onBack]);

  /**
   * Real-time message polling - WhatsApp-style auto-refresh
   * Polls the MongoDB API every 2 seconds to check for new messages
   * Automatically updates the chat when new messages are detected
   */
  useEffect(() => {
    const pollMessages = async () => {
      try {
        // Fetch latest ticket data from MongoDB via API
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tickets/${currentTicket.id}`);
        if (response.ok) {
          const updated = await response.json();
          // Only update if there are new messages
          if (updated.messages && updated.messages.length > currentTicket.messages.length) {
            setCurrentTicket(updated);
            // Auto-scroll to show new messages
            setTimeout(scrollToBottom, 100);
          }
        }
      } catch {
        // Silently fail - API might be down, will retry on next interval
      }
    };

    // Poll every 2 seconds for new messages
    const interval = setInterval(pollMessages, 2000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [currentTicket.id, currentTicket.messages.length]);

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

  /**
   * Auto-expanding textarea handler
   * Dynamically adjusts height from 52px to 200px max as user types
   */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      // Reset to minimum height first
      textareaRef.current.style.height = '52px';
      // Expand to fit content, max 200px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  /**
   * Handles sending a new message in the ticket conversation
   * Updates local state immediately for instant feedback
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketService = TicketService.getInstance();
      const message = await ticketService.addMessage(
        currentTicket.id,
        newMessage.trim(),
        user.id,
        user.name,
        false
      );
      
      if (message) {
        // Clear input and reset textarea height
        setNewMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = '52px';
        }
        // Update local state with new message for instant display
        setCurrentTicket(prev => ({
          ...prev,
          messages: [...(prev.messages || []), message]
        }));
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
      const updatedTicket = await ticketService.updateTicket(
        currentTicket.id,
        { status: newStatus },
        user.id,
        user.name
      );

      if (updatedTicket) {
        setTicketStatus(newStatus);

        // Show success notification
        const toastService = ToastService.getInstance();
        toastService.success('Status Updated', `Ticket status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const toastService = ToastService.getInstance();
      toastService.error('Status Update Failed', 'Failed to update ticket status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Handles ticket assignment changes
   * Updates the assigned agent and shows success/error notifications
   */
  const handleAssignmentChange = async (newAssignedTo: string) => {
    setIsUpdatingAssignment(true);
    try {
      const ticketService = TicketService.getInstance();
      const updatedTicket = await ticketService.updateTicket(
        currentTicket.id,
        { assignedTo: newAssignedTo || undefined },
        user.id,
        user.name
      );
      
      if (updatedTicket) {
        setAssignedTo(newAssignedTo);

        // Show success notification
        const toastService = ToastService.getInstance();
        if (newAssignedTo) {
          const agentName = availableAgents.find(a => a.id === newAssignedTo)?.name || 'Agent';
          toastService.success('Ticket Assigned', `Ticket assigned to ${agentName} successfully`);
        } else {
          toastService.success('Ticket Unassigned', 'Ticket has been unassigned successfully');
        }
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      const toastService = ToastService.getInstance();
      toastService.error('Assignment Update Failed', 'Failed to update ticket assignment');
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
            className="back-btn-animate inline-flex items-center gap-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/20 dark:text-gray-200"
            aria-label="Back"
          >
            <span className="back-btn-glass back-btn-animate inline-flex items-center justify-center w-9 h-9 rounded-full text-gray-700 dark:text-gray-200 shadow-sm">
              <ArrowLeft className="w-4 h-4 back-icon text-current" />
            </span>
            <span className="hidden sm:inline">Back</span>
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
                <div className="space-y-2.5 backdrop-blur-xl bg-white/70 dark:bg-gray-800/60 rounded-2xl p-3 border-2 border-white/60 dark:border-white/20 shadow-lg relative z-10">
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
                  
                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <div className="font-medium text-gray-900 dark:text-white mt-0.5">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                      <div className="font-medium text-gray-900 dark:text-white mt-0.5">
                        {new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
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

          {/* Conversation Card - Modern Minimalist Chat */}
          <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-280px)] min-h-[500px]">

            <div className="conversation-messages flex-1 p-4 sm:p-6 space-y-3 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50">
              {currentTicket.messages && currentTicket.messages.length > 0 ? (
                currentTicket.messages.map((message, index) => {
                const isCurrentUser = message.userId === user.id;
                // Get customer ID properly
                const customerId = typeof currentTicket.customerId === 'string' ? currentTicket.customerId : (currentTicket.customerId as UserType)?.id;
                // Show Agent label ONLY if message is from an agent/admin (not from customer)
                const isMessageFromAgent = isCurrentUser 
                  ? (user.role === 'support-agent' || user.role === 'administrator')
                  : (message.userId !== customerId);
                const showAvatar = index === 0 || currentTicket.messages[index - 1]?.userId !== message.userId;
                
                return (
                  <div key={message.id} className={`flex gap-2.5 ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    {/* Left Avatar */}
                    {!isCurrentUser && (
                      <div className="flex-shrink-0 self-end mb-1">
                        {showAvatar ? (
                          message.userAvatar ? (
                            <img 
                              src={message.userAvatar} 
                              alt={message.userName}
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8"></div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {/* Sender name */}
                      {showAvatar && !isCurrentUser && isMessageFromAgent && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {message.userName}
                          </span>
                        </div>
                      )}
                      
                      {/* Message Content - Sleek Modern Style */}
                      <div className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Timestamp */}
                        <div className={`flex items-center gap-1 mt-1 ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-[10px] ${
                            isCurrentUser 
                              ? 'text-blue-100' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          {isCurrentUser && (
                            <svg className="w-3 h-3 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Avatar */}
                    {isCurrentUser && (
                      <div className="flex-shrink-0 self-end mb-1">
                        {showAvatar ? (
                          message.userAvatar ? (
                            <img 
                              src={message.userAvatar} 
                              alt={message.userName}
                              className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
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

            {/* Reply Section - Telegram-style Input */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <form onSubmit={handleSendMessage}>
                <div className="flex items-end gap-3 mr-16 sm:mr-0"> {/* Add right margin to avoid chat bot icon */}
                  <div className="flex-1 relative">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all">
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
                        placeholder="Write a message..."
                        rows={1}
                        className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none text-sm rounded-2xl"
                        style={{ minHeight: '48px', height: '48px', maxHeight: '120px', overflow: 'auto' }}
                      />
                    </div>
                  </div>
                  
                  {/* Separate send button - Telegram style */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !newMessage.trim()}
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all transform ${
                      newMessage.trim() && !isSubmitting
                        ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl scale-100 hover:scale-105'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 scale-90 cursor-not-allowed'
                    }`}
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

        {/* Right Column - Ticket Details (Hidden on Mobile) */}
        <div className="hidden lg:block space-y-6">
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