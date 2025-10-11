import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { User, Ticket } from '../types';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import AppState from '../services/appState';
import HeroSection from './HeroSection';

interface CustomerDashboardProps {
  user: User;
  tickets: Ticket[];
  onTicketUpdate: () => void;
  selectedTicketId?: string | null;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, tickets, onTicketUpdate, selectedTicketId }) => {
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Auto-select ticket from notification
  React.useEffect(() => {
    if (selectedTicketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
  }, [selectedTicketId, tickets]);
  
  // Update selected ticket with fresh data when tickets array changes
  React.useEffect(() => {
    setSelectedTicket(current => {
      if (current && tickets.length > 0) {
        const updatedTicket = tickets.find(t => t.id === current.id);
        console.log('🔄 CustomerDashboard - Updating selected ticket:', {
          selectedTicketId: current.id,
          foundUpdatedTicket: !!updatedTicket,
          ticketsCount: tickets.length
        });
        if (updatedTicket) {
          // Always update to get the latest ticket data (messages, status, etc.)
          console.log('✅ CustomerDashboard - Setting updated ticket');
          return updatedTicket;
        } else {
          console.log('❌ CustomerDashboard - Updated ticket not found! Keeping current selection');
          return current;
        }
      } else if (current) {
        console.log('⚠️ CustomerDashboard - No tickets available but selectedTicket exists');
      }
      return current;
    });
  }, [tickets]);

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

  const handleCreateTicket = () => {
    setShowCreateTicket(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Modern Hero Section */}
      <HeroSection 
        user={user}
        totalTickets={tickets.length}
        totalUsers={resolvedTickets.length}
        onCreateTicket={handleCreateTicket}
      />

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