import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'cyan' | 'neutral';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
}) => {
  const styles = {
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    cyan: 'bg-[#55BBD9]/15 text-[#8DE7F2] border border-[#55BBD9]/30',
    neutral: 'bg-slate-700/40 text-slate-300 border border-slate-600/40',
  };

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${styles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      {children}
    </span>
  );
};
