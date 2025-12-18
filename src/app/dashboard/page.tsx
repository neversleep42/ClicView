'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Clock,
    Star,
    Zap,
    FileText,
    PauseCircle,
    Download,
    Bot,
    ArrowRight,
    Activity
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { dashboardStats } from '@/lib/data';
import Link from 'next/link';

// AI Activity mini chart data
const activityData = [
    { received: 12, resolved: 10 },
    { received: 15, resolved: 14 },
    { received: 8, resolved: 8 },
    { received: 18, resolved: 16 },
    { received: 14, resolved: 13 },
    { received: 20, resolved: 18 },
    { received: 16, resolved: 15 },
];

// Quick actions
const quickActions = [
    { icon: <PauseCircle className="w-5 h-5" />, label: 'Pause AI', description: 'Temporarily disable auto-responses' },
    { icon: <Download className="w-5 h-5" />, label: 'Export Report', description: 'Download weekly summary' },
    { icon: <FileText className="w-5 h-5" />, label: 'View Templates', description: 'Manage response templates' },
];

// Mini bar chart component
function MiniChart() {
    const maxValue = Math.max(...activityData.flatMap(d => [d.received, d.resolved]));

    return (
        <div className="flex items-end gap-2 h-24 mt-4">
            {activityData.map((day, i) => (
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
function ConfidenceRing({ value }: { value: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

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
                {value}%
            </text>
        </svg>
    );
}

export default function DashboardPage() {
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
                            Good afternoon, Alex 👋
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Here&apos;s what&apos;s happening with your support tickets today.
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
                                    Focus of the Day
                                </p>
                            </div>
                            <div className="ai-status-dot" />
                        </div>

                        <p
                            className="text-sm mb-4"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Incoming tickets vs. AI resolutions this week
                        </p>

                        <MiniChart />

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
                                91% resolution rate today
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
                            <div className={`trend ${dashboardStats.avgResponseTime.trendDirection === 'down' ? 'trend-up' : 'trend-down'}`}>
                                <TrendingDown className="w-3 h-3" />
                                {dashboardStats.avgResponseTime.trend}
                            </div>
                        </div>
                        <p
                            className="text-3xl font-semibold tabular-nums mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {dashboardStats.avgResponseTime.value}
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
                            <div className="trend trend-up">
                                <TrendingUp className="w-3 h-3" />
                                {dashboardStats.customerSatisfaction.trend}
                            </div>
                        </div>
                        <p
                            className="text-3xl font-semibold tabular-nums mb-1"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {dashboardStats.customerSatisfaction.value}
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
                        <ConfidenceRing value={85} />
                        <p
                            className="text-sm mt-3"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            AI Resolution Rate
                        </p>
                        <div className="trend trend-up mt-1">
                            <TrendingUp className="w-3 h-3" />
                            +5% from last week
                        </div>
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
                                    14 tickets need your attention
                                </p>
                                <p
                                    className="text-sm"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    2 marked as high priority
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
