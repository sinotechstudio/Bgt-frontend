import React, { useState } from 'react';
import { QrCode, Shield, CheckCircle2, ArrowDownLeft, AlertCircle, Smartphone, CreditCard, Building } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState<string>('user@okaxis');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { success, error } = useToast();

  const presets = [100, 250, 500, 1000, 2000];

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = Number(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 10) {
      error('Minimum deposit amount is ₹10', 'Invalid Amount');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.wallet.deposit({
        amount,
        method: method === 'UPI' ? `UPI (${upiId})` : method,
        referenceId: `DEP-${Date.now()}`,
      });
      success(res.message || `₹${amount} successfully added to wallet!`, 'Deposit Successful');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Deposit failed', 'Transaction Error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit Funds"
      description="Add money instantly to your tournament wallet"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset Amounts */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Amount
          </label>
          <div className="grid grid-cols-5 gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                  amount === preset && !customAmount
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                    : 'bg-[#141E33] text-slate-300 hover:bg-[#1C2945] border border-slate-700/60'
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Input
          label="Or Custom Amount (₹)"
          type="number"
          placeholder="Enter amount (min ₹10)"
          value={customAmount}
          onChange={handleCustomChange}
          min={10}
        />

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                method === 'UPI'
                  ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300 ring-1 ring-cyan-500/50'
                  : 'border-slate-700/80 bg-[#141E33] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-xs font-bold">UPI / GPay</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('Card')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                method === 'Card'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'border-slate-700/80 bg-[#141E33] text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-bold">Debit / Card</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('NetBanking')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                method === 'NetBanking'
                  ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300 ring-1 ring-indigo-500/50'
                  : 'border-slate-700/80 bg-[#141E33] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-5 h-5" />
              <span className="text-xs font-bold">Net Banking</span>
            </button>
          </div>
        </div>

        {/* UPI Details or Demo QR */}
        {method === 'UPI' && (
          <div className="p-3.5 rounded-xl bg-[#0A0F1D] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">UPI ID / VPA:</span>
              <span className="font-mono text-cyan-400 font-semibold">{upiId}</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#141E33] border border-slate-700/60">
              <QrCode className="w-10 h-10 text-white shrink-0 p-1 bg-white/10 rounded-lg" />
              <div className="text-[11px] text-slate-400 leading-tight">
                Scan QR or approve UPI mandate on your PhonePe, Google Pay, or Paytm app.
              </div>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>256-bit encrypted gateway. No sensitive card credentials stored.</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            id="deposit-submit-btn"
            variant="cyan"
            type="submit"
            isLoading={isProcessing}
            leftIcon={<ArrowDownLeft className="w-4 h-4" />}
          >
            Deposit {formatCurrency(amount)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
