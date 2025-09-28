import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, MessageSquare, Filter, Search, Plus } from 'lucide-react';
import { User, Ticket, TicketFilters } from '../types';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import AppState from '../services/appState';

interface AgentDashboardProps {
  user: User;
  tickets: Ticket[];
  onTicketUpdate: () => void;
  selectedTicketId?: string | null;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user, tickets, onTicketUpdate, selectedTicketId }) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const myTickets = tickets.filter(ticket => ticket.assignedTo === user.id);
  const unassignedTickets = tickets.filter(ticket => !ticket.assignedTo);
  const openTickets = myTickets.filter(ticket => ticket.status === 'open');
  const inProgressTickets = myTickets.filter(ticket => ticket.status === 'in-progress');
  const resolvedTickets = myTickets.filter(ticket => ticket.status === 'resolved');

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
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Agent Dashboard</h1>
        <p className="text-gray-300">Manage and resolve customer support tickets</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Open Tickets"
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
          title="Resolved Today"
          value={resolvedTickets.length}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Unassigned"
          value={unassignedTickets.length}
          icon={<MessageSquare className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.status?.[0] || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : undefined })}
              className="px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            
            <select
              value={filters.priority?.[0] || ''}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value ? [e.target.value] : undefined })}
              className="px-4 py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Tickets */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">My Assigned Tickets</h2>
          <TicketList
            tickets={myTickets.filter(ticket => 
              !searchTerm || 
              ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onSelectTicket={setSelectedTicket}
            filters={filters}
          />
        </div>

        {/* Unassigned Tickets */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Unassigned Tickets</h2>
          <TicketList
            tickets={unassignedTickets.filter(ticket => 
              !searchTerm || 
              ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onSelectTicket={setSelectedTicket}
            filters={filters}
            showAssignOption={true}
            currentUserId={user.id}
            onTicketUpdate={onTicketUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;