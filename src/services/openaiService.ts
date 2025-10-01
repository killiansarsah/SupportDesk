import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
});

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private conversationHistory: ChatGPTMessage[] = [];

  private constructor() {
    // Initialize with system prompt for support context
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
      // Check if API key is configured
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        return "I'm sorry, but the AI chat service is not configured yet. Please contact support for assistance.";
      }

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message
      });

      // Get response from ChatGPT
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: this.conversationHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const responseMessage = completion.choices[0]?.message?.content || 
        "I'm sorry, I didn't understand that. Could you please rephrase your question?";

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseMessage
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 11) { // 1 system + 10 messages
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-10) // Keep last 10 messages
        ];
      }

      return responseMessage;

    } catch (error: unknown) {
      console.error('OpenAI API Error:', error);
      
      // Handle specific error types
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('insufficient_quota') || errorMessage.includes('quota')) {
        return "I'm sorry, the AI service has reached its usage limit. Please contact support for assistance.";
      } else if (errorMessage.includes('invalid_api_key') || errorMessage.includes('unauthorized')) {
        return "I'm sorry, there's an issue with the AI service configuration. Please contact support.";
      } else {
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment or contact support if the issue persists.";
      }
    }
  }

  public clearConversation(): void {
    this.conversationHistory = [this.conversationHistory[0]]; // Keep only system message
  }

  public getConversationLength(): number {
    return this.conversationHistory.length - 1; // Exclude system message
  }
}

export const openaiService = OpenAIService.getInstance();