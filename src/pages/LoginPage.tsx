import React, { useState } from 'react';
import { Gamepad2, Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Welcome back to Nexus Arena!', 'Signed In');
      navigate('/');
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password';
      setFormError(msg);
      error(msg, 'Authentication Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDemo = async () => {
    setEmail('alex.chen@esports.com');
    setPassword('ProGamer#2026');
    setIsSubmitting(true);
    try {
      await login('alex.chen@esports.com', 'ProGamer#2026');
      success('Logged in as Alex Chen (Demo Player)!', 'Demo Access');
      navigate('/');
    } catch (err: any) {
      error(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[2px] shadow-xl shadow-indigo-600/30 mb-2">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide">
            Welcome to <span className="text-cyan-400">Nexus Arena</span>
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to enter tournaments, manage your squad, and withdraw prizes
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl bg-[#0B101E] border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email-input"
              label="Email or GamerTag"
              type="email"
              placeholder="alex.chen@esports.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              id="login-password-input"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-[#141E33] text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <Button
              id="login-submit-btn"
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              className="w-full shadow-indigo-600/30"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Arena
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleUseDemo}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/15 hover:bg-cyan-950/30 text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>One-Click Demo Sign In (Alex Chen)</span>
            </button>
          </div>

          <div className="text-center text-xs text-slate-400 pt-1">
            Don't have an esports account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
