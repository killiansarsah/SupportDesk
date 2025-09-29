import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket as TicketIcon, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { User, Ticket } from '../types';
import TicketService from '../services/ticketService';
import AuthService from '../services/authService';

interface AdminDashboardProps {
  user: User;
  tickets: Ticket[];
  onTicketUpdate: () => void;
  selectedTicketId?: string | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, tickets, onTicketUpdate, selectedTicketId }) => {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, [tickets]);

  const loadStats = () => {
    const ticketService = TicketService.getInstance();
    setStats(ticketService.getTicketStats());
  };

  const loadUsers = async () => {
    const authService = AuthService.getInstance();
    const usersList = await authService.getAllUsers();
    setUsers(usersList);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-400 text-sm font-medium">+{trend}%</span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-300 text-sm">{title}</p>
    </div>
  );

  const recentTickets = tickets.slice(0, 5);
  const agents = users.filter(u => u.role === 'support-agent');
  const customers = users.filter(u => u.role === 'customer');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Administrator Dashboard</h1>
        <p className="text-gray-300">Complete system overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tickets"
          value={stats.total}
          icon={<TicketIcon className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="12"
        />
        <StatCard
          title="Open Tickets"
          value={stats.open}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Tickets</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white truncate">{ticket.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-300' :
                    ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>#{ticket.id}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-500/20 text-blue-300' :
                    ticket.status === 'in-progress' ? 'bg-purple-500/20 text-purple-300' :
                    ticket.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Overview */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Team Overview</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Support Agents</span>
                <span className="text-2xl font-bold text-blue-400">{agents.length}</span>
              </div>
              <div className="text-sm text-gray-400">
                Active agents handling tickets
              </div>
            </div>

            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Customers</span>
                <span className="text-2xl font-bold text-green-400">{customers.length}</span>
              </div>
              <div className="text-sm text-gray-400">
                Registered customers
              </div>
            </div>

            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Response Time</span>
                <span className="text-2xl font-bold text-purple-400">2.5h</span>
              </div>
              <div className="text-sm text-gray-400">
                Average first response
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">94%</div>
            <div className="text-sm text-gray-400">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">1.2d</div>
            <div className="text-sm text-gray-400">Average Resolution Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">98%</div>
            <div className="text-sm text-gray-400">SLA Compliance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;