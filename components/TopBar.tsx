'use client';

import { UserCircle } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

export default function TopBar({ user, maxLimit }: { user: any, maxLimit: number }) {
  return (
    <header className="h-16 px-4 md:px-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-background)] shrink-0 z-10 w-full relative">
       <div className="flex items-center gap-4">
           {/* Mobile Only Logo */}
           <div className="md:hidden w-8 h-8 rounded-full overflow-hidden border border-[var(--color-primary)] bg-[var(--color-input)]">
               <img src="/logo.jpg" alt="DIRA Logo" className="w-full h-full object-cover" />
           </div>
           <h1 className="text-[var(--color-primary)] font-semibold hidden md:block">DASHBOARD</h1>
       </div>
       
       <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-4 border-r border-[var(--color-border)] pr-6">
               <div className="text-right">
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest">Max Request Limit</p>
                   <p className="text-[var(--color-primary)] font-bold font-mono">
                     {maxLimit > 0
                       ? maxLimit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' XAF'
                       : '—'}
                   </p>
               </div>
           </div>
           
           <NotificationsDropdown />
           
           <div className="flex items-center gap-3">
               <div className="text-right hidden md:block">
                   <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                   <p className="text-xs text-[var(--color-primary)]">{user.role}</p>
               </div>
               <div className="w-8 h-8 rounded bg-[var(--color-primary)]/20 border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)]">
                   <UserCircle className="w-5 h-5" />
               </div>
           </div>
       </div>
    </header>
  );
}
