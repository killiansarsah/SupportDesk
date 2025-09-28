import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User as UserIcon } from 'lucide-react';
import { ChatMessage, ChatSession, BotResponse } from '../types';

const MOCK_BOT_RESPONSES: Record<string, BotResponse> = {
  'hello': {
    message: 'Hello! I\'m here to help. What can I assist you with today?',
    suggestions: ['Reset password', 'Create ticket', 'Check order status']
  },
  'password': {
    message: 'I can help you reset your password. Would you like me to guide you through the process?',
    suggestions: ['Yes, help me reset', 'I need to speak to an agent']
  },
  'ticket': {
    message: 'I can help you create a support ticket. What issue are you experiencing?',
    suggestions: ['Technical issue', 'Billing question', 'Feature request']
  },
  'agent': {
    message: 'I\'ll connect you with a human agent. Please wait a moment...',
    escalate: true
  }
};

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hi! I\'m your AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnectedToAgent, setIsConnectedToAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): BotResponse => {
    const message = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(MOCK_BOT_RESPONSES)) {
      if (message.includes(key)) {
        return response;
      }
    }
    
    return {
      message: 'COMMAND NOT RECOGNIZED. SELECT FROM AVAILABLE EVENT MANAGEMENT OPTIONS.',
      suggestions: ['HUMAN_AGENT', 'HELP_ARTICLES', 'SYSTEM_STATUS']
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse.message,
        sender: isConnectedToAgent ? 'agent' : 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      if (botResponse.escalate) {
        setIsConnectedToAgent(true);
        setTimeout(() => {
          const agentMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: 'Hello! I\'m Sarah from the support team. I see you need assistance. How can I help you?',
            sender: 'agent',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, agentMessage]);
        }, 2000);
      }
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Animated Rings */}
        <div className="absolute inset-0 w-14 h-14">
          <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-1 bg-cyan-400/20 rounded-full animate-pulse"></div>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-all duration-300 group"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
          ) : (
            <div className="relative">
              {/* Custom Robot Icon */}
              <svg className="w-7 h-7 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                {/* Robot Head */}
                <rect x="6" y="4" width="12" height="10" rx="2" className="fill-white" />
                {/* Robot Eyes */}
                <circle cx="9" cy="8" r="1.5" className="fill-cyan-400 animate-pulse" />
                <circle cx="15" cy="8" r="1.5" className="fill-cyan-400 animate-pulse" />
                {/* Robot Mouth */}
                <rect x="10" y="11" width="4" height="1" rx="0.5" className="fill-gray-400" />
                {/* Robot Antenna */}
                <circle cx="12" cy="2" r="1" className="fill-red-400 animate-ping" />
                <line x1="12" y1="3" x2="12" y2="4" stroke="white" strokeWidth="1" />
                {/* Robot Body */}
                <rect x="8" y="14" width="8" height="6" rx="1" className="fill-white" />
                {/* Robot Arms */}
                <rect x="4" y="15" width="3" height="1" rx="0.5" className="fill-white" />
                <rect x="17" y="15" width="3" height="1" rx="0.5" className="fill-white" />
                {/* Robot Legs */}
                <rect x="9" y="20" width="2" height="2" rx="0.5" className="fill-white" />
                <rect x="13" y="20" width="2" height="2" rx="0.5" className="fill-white" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl flex flex-col z-40">
          {/* Header */}
          <div className="p-4 border-b border-white/20 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {isConnectedToAgent ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h3 className="text-white font-medium">
                {isConnectedToAgent ? 'Sarah - Support Agent' : 'AI Assistant'}
              </h3>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/20 text-white p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {!isConnectedToAgent && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {['Reset password', 'Create ticket', 'Speak to agent'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChat;