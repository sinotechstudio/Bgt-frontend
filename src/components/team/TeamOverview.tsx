import React, { useState } from 'react';
import { Users, UserPlus, Shield, Trophy, Crown, MoreVertical, LogOut, UserMinus } from 'lucide-react';
import { Team, TeamMember } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

interface TeamOverviewProps {
  team: Team;
  onInviteClick: () => void;
  onRemoveMember: (memberId: number) => void;
  onLeaveTeam: () => void;
}

export const TeamOverview: React.FC<TeamOverviewProps> = ({
  team,
  onInviteClick,
  onRemoveMember,
  onLeaveTeam,
}) => {
  const { user } = useAuth();
  const isCaptain = user?.id === team.ownerId;
  const [activeMenuMemberId, setActiveMenuMemberId] = useState<number | null>(null);

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'in-game':
        return 'bg-purple-400 animate-pulse';
      default:
        return 'bg-slate-600';
    }
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    switch (role) {
      case 'Captain':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Crown className="w-3 h-3" /> Captain
          </span>
        );
      case 'Co-Captain':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            <Shield className="w-3 h-3" /> Co-Captain
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            Member
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Header Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#11182E] via-[#0E1528] to-[#0A0F1D] border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Team Logo */}
          <div className="relative group">
            <img
              src={team.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'}
              alt={team.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-bold uppercase shadow">
              {team.tag}
            </span>
          </div>

          {/* Team Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
                  {team.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Captain:{' '}
                  <span className="text-indigo-400 font-semibold">{team.captainName}</span> •{' '}
                  <span className="text-slate-300 font-mono">{team.members.length} Members</span>
                </p>
              </div>

              {/* Header Action */}
              <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <Button
                  id="invite-team-member-btn"
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={onInviteClick}
                >
                  Invite Member
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLeaveTeam}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Leave
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {team.description || 'Elite competitive squad participating in national esports circuits.'}
            </p>

            {/* Quick Team Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Matches</span>
                <span className="font-display font-bold text-white text-sm">
                  {team.stats?.matchesPlayed || 45}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Wins</span>
                <span className="font-display font-bold text-emerald-400 text-sm">
                  {team.stats?.wins || 19}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Trophies</span>
                <span className="font-display font-bold text-amber-400 text-sm flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {team.stats?.trophies || 4}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster & Member List */}
      <div className="rounded-2xl bg-[#0B101E] border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Squad Roster ({team.members.length}/5)
          </h3>
          <span className="text-xs text-slate-400">Slots: {5 - team.members.length} available</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {team.members.map((member) => {
            const isSelf = user?.id === member.id;
            return (
              <div
                key={member.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-3 rounded-xl transition-colors"
              >
                {/* Member Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-[#0B101E] ${getStatusColor(
                        member.status
                      )}`}
                      title={`Status: ${member.status}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {member.name}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono block truncate">
                      GamerTag: @{member.gamerTag}
                    </span>
                  </div>
                </div>

                {/* Role & Menu */}
                <div className="flex items-center gap-3 shrink-0">
                  {getRoleBadge(member.role)}

                  {isCaptain && !isSelf && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Kick member from team"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
