'use client';

import { useState } from 'react';
import { insertIncomeAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';

export default function IncomeForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await insertIncomeAction(formData);

    if (res.success) {
      playSuccessSound();
      toast.success(res.message);
      (e.target as HTMLFormElement).reset();
    } else {
      playErrorSound();
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 border-b border-[var(--color-border)] pb-8 mb-8 items-end">
      <div className="flex-1">
         <label className="block text-xs font-medium text-gray-400 mb-1">Income Source / Title</label>
         <input name="title" required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-white focus:outline-none focus:border-[var(--color-primary)] text-sm" placeholder="VC Funding Round" />
      </div>
      <div className="flex-1">
         <label className="block text-xs font-medium text-gray-400 mb-1">Amount (XAF)</label>
         <input name="amount" required type="number" step="0.01" min="0" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-white font-mono focus:outline-none focus:border-[var(--color-primary)] text-sm" placeholder="1000000.00" />
      </div>
      <div className="flex-2 w-full md:w-1/3">
         <label className="block text-xs font-medium text-gray-400 mb-1">Details (Optional)</label>
         <input name="description" type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-2 px-3 text-white focus:outline-none focus:border-[var(--color-primary)] text-sm" placeholder="Stripe transfer #992..." />
      </div>
      <button disabled={loading} type="submit" className="whitespace-nowrap px-6 py-2 bg-[var(--color-success)] text-white text-sm font-bold tracking-widest rounded hover:bg-opacity-80 transition disabled:opacity-50">
         {loading ? 'PROCESSING...' : 'ADD INCOME'}
      </button>
    </form>
  );
}
