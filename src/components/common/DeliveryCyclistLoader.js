'use client';

import React from 'react';

const DeliveryCyclistLoader = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pedaling {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-wheel {
          animation: spin 1.2s linear infinite;
          transform-origin: 0px 0px;
        }
        .animate-bike {
          animation: bounce 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Main Illustration Container */}
      <div className="relative w-80 h-64 md:w-96 md:h-72">
        
        {/* SVG Canvas */}
        <svg 
          viewBox="0 0 400 300" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground Line */}
          <line x1="40" y1="270" x2="360" y2="270" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />

          {/* Bike and Rider Group (Bouncing) */}
          <g className="animate-bike">
            
            {/* --- BACK WHEEL --- */}
            <g transform="translate(100, 220)">
              <g className="animate-wheel">
                <circle cx="0" cy="0" r="45" stroke="#111" strokeWidth="3" fill="none" />
                <circle cx="0" cy="0" r="40" stroke="#111" strokeWidth="1" fill="none" />
                {/* Spokes */}
                <line x1="-45" y1="0" x2="45" y2="0" stroke="#111" strokeWidth="1" />
                <line x1="0" y1="-45" x2="0" y2="45" stroke="#111" strokeWidth="1" />
                <line x1="-32" y1="-32" x2="32" y2="32" stroke="#111" strokeWidth="1" />
                <line x1="-32" y1="32" x2="32" y2="-32" stroke="#111" strokeWidth="1" />
                <circle cx="0" cy="0" r="6" fill="#111" />
              </g>
            </g>

            {/* --- FRONT WHEEL --- */}
            <g transform="translate(280, 220)">
              <g className="animate-wheel">
                <circle cx="0" cy="0" r="45" stroke="#111" strokeWidth="3" fill="none" />
                <circle cx="0" cy="0" r="40" stroke="#111" strokeWidth="1" fill="none" />
                {/* Spokes */}
                <line x1="-45" y1="0" x2="45" y2="0" stroke="#111" strokeWidth="1" />
                <line x1="0" y1="-45" x2="0" y2="45" stroke="#111" strokeWidth="1" />
                <line x1="-32" y1="-32" x2="32" y2="32" stroke="#111" strokeWidth="1" />
                <line x1="-32" y1="32" x2="32" y2="-32" stroke="#111" strokeWidth="1" />
                <circle cx="0" cy="0" r="6" fill="#111" />
              </g>
            </g>

            {/* --- BIKE FRAME --- */}
            {/* Chainstay */}
            <line x1="100" y1="220" x2="170" y2="220" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            {/* Seat Tube */}
            <line x1="140" y1="140" x2="170" y2="220" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            {/* Down Tube */}
            <line x1="240" y1="140" x2="170" y2="220" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            {/* Fork */}
            <line x1="280" y1="220" x2="240" y2="120" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            {/* Top Tube */}
            <line x1="140" y1="140" x2="245" y2="140" stroke="#111" strokeWidth="4" strokeLinecap="round" />
            {/* Handlebars */}
            <path d="M240 120 C 240 100, 260 100, 265 110" stroke="#111" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Seat */}
            <path d="M125 140 C 135 135, 150 135, 160 140" stroke="#111" strokeWidth="8" fill="none" strokeLinecap="round" />
            
            {/* Pedal Crank */}
            <line x1="170" y1="220" x2="185" y2="240" stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <circle cx="170" cy="220" r="10" fill="#fff" stroke="#111" strokeWidth="3" />

            {/* --- RIDER --- */}
            {/* Back Leg (Darker) */}
            <path d="M145 145 L175 190 L160 215" stroke="#333" strokeWidth="12" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            
            {/* Delivery Bag */}
            <g transform="translate(65, 55)">
              <rect x="0" y="0" width="75" height="85" rx="4" fill="#222" />
              {/* Fork */}
              <path d="M55 25 L35 55 M50 20 L50 35 M55 20 L55 35 M60 20 L60 35 M50 35 C50 40 60 40 60 35" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              {/* Spoon */}
              <path d="M30 25 L50 55 M30 25 C25 20 20 30 25 35 Z" stroke="#fff" strokeWidth="2" fill="#fff" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* Torso */}
            <path d="M140 145 L155 70 C155 70, 165 65, 175 75 L180 140 Z" fill="#fff" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
            
            {/* Front Leg (Black pants) */}
            <path d="M145 145 L190 180 L185 240" stroke="#111" strokeWidth="14" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M175 235 L195 242" stroke="#111" strokeWidth="6" fill="none" strokeLinecap="round" /> {/* Shoe */}
            
            {/* Arm */}
            <path d="M165 85 L200 115 L250 110" stroke="#111" strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            {/* Sleeve detail */}
            <path d="M165 85 L180 100" stroke="#fff" strokeWidth="10" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M165 85 L180 100" stroke="#111" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />

            {/* Head */}
            <circle cx="165" cy="50" r="16" fill="#fff" stroke="#111" strokeWidth="3" />
            {/* Face details */}
            <path d="M175 45 C178 45, 180 48, 178 52" stroke="#111" strokeWidth="2" fill="none" strokeLinecap="round" /> {/* Ear/Nose hint */}
            
            {/* Cap */}
            <path d="M145 42 C145 35, 165 30, 175 35 L195 35" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M149 38 L175 38 C175 38, 170 30, 155 32 Z" fill="#111" />

          </g>
        </svg>
      </div>
    </div>
  );
};

export default DeliveryCyclistLoader;