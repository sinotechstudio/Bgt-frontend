import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { TournamentStatus } from '../../types';

interface TournamentFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedGame: string;
  onGameChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedSort: string;
  onSortChange: (val: string) => void;
  maxEntryFee: number;
  onMaxEntryFeeChange: (val: number) => void;
  onResetFilters: () => void;
}

export const TournamentFilterBar: React.FC<TournamentFilterBarProps> = ({
  search,
  onSearchChange,
  selectedGame,
  onGameChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  maxEntryFee,
  onMaxEntryFeeChange,
  onResetFilters,
}) => {
  const games = ['All', 'BGMI', 'Valorant', 'Free Fire', 'CS2', 'COD Mobile'];
  const statusTabs = ['All', 'Upcoming', 'Live', 'Completed'];

  const hasActiveFilters =
    search !== '' || selectedGame !== 'All' || selectedStatus !== 'All' || selectedSort !== 'default' || maxEntryFee < 500;

  return (
    <div className="space-y-4 rounded-2xl bg-[#0B101E] border border-slate-800 p-4 sm:p-5">
      {/* Top Status Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12192E] border border-slate-800">
          {statusTabs.map((tab) => {
            const active = selectedStatus.toLowerCase() === tab.toLowerCase();
            return (
              <button
                key={tab}
                id={`status-tab-${tab.toLowerCase()}`}
                onClick={() => onStatusChange(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab === 'Live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5 animate-pulse" />}
                {tab}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 font-medium px-2 py-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Search & Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="tournament-search-input"
            type="text"
            placeholder="Search tournaments or games..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl bg-[#12192E] border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Game Filter */}
        <div className="relative">
          <select
            id="tournament-game-select"
            value={selectedGame}
            onChange={(e) => onGameChange(e.target.value)}
            className="w-full rounded-xl bg-[#12192E] border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
          >
            {games.map((g) => (
              <option key={g} value={g} className="bg-[#0B101E] text-white">
                Game: {g}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="relative">
          <select
            id="tournament-sort-select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded-xl bg-[#12192E] border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
          >
            <option value="default" className="bg-[#0B101E] text-white">Sort: Start Time</option>
            <option value="prize-high" className="bg-[#0B101E] text-white">Prize: High to Low</option>
            <option value="fee-low" className="bg-[#0B101E] text-white">Entry Fee: Low to High</option>
            <option value="participants" className="bg-[#0B101E] text-white">Most Popular</option>
          </select>
        </div>

        {/* Max Entry Fee Filter */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#12192E] border border-slate-800">
          <span className="text-[11px] text-slate-400 shrink-0">Max Fee:</span>
          <input
            id="tournament-fee-slider"
            type="range"
            min="0"
            max="500"
            step="10"
            value={maxEntryFee}
            onChange={(e) => onMaxEntryFeeChange(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-bold text-white font-mono shrink-0">
            {maxEntryFee >= 500 ? 'Any' : `₹${maxEntryFee}`}
          </span>
        </div>
      </div>
    </div>
  );
};
