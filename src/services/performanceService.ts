import ApiService from './apiService';

export interface PerformanceOverview {
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  customerSatisfaction: number;
  activeAgents: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  email: string;
  tickets: number;
  resolved: number;
  avgTime: string;
  rating: string;
}

class PerformanceService {
  private apiService = ApiService.getInstance();

  async getOverview(): Promise<PerformanceOverview> {
    return this.apiService.get('/performance/overview');
  }

  async getAgentPerformance(): Promise<AgentPerformance[]> {
    return this.apiService.get('/performance/agents');
  }
}

export const performanceService = new PerformanceService();