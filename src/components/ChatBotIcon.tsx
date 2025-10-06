import React from 'react';

interface ChatbotIconProps {
  className?: string;
  size?: number;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ className = "", size = 24 }) => {
  return (
    <div className="relative">
      {/* Spinning Circle Background */}
      <div className="absolute inset-0 animate-spin">
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="8 4" 
            opacity="0.3"
          />
        </svg>
      </div>
      
      {/* Main Robot */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Robot Head */}
        <rect x="8" y="4" width="8" height="7" rx="3" fill="currentColor"/>
        
        {/* Robot Eyes */}
        <circle cx="10" cy="7" r="1" fill="white"/>
        <circle cx="14" cy="7" r="1" fill="white"/>
        <circle cx="10" cy="7" r="0.3" fill="currentColor"/>
        <circle cx="14" cy="7" r="0.3" fill="currentColor"/>
        
        {/* Robot Mouth */}
        <rect x="11" y="9" width="2" height="0.8" rx="0.4" fill="white"/>
        
        {/* Robot Neck */}
        <rect x="11" y="11" width="2" height="2" fill="currentColor"/>
        
        {/* Robot Body */}
        <rect x="7" y="13" width="10" height="6" rx="2" fill="currentColor"/>
        
        {/* Robot Arms */}
        <rect x="4" y="14" width="2" height="4" rx="1" fill="currentColor"/>
        <rect x="18" y="14" width="2" height="4" rx="1" fill="currentColor"/>
        
        {/* Robot Legs */}
        <rect x="9" y="19" width="2" height="3" rx="1" fill="currentColor"/>
        <rect x="13" y="19" width="2" height="3" rx="1" fill="currentColor"/>
        
        {/* Control Panel */}
        <circle cx="12" cy="16" r="1" fill="white" opacity="0.8"/>
        <rect x="9" y="15" width="1" height="0.5" rx="0.25" fill="white" opacity="0.6"/>
        <rect x="14" y="15" width="1" height="0.5" rx="0.25" fill="white" opacity="0.6"/>
        
        {/* Antenna */}
        <circle cx="12" cy="2" r="0.8" fill="currentColor"/>
        <line x1="12" y1="2.8" x2="12" y2="4" stroke="currentColor" strokeWidth="1"/>
      </svg>
    </div>
  );
};

export default ChatbotIcon;