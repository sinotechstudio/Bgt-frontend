import React from 'react';
import { User, Trophy, Award, Target, Calendar, CheckCircle2, Shield, Edit3, Lock } from 'lucide-react';
import { User as UserType } from '../../types';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';

interface ProfileHeaderProps {
  user: UserType;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditProfile,
  onChangePassword,
}) => {
  const stats = user.stats || {
    tournamentsJoined: 28,
    wins: 9,
    winRate: 32.1,
    totalWinnings: 24500,
    kdRatio: 3.42,
    rank: 'Diamond III',
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#121A33] via-[#0E1528] to-[#090D16] border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-2xl"
            />
            <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-[#090D16]" title="Verified Gamer">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {stats.rank || 'PRO GAMER'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-cyan-400 font-mono font-semibold">@{user.gamerTag}</span> • {user.email}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Button
                  id="edit-profile-btn"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={onEditProfile}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                  onClick={onChangePassword}
                >
                  Security
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Joined {formatDate(user.joinedAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                KYC Verified
              </span>
            </div>

            {/* In Game IDs Badge Row */}
            {user.inGameIds && (
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {user.inGameIds.bgmi && (
                  <span className="px-2 py-1 rounded-lg bg-[#141F36] border border-slate-700/60 text-[11px] font-mono text-slate-300">
                    BGMI: <strong className="text-white">{user.inGameIds.bgmi}</strong>
                  </span>
                )}
                {user.inGameIds.valorant && (
                  <span className="px-2 py-1 rounded-lg bg-[#141F36] border border-slate-700/60 text-[11px] font-mono text-slate-300">
                    VAL: <strong className="text-white">{user.inGameIds.valorant}</strong>
                  </span>
                )}
                {user.inGameIds.freefire && (
                  <span className="px-2 py-1 rounded-lg bg-[#141F36] border border-slate-700/60 text-[11px] font-mono text-slate-300">
                    FF: <strong className="text-white">{user.inGameIds.freefire}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-[#0B101E] border border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tournaments
            </span>
            <span className="font-display text-xl font-bold text-white mt-1 block">
              {stats.tournamentsJoined}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B101E] border border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Championship Wins
            </span>
            <span className="font-display text-xl font-bold text-amber-400 mt-1 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              {stats.wins}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B101E] border border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Win Rate
            </span>
            <span className="font-display text-xl font-bold text-cyan-400 mt-1 block">
              {stats.winRate}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0B101E] border border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Career Earnings
            </span>
            <span className="font-display text-xl font-bold text-emerald-400 mt-1 block">
              {formatCurrency(stats.totalWinnings)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
