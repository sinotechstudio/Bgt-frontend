import React, { useState } from 'react';
import { Trophy, Wallet, AlertCircle, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { Tournament } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { useWebSocket } from '../../context/WebSocketContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { useRouter } from '../../context/RouterContext';

interface TournamentJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onSuccess?: () => void;
}

export const TournamentJoinModal: React.FC<TournamentJoinModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}) => {
  const { walletBalance } = useWebSocket();
  const { success, error } = useToast();
  const { navigate } = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!tournament) return null;

  const currentWallet = walletBalance !== null ? walletBalance : 1250;
  const entryFee = tournament.entryFee;
  const balanceAfter = currentWallet - entryFee;
  const isInsufficient = currentWallet < entryFee;

  const handleConfirm = async () => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Send join request to backend (Backend is strictly authoritative)
      const res = await api.tournaments.join(tournament.id);
      success(`Successfully joined ${tournament.title}!`, 'Registration Confirmed');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to join tournament';
      setServerError(msg);
      error(msg, 'Join Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Tournament"
      description={`Confirm your registration for ${tournament.title}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Tournament Summary Card */}
        <div className="p-3.5 rounded-xl bg-[#141E33] border border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={tournament.banner}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border border-slate-700"
            />
            <div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{tournament.title}</h4>
              <p className="text-[11px] text-slate-400">{tournament.game} • {tournament.format || 'Squad'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Prize Pool</span>
            <span className="text-xs font-bold text-emerald-400 font-display">
              {formatCurrency(tournament.prizePool)}
            </span>
          </div>
        </div>

        {/* Financial Breakdown Table as requested in spec */}
        <div className="p-4 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Entry Fee</span>
            <span className="font-bold text-white font-mono">{formatCurrency(entryFee)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Prize Pool</span>
            <span className="font-bold text-emerald-400 font-mono">{formatCurrency(tournament.prizePool)}</span>
          </div>

          <div className="border-t border-slate-800 my-2" />

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              Your Wallet Balance
            </span>
            <span className="font-bold text-white font-mono">{formatCurrency(currentWallet)}</span>
          </div>

          <div className="flex items-center justify-between font-semibold pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Balance After Joining</span>
            <span
              className={`font-bold font-mono text-sm ${
                isInsufficient ? 'text-rose-400' : 'text-indigo-300'
              }`}
            >
              {formatCurrency(balanceAfter)}
            </span>
          </div>
        </div>

        {/* Insufficient Funds Warning */}
        {isInsufficient && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Insufficient Wallet Balance</p>
              <p className="mt-0.5 text-slate-400">
                You need {formatCurrency(entryFee - currentWallet)} more in your wallet to join this tournament.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/wallet');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Deposit Funds
              </button>
            </div>
          </div>
        )}

        {/* Server Error Message */}
        {serverError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-300">
            {serverError}
          </div>
        )}

        {/* Notice */}
        <p className="text-[11px] text-slate-500 leading-relaxed">
          * By joining, you accept the tournament rules. Room details and credentials will appear in the tournament room view before match start.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            id="confirm-join-tournament-btn"
            variant="primary"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={isInsufficient}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Confirm & Join
          </Button>
        </div>
      </div>
    </Modal>
  );
};
