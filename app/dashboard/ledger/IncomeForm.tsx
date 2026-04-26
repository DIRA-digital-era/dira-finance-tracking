'use client';

import { useState } from 'react';
import { insertIncomeAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { PlusCircle, X } from 'lucide-react';

export default function IncomeForm() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await insertIncomeAction(formData);
    if (res.success) {
      playSuccessSound();
      toast.success(res.message);
      (e.target as HTMLFormElement).reset();
      setOpen(false);
    } else {
      playErrorSound();
      toast.error(res.message);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[var(--color-success)] text-white font-bold py-2 px-4 rounded text-sm tracking-widest hover:opacity-90 transition"
      >
        <PlusCircle className="w-4 h-4" /> ADD MONEY IN
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={() => setOpen(false)} />
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl w-full max-w-lg shadow-2xl relative z-10">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-input)]">
          <h3 className="text-sm font-bold font-mono tracking-widest text-[var(--color-success)] uppercase">Add Money Received</h3>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-[var(--color-foreground)] transition relative z-20">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Income Source / Title</label>
            <input name="title" required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] text-sm" placeholder="VC Funding Round" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Amount (XAF)</label>
            <input name="amount" required type="number" step="1" min="0" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-[var(--color-foreground)] font-mono focus:outline-none focus:border-[var(--color-primary)] text-sm" placeholder="1000000" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Details (Optional)</label>
            <input name="description" type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] text-sm" placeholder="Stripe transfer #992..." />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-[var(--color-success)] text-white text-sm font-bold tracking-widest rounded py-3 hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'PROCESSING...' : 'ADD INCOME'}
          </button>
        </form>
      </div>
    </div>
  );
}
