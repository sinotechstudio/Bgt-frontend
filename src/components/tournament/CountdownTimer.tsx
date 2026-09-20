import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { calculateTimeRemaining } from '../../lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  prefix?: string;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  prefix = 'Starts in',
  className = '',
}) => {
  const [timeState, setTimeState] = useState(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(calculateTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeState.isPast) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-bold text-rose-400 font-mono ${className}`}>
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>MATCH LIVE</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs text-slate-300 font-mono ${className}`}>
      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      <span className="text-slate-400 text-[11px] font-sans">{prefix}</span>
      <span className="font-bold text-white tracking-wider">{timeState.formatted}</span>
    </div>
  );
};
