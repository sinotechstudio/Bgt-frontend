import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Users,
  Shield,
  Clock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Swords,
  CheckCircle2,
  Lock,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useWebSocket } from '../context/WebSocketContext';
import { useToast } from '../context/ToastContext';
import { Tournament, Participant } from '../types';
import { api } from '../lib/api';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CountdownTimer } from '../components/tournament/CountdownTimer';
import { TournamentJoinModal } from '../components/tournament/TournamentJoinModal';
import { TournamentBracket } from '../components/tournament/TournamentBracket';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../lib/utils';

export const TournamentDetailPage: React.FC = () => {
  const { path, navigate } = useRouter();
  const { dataVersion, walletBalance } = useWebSocket();
  const { success, error } = useToast();

  // Extract ID from path e.g. /tournaments/1
  const tournamentId = Number(path.split('/')[2]);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'bracket' | 'participants' | 'room'>('rules');
  const [showRoomPassword, setShowRoomPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchDetails = async () => {
    if (!tournamentId) return;
    try {
      const [tRes, pRes] = await Promise.all([
        api.tournaments.get(tournamentId),
        api.tournaments.getParticipants(tournamentId),
      ]);
      setTournament(tRes.data);
      setParticipants(pRes.data);
    } catch (err: any) {
      error(err.message || 'Failed to load tournament details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [tournamentId, dataVersion]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    success(`Copied ${field} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <Skeleton className="h-64 sm:h-80 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#0E1528] border border-slate-800">
        <p className="text-white text-lg font-bold">Tournament not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/tournaments')}>
          Back to Tournaments
        </Button>
      </div>
    );
  }

  const currentWallet = walletBalance !== null ? walletBalance : 1250;
  const isJoined = tournament.isJoined;
  const isFull = tournament.participants >= tournament.maxPlayers;
  const isLive = tournament.status === 'live';
  const isCompleted = tournament.status === 'completed';

  return (
    <div className="space-y-6 pb-28">
      {/* Back button */}
      <button
        onClick={() => navigate('/tournaments')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tournaments
      </button>

      {/* Hero Tournament Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-[#0B101E] shadow-2xl">
        <div className="relative h-60 sm:h-80 w-full overflow-hidden">
          <img
            src={tournament.banner}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B101E] via-[#0B101E]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Top Overlays */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs font-bold text-white border border-white/10">
              {tournament.game} • {tournament.format}
            </span>
            <StatusBadge status={tournament.status} />
          </div>

          {/* Bottom Banner Details */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="font-display text-2xl sm:text-4xl font-black text-white leading-tight">
              {tournament.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <CountdownTimer targetDate={tournament.startAt} className="text-sm font-bold text-cyan-300" />
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-4 h-4 text-slate-500" />
                Starts {formatDate(tournament.startAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0E1528] border border-slate-800">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Prize Pool
          </span>
          <span className="font-display text-lg sm:text-xl font-extrabold text-emerald-400 flex items-center gap-1.5 mt-1">
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            {formatCurrency(tournament.prizePool)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1528] border border-slate-800">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Entry Fee
          </span>
          <span className="font-display text-lg sm:text-xl font-extrabold text-white mt-1 block">
            {tournament.entryFee === 0 ? <span className="text-cyan-400">FREE</span> : formatCurrency(tournament.entryFee)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1528] border border-slate-800">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Slots Filled
          </span>
          <span className="font-display text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            {tournament.participants}/{tournament.maxPlayers}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1528] border border-slate-800">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform / Device
          </span>
          <span className="font-display text-lg sm:text-xl font-extrabold text-cyan-300 mt-1 block truncate">
            {tournament.platform || 'Mobile Only'}
          </span>
        </div>
      </div>

      {/* Content Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'rules', label: 'Rules & Format', icon: FileText },
          { id: 'bracket', label: 'Bracket & Schedule', icon: Swords },
          { id: 'participants', label: `Participants (${participants.length})`, icon: Users },
          { id: 'room', label: 'Room Details', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'room' && isJoined && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {/* TAB 1: RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            {/* Description */}
            <div className="p-5 rounded-2xl bg-[#0E1528] border border-slate-800 space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">About Tournament</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{tournament.description}</p>
            </div>

            {/* Official Rules List */}
            <div className="p-5 rounded-2xl bg-[#0E1528] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Tournament Rules & Regulations
              </h3>
              <div className="space-y-3">
                {(tournament.rules || []).map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold font-mono flex items-center justify-center shrink-0 border border-indigo-500/20 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map & Emulators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0E1528] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Map / Arena</span>
                <p className="text-sm font-bold text-white">{tournament.map || 'Erangel / Haven'}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#0E1528] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Emulator Policy</span>
                <p className="text-sm font-bold text-rose-400">STRICTLY BANNED (Mobile Players Only)</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRACKET & SCHEDULE */}
        {activeTab === 'bracket' && (
          <TournamentBracket bracket={tournament.bracket} schedule={tournament.schedule} />
        )}

        {/* TAB 3: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="rounded-2xl bg-[#0E1528] border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Confirmed Players ({participants.length}/{tournament.maxPlayers})
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {Math.max(0, tournament.maxPlayers - participants.length)} slots remaining
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#12192E] border border-slate-800/80 flex items-center gap-3"
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <span className="text-[11px] text-cyan-400 font-mono block truncate">
                      @{p.gamerTag}
                    </span>
                  </div>
                  {p.teamName && (
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono shrink-0">
                      {p.teamName}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ROOM DETAILS */}
        {activeTab === 'room' && (
          <div className="space-y-4">
            {!isJoined ? (
              <div className="p-8 rounded-2xl bg-[#0E1528] border border-slate-800 text-center space-y-3">
                <Lock className="w-10 h-10 text-indigo-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Room Details are Private</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Room ID and Match Password are only visible to confirmed participants registered for this tournament.
                </p>
                <Button variant="primary" onClick={() => setShowJoinModal(true)}>
                  Join Tournament to Unlock
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#0E1528] border border-indigo-500/40 p-6 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Match Room Credentials
                      </h3>
                      <p className="text-xs text-slate-400">
                        Enter these details in your game client custom room
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Access Granted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Room ID */}
                  <div className="p-4 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Custom Room ID
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold text-white">
                        {tournament.roomId || '8492019'}
                      </span>
                      <button
                        onClick={() => handleCopy(tournament.roomId || '8492019', 'Room ID')}
                        className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Copy Room ID"
                      >
                        {copiedField === 'Room ID' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="p-4 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Room Password
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xl font-bold text-white">
                        {showRoomPassword ? (tournament.roomPassword || 'PRO8821') : '••••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowRoomPassword(!showRoomPassword)}
                          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Toggle Password Visibility"
                        >
                          {showRoomPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleCopy(tournament.roomPassword || 'PRO8821', 'Password')}
                          className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Copy Password"
                        >
                          {copiedField === 'Password' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Do not share custom room credentials outside your squad. Sharing room credentials with non-registered players will result in permanent account ban and tournament disqualification.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar with Action */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#090D16]/95 backdrop-blur-xl border-t border-slate-800/90 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Entry Fee</span>
              <span className="font-display text-sm sm:text-base font-extrabold text-white">
                {tournament.entryFee === 0 ? 'FREE' : formatCurrency(tournament.entryFee)}
              </span>
            </div>

            <div className="hidden sm:block h-7 w-[1px] bg-slate-800" />

            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Your Wallet Balance</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-indigo-300">
                {formatCurrency(currentWallet)}
              </span>
            </div>
          </div>

          <div>
            {isJoined ? (
              <Button
                variant="secondary"
                size="md"
                className="bg-emerald-950/40 border-emerald-500/40 text-emerald-300 cursor-default"
                leftIcon={<Check className="w-4 h-4 text-emerald-400" />}
                onClick={() => setActiveTab('room')}
              >
                JOINED (VIEW ROOM)
              </Button>
            ) : isCompleted ? (
              <Button variant="ghost" disabled>
                TOURNAMENT COMPLETED
              </Button>
            ) : isFull ? (
              <Button variant="secondary" disabled>
                TOURNAMENT FULL
              </Button>
            ) : (
              <Button
                id="detail-join-tournament-btn"
                variant="primary"
                size="md"
                onClick={() => setShowJoinModal(true)}
              >
                JOIN TOURNAMENT
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      <TournamentJoinModal
        isOpen={showJoinModal}
        tournament={tournament}
        onClose={() => setShowJoinModal(false)}
        onSuccess={fetchDetails}
      />
    </div>
  );
};
