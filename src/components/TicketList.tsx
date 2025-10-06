import React from 'react';
import { Clock, User, AlertTriangle, MessageSquare } from 'lucide-react';
import { Ticket, TicketFilters } from '../types';
import TicketService from '../services/ticketService';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  filters?: TicketFilters;
  showAssignOption?: boolean;
  currentUserId?: string;
  onTicketUpdate?: () => void;
}

const TicketList: React.FC<TicketListProps> = ({ 
  tickets, 
  onSelectTicket, 
  showAssignOption = false,
  currentUserId,
  onTicketUpdate
}) => {
  const handleAssignToMe = async (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    if (!currentUserId || !onTicketUpdate) return;

    try {
      const ticketService = TicketService.getInstance();
      await ticketService.updateTicket(
        ticket.id, 
        { assignedTo: currentUserId }, 
        currentUserId, 
        'Support Agent'
      );
      onTicketUpdate();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-green-400" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onSelectTicket(ticket)}
          className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center space-x-2 mb-1">
                {getPriorityIcon(ticket.priority)}
                <h3 className="font-medium text-white truncate text-sm sm:text-base">{ticket.title}</h3>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">{ticket.description}</p>
            </div>
            
            <div className="flex flex-col items-end space-y-2 flex-shrink-0">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)} whitespace-nowrap`}>
                {ticket.status.replace('-', ' ')}
              </span>
              {showAssignOption && !ticket.assignedTo && (
                <button
                  onClick={(e) => handleAssignToMe(e, ticket)}
                  className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded border border-blue-500/30 transition-colors whitespace-nowrap"
                >
                  Assign to me
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-4 text-gray-400 overflow-x-auto">
              <span className="whitespace-nowrap">#{ticket.id}</span>
              <span className="flex items-center space-x-1 whitespace-nowrap">
                <User className="w-3 h-3" />
                <span className="truncate max-w-20 sm:max-w-none">{ticket.category}</span>
              </span>
              {ticket.messages.length > 0 && (
                <span className="flex items-center space-x-1 whitespace-nowrap">
                  <MessageSquare className="w-3 h-3" />
                  <span>{ticket.messages.length}</span>
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">{formatDate(ticket.updatedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;