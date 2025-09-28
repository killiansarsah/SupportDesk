import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Paperclip, Download, Clock, User, Tag, AlertCircle } from 'lucide-react';
import { Ticket, User as UserType, Message } from '../types';
import TicketService from '../services/ticketService';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const ticketService = TicketService.getInstance();
      await ticketService.addMessage(
        ticket.id,
        newMessage.trim(),
        user.id,
        user.name,
        false
      );
      setNewMessage('');
      onUpdate();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
            <p className="text-gray-300">Ticket #{ticket.id}</p>
          </div>
        </div>

        {canChangeStatus && (
          <select
            value={ticketStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="px-4 py-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        )}
      </div>

      {/* Ticket Info */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticketStatus)}`}>
              {ticketStatus.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <AlertCircle className={`w-4 h-4 ${getPriorityColor(ticket.priority)}`} />
            <span className="text-gray-300 text-sm">Priority:</span>
            <span className={`font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Category:</span>
            <span className="text-white">{ticket.category}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 text-sm">Created:</span>
            <span className="text-white">{new Date(ticket.createdAt).toLocaleDateString()}</span>
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
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
    </div>
  );
};

export default TicketDetail;