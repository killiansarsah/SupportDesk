import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User as UserIcon } from 'lucide-react';
import { ChatMessage } from '../types';
import { openaiService } from '../services/openaiService';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hi! I\'m your AI assistant powered by ChatGPT. How can I help you today?',
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage; // Store the message
    setInputMessage('');
    setIsTyping(true);

    try {
      // Check if user wants to speak to an agent
      if (currentMessage.toLowerCase().includes('agent') || 
          currentMessage.toLowerCase().includes('human') ||
          currentMessage.toLowerCase().includes('person')) {
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I\'ll connect you with a human agent right away. Please wait a moment...',
          sender: 'bot',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
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
        
        return;
      }

      // Get ChatGPT response
      const aiResponse = await openaiService.sendMessage(currentMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: isConnectedToAgent ? 'agent' : 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment or type "agent" to speak with a human.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        content: 'Hi! I\'m your AI assistant powered by ChatGPT. How can I help you today?',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
    ]);
    setIsConnectedToAgent(false);
    openaiService.clearConversation();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Animated Glow Effects */}
        <div className="absolute inset-0 -m-2">
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping blur-sm"></div>
          <div className="absolute inset-2 bg-blue-400/15 rounded-full animate-pulse blur-sm"></div>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:to-gray-700 text-white px-6 py-3 rounded-full shadow-lg border border-cyan-400/50 flex items-center gap-3 transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm"
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
              <span className="text-sm font-medium">Close Chat</span>
            </>
          ) : (
            <>
              <div className="relative">
                {/* Sparkle Icon */}
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L13.09 8.26L22 9L13.09 9.74L12 18L10.91 9.74L2 9L10.91 8.26L12 0Z" className="animate-pulse"/>
                  <path d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z" className="animate-ping opacity-70"/>
                  <path d="M5 14L5.5 16.5L8 17L5.5 17.5L5 20L4.5 17.5L2 17L4.5 16.5L5 14Z" className="animate-pulse opacity-60" style={{animationDelay: '0.5s'}}/>
                </svg>
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                AI Assistant
              </span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            </>
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
            <div className="flex-1">
              <h3 className="text-white font-medium">
                {isConnectedToAgent ? 'Sarah - Support Agent' : 'AI Assistant (ChatGPT)'}
              </h3>
              <p className="text-xs text-green-400">● Online</p>
            </div>
            <button
              onClick={clearConversation}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
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