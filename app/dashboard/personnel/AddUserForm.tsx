'use client';

import { useState } from 'react';
import { createUserAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { UserPlus, Shield, Mail, Lock } from 'lucide-react';

export default function AddUserForm({ currentRole }: { currentRole: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  if (!open) {
      return (
          <button onClick={() => setOpen(true)} className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] transition font-bold py-2 px-4 rounded text-sm tracking-widest w-full md:w-auto mt-4 md:mt-0">
             + REGISTER PERSONNEL
          </button>
      );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
       <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl w-full max-w-md overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
           <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
           <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
              <div>
                 <h2 className="text-xl font-bold font-mono tracking-widest text-[var(--color-primary)] flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> NEW Employee
                 </h2>
                 <p className="text-[10px] text-gray-500 uppercase mt-1">Configure profile and access level</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Identity (Name)</label>
                 <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="name" required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="E.g. Agent K. Sterling" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Employee Code (Email)</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="email" required type="email" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="agent@dira.inc" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Security Key (Password)</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="password" required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white focus:outline-none focus:border-[var(--color-primary)]" placeholder="Temporary Secret Key" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Access Clearance (Role)</label>
                 <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select name="role" required className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none">
                       <option value="EMPLOYEE">Level 1 - Field Employee (EMPLOYEE)</option>
                       <option value="ADMIN">Level 2 - Sector Lead (ADMIN)</option>
                       {currentRole === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Level 3 - Director (SUPER_ADMIN)</option>}
                    </select>
                 </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                 <button disabled={loading} type="submit" className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] transition font-bold py-3 rounded text-sm tracking-widest disabled:opacity-50">
                    {loading ? 'INITIALIZING...' : 'PROVISION Employee'}
                 </button>
              </div>
           </form>
       </div>
    </div>
  );
}
