import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket as TicketIcon, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { User, Ticket } from '../types';
import TicketService from '../services/ticketService';
import ApiService from '../services/apiService';

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
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    loadStats();
    loadUsers();
  }, [tickets]);

  const loadStats = () => {
    const ticketService = TicketService.getInstance();
    setStats(ticketService.getTicketStats());
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const apiService = ApiService.getInstance();
      const usersList = await apiService.getUsers();
      console.log('📊 AdminDashboard - Loaded users:', usersList);
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error) {
      console.error('❌ AdminDashboard - Error loading users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };



  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-2xl p-3 sm:p-6 hover:shadow-2xl dark:hover:bg-white/15 hover:scale-105 hover:border-blue-300 dark:hover:border-white/30 transition-all duration-300 cursor-pointer group">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-xl ${color} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
          {icon}
        </div>
        {trend && (
          <span className="text-green-500 dark:text-green-400 text-xs sm:text-sm font-medium group-hover:scale-110 transition-transform duration-300">+{trend}%</span>
        )}
      </div>
      <h3 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 group-hover:scale-105 transition-transform duration-300">{value}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">{title}</p>
    </div>
  );

  const recentTickets = tickets.slice(0, 5);
  const agents = users.filter(u => u.role === 'support-agent');
  const customers = users.filter(u => u.role === 'customer');
  const administrators = users.filter(u => u.role === 'administrator');

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Header - Gradient style matching screenshot */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">Welcome back, System! Manage events, registrations, and staff with powerful insights.</p>
              <div className="flex items-center gap-2 sm:gap-4 mt-3 text-white/80 justify-center sm:justify-start flex-wrap">
                <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <TicketIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {stats.total} Total Tickets
                </span>
                <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  {users.length} Total Users
                </span>
              </div>
            </div>
          </div>
          <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base">
            <span className="text-xl sm:text-2xl">+</span>
            Create Ticket
          </button>
        </div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/30 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Total Tickets"
          value={stats.total}
          icon={<TicketIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="12"
        />
        <StatCard
          title="Open Tickets"
          value={stats.open}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-br from-yellow-500 to-orange-600"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Recent Tickets</h2>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/30 dark:border-blue-500/20">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 sm:p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg hover:border-blue-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base flex-1">{ticket.title}</h3>
                  <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span>#{ticket.id}</span>
                  <span className={`px-2 py-0.5 sm:py-1 rounded-full text-xs ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                    ticket.status === 'in-progress' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Overview */}
        <div className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Team Overview</h2>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/30 dark:border-purple-500/20">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Total Users */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary-500/20 dark:to-primary-600/20 border border-blue-200 dark:border-primary-400/30 rounded-xl p-3 sm:p-4 hover:scale-105 hover:shadow-lg hover:from-blue-100 hover:to-blue-200 dark:hover:from-primary-500/30 dark:hover:to-primary-600/30 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base">Total Users</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-primary-300">{users.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  All registered users in the system
                </div>
              </div>

              {/* Administrators */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/20 dark:to-purple-600/20 border border-purple-200 dark:border-purple-400/30 rounded-xl p-3 sm:p-4 hover:scale-105 hover:shadow-lg hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-500/30 dark:hover:to-purple-600/30 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors duration-300">Administrators</span>
                  <span className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform duration-300">{administrators.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  System administrators with full access
                </div>
              </div>

              {/* Support Agents */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-200 dark:border-blue-400/30 rounded-xl p-3 sm:p-4 hover:scale-105 hover:shadow-lg hover:from-blue-100 hover:to-indigo-200 dark:hover:from-blue-500/30 dark:hover:to-blue-600/30 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base group-hover:text-indigo-700 dark:group-hover:text-blue-200 transition-colors duration-300">Support Agents</span>
                  <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-blue-300 group-hover:scale-110 transition-transform duration-300">{agents.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Active agents handling tickets
                </div>
              </div>

              {/* Customers */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/20 dark:to-green-600/20 border border-green-200 dark:border-green-400/30 rounded-xl p-3 sm:p-4 hover:scale-105 hover:shadow-lg hover:from-green-100 hover:to-green-200 dark:hover:from-green-500/30 dark:hover:to-green-600/30 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900 dark:text-white font-medium text-sm sm:text-base group-hover:text-green-700 dark:group-hover:text-green-200 transition-colors duration-300">Customers</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-300 group-hover:scale-110 transition-transform duration-300">{customers.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Registered customers submitting tickets
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Performance Metrics</h2>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200/30 dark:border-green-500/20">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="text-center p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/30 hover:scale-105 hover:shadow-lg hover:from-green-100 hover:to-emerald-100 dark:hover:bg-green-500/20 transition-all duration-300 cursor-pointer group">
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">94%</div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 font-medium">Customer Satisfaction</div>
          </div>
          <div className="text-center p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30 hover:scale-105 hover:shadow-lg hover:from-blue-100 hover:to-cyan-100 dark:hover:bg-blue-500/20 transition-all duration-300 cursor-pointer group">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">1.2d</div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 font-medium">Average Resolution Time</div>
          </div>
          <div className="text-center p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/30 hover:scale-105 hover:shadow-lg hover:from-purple-100 hover:to-pink-100 dark:hover:bg-purple-500/20 transition-all duration-300 cursor-pointer group">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">98%</div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 font-medium">SLA Compliance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;