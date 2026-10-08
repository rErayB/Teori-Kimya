import React from 'react';
import { ProductCategory, ProductUnit } from '../../types';
import { ShieldAlert, Droplets, Sparkles, Flame, Beaker, Car, Utensils, Shirt } from 'lucide-react';

interface ProductVisualProps {
  image?: string;
  name: string;
  code: string;
  category: ProductCategory;
  unit: ProductUnit;
  phValue?: string;
  unNumber?: string;
  className?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  image,
  name,
  code,
  category,
  unit,
  phValue,
  unNumber,
  className = '',
  showBadge = true,
  size = 'md',
}) => {
  // Category specific color theme
  const getCategoryTheme = (cat: ProductCategory) => {
    switch (cat) {
      case 'Ağır Sanayi & Yağ Sökücüler':
        return {
          gradient: 'from-amber-500/20 via-orange-600/20 to-red-900/30',
          border: 'border-orange-500/30',
          liquidColor: '#f97316',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
          icon: <Flame className="w-5 h-5 text-orange-400" />,
          accent: 'text-orange-400',
        };
      case 'Oto Bakım & Yıkama':
        return {
          gradient: 'from-cyan-500/20 via-blue-600/20 to-indigo-900/30',
          border: 'border-cyan-500/30',
          liquidColor: '#06b6d4',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          icon: <Car className="w-5 h-5 text-cyan-400" />,
          accent: 'text-cyan-400',
        };
      case 'Endüstriyel Zemin & Yüzey':
        return {
          gradient: 'from-sky-500/20 via-blue-600/20 to-slate-900/30',
          border: 'border-sky-500/30',
          liquidColor: '#0284c7',
          glow: 'shadow-[0_0_20px_rgba(2,132,199,0.15)]',
          icon: <Droplets className="w-5 h-5 text-sky-400" />,
          accent: 'text-sky-400',
        };
      case 'Gıda Hijyeni & Mutfak':
        return {
          gradient: 'from-emerald-500/20 via-teal-600/20 to-green-950/30',
          border: 'border-emerald-500/30',
          liquidColor: '#10b981',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          icon: <Utensils className="w-5 h-5 text-emerald-400" />,
          accent: 'text-emerald-400',
        };
      case 'Dezenfektan & Biyosidal':
        return {
          gradient: 'from-teal-500/20 via-cyan-600/20 to-blue-950/30',
          border: 'border-teal-500/30',
          liquidColor: '#14b8a6',
          glow: 'shadow-[0_0_20px_rgba(20,184,166,0.15)]',
          icon: <Sparkles className="w-5 h-5 text-teal-400" />,
          accent: 'text-teal-400',
        };
      case 'Çamaşırhane & Tekstil':
        return {
          gradient: 'from-purple-500/20 via-violet-600/20 to-indigo-950/30',
          border: 'border-purple-500/30',
          liquidColor: '#a855f7',
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
          icon: <Shirt className="w-5 h-5 text-purple-400" />,
          accent: 'text-purple-400',
        };
      case 'Özel Kimyasallar':
        return {
          gradient: 'from-rose-500/20 via-red-600/20 to-pink-950/30',
          border: 'border-rose-500/30',
          liquidColor: '#f43f5e',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
          icon: <Beaker className="w-5 h-5 text-rose-400" />,
          accent: 'text-rose-400',
        };
      default:
        return {
          gradient: 'from-cyan-500/20 via-blue-600/20 to-slate-900/30',
          border: 'border-cyan-500/30',
          liquidColor: '#06b6d4',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          icon: <Droplets className="w-5 h-5 text-cyan-400" />,
          accent: 'text-cyan-400',
        };
    }
  };

  const theme = getCategoryTheme(category);

  // If a real image exists, render it with high-end framing
  if (image && image.trim().length > 0) {
    return (
      <div
        className={`relative rounded-xl overflow-hidden bg-[#07111F] border ${theme.border} flex items-center justify-center group ${className}`}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          crossOrigin="anonymous"
        />

        {showBadge && (
          <>
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              <span className="font-mono text-[10px] font-black text-cyan-300 bg-black/80 backdrop-blur px-2 py-0.5 rounded border border-cyan-500/30 shadow-sm">
                {code}
              </span>
            </div>

            {phValue && (
              <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-cyan-300 border border-cyan-500/30 shadow-sm">
                pH {phValue}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  // Render Photorealistic Vector Chemical Canister Graphic
  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-gradient-to-b from-[#0e2137] via-[#07111F] to-[#040912] border ${theme.border} flex flex-col items-center justify-center p-3 select-none ${theme.glow} ${className}`}
    >
      {/* Background ambient liquid glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none blur-xl"
        style={{
          background: `radial-gradient(circle at center, ${theme.liquidColor} 0%, transparent 70%)`,
        }}
      />

      {/* Chemical Industrial Container SVG Mockup */}
      <div className="relative w-full h-full max-h-[160px] flex items-center justify-center">
        <svg
          viewBox="0 0 160 190"
          className="w-full h-full max-h-[140px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Canister Cap */}
          <rect x="90" y="8" width="28" height="14" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
          <line x1="94" y1="12" x2="114" y2="12" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
          <line x1="94" y1="16" x2="114" y2="16" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />

          {/* Canister Handle */}
          <path
            d="M52 35 C 52 16, 85 16, 85 35"
            stroke="#334155"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M52 35 C 52 16, 85 16, 85 35"
            stroke="#64748B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Canister Body Base */}
          <rect
            x="24"
            y="32"
            width="112"
            height="145"
            rx="16"
            fill="url(#canisterGradient)"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Side Ribs & Grip Texture */}
          <line x1="30" y1="50" x2="30" y2="155" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <line x1="130" y1="50" x2="130" y2="155" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

          {/* Chemical Liquid Level Window Indicator */}
          <rect x="36" y="55" width="8" height="105" rx="4" fill="#091422" stroke="#1E293B" strokeWidth="1" />
          <rect
            x="38"
            y="80"
            width="4"
            height="78"
            rx="2"
            fill={theme.liquidColor}
            opacity="0.85"
          />

          {/* Main Industrial Product Label */}
          <rect
            x="50"
            y="48"
            width="74"
            height="115"
            rx="6"
            fill="#06121E"
            stroke="#0284C7"
            strokeWidth="1"
          />

          {/* Label Header */}
          <rect x="50" y="48" width="74" height="20" rx="6" fill="#0C253F" />
          <text x="87" y="61" fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
            TEORİ KİMYA
          </text>

          {/* Product Code Badge on Label */}
          <rect x="56" y="74" width="62" height="18" rx="3" fill="#021A30" stroke="#06B6D4" strokeWidth="0.8" />
          <text x="87" y="86" fill="#67E8F9" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            {code}
          </text>

          {/* Simulated Hazard Diamond / Chemical Spec */}
          <g transform="translate(68, 98) scale(0.65)">
            <polygon points="16,0 32,16 16,32 0,16" fill="#1E293B" stroke="#94A3B8" strokeWidth="1" />
            <polygon points="16,2 30,16 16,16 16,2" fill="#EF4444" />
            <polygon points="2,16 16,2 16,16 2,16" fill="#3B82F6" />
            <polygon points="16,30 30,16 16,16 16,30" fill="#EAB308" />
            <polygon points="2,16 16,30 16,16 2,16" fill="#F8FAFC" />
          </g>

          {/* Barcode Mock on Label */}
          <g transform="translate(56, 128)">
            <rect x="0" y="0" width="62" height="14" fill="#FFFFFF" rx="1.5" />
            <line x1="4" y1="2" x2="4" y2="12" stroke="#000000" strokeWidth="1" />
            <line x1="7" y1="2" x2="7" y2="12" stroke="#000000" strokeWidth="2" />
            <line x1="11" y1="2" x2="11" y2="12" stroke="#000000" strokeWidth="1" />
            <line x1="14" y1="2" x2="14" y2="12" stroke="#000000" strokeWidth="1.5" />
            <line x1="18" y1="2" x2="18" y2="12" stroke="#000000" strokeWidth="2.5" />
            <line x1="23" y1="2" x2="23" y2="12" stroke="#000000" strokeWidth="1" />
            <line x1="26" y1="2" x2="26" y2="12" stroke="#000000" strokeWidth="1.5" />
            <line x1="30" y1="2" x2="30" y2="12" stroke="#000000" strokeWidth="2" />
            <line x1="34" y1="2" x2="34" y2="12" stroke="#000000" strokeWidth="1" />
            <line x1="38" y1="2" x2="38" y2="12" stroke="#000000" strokeWidth="2" />
            <line x1="43" y1="2" x2="43" y2="12" stroke="#000000" strokeWidth="1" />
            <line x1="47" y1="2" x2="47" y2="12" stroke="#000000" strokeWidth="2.5" />
            <line x1="52" y1="2" x2="52" y2="12" stroke="#000000" strokeWidth="1.5" />
            <line x1="57" y1="2" x2="57" y2="12" stroke="#000000" strokeWidth="1" />
          </g>

          {/* Unit text */}
          <text x="87" y="153" fill="#94A3B8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
            {unit}
          </text>

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="canisterGradient" x1="24" y1="32" x2="136" y2="177" gradientUnits="userSpaceOnUse">
              <stop stopColor="#132D48" />
              <stop offset="0.5" stopColor="#0B1C30" />
              <stop offset="1" stopColor="#060F1A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showBadge && (
        <div className="w-full flex items-center justify-between gap-1 mt-1 z-10">
          <span className="font-mono text-[10px] font-black text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {code}
          </span>

          <div className="flex items-center gap-1">
            {phValue && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                pH {phValue}
              </span>
            )}
            {unNumber && unNumber.startsWith('UN') && (
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                {unNumber}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
