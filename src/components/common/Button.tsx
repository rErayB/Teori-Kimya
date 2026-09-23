import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  children,
  onClick,
  className = '',
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  // Debounced click to avoid double execution on rapid clicks
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || internalLoading) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      try {
        const result: any = onClick(e);
        if (result && typeof result.then === 'function') {
          setInternalLoading(true);
          await result;
        }
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const loading = isLoading || internalLoading;

  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#07111F] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px]',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#163A5F] via-[#2E6F95] to-[#55BBD9] hover:from-[#1A4775] hover:to-[#68CEEB] text-white shadow-lg shadow-cyan-950/40 border border-cyan-400/20 focus:ring-cyan-400',
    secondary:
      'bg-[#102A43] hover:bg-[#163A5F] text-slate-100 border border-slate-700/60 focus:ring-slate-500',
    outline:
      'bg-transparent hover:bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 focus:ring-cyan-400',
    danger:
      'bg-red-600/90 hover:bg-red-600 text-white shadow-lg shadow-red-950/40 border border-red-500/40 focus:ring-red-500',
    success:
      'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40 focus:ring-emerald-500',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-400',
  };

  return (
    <button
      disabled={disabled || loading}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>İşleniyor...</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
