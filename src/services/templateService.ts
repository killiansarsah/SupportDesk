import { TicketTemplate } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api';
console.log('🔧 TemplateService API_BASE_URL:', API_BASE_URL);
console.log('🔧 VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL);

interface TemplateResponse {
  success: boolean;
  data?: TicketTemplate[];
}

interface SingleTemplateResponse {
  success: boolean;
  data?: TicketTemplate;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

class TemplateService {
  private static instance: TemplateService;

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTemplates(): Promise<TemplateResponse> {
    return this.request<TemplateResponse>('/templates');
  }

  async createTemplate(template: Omit<TicketTemplate, 'id'>): Promise<SingleTemplateResponse> {
    return this.request<SingleTemplateResponse>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: string, template: Partial<TicketTemplate>): Promise<SingleTemplateResponse> {
    return this.request<SingleTemplateResponse>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(id: string): Promise<DeleteResponse> {
    return this.request<DeleteResponse>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }
}

export default TemplateService;