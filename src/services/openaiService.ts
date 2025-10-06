export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private conversationHistory: ChatGPTMessage[] = [];
  private apiKey: string | null = null;

  private constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.conversationHistory = [
      {
        role: 'system',
        content: `You are a helpful AI assistant for a customer support system. You should:
        1. Be friendly, professional, and helpful
        2. Provide clear and concise answers
        3. Ask clarifying questions when needed
        4. Offer to escalate to a human agent for complex issues
        5. Help with common support topics like password resets, billing questions, technical issues
        6. Keep responses conversational and not too long
        7. If you cannot help with something, recommend speaking to a human agent
        
        You are part of a support ticket system, so you can help users create tickets, check status, and provide general assistance.`
      }
    ];
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async sendMessage(message: string): Promise<string> {
    try {
      if (!this.apiKey) {
        return "AI chat service is not configured. Please add your OpenAI API key to the environment variables.";
      }

      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: this.conversationHistory,
          max_tokens: 300,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseMessage = data.choices[0]?.message?.content || 
        "I'm sorry, I didn't understand that. Could you please rephrase your question?";

      this.conversationHistory.push({
        role: 'assistant',
        content: responseMessage
      });

      if (this.conversationHistory.length > 11) {
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-10)
        ];
      }

      return responseMessage;

    } catch (error: unknown) {
      console.error('OpenAI API Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('insufficient_quota') || errorMessage.includes('quota')) {
        return "AI service has reached its usage limit. Please contact support for assistance.";
      } else if (errorMessage.includes('invalid_api_key') || errorMessage.includes('unauthorized')) {
        return "AI service configuration issue. Please contact support.";
      } else {
        return "I'm having trouble connecting right now. Please try again in a moment or contact support if the issue persists.";
      }
    }
  }

  public clearConversation(): void {
    this.conversationHistory = [this.conversationHistory[0]];
  }

  public getConversationLength(): number {
    return this.conversationHistory.length - 1;
  }
}

export const openaiService = OpenAIService.getInstance();