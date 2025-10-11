import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, MessageSquare, Search, Clipboard } from 'lucide-react';
import { User, Ticket, TicketFilters } from '../types';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import TemplateManager from './TemplateManager';
import AppState from '../services/appState';
import CustomSelect from './CustomSelect';
import HeroSection from './HeroSection';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

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
  const [activeTab, setActiveTab] = useState<'tickets' | 'templates'>('tickets');

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
        console.log('🔄 AgentDashboard - Updating selected ticket:', {
          selectedTicketId: current.id,
          foundUpdatedTicket: !!updatedTicket,
          ticketsCount: tickets.length
        });
        if (updatedTicket) {
          // Always update to get the latest ticket data (messages, status, etc.)
          console.log('✅ AgentDashboard - Setting updated ticket');
          return updatedTicket;
        } else {
          console.log('❌ AgentDashboard - Updated ticket not found! Keeping current selection');
          return current;
        }
      } else if (current) {
        console.log('⚠️ AgentDashboard - No tickets available but selectedTicket exists');
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

  // Handle both MongoDB ObjectId and old string ID system
  const myTickets = tickets.filter(ticket => {
    const assignedId = ticket.assignedTo;
    const userId = user.id;
    
    // Check multiple ID formats
    return assignedId === userId || 
           assignedId === user.id;
  });
  
  const unassignedTickets = tickets.filter(ticket => !ticket.assignedTo);
  const inProgressTickets = myTickets.filter(ticket => ticket.status === 'in-progress');
  const resolvedTickets = myTickets.filter(ticket => ticket.status === 'resolved');

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
    // Add create ticket logic here
    console.log('Create ticket clicked');
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Modern Hero Section */}
      <HeroSection 
        user={user}
        totalTickets={myTickets.length}
        totalUsers={inProgressTickets.length}
        onCreateTicket={handleCreateTicket}
      />

      {/* Tab Navigation */}
      <div className="backdrop-blur-md bg-white/15 border border-white/30 rounded-xl p-1 flex shadow-lg w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 sm:flex-initial px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
            activeTab === 'tickets'
              ? 'bg-white/30 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tickets</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 sm:flex-initial px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
            activeTab === 'templates'
              ? 'bg-white/30 text-white shadow-lg'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          <span>Templates</span>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'tickets' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard
              title="My Assignments"
              value={myTickets.length}
              icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard
              title="In Progress"
              value={inProgressTickets.length}
              icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard
              title="Resolved Today"
              value={resolvedTickets.length}
              icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatCard
              title="Unassigned"
              value={unassignedTickets.length}
              icon={<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
          </div>

          {/* Filters and Search */}
          <div className="relative z-20 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6 overflow-visible">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>
              
              <div className="relative z-20 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <CustomSelect
                  value={filters.status?.[0] ?? ''}
                  onChange={(statusValue) =>
                    setFilters({
                      ...filters,
                      status: statusValue ? [statusValue] : undefined
                    })
                  }
                  options={statusOptions}
                  placeholder="All Status"
                  className="flex-1 z-25"
                />

                <CustomSelect
                  value={filters.priority?.[0] ?? ''}
                  onChange={(priorityValue) =>
                    setFilters({
                      ...filters,
                      priority: priorityValue ? [priorityValue] : undefined
                    })
                  }
                  options={priorityOptions}
                  placeholder="All Priority"
                  className="flex-1 z-20"
                />
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Assignments */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">My Assignments</h2>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                  {myTickets.length} tickets
                </span>
              </div>
              {myTickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-500/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No tickets assigned to you yet</p>
                </div>
              ) : (
                <TicketList
                  tickets={myTickets.filter(ticket => 
                    !searchTerm || 
                    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  onSelectTicket={setSelectedTicket}
                  filters={filters}
                />
              )}
            </div>

            {/* Unassigned Tickets */}
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Available Tickets</h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium">
                  {unassignedTickets.length} unassigned
                </span>
              </div>
              {unassignedTickets.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">All tickets are assigned</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </>
      ) : (
        /* Templates Tab */
        <TemplateManager type="both" />
      )}
    </div>
  );
};

export default AgentDashboard;