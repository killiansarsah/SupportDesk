import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { User, Ticket } from '../types';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import AppState from '../services/appState';

interface CustomerDashboardProps {
  user: User;
  tickets: Ticket[];
  onTicketUpdate: () => void;
  selectedTicketId?: string | null;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, tickets, onTicketUpdate, selectedTicketId }) => {
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Auto-select ticket from notification and update selected ticket when tickets change
  React.useEffect(() => {
    if (selectedTicketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
    
    // Update selected ticket with fresh data if it exists
    if (selectedTicket && tickets.length > 0) {
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    }
  }, [selectedTicketId, tickets, selectedTicket?.id]);

  // Listen for ticket open events
  useEffect(() => {
    const appState = AppState.getInstance();
    const unsubscribe = appState.onTicketOpen((ticketId) => {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    });
    return unsubscribe;
  }, [tickets]);

  const openTickets = tickets.filter(ticket => ticket.status === 'open');
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in-progress');
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed');

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="backdrop-blur-lg bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20 rounded-xl p-3 sm:p-6 hover:bg-white/20 dark:hover:bg-white/15 hover:scale-105 hover:shadow-2xl hover:border-white/30 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-gray-300 dark:text-gray-300 text-xs sm:text-sm truncate group-hover:text-white transition-colors duration-300">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-white mt-1 group-hover:scale-110 transition-transform duration-300">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (showCreateTicket) {
    return (
      <CreateTicket
        user={user}
        onBack={() => setShowCreateTicket(false)}
        onTicketCreated={onTicketUpdate}
      />
    );
  }

  if (selectedTicket) {
    return (
      <TicketDetail
        ticket={selectedTicket}
        user={user}
        onBack={() => setSelectedTicket(null)}
        onUpdate={onTicketUpdate}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Header - Beautiful Gradient Design */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 dark:from-blue-600 dark:via-purple-600 dark:to-purple-700 p-4 sm:p-6 md:p-8 shadow-xl border border-white/20">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 opacity-50 dark:opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-0 left-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-96 h-96 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Glass Overlay Layer */}
        <div className="absolute inset-0 backdrop-blur-xl bg-white/5"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            {/* Icon with Glass Effect */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border border-white/30 animate-float flex-shrink-0">
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">My Support Tickets</h1>
              <p className="text-white/95 text-sm sm:text-base lg:text-lg drop-shadow-md">Track and manage your support requests</p>
              <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-white/90 justify-center sm:justify-start flex-wrap">
                <span className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  {openTickets.length} Open
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-xs sm:text-sm">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {resolvedTickets.length} Resolved
                </span>
              </div>
            </div>
          </div>
          
          {/* Glass Button */}
          <button
            onClick={() => setShowCreateTicket(true)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/25 hover:bg-white/35 backdrop-blur-md text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-xl border border-white/30 hover:scale-105 hover:shadow-2xl text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>Create Ticket</span>
          </button>
        </div>

        {/* Sparkle Effects */}
        <div className="absolute top-10 right-40 w-2 h-2 bg-white/80 rounded-full animate-pulse shadow-lg"></div>
        <div className="absolute top-20 right-60 w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse animation-delay-1000 shadow-lg"></div>
        <div className="absolute bottom-10 right-20 w-2 h-2 bg-white/80 rounded-full animate-pulse animation-delay-2000 shadow-lg"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Open Tickets"
          value={openTickets.length}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="In Progress"
          value={inProgressTickets.length}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Resolved"
          value={resolvedTickets.length}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Messages"
          value={tickets.reduce((total, ticket) => total + ticket.messages.length, 0)}
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Tickets Section */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Your Tickets</h2>
          <span className="text-gray-300 text-xs sm:text-sm">{tickets.length} total tickets</span>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No tickets yet</h3>
            <p className="text-gray-400 mb-6">Create your first support ticket to get help from our team.</p>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Create First Ticket
            </button>
          </div>
        ) : (
          <TicketList
            tickets={tickets}
            onSelectTicket={setSelectedTicket}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;