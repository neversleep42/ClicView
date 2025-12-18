'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import {
    Bell,
    Check,
    X,
    Trash2,
    CheckCheck,
    Filter,
    Settings,
    AlertCircle,
    MessageSquare,
    Sparkles,
    Users,
    TrendingUp,
    Clock
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'ticket' | 'ai' | 'system' | 'team';
    title: string;
    message: string;
    time: string;
    read: boolean;
    priority?: 'high' | 'normal';
}

const mockNotifications: Notification[] = [
    { id: '1', type: 'ticket', title: 'High Priority Ticket', message: 'Emma Johnson submitted an urgent refund request (#61403)', time: '2 min ago', read: false, priority: 'high' },
    { id: '2', type: 'ai', title: 'AI Draft Ready', message: 'Response prepared for ticket #61399 - Shipping delay inquiry', time: '15 min ago', read: false },
    { id: '3', type: 'system', title: 'Weekly Report Available', message: 'Your support analytics for Dec 9-15 are ready to view', time: '1 hour ago', read: false },
    { id: '4', type: 'team', title: 'Team Update', message: 'Sarah assigned you to ticket #61395', time: '2 hours ago', read: true },
    { id: '5', type: 'ai', title: 'AI Learning Complete', message: 'Model updated with 23 new corrections from last week', time: '3 hours ago', read: true },
    { id: '6', type: 'ticket', title: 'New Ticket', message: 'Michael Chen opened a product inquiry ticket', time: '4 hours ago', read: true },
    { id: '7', type: 'system', title: 'Integration Sync', message: 'Shopify sync completed: 156 orders imported', time: '5 hours ago', read: true },
    { id: '8', type: 'ai', title: 'Confidence Alert', message: '3 tickets flagged for human review due to low confidence', time: 'Yesterday', read: true },
];

const notificationIcons: Record<string, React.ReactNode> = {
    ticket: <MessageSquare className="w-5 h-5" />,
    ai: <Sparkles className="w-5 h-5" />,
    system: <TrendingUp className="w-5 h-5" />,
    team: <Users className="w-5 h-5" />,
};

const notificationColors: Record<string, { bg: string; color: string }> = {
    ticket: { bg: 'var(--status-delivery-bg)', color: 'var(--status-delivery)' },
    ai: { bg: 'var(--accent-green-bg)', color: 'var(--accent-green-dark)' },
    system: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
    team: { bg: 'var(--status-human-bg)', color: '#7c3aed' },
};

function NotificationCard({ notification, onRead, onDelete }: {
    notification: Notification;
    onRead: () => void;
    onDelete: () => void;
}) {
    const colors = notificationColors[notification.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className={`flex items-start gap-4 p-4 rounded-xl transition-all ${!notification.read ? 'border-l-4' : ''}`}
            style={{
                background: notification.read ? 'transparent' : 'var(--bg-card)',
                borderLeftColor: notification.priority === 'high' ? 'var(--status-pending)' : 'var(--accent-green)',
                boxShadow: notification.read ? 'none' : 'var(--shadow-sm)',
            }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: colors.bg, color: colors.color }}
            >
                {notificationIcons[notification.type]}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {notification.title}
                        </h3>
                        {notification.priority === 'high' && (
                            <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ background: 'var(--status-pending-bg)', color: '#dc2626' }}
                            >
                                Urgent
                            </span>
                        )}
                        {!notification.read && (
                            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                            <Clock className="w-3 h-3" />
                            {notification.time}
                        </span>
                    </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                </p>
            </div>

            <div className="flex items-center gap-1">
                {!notification.read && (
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
                <motion.button
                    onClick={onDelete}
                    className="btn-ghost p-2 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                </motion.button>
            </div>
        </motion.div>
    );
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' || !n.read
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
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
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Stay updated with your support activity.
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green-dark)' }}
                            >
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark All Read
                        </motion.button>
                        <motion.button
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
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
                                    <span
                                        className="ml-2 px-1.5 py-0.5 rounded text-xs"
                                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                                    >
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
                                        <span
                                            className="ml-2 px-1.5 py-0.5 rounded text-xs"
                                            style={{ background: 'var(--accent-green)', color: '#0f172a' }}
                                        >
                                            {unreadCount}
                                        </span>
                                    )}
                                </motion.button>
                            </div>
                            {notifications.length > 0 && (
                                <motion.button
                                    onClick={clearAll}
                                    className="text-sm font-medium"
                                    style={{ color: 'var(--text-tertiary)' }}
                                    whileHover={{ color: 'var(--status-pending)' }}
                                >
                                    Clear All
                                </motion.button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {filteredNotifications.length > 0 ? (
                                    filteredNotifications.map(notification => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onRead={() => markAsRead(notification.id)}
                                            onDelete={() => deleteNotification(notification.id)}
                                        />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <div
                                            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                            style={{ background: 'var(--bg-tertiary)' }}
                                        >
                                            <Bell className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
                                        </div>
                                        <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                                            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            {filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here.'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-4 space-y-4">
                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bento-card"
                        >
                            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Today&apos;s Activity</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'New tickets', value: 14, icon: <MessageSquare className="w-4 h-4" /> },
                                    { label: 'AI responses', value: 42, icon: <Sparkles className="w-4 h-4" /> },
                                    { label: 'Team mentions', value: 3, icon: <Users className="w-4 h-4" /> },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                            {stat.icon}
                                            <span className="text-sm">{stat.label}</span>
                                        </div>
                                        <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Notification Preferences */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bento-card"
                        >
                            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Settings</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Email notifications', enabled: true },
                                    { label: 'Push notifications', enabled: true },
                                    { label: 'Sound alerts', enabled: false },
                                ].map((setting, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{setting.label}</span>
                                        <div
                                            className="w-10 h-5 rounded-full relative cursor-pointer"
                                            style={{ background: setting.enabled ? 'var(--accent-green)' : 'var(--border-primary)' }}
                                        >
                                            <div
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                                                style={{ left: setting.enabled ? '22px' : '2px' }}
                                            />
                                        </div>
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
