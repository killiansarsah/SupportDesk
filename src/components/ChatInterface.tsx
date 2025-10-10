import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isOpen, 
  onClose, 
  onMinimize, 
  isMinimized = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant powered by ChatGPT. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('reset') || input.includes('password')) {
      return "I can help you reset your password. Please click the 'Reset password' button below or contact our support team for immediate assistance.";
    }
    
    if (input.includes('ticket') || input.includes('create')) {
      return "I can help you create a new support ticket. Click the 'Create ticket' button below to get started, or I can guide you through the process step by step.";
    }
    
    if (input.includes('agent') || input.includes('human') || input.includes('speak')) {
      return "I'll connect you with one of our support agents right away. Click 'Speak to agent' below to start a live chat session with a human representative.";
    }
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! I'm here to help you with any questions or issues you might have. You can ask me about resetting passwords, creating tickets, or I can connect you with a human agent.";
    }
    
    if (input.includes('help') || input.includes('support')) {
      return "I'm here to provide support! I can help you with:\n• Password resets\n• Creating support tickets\n• Connecting you with live agents\n• General questions about our services\n\nWhat would you like assistance with?";
    }
    
    return "I understand you're looking for help. I can assist you with password resets, creating support tickets, or connecting you with our support team. What specific assistance do you need today?";
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'reset':
        // Trigger password reset flow
        console.log('Password reset initiated');
        break;
      case 'ticket':
        // Trigger ticket creation
        console.log('Ticket creation initiated');
        break;
      case 'agent':
        // Connect to live agent
        console.log('Connecting to live agent');
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-96 h-[600px]'
    }`}>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Assistant (ChatGPT)</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-xs">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Reset chat"
            >
              <RefreshCw className="w-4 h-4 text-white/70" />
            </button>
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white/70" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white/70" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close chat"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto h-96 bg-gradient-to-b from-blue-500/5 to-purple-500/5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.isUser
                        ? 'bg-blue-500 text-white ml-4'
                        : 'bg-white/20 text-white mr-4 backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/20 backdrop-blur-sm text-white mr-4 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => handleQuickAction('reset')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors"
                >
                  Reset password
                </button>
                <button
                  onClick={() => handleQuickAction('ticket')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors"
                >
                  Create ticket
                </button>
                <button
                  onClick={() => handleQuickAction('agent')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors"
                >
                  Speak to agent
                </button>
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white p-2 rounded-full transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;