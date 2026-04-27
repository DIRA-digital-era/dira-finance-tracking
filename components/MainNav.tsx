'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Users, Settings, LogOut, Wallet, UserCircle } from 'lucide-react';

// Main navigation component for dashboard sidebar and mobile bottom nav
export default function MainNav({ role, mobile = false }: { role: string, mobile?: boolean }) {
  // Get current pathname for active link highlighting
  const pathname = usePathname();

  // Base navigation items available to all users
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Requests', href: '/dashboard/my-requests', icon: Receipt },
  ];

  // Add admin-only items for mobile navigation
  if ((role === 'SUPER_ADMIN' || role === 'ADMIN') && mobile) {
    navItems.push({ name: 'Staff', href: '/dashboard/personnel', icon: Users });
    navItems.push({ name: 'All Requests', href: '/dashboard/requests', icon: Receipt });
  }

  // Add all admin items for desktop sidebar
  if (!mobile && (role === 'SUPER_ADMIN' || role === 'ADMIN')) {
    navItems.push({ name: 'Staff', href: '/dashboard/personnel', icon: Users });
    navItems.push({ name: 'All Requests', href: '/dashboard/requests', icon: Receipt });
    navItems.push({ name: 'Financial Records', href: '/dashboard/ledger', icon: Wallet });
    if (role === 'SUPER_ADMIN') {
       navItems.push({ name: 'System', href: '/dashboard/config', icon: Settings });
    }
  }

  return (
    // Navigation container with responsive layout
    <nav className={`flex ${mobile ? 'flex-row w-full h-full pb-safe' : 'flex-col h-full p-4'}`}>
      {/* Desktop header with logo and branding */}
      {!mobile && (
        <div className="mb-10 px-2 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--color-primary)] bg-[var(--color-input)] shrink-0">
              <img src="/logo.jpg" alt="DIRA Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-widest text-[var(--color-primary)]">DIRA</h2>
              <p className="text-[10px] text-slate-700 uppercase leading-none">MONEY SYSTEM</p>
            </div>
          </div>
          {/* User role indicator */}
          <div className="text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] w-fit px-2 py-1 rounded">ROLE: {role}</div>
        </div>
      )}

      {/* Navigation links list */}
      <ul className={`flex ${mobile ? 'flex-row w-full justify-around items-center h-full' : 'flex-col gap-2 flex-1'}`}>
        {navItems.map((item) => {
          // Check if current link is active
          const isActive = pathname === item.href;
          return (
            // Navigation item with active state styling
            <li key={item.name} className={mobile ? 'h-full flex-1' : ''}>
              <Link
                href={item.href}
                className={`flex h-full ${mobile ? 'flex-col justify-center items-center text-center' : 'items-center px-4 py-3'} transition-colors group ${
                  isActive
                    ? (mobile ? 'text-[var(--color-primary)] relative' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg border-l-4 border-[var(--color-primary)]')
                    : 'text-slate-700 hover:text-[var(--color-foreground)] hover:bg-[var(--color-card)] rounded-lg'
                }`}
              >
                {/* Active indicator for mobile */}
                {mobile && isActive && <div className="absolute top-0 w-8 h-[2px] bg-[var(--color-primary)] rounded-b-md" />}
                {/* Navigation icon */}
                <item.icon className={`${mobile ? 'h-5 w-5 mb-1' : 'h-5 w-5 mr-3'} ${isActive ? 'text-[var(--color-primary)]' : 'text-slate-600 group-hover:text-[var(--color-primary)] transition-colors'}`} />
                {/* Navigation label */}
                <span className={`${mobile ? 'text-[10px] leading-tight' : 'text-sm font-medium'}`}>{item.name}</span>
              </Link>
            </li>
          );
        })}

      </ul>

      {/* Desktop logout link */}
      {!mobile && (
         <div className="mt-auto border-t border-[var(--color-border)] pt-4">
            <Link href="/api/logout" prefetch={false} className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 hover:bg-[var(--color-card)] hover:text-[var(--color-danger)] transition-colors group rounded-lg">
                <LogOut className="h-5 w-5 mr-3 text-slate-600 group-hover:text-[var(--color-danger)] transition-colors" />
                Logout
            </Link>
         </div>
      )}
    </nav>
  );
}
