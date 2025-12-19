'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Clock, Filter, MessageSquare, Settings, Sparkles, TrendingUp, Users } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { useToast } from '@/components/Toast';
import { useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import type { NotificationDTO } from '@/lib/api/contracts';

function formatTimeAgo(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const diffMs = Date.now() - d.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

const notificationIcons: Record<NotificationDTO['type'], React.ReactNode> = {
    ticket: <MessageSquare className="w-5 h-5" />,
    ai: <Sparkles className="w-5 h-5" />,
    system: <TrendingUp className="w-5 h-5" />,
    team: <Users className="w-5 h-5" />,
};

const notificationColors: Record<NotificationDTO['type'], { bg: string; color: string }> = {
    ticket: { bg: 'var(--status-delivery-bg)', color: 'var(--status-delivery)' },
    ai: { bg: 'var(--accent-green-bg)', color: 'var(--accent-green-dark)' },
    system: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
    team: { bg: 'var(--status-human-bg)', color: '#7c3aed' },
};

function NotificationCard({
    notification,
    onRead,
}: {
    notification: NotificationDTO;
    onRead: () => void;
}) {
    const colors = notificationColors[notification.type];
    const isRead = Boolean(notification.readAt);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className={`flex items-start gap-4 p-4 rounded-xl transition-all ${!isRead ? 'border-l-4' : ''}`}
            style={{
                background: isRead ? 'transparent' : 'var(--bg-card)',
                borderLeftColor: notification.priority === 'high' ? 'var(--status-pending)' : 'var(--accent-green)',
                boxShadow: isRead ? 'none' : 'var(--shadow-sm)',
            }}
        >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.bg, color: colors.color }}>
                {notificationIcons[notification.type]}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {notification.title}
                        </h3>
                        {notification.priority === 'high' && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'var(--status-pending-bg)', color: '#dc2626' }}>
                                Urgent
                            </span>
                        )}
                        {!isRead && <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.createdAt)}
                        </span>
                    </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                </p>
            </div>

            <div className="flex items-center gap-1">
                {!isRead && (
                    <motion.button
                        onClick={onRead}
                        className="btn-ghost p-2 rounded-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Mark as read"
                    >
                        <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

export default function NotificationsPage() {
    const { addToast } = useToast();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const notificationsQuery = useNotifications({ limit: 50, cursor: null, sort: 'createdAt', order: 'desc' });
    const markRead = useMarkNotificationRead();

    const notifications = notificationsQuery.data?.items ?? [];
    const unreadCount = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

    const filteredNotifications = useMemo(() => {
        return filter === 'all' ? notifications : notifications.filter((n) => !n.readAt);
    }, [filter, notifications]);

    const markAsRead = async (id: string) => {
        try {
            await markRead.mutateAsync(id);
        } catch (err: any) {
            addToast('error', 'Update Failed', err?.message ?? 'Could not mark notification read.');
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter((n) => !n.readAt);
        if (unread.length === 0) return;
        try {
            await Promise.all(unread.map((n) => markRead.mutateAsync(n.id)));
            addToast('success', 'All Read', 'All notifications marked as read.');
        } catch (err: any) {
            addToast('error', 'Update Failed', err?.message ?? 'Could not mark all as read.');
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                Notifications
                            </h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Stay updated with your support activity.</p>
                        </div>
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green-dark)' }}>
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0 || markRead.isPending}
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark All Read
                        </motion.button>
                        <motion.button className="btn btn-secondary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Settings className="w-4 h-4" />
                            Preferences
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="col-span-8">
                        {/* Filter Tabs */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="tab-group">
                                <motion.button
                                    onClick={() => setFilter('all')}
                                    className={`tab-item ${filter === 'all' ? 'active' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    All
                                    <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                                        {notifications.length}
                                    </span>
                                </motion.button>
                                <motion.button
                                    onClick={() => setFilter('unread')}
                                    className={`tab-item ${filter === 'unread' ? 'active' : ''}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Unread
                                    {unreadCount > 0 && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--accent-green)', color: '#0f172a' }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </motion.button>
                            </div>
                            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                <Filter className="w-4 h-4" />
                                {filter === 'unread' ? 'Unread only' : 'All'}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-2">
                            {notificationsQuery.isLoading && (
                                <div className="text-center py-10" style={{ color: 'var(--text-tertiary)' }}>
                                    Loading notifications...
                                </div>
                            )}

                            {!notificationsQuery.isLoading && notificationsQuery.error && (
                                <div className="text-center py-10" style={{ color: 'var(--status-pending)' }}>
                                    Failed to load notifications.
                                </div>
                            )}

                            <AnimatePresence mode="popLayout">
                                {!notificationsQuery.isLoading && !notificationsQuery.error && filteredNotifications.length > 0 ? (
                                    filteredNotifications.map((notification) => (
                                        <NotificationCard key={notification.id} notification={notification} onRead={() => markAsRead(notification.id)} />
                                    ))
                                ) : (
                                    !notificationsQuery.isLoading &&
                                    !notificationsQuery.error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                                                <Bell className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
                                            </div>
                                            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                                {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                                            </p>
                                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                                {filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here.'}
                                            </p>
                                        </motion.div>
                                    )
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-4 space-y-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bento-card">
                            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                                Today&apos;s Activity
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'New tickets', value: 0, icon: <MessageSquare className="w-4 h-4" /> },
                                    { label: 'AI responses', value: 0, icon: <Sparkles className="w-4 h-4" /> },
                                    { label: 'Team mentions', value: 0, icon: <Users className="w-4 h-4" /> },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            {stat.icon}
                                            <span className="text-sm">{stat.label}</span>
                                        </div>
                                        <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                                            {stat.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

