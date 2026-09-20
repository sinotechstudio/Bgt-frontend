import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { checkPasswordStrength } from '../../lib/utils';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const strength = checkPasswordStrength(newPassword);

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-rose-500';
      case 2:
      case 3:
        return 'bg-amber-500';
      case 4:
      case 5:
        return 'bg-emerald-500';
      default:
        return 'bg-slate-700';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error('Current password is required', 'Input Error');
      return;
    }
    if (newPassword.length < 8) {
      error('New password must be at least 8 characters long', 'Weak Password');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match', 'Password Mismatch');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.auth.changePassword({
        currentPassword,
        newPassword,
      });
      success(res.message || 'Password changed successfully! You will need this on next login.', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update password', 'Security Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Account Password"
      description="Protect your tournament earnings and account access"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />

        <div className="space-y-2">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          {newPassword && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Strength:</span>
                <span
                  className={`font-semibold ${
                    strength.score <= 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 rounded-full ${
                      level <= strength.score ? getStrengthColor(strength.score) : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              {strength.feedback && (
                <p className="text-[10px] text-slate-400">{strength.feedback}</p>
              )}
            </div>
          )}
        </div>

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            disabled={!newPassword || newPassword !== confirmPassword}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};
