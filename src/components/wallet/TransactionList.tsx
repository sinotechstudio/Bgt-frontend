import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Trophy,
  RotateCcw,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
} from 'lucide-react';
import { Transaction, TransactionType } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { EmptyState } from '../ui/EmptyState';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, isLoading = false }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const types = ['All', 'Deposit', 'Withdrawal', 'Tournament Entry', 'Tournament Prize', 'Refund'];

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'All' && tx.type.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return tx.description.toLowerCase().includes(q) || tx.reference.toLowerCase().includes(q);
    }
    return true;
  });

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'Deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'Withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'Tournament Prize':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Tournament Entry':
        return <ArrowUpRight className="w-4 h-4 text-indigo-400" />;
      case 'Refund':
        return <RotateCcw className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Failed':
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <XCircle className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#0E1526] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference or desc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-[#0E1526] border border-slate-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* List / Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description="Your wallet transactions will appear here once you enter tournaments or deposit funds."
        />
      ) : (
        <div className="space-y-3">
          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3">
            {filtered.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-[#0B101E] border border-slate-800/90 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{tx.type}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(tx.date)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-display text-sm font-black font-mono ${
                          isPositive ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {isPositive ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">{tx.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Hash className="w-3 h-3" />
                      {tx.reference}
                    </span>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl bg-[#0B101E] border border-slate-800 overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12192E] text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Type & Reference</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {filtered.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{tx.type}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{tx.reference}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs truncate text-slate-300">
                        {tx.description}
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                        {formatDate(tx.date)}
                      </td>

                      <td className="px-5 py-4">{getStatusBadge(tx.status)}</td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-display text-sm font-black font-mono ${
                            isPositive ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {isPositive ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
