'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotificationsAction, markNotificationReadAction } from '@/app/dashboard/notificationActions';

// NotificationsDropdown component displays system alerts with unread indicator
export default function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    // Fetch notifications on component mount and set up polling
    const fetchDropdown = async () => {
        const notifs = await getNotificationsAction();
        setNotifications(notifs);
    };

    useEffect(() => {
        fetchDropdown();
        // Poll for new notifications every 15 seconds
        const interval = setInterval(fetchDropdown, 15000);
        return () => clearInterval(interval);
    }, []);

    // Count unread notifications for badge display
    const unreadCount = notifications.filter(n => !n.read_status).length;

    // Mark notification as read when clicked
    const handleRead = async (id: number) => {
        await markNotificationReadAction(id);
        setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: true } : n));
    };

    return (
        <div className="relative">
            {/* Bell icon button with unread indicator */}
            <button
                onClick={() => setOpen(!open)}
                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors relative block"
            >
                <Bell className="w-5 h-5" />
                {/* Red dot for unread notifications */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[var(--color-background)]"></span>
                )}
            </button>

            {/* Dropdown menu when open */}
            {open && (
                <>
                    {/* Backdrop overlay to close dropdown */}
                    <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
                    <div className="md:absolute fixed right-4 md:right-0 mt-4 md:mt-4 w-80 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden z-[100] shadow-xl md:top-auto top-16">
                        {/* Header with title and unread count */}
                        <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-input)]">
                            <h3 className="text-xs font-bold font-mono tracking-widest text-[var(--color-primary)] uppercase">System Alerts</h3>
                            {unreadCount > 0 && (
                                <span className="text-[9px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded-full font-mono">{unreadCount} new</span>
                            )}
                        </div>
                        {/* Scrollable notifications list */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-xs text-slate-500">No recent alerts.</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} onClick={() => handleRead(n.id)}
                                        className={`p-3 text-xs cursor-pointer transition-colors ${!n.read_status ? 'bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20' : 'hover:bg-[var(--color-input)]'}`}
                                    >
                                        {/* Notification content */}
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`font-bold ${!n.read_status ? 'text-[var(--color-foreground)]' : 'text-slate-600'}`}>{n.title}</p>
                                            {!n.read_status && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-0.5 ml-2"></span>}
                                        </div>
                                        <p className="text-slate-700 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] text-slate-500 mt-2 font-mono">{new Date(n.created_at).toLocaleString()}</p>
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
