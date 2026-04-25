'use client';

import { useState } from 'react';
import { dispatchFundsAction } from './dispatchActions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { Send, Banknote } from 'lucide-react';

export default function DispatchFundsModal({ users }: { users: { id: number, name: string, email: string, role: string }[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const eligibleRecipients = users.filter(u => u.role !== 'SUPER_ADMIN');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await dispatchFundsAction(fd);
    if (res.success) {
      playSuccessSound();
      toast.success(res.message);
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      playErrorSound();
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[var(--color-accent)] text-white hover:opacity-90 transition font-bold py-2 px-4 rounded text-sm tracking-widest"
      >
        <Send className="w-4 h-4" /> SEND MONEY
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-card)] border border-[var(--color-accent)]/40 rounded-xl w-full max-w-md overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)]">
            <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-[var(--color-accent)] to-transparent" />
            <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-mono tracking-widest text-[var(--color-accent)] flex items-center gap-2">
                  <Send className="w-5 h-5" /> SEND MONEY
                </h2>
                <p className="text-[10px] text-gray-500 uppercase mt-1">Send money to staff</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Send To</label>
                <select
                  name="target_user_id"
                  required
                  className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 px-3 text-white focus:outline-none focus:border-[var(--color-accent)] appearance-none"
                >
                  <option value="">Choose staff member...</option>
                  {eligibleRecipients.map(u => (
                    <option key={u.id} value={u.id}>{u.name} — {u.email} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Amount (XAF)</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="0"
                    className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white font-mono text-lg focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Note / Purpose</label>
                <textarea
                  name="note"
                  rows={3}
                  placeholder="Reason for this fund dispatch..."
                  className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded p-3 text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[var(--color-accent)] text-white hover:opacity-90 transition font-bold py-3 rounded text-sm tracking-widest disabled:opacity-50"
                >
                  {loading ? 'DISPATCHING...' : 'CONFIRM DISPATCH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
