import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm font-bold tracking-wider',
    md: 'text-lg font-extrabold tracking-wider',
    lg: 'text-xl font-black tracking-wider',
    xl: 'text-2xl font-black tracking-wider',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Atom SVG Icon with TK monogram */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(85,187,217,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Orbital Oval 1 (45 deg) */}
          <ellipse
            cx="50"
            cy="50"
            rx="46"
            ry="18"
            transform="rotate(45 50 50)"
            stroke="url(#cyanGlow)"
            strokeWidth="3.2"
            strokeDasharray="1 0"
          />
          {/* Orbital Oval 2 (-45 deg) */}
          <ellipse
            cx="50"
            cy="50"
            rx="46"
            ry="18"
            transform="rotate(-45 50 50)"
            stroke="url(#cyanGlow)"
            strokeWidth="3.2"
          />
          {/* Orbital Oval 3 (Horizontal) */}
          <ellipse
            cx="50"
            cy="50"
            rx="46"
            ry="18"
            stroke="url(#cyanGlow)"
            strokeWidth="3.2"
          />

          {/* Electron Nodes */}
          <circle cx="82" cy="18" r="4.2" fill="#8DE7F2" className="animate-pulse" />
          <circle cx="18" cy="82" r="4.2" fill="#8DE7F2" />
          <circle cx="96" cy="50" r="3.8" fill="#55BBD9" />

          {/* Central Nucleus with TK */}
          <circle cx="50" cy="50" r="21" fill="#0B1B2E" stroke="#55BBD9" strokeWidth="2.5" />
          <text
            x="50"
            y="56"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="900"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            TK
          </text>

          <defs>
            <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#8DE7F2" />
              <stop offset="100%" stopColor="#2E6F95" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-tight">
        <span className={`text-white uppercase ${titleSizes[size]} drop-shadow-sm`}>
          TEORİ <span className="text-[#55BBD9]">KİMYA</span>
        </span>
        {showSubtitle && (
          <span className={`text-cyan-200/80 font-medium tracking-tight ${subtitleSizes[size]}`}>
            Endüstriyel & Kurumsal Temizlik Ürünleri
          </span>
        )}
      </div>
    </div>
  );
};
