import React from 'react';
import { Trophy, Users, Shield, Zap, Crosshair, Swords, Target, Check, ChevronRight } from 'lucide-react';
import { Tournament } from '../../types';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CountdownTimer } from './CountdownTimer';
import { formatCurrency } from '../../lib/utils';
import { useRouter } from '../../context/RouterContext';

interface TournamentCardProps {
  tournament: Tournament;
  onJoinClick?: (tournament: Tournament) => void;
  featured?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoinClick,
  featured = false,
}) => {
  const { navigate } = useRouter();

  const getGameIcon = (game: string) => {
    switch (game.toLowerCase()) {
      case 'bgmi':
        return <Crosshair className="w-4 h-4 text-amber-400" />;
      case 'valorant':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'free fire':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      case 'cs2':
        return <Swords className="w-4 h-4 text-indigo-400" />;
      default:
        return <Target className="w-4 h-4 text-purple-400" />;
    }
  };

  const isFull = tournament.participants >= tournament.maxPlayers;
  const isJoined = tournament.isJoined;
  const isLive = tournament.status === 'live';
  const isCompleted = tournament.status === 'completed';
  const slotsRemaining = Math.max(0, tournament.maxPlayers - tournament.participants);
  const fillPercentage = Math.min(100, Math.round((tournament.participants / tournament.maxPlayers) * 100));

  const handleCardClick = () => {
    navigate(`/tournaments/${tournament.id}`);
  };

  return (
    <div
      id={`tournament-card-${tournament.id}`}
      onClick={handleCardClick}
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between ${
        featured
          ? 'bg-[#0E1528] border-indigo-500/40 hover:border-indigo-400 shadow-xl shadow-indigo-950/20 hover:shadow-indigo-500/10'
          : 'bg-[#0B101E] border-slate-800 hover:border-slate-700 shadow-lg'
      }`}
    >
      {/* Banner & Badges */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={tournament.banner}
          alt={tournament.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient overlays for high contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B101E] via-[#0B101E]/40 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Game Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-md">
            {getGameIcon(tournament.game)}
            <span>{tournament.game}</span>
          </div>

          {/* Status Badge */}
          <StatusBadge status={tournament.status} />
        </div>

        {/* Live Score Ticker for active matches */}
        {isLive && tournament.liveScore && (
          <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-rose-950/85 backdrop-blur-md border border-rose-500/40 text-xs text-white flex items-center justify-between font-mono">
            <span className="flex items-center gap-1.5 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              LIVE ROUND
            </span>
            <span className="text-[11px] truncate max-w-[200px] text-right font-medium">
              {tournament.liveScore}
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {tournament.title}
          </h3>

          {/* Mode / Format */}
          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {tournament.format || tournament.mode || 'Competitive Tournament'}
          </p>
        </div>

        {/* Prize Pool and Entry Fee Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 px-3.5 rounded-xl bg-[#12192E] border border-slate-800/80">
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Prize Pool
            </span>
            <span className="font-display text-sm sm:text-base font-extrabold text-emerald-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {formatCurrency(tournament.prizePool)}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Entry Fee
            </span>
            <span className="font-display text-sm sm:text-base font-extrabold text-white">
              {tournament.entryFee === 0 ? (
                <span className="text-cyan-400 uppercase">FREE</span>
              ) : (
                formatCurrency(tournament.entryFee)
              )}
            </span>
          </div>
        </div>

        {/* Participants Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {tournament.participants}/{tournament.maxPlayers} Players
              </span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {isFull ? (
                <span className="text-rose-400">Full</span>
              ) : (
                `${slotsRemaining} slots left`
              )}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer: Countdown & Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CountdownTimer targetDate={tournament.startAt} />
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {isJoined ? (
              <Button
                variant="secondary"
                size="sm"
                className="bg-emerald-950/40 border-emerald-500/40 text-emerald-300 pointer-events-none"
                leftIcon={<Check className="w-3.5 h-3.5 text-emerald-400" />}
              >
                JOINED ✓
              </Button>
            ) : isCompleted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCardClick}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Results
              </Button>
            ) : isFull ? (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="opacity-60 cursor-not-allowed"
              >
                FULL
              </Button>
            ) : (
              <Button
                id={`join-btn-${tournament.id}`}
                variant={featured ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => (onJoinClick ? onJoinClick(tournament) : handleCardClick())}
              >
                JOIN NOW
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
