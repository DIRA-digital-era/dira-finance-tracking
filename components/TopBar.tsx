'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCircle, Menu, LogOut, Settings, Users, Receipt, Wallet } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

// TopBar component renders the header with navigation, user info, and dropdowns
export default function TopBar({ user, maxLimit, role }: { user: any, maxLimit: number, role: string }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    // Header with responsive padding and z-index for layering
    <header className="h-16 px-4 md:px-8 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-background)] shrink-0 z-10 w-full relative">
       <div className="flex items-center gap-4">
           {/* Mobile hamburger menu for settings dropdown */}
           <div className="md:hidden relative">
               <button
                   onClick={() => setSettingsOpen(!settingsOpen)}
                   className="p-2 hover:bg-[var(--color-card)] rounded-lg transition-colors"
                   aria-label="Menu"
               >
                   <Menu className="w-5 h-5 text-[var(--color-foreground)]" />
               </button>
               {/* Settings dropdown for mobile navigation */}
               {settingsOpen && (
                   <>
                       {/* Overlay to close dropdown when clicking outside */}
                       <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                       <div className="absolute top-full left-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl min-w-48 z-[100] overflow-hidden">
                           {/* Conditional links based on user role */}
                           {(role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                               <>
                                   <Link href="/dashboard/ledger" onClick={() => setSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] transition-colors text-[var(--color-foreground)]">
                                       <Wallet className="w-4 h-4" /> Financial Records
                                   </Link>
                                   {role === 'SUPER_ADMIN' && (
                                       <Link href="/dashboard/config" onClick={() => setSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] transition-colors border-t border-[var(--color-border)] text-[var(--color-foreground)]">
                                           <Settings className="w-4 h-4" /> System Settings
                                       </Link>
                                   )}
                               </>
                           )}
                       </div>
                   </>
               )}
           </div>

           {/* Mobile logo */}
           <div className="md:hidden w-8 h-8 rounded-full overflow-hidden border border-[var(--color-primary)] bg-[var(--color-input)]">
               <img src="/logo.jpg" alt="DIRA Logo" className="w-full h-full object-cover" />
           </div>
           {/* Desktop dashboard title */}
           <h1 className="text-[var(--color-primary)] font-semibold hidden md:block">DASHBOARD</h1>
       </div>
       
       <div className="flex items-center gap-6">
           {/* Desktop spending limit display */}
           <div className="hidden md:flex items-center gap-4 border-r border-[var(--color-border)] pr-6">
               <div className="text-right">
                   <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Spending Limit</p>
                   <p className="text-[var(--color-primary)] font-bold font-mono">
                     {maxLimit > 0
                       ? maxLimit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' XAF'
                       : '—'}
                   </p>
               </div>
           </div>
           
           {/* Notifications dropdown component */}
           <NotificationsDropdown />
           
           {/* User profile section with dropdown */}
           <div className="flex items-center gap-3 relative">
               {/* User info display on desktop */}
               <div className="text-right hidden md:block">
                   <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                   <p className="text-xs text-[var(--color-primary)]">{user.role}</p>
               </div>
               {/* Profile button */}
               <button
                   onClick={() => setProfileOpen(!profileOpen)}
                   className="w-8 h-8 rounded bg-[var(--color-primary)]/20 border border-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 transition-colors"
               >
                   <UserCircle className="w-5 h-5" />
               </button>
               
               {/* Profile dropdown menu */}
               {profileOpen && (
                   <>
                       {/* Overlay for closing dropdown */}
                       <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                       <div className="absolute top-full right-0 mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl min-w-40 z-[100] overflow-hidden">
                           <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] transition-colors text-[var(--color-foreground)]">
                               <UserCircle className="w-4 h-4" /> Profile
                           </Link>
                           <Link href="/api/logout" prefetch={false} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-input)] hover:text-[var(--color-danger)] transition-colors text-slate-700 border-t border-[var(--color-border)]">
                               <LogOut className="w-4 h-4" /> Logout
                           </Link>
                       </div>
                   </>
               )}
           </div>
       </div>
    </header>
  );
}
