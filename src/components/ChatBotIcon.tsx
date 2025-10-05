import React from 'react';

interface ChatBotIconProps {
  className?: string;
}

const ChatBotIcon: React.FC<ChatBotIconProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} chatbot-float chatbot-glow chatbot-3d-enhance`}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="outerWhite" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F3F4F6" />
        </linearGradient>
        <radialGradient id="faceDark" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#11141A" />
          <stop offset="100%" stopColor="#0B0E14" />
        </radialGradient>
        <linearGradient id="purpleEar" x1="0" x2="1">
          <stop offset="0%" stopColor="#9F7AEA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* outer chunky white frame */}
      <g filter="url(#shadow)">
        <rect x="6" y="6" width="108" height="108" rx="24" fill="url(#outerWhite)" />
      </g>

      {/* side ears / bumps */}
      <g>
        <ellipse cx="16" cy="60" rx="8" ry="12" fill="url(#purpleEar)" opacity="0.95" />
        <ellipse cx="104" cy="60" rx="8" ry="12" fill="url(#purpleEar)" opacity="0.95" />
        {/* top bump */}
        <ellipse cx="60" cy="12" rx="10" ry="6" fill="#7C3AED" opacity="0.96" />
      </g>

      {/* inner dark face */}
      <g transform="translate(20,22)">
        <rect x="0" y="0" width="80" height="64" rx="14" fill="url(#faceDark)" />

        {/* subtle inset highlight */}
        <rect x="6" y="6" width="68" height="52" rx="10" fill="rgba(255,255,255,0.02)" />

        {/* eyes */}
        <circle cx="26" cy="28" r="6" fill="#00F0DF" />
        <circle cx="54" cy="28" r="6" fill="#00F0DF" />
        <circle cx="26" cy="26" r="2" fill="#E6FFFB" opacity="0.9" />
        <circle cx="54" cy="26" r="2" fill="#E6FFFB" opacity="0.9" />

        {/* smile */}
        <path d="M28 46 C36 54, 48 54, 56 46" stroke="#05E5D5" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default ChatBotIcon;
