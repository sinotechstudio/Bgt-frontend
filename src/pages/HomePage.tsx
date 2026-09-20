import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  Shield,
  Wallet,
  Users,
  Radio,
  Gamepad2,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Tournament } from '../types';
import { api } from '../lib/api';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { TournamentJoinModal } from '../components/tournament/TournamentJoinModal';
import { TournamentCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { dataVersion, walletBalance } = useWebSocket();

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTournamentForJoin, setSelectedTournamentForJoin] = useState<Tournament | null>(null);

  const fetchTournaments = async () => {
    try {
      const res = await api.tournaments.list();
      setTournaments(res.data);
    } catch (err) {
      console.error('Failed to load tournaments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [dataVersion]);

  const featuredTournaments = tournaments.filter((t) => t.featured || t.isFeatured || t.status === 'live').slice(0, 3);
  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming').slice(0, 6);
  const liveTournaments = tournaments.filter((t) => t.status === 'live');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121A36] via-[#0E1528] to-[#070B14] border border-indigo-500/30 p-6 sm:p-10 shadow-2xl">
        {/* Glow lights */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Season 4 Circuit Now Open</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Compete in Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">Esports Tournaments</span> & Win Real Cash
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Join thousands of gamers in BGMI, Valorant, Free Fire and CS2. Real-time bracket synchronization, guaranteed prize pools, and instant automated payouts.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Button
              id="hero-explore-tournaments-btn"
              variant="primary"
              size="lg"
              onClick={() => navigate('/tournaments')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Browse Tournaments
            </Button>

            <Button
              id="hero-view-wallet-btn"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/wallet')}
              leftIcon={<Wallet className="w-4 h-4" />}
            >
              My Wallet ({formatCurrency(walletBalance !== null ? walletBalance : 1250)})
            </Button>
          </div>
        </div>

        {/* Floating live status ticker */}
        {liveTournaments.length > 0 && (
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-rose-400 uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Matches Streaming Live
            </span>
            <div className="h-4 w-[1px] bg-slate-800" />
            <span className="text-slate-300 truncate">
              {liveTournaments[0].title}: <span className="text-amber-400">{liveTournaments[0].liveScore || 'Round 2 In Progress'}</span>
            </span>
          </div>
        )}
      </div>

      {/* Featured Tournaments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Featured Championships
            </h2>
          </div>
          <button
            onClick={() => navigate('/tournaments')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                featured
                onJoinClick={(item) => setSelectedTournamentForJoin(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Game Categories Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: 'BGMI', desc: 'Battlegrounds Mobile India', count: '14 Live Cups' },
          { name: 'Valorant', desc: 'Tactical 5v5 FPS', count: '8 Tournaments' },
          { name: 'Free Fire', desc: 'Max Survival Royale', count: '12 Live Cups' },
          { name: 'CS2', desc: 'Counter-Strike 2', count: '6 Tournaments' },
        ].map((game) => (
          <div
            key={game.name}
            onClick={() => navigate('/tournaments')}
            className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-display font-black text-white group-hover:text-indigo-300">
                {game.name}
              </span>
              <Gamepad2 className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">{game.desc}</p>
            <span className="mt-2 block text-[10px] font-mono text-cyan-400 font-semibold">
              {game.count}
            </span>
          </div>
        ))}
      </div>

      {/* Upcoming Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              Upcoming Tournaments
            </h2>
          </div>
          <button
            onClick={() => navigate('/tournaments')}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            Explore Filters <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingTournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onJoinClick={(item) => setSelectedTournamentForJoin(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Join Modal */}
      <TournamentJoinModal
        isOpen={selectedTournamentForJoin !== null}
        tournament={selectedTournamentForJoin}
        onClose={() => setSelectedTournamentForJoin(null)}
        onSuccess={fetchTournaments}
      />
    </div>
  );
};
