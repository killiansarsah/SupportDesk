import React from 'react';
import { User } from '../types';
import { Plus, BarChart3, Users, Ticket } from 'lucide-react';

interface HeroSectionProps {
  user: User;
  onCreateTicket?: () => void;
  totalTickets?: number;
  totalUsers?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  user, 
  onCreateTicket,
  totalTickets = 0,
  totalUsers = 0
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleDisplay = () => {
    switch (user.role) {
      case 'administrator':
        return 'Admin Dashboard';
      case 'support-agent':
        return 'Agent Dashboard';
      case 'customer':
        return 'Customer Portal';
      default:
        return 'Dashboard';
    }
  };

  const getDescription = () => {
    switch (user.role) {
      case 'administrator':
        return 'Manage events, registrations, and staff with powerful insights.';
      case 'support-agent':
        return 'Handle customer inquiries and resolve tickets efficiently.';
      case 'customer':
        return 'Track your support requests and get help when you need it.';
      default:
        return 'Welcome to your personalized dashboard experience.';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 p-4 sm:p-8 mb-8">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
        {/* Left Side - Icon, Badge and Content */}
        <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto">
          {/* Chart Icon - Hidden on mobile */}
          <div className="hidden sm:flex w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2 sm:space-y-4 flex-1">
            {/* Role Badge */}
            <div className="flex justify-center sm:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
                {user.role === 'administrator' && (
                  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L3 7V12C3 16.55 6.84 20.74 9.91 21.79C11.04 22.26 12.96 22.26 14.09 21.79C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="currentColor"/>
                    <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {user.role === 'support-agent' && (
                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
                    <path d="M21 9V7C21 5.9 20.1 5 19 5H17.5C16.1 5 15 6.1 15 7.5V9.5C15 10.9 16.1 12 17.5 12H19C20.1 12 21 11.1 21 10V9Z" fill="currentColor"/>
                    <path d="M3 9V7C3 5.9 3.9 5 5 5H6.5C7.9 5 9 6.1 9 7.5V9.5C9 10.9 7.9 12 6.5 12H5C3.9 12 3 11.1 3 10V9Z" fill="currentColor"/>
                    <path d="M12 14C8 14 5 17 5 21H19C19 17 16 14 12 14Z" fill="currentColor" fillOpacity="0.7"/>
                  </svg>
                )}
                {user.role === 'customer' && (
                  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="currentColor"/>
                    <path d="M20 21C20 16.58 16.42 13 12 13S4 16.58 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  </svg>
                )}
                <span className="text-white text-sm font-medium">{getRoleDisplay()}</span>
              </div>
            </div>

            {/* Greeting */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
                {getGreeting()}, {user.name} <span className="inline-block animate-gentle-float">👋</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-lg">
                {getDescription()}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <Ticket className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{totalTickets} Total Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{totalUsers} Total Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Create Ticket Button */}
        <button
          onClick={onCreateTicket}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 text-white font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/30 rounded-full blur-3xl"></div>
    </div>
  );
};

export default HeroSection;