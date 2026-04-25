'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCircle, Menu, LogOut, Settings, Users, Receipt, Wallet } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

export default function TopBar({ user, maxLimit, role }: { user: any, maxLimit: number, role: string }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="h-16 px-4 md:px-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-background)] shrink-0 z-10 w-full relative">
       <div className="flex items-center gap-4">
           {/* Mobile Only Hamburger Menu */}
           <div className="md:hidden relative">
               <button
                   onClick={() => setSettingsOpen(!settingsOpen)}
                   className="p-2 hover:bg-[var(--color-card)] rounded-lg transition-colors"
                   aria-label="Menu"
               >
                   <Menu className="w-5 h-5 text-[var(--color-foreground)]" />
               </button>
               {settingsOpen && (
                   <div className="absolute top-full left-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg min-w-48 z-50">
                       {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                           <>
                               <Link href="/dashboard/ledger" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] transition-colors">
                                   <Wallet className="w-4 h-4" /> Master Ledger
                               </Link>
                               {role === 'SUPER_ADMIN' && (
                                   <Link href="/dashboard/config" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] transition-colors border-t border-[var(--color-border)]">
                                       <Settings className="w-4 h-4" /> System Settings
                                   </Link>
                               )}
                           </>
                       )}
                   </div>
               )}
           </div>

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
           
           <div className="flex items-center gap-3 relative">
               <div className="text-right hidden md:block">
                   <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                   <p className="text-xs text-[var(--color-primary)]">{user.role}</p>
               </div>
               <button
                   onClick={() => setProfileOpen(!profileOpen)}
                   className="w-8 h-8 rounded bg-[var(--color-primary)]/20 border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 transition-colors"
               >
                   <UserCircle className="w-5 h-5" />
               </button>
               
               {profileOpen && (
                   <div className="absolute top-full right-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg min-w-40 z-50">
                       <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] transition-colors rounded-t-lg">
                           <UserCircle className="w-4 h-4" /> Profile
                       </Link>
                       <Link href="/api/logout" prefetch={false} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] hover:text-[var(--color-danger)] transition-colors text-gray-400 rounded-b-lg border-t border-[var(--color-border)]">
                           <LogOut className="w-4 h-4" /> Logout
                       </Link>
                   </div>
               )}
           </div>
       </div>
    </header>
  );
}
