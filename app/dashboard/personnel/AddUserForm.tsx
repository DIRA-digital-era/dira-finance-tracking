'use client';

import { useState } from 'react';
import { createUserAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { UserPlus, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function AddUserForm({ currentRole, jobTitles }: { currentRole: string, jobTitles: any[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (!open) {
      return (
          <button onClick={() => setOpen(true)} className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] transition font-bold py-2 px-4 rounded text-sm tracking-widest w-full md:w-auto mt-4 md:mt-0">
             + ADD STAFF
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
       <div className="fixed inset-0" onClick={() => setOpen(false)} />
       <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl w-full max-w-lg overflow-hidden relative shadow-2xl z-10">
           <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
           <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-input)]">
              <div>
                 <h2 className="text-xl font-bold font-mono tracking-widest text-[var(--color-primary)] flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> ADD STAFF
                 </h2>
                  <p className="text-[10px] text-slate-700 uppercase mt-1">Set up staff account and permissions</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-[var(--color-foreground)] transition relative z-20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Identity (Name)</label>
                 <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="name" required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]" placeholder="E.g. Agent K. Sterling" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Employee Code (Email)</label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="email" required type="email" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]" placeholder="employee@dira.inc" />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Security Key (Password)</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="password" required type={showPass ? 'text' : 'password'} className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-10 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)]" placeholder="Temporary Secret Key" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[var(--color-foreground)] transition">
                       {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wider uppercase">Access Clearance (Role)</label>
                 <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select name="role" required className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-primary)] appearance-none">
                       <option value="EMPLOYEE">Level 1 - Field Employee (EMPLOYEE)</option>
                       <option value="ADMIN">Level 2 - Sector Lead (ADMIN)</option>
                       {currentRole === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Level 3 - Director (SUPER_ADMIN)</option>}
                    </select>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-700 mb-2 tracking-wider uppercase">Professional Titles (Optional)</label>
                 <div className="bg-[var(--color-input)] border border-[var(--color-border)] rounded p-4 grid grid-cols-2 gap-2 text-sm text-slate-800">
                     {jobTitles.length === 0 ? <p className="text-xs text-slate-600 italic">No job titles configured in system.</p> : null}
                     {jobTitles.map(jobTitle => (
                         <label key={jobTitle.id} className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-foreground)] transition">
                            <input type="checkbox" name="titles" value={jobTitle.id} className="w-4 h-4 accent-[var(--color-primary)]" />
                            {jobTitle.title}
                         </label>
                     ))}
                 </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                 <button disabled={loading} type="submit" className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] transition font-bold py-3 rounded text-sm tracking-widest disabled:opacity-50">
                    {loading ? 'INITIALIZING...' : 'PROVISION EMPLOYEE'}
                 </button>
              </div>
           </form>
       </div>
    </div>
  );
}
