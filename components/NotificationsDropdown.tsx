'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotificationsAction, markNotificationReadAction } from '@/app/dashboard/notificationActions';

export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchDropdown = async () => {
        const notifs = await getNotificationsAction();
        setNotifications(notifs);
    };

    useEffect(() => {
        fetchDropdown();
        const interval = setInterval(fetchDropdown, 15000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read_status).length;

    const handleRead = async (id: number) => {
        await markNotificationReadAction(id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: true } : n));
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors relative block"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[var(--color-background)]"></span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-4 w-80 rounded-xl overflow-hidden z-50 shadow-[0_8px_40px_rgba(0,0,0,0.9)]"
                        style={{
                            background: 'rgba(11,14,30,0.97)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(0,229,255,0.18)',
                        }}
                    >
                        <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[rgba(0,229,255,0.04)]">
                            <h3 className="text-xs font-bold font-mono tracking-widest text-[var(--color-primary)] uppercase">System Alerts</h3>
                            {unreadCount > 0 && (
                                <span className="text-[9px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-mono">{unreadCount} new</span>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-xs text-gray-500">No recent alerts.</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => handleRead(n.id)}
                                        className={`p-3 text-xs cursor-pointer transition-colors ${!n.read_status ? 'bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10' : 'hover:bg-white/5'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-bold ${!n.read_status ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                                            {!n.read_status && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-0.5 ml-2"></span>}
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] text-gray-500 mt-2 font-mono">{new Date(n.created_at).toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
