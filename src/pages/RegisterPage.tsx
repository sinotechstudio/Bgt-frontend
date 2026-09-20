import React, { useState } from 'react';
import { Gamepad2, Mail, Lock, User, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { checkPasswordStrength } from '../lib/utils';

export const RegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = checkPasswordStrength(password);

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-rose-500';
      case 2:
      case 3:
        return 'bg-amber-500';
      case 4:
      case 5:
        return 'bg-emerald-500';
      default:
        return 'bg-slate-700';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !gamerTag || !email || !password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setFormError('Please agree to tournament fair-play terms & conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        gamerTag,
        email,
        password,
      });
      success('Registration successful! Welcome to Nexus Arena.', 'Account Created');
      navigate('/');
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Try a different email or GamerTag.';
      setFormError(msg);
      error(msg, 'Registration Error');
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
            Create Gamer Account
          </h1>
          <p className="text-xs text-slate-400">
            Join the premier competitive esports circuit in India & SEA
          </p>
        </div>

        {/* Register Box */}
        <div className="rounded-3xl bg-[#0B101E] border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="GamerTag"
                placeholder="ApexPhantom"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="rohan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Strength:</span>
                    <span
                      className={`font-semibold ${
                        strength.score <= 2 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full ${
                          level <= strength.score ? getStrengthColor(strength.score) : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.feedback && (
                    <p className="text-[10px] text-slate-400">{strength.feedback}</p>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-[#141E33] text-indigo-600 focus:ring-0 mt-0.5"
                />
                <span>
                  I agree to the Fair Play policy, emulator restrictions, and platform terms of service.
                </span>
              </label>
            </div>

            <Button
              id="register-submit-btn"
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isSubmitting}
              className="w-full shadow-indigo-600/30"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Esports Profile
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-1">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-cyan-400 hover:text-cyan-300 font-bold ml-1"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
