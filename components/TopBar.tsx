'use client';

import { Bell, UserCircle } from 'lucide-react';
import Image from 'next/image';

export default function TopBar({ user }: { user: any }) {
  return (
    <header className="h-16 px-4 md:px-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-background)] shrink-0 z-10 w-full relative">
       <div className="flex items-center gap-4">
           {/* Mobile Only Logo */}
           <div className="md:hidden relative w-8 h-8 rounded-full overflow-hidden border border-[var(--color-primary)]">
               <Image src="/Innovative Logo DIRA – Digital Era.jpg" fill alt="DIRA Logo" className="object-cover" />
           </div>
           <h1 className="text-[var(--color-primary)] font-semibold hidden md:block">DASHBOARD</h1>
       </div>
       
       <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-4 border-r border-[var(--color-border)] pr-6">
               <div className="text-right">
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest">Total Balance Overview</p>
                   {/* Normally this would be dynamic, but matching the UI static text here for vibe */}
                   <p className="text-[var(--color-foreground)] font-bold font-mono">254,920 XAF</p>
               </div>
           </div>
           
           <button className="text-gray-400 hover:text-[var(--color-primary)] transition-colors relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[var(--color-background)]"></span>
           </button>
           
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
