'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { User, Lock, ArrowRight } from 'lucide-react';
import { PasswordEyeToggle } from '@/components/PasswordEyeToggle';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    const res = await loginAction(formData);

    if (res.success) {
      playSuccessSound();
      toast.success(res.message);

      if (res.role === 'ADMIN' || res.role === 'SUPER_ADMIN') {
        router.push('/dashboard'); // Both go to dashboard for now
      } else {
        router.push('/dashboard');
      }
    } else {
      playErrorSound();
      toast.error(res.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-[var(--color-background)]">

      {/* Background Tech Details */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-primary) 0%, transparent 40%)' }} />
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-20" />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-[var(--color-card)] p-8 border border-[var(--color-border)] shadow-2xl backdrop-blur-sm">

        <div className="mb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-[var(--color-primary)] shadow-[0_0_20px_rgba(0,229,255,0.3)] bg-[var(--color-input)] flex items-center justify-center">
            <img src="/logo.jpg" alt="DIRA Logo" className="w-full h-full object-cover" />
          </div>

          <h1 className="text-2xl font-bold tracking-wider text-[var(--color-primary)]">DIRA FINANCIALS</h1>
          <p className="mt-2 text-sm text-[var(--color-foreground)] opacity-70">STAFF ONLY</p>
        </div>

        <form action={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-md border border-[var(--color-border)] bg-[var(--color-input)] py-3 pl-10 pr-3 text-white placeholder-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                placeholder="Email Address"
              />
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-center pl-3 z-10 h-[48px]">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <PasswordEyeToggle />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-[var(--color-primary)] py-3 px-4 text-sm font-semibold text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-card)] transition-all overflow-hidden disabled:opacity-50"
          >
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-[var(--color-primary-foreground)] opacity-70 group-hover:opacity-100 transition-opacity" />
            </span>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
            <ArrowRight className="absolute right-4 h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--color-border)] pt-4 text-center">
          <p className="text-xs text-justify text-gray-500">
            WARNING: This system belongs to DIRA. Unauthorized access is not allowed and will be tracked. By continuing you agree to follow company rules.
          </p>
        </div>
      </div>
    </div>
  );
}
