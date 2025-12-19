'use client';

import { motion } from 'framer-motion';
import {
    Clock,
    Star,
    FileText,
    PauseCircle,
    Download,
    Bot,
    ArrowRight,
    Activity
} from 'lucide-react';
import Link from 'next/link';

import { Sidebar } from '@/components/Sidebar';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { AnalyticsDTO } from '@/lib/api/contracts';

type ActivityPoint = { received: number; resolved: number };

function buildActivityData(analytics: AnalyticsDTO | undefined): ActivityPoint[] {
    if (!analytics) return [];
    const totalTickets = analytics.summary.totalTickets;
    const resolvedTickets = analytics.summary.resolvedTickets;
    const resolvedRate = totalTickets > 0 ? resolvedTickets / totalTickets : 0;

    return analytics.ticketVolume.map((bucket) => ({
        received: bucket.tickets,
        resolved: Math.round(bucket.tickets * resolvedRate),
    }));
}

function formatDuration(seconds: number | null | undefined) {
    if (seconds == null) return '-';
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
}

// Quick actions
const quickActions = [
    { icon: <PauseCircle className="w-5 h-5" />, label: 'Pause AI', description: 'Temporarily disable auto-responses' },
    { icon: <Download className="w-5 h-5" />, label: 'Export Report', description: 'Download weekly summary' },
    { icon: <FileText className="w-5 h-5" />, label: 'View Templates', description: 'Manage response templates' },
];

// Mini bar chart component
function MiniChart({ data }: { data: ActivityPoint[] }) {
    if (data.length === 0) {
        return (
            <div className="h-24 mt-4 flex items-center justify-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                No activity yet
            </div>
        );
    }

    const maxValue = Math.max(...data.flatMap(d => [d.received, d.resolved]), 1);

    return (
        <div className="flex items-end gap-2 h-24 mt-4">
            {data.map((day, i) => (
                <div key={i} className="flex-1 flex gap-0.5">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.received / maxValue) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="flex-1 rounded-t"
                        style={{ background: 'var(--border-primary)' }}
                    />
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.resolved / maxValue) * 100}%` }}
                        transition={{ delay: i * 0.1 + 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t"
                        style={{ background: 'var(--accent-green)' }}
                    />
                </div>
            ))}
        </div>
    );
}

// Confidence Ring SVG
function ConfidenceRing({ value }: { value: number | null }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const safeValue = value ?? 0;
    const offset = circumference - (safeValue / 100) * circumference;
    const label = value == null ? '-' : `${Math.round(value)}%`;

    return (
        <svg width="100" height="100" className="mx-auto">
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                strokeWidth="8"
                className="confidence-ring-bg"
                style={{ stroke: 'var(--border-primary)' }}
            />
            <motion.circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                    stroke: 'var(--accent-green)',
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                }}
                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, delay: 0.5 }}
            />
            <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xl font-semibold"
                style={{ fill: 'var(--text-primary)' }}
            >
                {label}
            </text>
        </svg>
    );
}

export default function DashboardPage() {
    const analyticsQuery = useAnalytics('7d');
    const analytics = analyticsQuery.data?.analytics;

    const activityData = buildActivityData(analytics);
    const totalTickets = analytics?.summary.totalTickets ?? null;
    const resolvedTickets = analytics?.summary.resolvedTickets ?? null;
    const resolutionRate = totalTickets && resolvedTickets != null ? resolvedTickets / totalTickets : null;
    const resolutionRateLabel = resolutionRate == null ? '-' : `${Math.round(resolutionRate * 100)}%`;

    const avgHandle = analytics?.summary.avgHandleTimeSeconds ?? null;
    const csatScore = analytics?.summary.csatScore ?? null;
    const aiResolutionRate = analytics?.summary.aiResolutionRate ?? null;

    const openTickets = analytics?.summary.openTickets ?? null;
    const humanNeeded = analytics?.summary.humanNeededTickets ?? null;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1
                            className="text-2xl font-semibold mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Welcome back
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Here is what is happening with your support tickets.
                        </p>
                    </div>
                    <div className="live-indicator">
                        <Bot className="w-4 h-4" />
                        AI Active
                    </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-12 grid-rows-2 gap-4 mb-6" style={{ gridTemplateRows: 'auto auto' }}>

                    {/* Main Block - AI Activity (spans 6 cols) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-6 row-span-2 bento-card"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3
                                    className="text-sm font-medium mb-1"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    AI Activity
                                </h3>
                                <p
                                    className="text-2xl font-semibold"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Focus of the Week
                                </p>
                            </div>
                            <div className="ai-status-dot" />
                        </div>

                        <p
                            className="text-sm mb-4"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Incoming tickets vs resolved (estimated) in the last 7 days
                        </p>

                        <MiniChart data={activityData} />

                        <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded" style={{ background: 'var(--border-primary)' }} />
                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Received</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded" style={{ background: 'var(--accent-green)' }} />
                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Resolved</span>
                                </div>
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--accent-green-dark)' }}>
                                {resolutionRateLabel} resolution rate (7d)
                            </span>
                        </div>
                    </motion.div>

                    {/* Avg Response Time (top right) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-3 bento-card"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <Clock className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                        </div>
                        <p
                            className="text-3xl font-semibold tabular-nums mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {formatDuration(avgHandle)}
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Avg Response Time
                        </p>
                    </motion.div>

                    {/* CSAT Score (top right) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-3 bento-card"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <Star className="w-5 h-5" style={{ color: 'var(--status-delivery)' }} />
                        </div>
                        <p
                            className="text-3xl font-semibold tabular-nums mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {csatScore == null ? '-' : csatScore.toFixed(1)}
                        </p>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Customer Satisfaction
                        </p>
                    </motion.div>

                    {/* Quick Actions (bottom left) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-3 bento-card"
                    >
                        <h3
                            className="text-sm font-medium mb-4"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {quickActions.map((action, i) => (
                                <button key={i} className="quick-action">
                                    <div style={{ color: 'var(--accent-green)' }}>{action.icon}</div>
                                    <div className="flex-1 text-left">
                                        <p
                                            className="text-sm font-medium"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {action.label}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Resolution Rate with Ring */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="col-span-3 bento-card flex flex-col items-center justify-center"
                    >
                        <ConfidenceRing value={aiResolutionRate == null ? null : aiResolutionRate * 100} />
                        <p
                            className="text-sm mt-3"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            AI Resolution Rate
                        </p>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            Last 7 days
                        </span>
                    </motion.div>
                </div>

                {/* Go to Inbox CTA */}
                <Link href="/inbox">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bento-card flex items-center justify-between cursor-pointer group"
                        whileHover={{ scale: 1.005 }}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: 'var(--accent-green-bg)' }}
                            >
                                <Activity className="w-6 h-6" style={{ color: 'var(--accent-green-dark)' }} />
                            </div>
                            <div>
                                <p
                                    className="font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {openTickets == null ? 'Open tickets: -' : `Open tickets: ${openTickets}`}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    {humanNeeded == null ? 'Human needed: -' : `Human needed: ${humanNeeded}`}
                                </p>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-2 transition-transform group-hover:translate-x-1"
                            style={{ color: 'var(--accent-green-dark)' }}
                        >
                            <span className="font-medium">View Inbox</span>
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </motion.div>
                </Link>
            </main>
        </div>
    );
}
