import React from 'react';
import { Mail, Check, X, Shield } from 'lucide-react';
import { TeamInvitation } from '../../types';
import { Button } from '../ui/Button';

interface TeamInvitationsListProps {
  invitations: TeamInvitation[];
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}

export const TeamInvitationsList: React.FC<TeamInvitationsListProps> = ({
  invitations,
  onAccept,
  onDecline,
}) => {
  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#0F172A] border border-cyan-500/30 p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
        <Mail className="w-4 h-4" />
        <span>Pending Squad Invitations ({invitations.length})</span>
      </div>

      <div className="space-y-2.5">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="p-3.5 rounded-xl bg-[#141F36] border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
                {inv.teamTag}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {inv.teamName} <span className="text-slate-400 font-normal">invited you</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Invited by @{inv.invitedBy} • {inv.invitedAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="cyan"
                size="sm"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                onClick={() => onAccept(inv.id)}
              >
                Accept
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                leftIcon={<X className="w-3.5 h-3.5" />}
                onClick={() => onDecline(inv.id)}
              >
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
