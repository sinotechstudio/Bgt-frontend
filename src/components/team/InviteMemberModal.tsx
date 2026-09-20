import React, { useState } from 'react';
import { UserPlus, Search, Shield } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [gamerTag, setGamerTag] = useState('');
  const [role, setRole] = useState<'Member' | 'Co-Captain'>('Member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamerTag.trim()) {
      error('Player GamerTag or ID is required', 'Input Missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.team.invite({
        gamerTag,
        role,
      });
      success(res.message || `Invitation sent to @${gamerTag}!`, 'Invitation Sent');
      setGamerTag('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to send invite', 'Invite Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Add a registered player to your tournament squad roster"
      maxWidth="sm"
    >
      <form onSubmit={handleInvite} className="space-y-4">
        <Input
          label="Player GamerTag / In-Game ID"
          placeholder="e.g. ApexSniper99"
          value={gamerTag}
          onChange={(e) => setGamerTag(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Roster Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('Member')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                role === 'Member'
                  ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 bg-[#12192E] text-slate-400'
              }`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => setRole('Co-Captain')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                role === 'Co-Captain'
                  ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 bg-[#12192E] text-slate-400'
              }`}
            >
              Co-Captain
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          The player will receive an immediate real-time invitation notification to join your team.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
};
