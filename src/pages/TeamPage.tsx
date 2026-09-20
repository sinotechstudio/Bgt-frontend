import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Plus, Sparkles } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useToast } from '../context/ToastContext';
import { Team, TeamInvitation } from '../types';
import { api } from '../lib/api';
import { TeamOverview } from '../components/team/TeamOverview';
import { CreateTeamModal } from '../components/team/CreateTeamModal';
import { InviteMemberModal } from '../components/team/InviteMemberModal';
import { TeamInvitationsList } from '../components/team/TeamInvitationsList';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

export const TeamPage: React.FC = () => {
  const { dataVersion } = useWebSocket();
  const { success, error } = useToast();

  const [team, setTeam] = useState<Team | null>(null);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchTeamData = async () => {
    setLoadError(null);
    try {
      const [tRes, iRes] = await Promise.all([
        api.team.get(),
        api.team.getInvitations(),
      ]);
      setTeam(tRes.data);
      setInvitations(iRes.data);
    } catch (err: any) {
      setLoadError(err.message || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [dataVersion]);

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      const res = await api.team.acceptInvite(inviteId);
      success(res.message || 'Joined squad successfully!');
      fetchTeamData();
    } catch (err: any) {
      error(err.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      const res = await api.team.declineInvite(inviteId);
      success(res.message || 'Invitation declined');
      fetchTeamData();
    } catch (err: any) {
      error(err.message || 'Failed to decline invitation');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!window.confirm('Are you sure you want to remove this player from your squad?')) return;
    try {
      const res = await api.team.removeMember(memberId);
      success(res.message || 'Member removed from team');
      fetchTeamData();
    } catch (err: any) {
      error(err.message || 'Failed to remove member');
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      const res = await api.team.leave();
      success(res.message || 'You have left the team');
      fetchTeamData();
    } catch (err: any) {
      error(err.message || 'Failed to leave team');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-cyan-400" />
            Squad & Esports Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build your team, invite co-players, and enter squad championships.
          </p>
        </div>

        {!team && !isLoading && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Squad
          </Button>
        )}
      </div>

      {/* Pending Invitations Banner */}
      <TeamInvitationsList
        invitations={invitations}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={fetchTeamData} />
      ) : team ? (
        <TeamOverview
          team={team}
          onInviteClick={() => setShowInviteModal(true)}
          onRemoveMember={handleRemoveMember}
          onLeaveTeam={handleLeaveTeam}
        />
      ) : (
        <EmptyState
          icon={Shield}
          title="You are not part of any team yet"
          description="Create your own esports team to enter squad tournaments, or wait for an invitation from a team captain."
          actionText="Create Team Now"
          onAction={() => setShowCreateModal(true)}
        />
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={(newTeam) => {
          setTeam(newTeam);
          fetchTeamData();
        }}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={fetchTeamData}
      />
    </div>
  );
};
