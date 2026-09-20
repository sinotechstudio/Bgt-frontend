import React, { useState } from 'react';
import { Gamepad2, Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useRouter();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setIsSent(true);
      success(res.message || 'Password reset link dispatched!');
    } catch (err: any) {
      error(err.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-xl shadow-indigo-600/30 mb-2">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your registered email to receive password recovery instructions
          </p>
        </div>

        <div className="rounded-3xl bg-[#0B101E] border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
          {isSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive an email with instructions to securely reset your password.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="alex.chen@esports.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                variant="primary"
                size="lg"
                type="submit"
                isLoading={isSubmitting}
                className="w-full shadow-indigo-600/30"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
