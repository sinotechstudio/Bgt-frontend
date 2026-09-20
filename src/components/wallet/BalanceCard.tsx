import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';
import { Wallet as WalletType } from '../../types';

interface BalanceCardProps {
  wallet: WalletType | null;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  wallet,
  onDepositClick,
  onWithdrawClick,
}) => {
  const balance = wallet ? wallet.balance : 1250;
  const totalDeposited = wallet ? wallet.totalDeposited : 5000;
  const totalWithdrawn = wallet ? wallet.totalWithdrawn : 3000;
  const totalWon = wallet ? wallet.totalWon : 24500;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#131C38] via-[#0E1528] to-[#090D16] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 overflow-hidden">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Balance info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-indigo-300 uppercase">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span>Available Tournament Balance</span>
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
              {formatCurrency(balance)}
            </h1>
            <span className="text-xs font-semibold text-slate-400">INR</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant payouts & 100% secure escrow transactions</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Button
            id="wallet-deposit-btn"
            variant="cyan"
            size="lg"
            leftIcon={<ArrowDownLeft className="w-5 h-5" />}
            onClick={onDepositClick}
            className="flex-1 sm:flex-none shadow-cyan-500/25"
          >
            Add Money
          </Button>

          <Button
            id="wallet-withdraw-btn"
            variant="secondary"
            size="lg"
            leftIcon={<ArrowUpRight className="w-5 h-5 text-slate-400" />}
            onClick={onWithdrawClick}
            className="flex-1 sm:flex-none hover:border-slate-500"
          >
            Withdraw
          </Button>
        </div>
      </div>

      {/* Sub-stats row */}
      <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center sm:text-left">
        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Won
          </span>
          <span className="font-display text-base sm:text-lg font-bold text-emerald-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {formatCurrency(totalWon)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Deposited
          </span>
          <span className="font-display text-base sm:text-lg font-bold text-slate-200 mt-0.5 block">
            {formatCurrency(totalDeposited)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Withdrawn
          </span>
          <span className="font-display text-base sm:text-lg font-bold text-slate-200 mt-0.5 block">
            {formatCurrency(totalWithdrawn)}
          </span>
        </div>
      </div>
    </div>
  );
};
