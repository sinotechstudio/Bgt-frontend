import React, { useState } from 'react';
import { ArrowUpRight, AlertCircle, Building, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { useWebSocket } from '../../context/WebSocketContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { walletBalance } = useWebSocket();
  const available = walletBalance !== null ? walletBalance : 1250;

  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<'UPI' | 'Bank'>('UPI');
  const [upiId, setUpiId] = useState<string>('alex.viper@oksbi');
  const [accountNumber, setAccountNumber] = useState<string>('50100481920194');
  const [ifsc, setIfsc] = useState<string>('HDFC0000240');
  const [beneficiaryName, setBeneficiaryName] = useState<string>("Alex Chen");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { success, error } = useToast();

  const numAmount = Number(amount);
  const isInvalidAmount = numAmount < 100 || numAmount > available;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 100) {
      error('Minimum withdrawal is ₹100', 'Invalid Amount');
      return;
    }
    if (numAmount > available) {
      error('Withdrawal amount exceeds available balance', 'Insufficient Funds');
      return;
    }

    setIsProcessing(true);
    try {
      const details =
        method === 'UPI'
          ? `UPI: ${upiId}`
          : `Bank: A/C ending in ${accountNumber.slice(-4)}, IFSC: ${ifsc}`;

      const res = await api.wallet.withdraw({
        amount: numAmount,
        method: method === 'UPI' ? 'Instant UPI' : 'NEFT Bank Transfer',
        accountDetails: details,
      });

      success(res.message || 'Withdrawal request submitted successfully!', 'Payout Initiated');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Withdrawal failed', 'Transaction Error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Earnings"
      description="Transfer your tournament winnings to your verified account"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Balance Status Banner */}
        <div className="p-3.5 rounded-xl bg-[#141E33] border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Available for Payout</span>
            <span className="font-display text-lg font-black text-emerald-400">
              {formatCurrency(available)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAmount(String(available))}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
          >
            Withdraw All
          </button>
        </div>

        {/* Amount Input */}
        <Input
          label="Withdrawal Amount (₹)"
          type="number"
          placeholder="Min ₹100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={100}
          max={available}
          helperText={`Minimum ₹100 • Maximum ${formatCurrency(available)}`}
        />

        {/* Method Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Withdrawal Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                method === 'UPI'
                  ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300 ring-1 ring-cyan-500/50 font-bold'
                  : 'border-slate-700/80 bg-[#141E33] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-xs">Instant UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('Bank')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                method === 'Bank'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300 ring-1 ring-indigo-500/50 font-bold'
                  : 'border-slate-700/80 bg-[#141E33] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span className="text-xs">Bank Transfer (IMPS)</span>
            </button>
          </div>
        </div>

        {/* Specific Method Fields */}
        {method === 'UPI' ? (
          <Input
            label="Verified UPI ID / VPA"
            type="text"
            placeholder="username@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            helperText="Funds are dispatched to this UPI ID within 15-30 minutes."
          />
        ) : (
          <div className="space-y-3">
            <Input
              label="Bank Account Number"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="IFSC Code"
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              />
              <Input
                label="Beneficiary Name"
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Processing Notice */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>TDS & government compliance deducted automatically where applicable.</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            id="withdraw-submit-btn"
            variant="primary"
            type="submit"
            isLoading={isProcessing}
            disabled={!amount || isInvalidAmount}
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Confirm Payout {numAmount > 0 ? formatCurrency(numAmount) : ''}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
