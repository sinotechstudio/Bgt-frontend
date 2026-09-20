import React from 'react';
import { cn } from '../../lib/utils';
import { TournamentStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'cyan' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  pulse = false,
  className,
}) => {
  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    primary: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 font-medium tracking-wide uppercase',
    md: 'text-xs px-3 py-1 font-semibold tracking-wider uppercase',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TournamentStatus | string; className?: string }> = ({
  status,
  className,
}) => {
  const norm = (status || '').toLowerCase();
  if (norm === 'live') {
    return (
      <Badge variant="danger" pulse className={className}>
        LIVE MATCH
      </Badge>
    );
  }
  if (norm === 'upcoming') {
    return (
      <Badge variant="cyan" className={className}>
        UPCOMING
      </Badge>
    );
  }
  if (norm === 'completed') {
    return (
      <Badge variant="default" className={className}>
        COMPLETED
      </Badge>
    );
  }
  return <Badge className={className}>{status}</Badge>;
};
