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

  // Auto-select ticket from notification
  React.useEffect(() => {
    if (selectedTicketId && tickets.length > 0) {
      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
  }, [selectedTicketId, tickets]);

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
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-white">My Support Tickets</h1>
          <p className="text-gray-300">Track and manage your support requests</p>
        </div>
        <button
          onClick={() => setShowCreateTicket(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Ticket</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Your Tickets</h2>
          <span className="text-gray-300 text-sm">{tickets.length} total tickets</span>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No tickets yet</h3>
            <p className="text-gray-400 mb-6">Create your first support ticket to get help from our team.</p>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
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