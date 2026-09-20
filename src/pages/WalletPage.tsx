import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { Wallet as WalletType, Transaction } from '../types';
import { api } from '../lib/api';
import { BalanceCard } from '../components/wallet/BalanceCard';
import { TransactionList } from '../components/wallet/TransactionList';
import { DepositModal } from '../components/wallet/DepositModal';
import { WithdrawModal } from '../components/wallet/WithdrawModal';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export const WalletPage: React.FC = () => {
  const { dataVersion } = useWebSocket();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const fetchWalletData = async () => {
    setError(null);
    try {
      const [wRes, tRes] = await Promise.all([
        api.wallet.get(),
        api.wallet.getTransactions(),
      ]);
      setWallet(wRes.data);
      setTransactions(tRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [dataVersion]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Wallet className="w-7 h-7 text-emerald-400" />
          Tournament Wallet & Payouts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your tournament funds, deposit for match entries, and withdraw earnings.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-60 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchWalletData} />
      ) : (
        <div className="space-y-8">
          {/* Main Balance Hero Card */}
          <BalanceCard
            wallet={wallet}
            onDepositClick={() => setShowDepositModal(true)}
            onWithdrawClick={() => setShowWithdrawModal(true)}
          />

          {/* Transactions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Transaction History
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {transactions.length} Records
              </span>
            </div>

            <TransactionList transactions={transactions} />
          </div>
        </div>
      )}

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={fetchWalletData}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={fetchWalletData}
      />
    </div>
  );
};
