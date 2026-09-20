import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Swords } from 'lucide-react';
import { Tournament } from '../types';
import { api } from '../lib/api';
import { useWebSocket } from '../context/WebSocketContext';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { TournamentFilterBar } from '../components/tournament/TournamentFilterBar';
import { TournamentJoinModal } from '../components/tournament/TournamentJoinModal';
import { TournamentCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';

export const TournamentsPage: React.FC = () => {
  const { dataVersion } = useWebSocket();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('default');
  const [maxEntryFee, setMaxEntryFee] = useState<number>(500);

  // Join Modal
  const [selectedForJoin, setSelectedForJoin] = useState<Tournament | null>(null);

  const fetchTournaments = async () => {
    setError(null);
    try {
      const res = await api.tournaments.list();
      setTournaments(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tournaments list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [dataVersion]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGame('All');
    setSelectedStatus('All');
    setSelectedSort('default');
    setMaxEntryFee(500);
  };

  // Filter & Sort Logic
  const filteredTournaments = useMemo(() => {
    return tournaments
      .filter((t) => {
        // Status filter
        if (selectedStatus !== 'All' && t.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }

        // Game filter
        if (selectedGame !== 'All' && t.game.toLowerCase() !== selectedGame.toLowerCase()) {
          return false;
        }

        // Entry Fee filter
        if (maxEntryFee < 500 && t.entryFee > maxEntryFee) {
          return false;
        }

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesGame = t.game.toLowerCase().includes(q);
          const matchesFormat = t.format?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesGame && !matchesFormat) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'prize-high') {
          return b.prizePool - a.prizePool;
        }
        if (selectedSort === 'fee-low') {
          return a.entryFee - b.entryFee;
        }
        if (selectedSort === 'participants') {
          return b.participants - a.participants;
        }
        // default: start time
        return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
      });
  }, [tournaments, search, selectedGame, selectedStatus, selectedSort, maxEntryFee]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-indigo-400" />
            Competitive Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse active cups, register your squad, and track live brackets.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {filteredTournaments.length} Tournaments Available
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <TournamentFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedGame={selectedGame}
        onGameChange={setSelectedGame}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        maxEntryFee={maxEntryFee}
        onMaxEntryFeeChange={setMaxEntryFee}
        onResetFilters={handleResetFilters}
      />

      {/* Content Grid / Loading / Error / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTournaments} />
      ) : filteredTournaments.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No tournaments matched your criteria"
          description="Try broadening your filters or search terms to see available tournaments."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onJoinClick={(item) => setSelectedForJoin(item)}
            />
          ))}
        </div>
      )}

      {/* Join Modal */}
      <TournamentJoinModal
        isOpen={selectedForJoin !== null}
        tournament={selectedForJoin}
        onClose={() => setSelectedForJoin(null)}
        onSuccess={fetchTournaments}
      />
    </div>
  );
};
