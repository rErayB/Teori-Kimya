import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: 'cyan' | 'emerald' | 'amber' | 'blue' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'cyan',
  onClick,
}) => {
  const colorGradients = {
    cyan: 'from-cyan-500/20 via-sky-500/5 to-transparent border-cyan-500/20 text-[#8DE7F2]',
    emerald: 'from-emerald-500/20 via-teal-500/5 to-transparent border-emerald-500/20 text-emerald-300',
    amber: 'from-amber-500/20 via-orange-500/5 to-transparent border-amber-500/20 text-amber-300',
    blue: 'from-blue-500/20 via-indigo-500/5 to-transparent border-blue-500/20 text-blue-300',
    rose: 'from-rose-500/20 via-pink-500/5 to-transparent border-rose-500/20 text-rose-300',
  };

  const iconBg = {
    cyan: 'bg-cyan-500/15 border-cyan-400/30 text-[#8DE7F2]',
    emerald: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    amber: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
    blue: 'bg-blue-500/15 border-blue-400/30 text-blue-300',
    rose: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 bg-[#0B1B2E]/90 border backdrop-blur-md transition-all duration-200 hover:border-cyan-500/40 hover:-translate-y-0.5 shadow-lg shadow-black/40 ${colorGradients[highlightColor]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Background radial soft aura */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h4 className="text-2xl font-black text-white tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl border shrink-0 ${iconBg[highlightColor]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-500 text-[11px] font-normal">geçen döneme göre</span>
        </div>
      )}
    </div>
  );
};
