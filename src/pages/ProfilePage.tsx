import React, { useState } from 'react';
import { User, Trophy, Shield, Key, Smartphone, History, CheckCircle2, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { Button } from '../components/ui/Button';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const { success } = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  if (!user) return null;

  const mockPastMatches = [
    {
      id: 101,
      tournament: 'BGMI Pro League Championship',
      game: 'BGMI',
      date: '2026-09-18T18:30:00Z',
      placement: '#1 Champion',
      kills: 14,
      prize: 10000,
    },
    {
      id: 102,
      tournament: 'Valorant Spike Rush Weekly #4',
      game: 'Valorant',
      date: '2026-09-15T15:00:00Z',
      placement: '#3 Semi-Finalist',
      kills: 22,
      prize: 2500,
    },
    {
      id: 103,
      tournament: 'Free Fire Speed Rush Cup',
      game: 'Free Fire',
      date: '2026-09-10T12:00:00Z',
      placement: '#8 Top 10',
      kills: 6,
      prize: 500,
    },
  ];

  const toggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    if (nextState) {
      success('Two-factor authentication (SMS/App) enabled for this account.', 'Security Updated');
    } else {
      success('Two-factor authentication disabled.', 'Security Updated');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header & Stats */}
      <ProfileHeader
        user={user}
        onEditProfile={() => setShowEditModal(true)}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      {/* Two Column Layout: Past Tournaments & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Past Tournaments / Match History (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Recent Tournament History
            </h3>
            <span className="text-xs text-slate-500 font-mono">3 Matches</span>
          </div>

          <div className="space-y-3">
            {mockPastMatches.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{m.tournament}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {m.game} • {formatDate(m.date)} • {m.kills} Kills
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/60">
                    {m.placement}
                  </span>
                  <span className="font-display font-black text-sm text-emerald-400 font-mono">
                    +{formatCurrency(m.prize)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Account Settings (1 col) */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Security & Access
          </h3>

          <div className="rounded-2xl bg-[#0B101E] border border-slate-800 p-5 space-y-4">
            {/* 2FA Toggle */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Two-Factor Authentication
                </div>
                <p className="text-[11px] text-slate-400">
                  Require OTP code during withdrawal & login
                </p>
              </div>

              <button
                type="button"
                onClick={toggle2FA}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Password</span>
                <span className="text-[11px] text-slate-400">Last changed 2 weeks ago</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Update
              </Button>
            </div>

            {/* Active Session Info */}
            <div className="space-y-2 pt-1 text-xs">
              <span className="text-slate-400 uppercase text-[10px] font-semibold block tracking-wider">
                Current Active Session
              </span>
              <div className="p-3 rounded-xl bg-[#0E1526] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Desktop (Chrome / Linux)</span>
                  <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Now
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  IP: 104.28.192.10 • Delhi, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSuccess={(updated) => setUser(updated)}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
