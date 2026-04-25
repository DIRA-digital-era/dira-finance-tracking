'use client';
import { updatePasswordAction } from './actions';
import { toast } from 'sonner';
import { playSuccessSound } from '@/lib/audio';
import { PasswordEyeToggle } from '@/components/PasswordEyeToggle';

export default function ProfilePage() {
   const handlePass = async (e: any) => {
       e.preventDefault();
       const fd = new FormData(e.currentTarget);
       const res = await updatePasswordAction(fd);
       if (res.success) {
           playSuccessSound();
           toast.success(res.message);
           e.target.reset();
       } else toast.error(res.message);
   };

   return (
       <div className="space-y-6 max-w-xl">
           <h2 className="text-2xl font-bold font-mono tracking-widest text-[var(--color-primary)]">MY PROFILE</h2>
           <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] shadow-lg">
               <p className="text-[10px] text-[var(--color-primary)] tracking-widest uppercase mb-4">Password Settings</p>
               <form onSubmit={handlePass} className="space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">New Password</label>
                       <PasswordEyeToggle />
                   </div>
                   <button type="submit" className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded px-4 py-2 text-sm font-bold tracking-widest hover:bg-[var(--color-primary-hover)] transition w-full">CHANGE PASSWORD</button>
               </form>
           </div>
       </div>
   );
}
