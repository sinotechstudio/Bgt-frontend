/**
 * Utility functions for Esports Tournament Hub
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${Math.abs(amount).toLocaleString('en-IN')}`;
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    const now = Date.now();
    const past = new Date(isoString).getTime();
    const diffSeconds = Math.floor((now - past) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export function calculateTimeRemaining(targetIsoDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formatted: string;
} {
  const targetTime = new Date(targetIsoDate).getTime();
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, formatted: 'Started / Live' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted = days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { days, hours, minutes, seconds, isPast: false, formatted };
}

export function getPasswordStrength(password: string): {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  checks: {
    length: boolean;
    hasNumber: boolean;
    hasUppercase: boolean;
    hasSpecial: boolean;
  };
} {
  const checks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const count = Object.values(checks).filter(Boolean).length;
  let score = 0;
  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let color = 'bg-red-500';

  if (count === 4 && password.length >= 10) {
    score = 4;
    label = 'Strong';
    color = 'bg-emerald-500';
  } else if (count >= 3) {
    score = 3;
    label = 'Good';
    color = 'bg-cyan-500';
  } else if (count >= 2) {
    score = 2;
    label = 'Fair';
    color = 'bg-amber-500';
  } else {
    score = 1;
    label = 'Weak';
    color = 'bg-red-500';
  }

  return { score, label, color, checks };
}

export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback?: string;
  checks?: {
    length: boolean;
    hasNumber: boolean;
    hasUppercase: boolean;
    hasSpecial: boolean;
  };
} {
  const result = getPasswordStrength(password);
  let feedback = '';
  if (!result.checks.length) feedback = 'Minimum 8 characters needed';
  else if (!result.checks.hasUppercase) feedback = 'Add at least one uppercase letter';
  else if (!result.checks.hasNumber) feedback = 'Add at least one number';
  else if (!result.checks.hasSpecial) feedback = 'Add at least one special character';

  return {
    ...result,
    feedback,
  };
}
