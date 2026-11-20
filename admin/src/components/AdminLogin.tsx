import React, { useState } from 'react';
import { LockKeyhole, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('rohan@genzopk.com');
  const [password, setPassword] = useState('Rohan0313');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await adminApi.login(email.trim(), password);
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Could not connect to backend server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setEmail('rohan@genzopk.com');
    setPassword('Rohan0313');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0b0c] relative overflow-hidden">
      {/* Subtle background ambient lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-zinc-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-2xl border silver-border shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 mb-3 shadow-inner">
            <span className="brand-font text-xl font-bold tracking-widest text-zinc-100">G</span>
          </div>
          <h1 className="brand-font text-2xl font-semibold tracking-wider text-white">GENZO SILVER</h1>
          <p className="text-xs uppercase tracking-widest text-zinc-400 mt-1 font-medium">
            Atelier Administration Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@genzopk.com"
                className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-lg pl-10 pr-4 py-2.5 text-sm silver-glow transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                Master Password
              </label>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline transition"
              >
                Auto-fill credentials
              </button>
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-lg pl-10 pr-4 py-2.5 text-sm silver-glow transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-white hover:to-zinc-200 text-zinc-950 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>TiDB Cloud Protected</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles size={12} className="text-zinc-400" />
            <span>925 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
