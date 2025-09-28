import React, { useEffect, useState } from 'react';
import { Ticket, User } from '../types';
import TicketService from '../services/ticketService';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';
import CustomerDashboard from './CustomerDashboard';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    // Check if there's a ticket to open from notification
    const ticketToOpen = localStorage.getItem('openTicketId');
    if (ticketToOpen) {
      setSelectedTicketId(ticketToOpen);
      localStorage.removeItem('openTicketId');
    }
  }, [user]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const ticketService = TicketService.getInstance();
      const userTickets = await ticketService.getTickets(undefined, user.id, user.role);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketUpdate = async () => {
    await loadTickets();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  switch (user.role) {
    case 'administrator':
      return <AdminDashboard user={user} tickets={tickets} onTicketUpdate={handleTicketUpdate} selectedTicketId={selectedTicketId} />;
    case 'support-agent':
      return <AgentDashboard user={user} tickets={tickets} onTicketUpdate={handleTicketUpdate} selectedTicketId={selectedTicketId} />;
    case 'customer':
      return <CustomerDashboard user={user} tickets={tickets} onTicketUpdate={handleTicketUpdate} selectedTicketId={selectedTicketId} />;
    default:
      return <div className="text-white">Unknown user role</div>;
  }
};

export default Dashboard;