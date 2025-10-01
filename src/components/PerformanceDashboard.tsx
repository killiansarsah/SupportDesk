import { useState, useEffect } from 'react';
import { TrendingUp, Clock, CheckCircle, Users, Target, Award } from 'lucide-react';
import { performanceService, PerformanceOverview, AgentPerformance } from '../services/performanceService';

export default function PerformanceDashboard() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [overview, setOverview] = useState<PerformanceOverview | null>(null);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const [overviewData, agentsData] = await Promise.all([
        performanceService.getOverview(),
        performanceService.getAgentPerformance()
      ]);
      setOverview(overviewData);
      setAgents(agentsData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedAgentData = selectedAgent === 'all' ? null : agents.find(a => a.id === selectedAgent);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading performance data...</div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Failed to load performance data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Performance Dashboard</h1>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Agents</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Total Tickets</p>
          </div>
          <p className="text-2xl font-bold text-white">{selectedAgentData?.tickets || overview.totalTickets}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-gray-400 text-sm">Resolved</p>
          </div>
          <p className="text-2xl font-bold text-white">{selectedAgentData?.resolved || overview.resolvedTickets}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <p className="text-gray-400 text-sm">Avg Response</p>
          </div>
          <p className="text-2xl font-bold text-white">{selectedAgentData?.avgTime || overview.avgResponseTime}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <p className="text-gray-400 text-sm">Resolution Time</p>
          </div>
          <p className="text-2xl font-bold text-white">{overview.avgResolutionTime}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-orange-400" />
            <p className="text-gray-400 text-sm">CSAT Rating</p>
          </div>
          <p className="text-2xl font-bold text-white">{selectedAgentData?.rating || overview.customerSatisfaction}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <p className="text-gray-400 text-sm">Active Agents</p>
          </div>
          <p className="text-2xl font-bold text-white">{overview.activeAgents}</p>
        </div>
      </div>

      {/* Agent Performance Table */}
      {selectedAgent === 'all' && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">Agent Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white font-medium py-3">Agent</th>
                  <th className="text-left text-white font-medium py-3">Tickets</th>
                  <th className="text-left text-white font-medium py-3">Resolved</th>
                  <th className="text-left text-white font-medium py-3">Avg Time</th>
                  <th className="text-left text-white font-medium py-3">Rating</th>
                  <th className="text-left text-white font-medium py-3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => {
                  const resolutionRate = agent.tickets > 0 ? Math.round((agent.resolved / agent.tickets) * 100) : 0;
                  return (
                    <tr key={agent.id} className="border-b border-white/10">
                      <td className="py-4 text-white">{agent.name}</td>
                      <td className="py-4 text-white">{agent.tickets}</td>
                      <td className="py-4 text-white">{agent.resolved}</td>
                      <td className="py-4 text-white">{agent.avgTime}</td>
                      <td className="py-4 text-white">{agent.rating}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-green-400 h-2 rounded-full" 
                              style={{ width: `${resolutionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{resolutionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Agent Details */}
      {selectedAgentData && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">{selectedAgentData.name} - Detailed Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-4">Resolution Rate</h3>
              <div className="w-full bg-white/20 rounded-full h-4 mb-2">
                <div 
                  className="bg-green-400 h-4 rounded-full" 
                  style={{ width: `${Math.round((selectedAgentData.resolved / selectedAgentData.tickets) * 100)}%` }}
                ></div>
              </div>
              <p className="text-white text-sm">{Math.round((selectedAgentData.resolved / selectedAgentData.tickets) * 100)}% of tickets resolved</p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Customer Rating</h3>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-white">{selectedAgentData.rating}</div>
                <div className="text-yellow-400">★★★★★</div>
              </div>
              <p className="text-white/60 text-sm mt-2">Based on customer feedback</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}