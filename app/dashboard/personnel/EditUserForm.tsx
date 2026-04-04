'use client';

import { useState } from 'react';
import { updateUserAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound, playErrorSound } from '@/lib/audio';
import { UserCog, Shield } from 'lucide-react';

export default function EditUserForm({ user, currentRole, jobTitles }: { user: any, currentRole: string, jobTitles: any[] }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const defaultTitleIds = user.title_ids || [];

  if (!open) {
      return (
          <button onClick={() => setOpen(true)} className="px-3 py-1 rounded bg-[var(--color-input)] hover:text-white transition text-xs">
             Edit
          </button>
      );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateUserAction(user.id, formData);

    if (res.success) {
      playSuccessSound();
      toast.success(res.message);
      setOpen(false);
    } else {
      playErrorSound();
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
       <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl w-full max-w-lg overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)] text-left">
           <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-transparent" />
           <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]/50">
              <div>
                 <h2 className="text-xl font-bold font-mono tracking-widest text-[var(--color-primary)] flex items-center gap-2">
                    <UserCog className="w-5 h-5" /> UPDATE EMPLOYEE
                 </h2>
                 <p className="text-[10px] text-gray-500 uppercase mt-1">Modify profile and clearance</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Identity (Name)</label>
                 <div className="relative">
                    <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input name="name" defaultValue={user.name} required type="text" className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white focus:outline-none focus:border-[var(--color-primary)]" />
                 </div>
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">Access Clearance (Role)</label>
                 <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select name="role" defaultValue={user.role} required className="w-full bg-[var(--color-input)] border border-[var(--color-border)] rounded py-3 pl-10 pr-3 text-white focus:outline-none focus:border-[var(--color-primary)] appearance-none">
                       <option value="EMPLOYEE">Level 1 - Field Employee (EMPLOYEE)</option>
                       <option value="ADMIN">Level 2 - Sector Lead (ADMIN)</option>
                       {currentRole === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Level 3 - Director (SUPER_ADMIN)</option>}
                    </select>
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-400 mb-2 tracking-wider uppercase">Professional Titles</label>
                 <div className="bg-[var(--color-input)] border border-[var(--color-border)] rounded p-4 grid grid-cols-2 gap-2 text-sm text-gray-300">
                     {jobTitles.length === 0 ? <p className="text-xs text-gray-500 italic">No job titles configured in system.</p> : null}
                     {jobTitles.map(jt => (
                         <label key={jt.id} className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                            <input defaultChecked={defaultTitleIds.includes(jt.id)} type="checkbox" name="titles" value={jt.id} className="w-4 h-4 accent-[var(--color-primary)]" />
                            {jt.title}
                         </label>
                     ))}
                 </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border)]">
                 <button disabled={loading} type="submit" className="w-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] transition font-bold py-3 rounded text-sm tracking-widest disabled:opacity-50">
                    {loading ? 'TRANSMITTING...' : 'UPDATE EMPLOYEE'}
                 </button>
              </div>
           </form>
       </div>
    </div>
  );
}
