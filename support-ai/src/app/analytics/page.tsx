'use client';

import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart } from 'lucide-react';

// Mock data for charts
const volumeData = [
    { day: 'Mon', tickets: 45 },
    { day: 'Tue', tickets: 52 },
    { day: 'Wed', tickets: 38 },
    { day: 'Thu', tickets: 67 },
    { day: 'Fri', tickets: 54 },
    { day: 'Sat', tickets: 23 },
    { day: 'Sun', tickets: 18 },
];

const resolutionData = [
    { label: 'AI Resolved', value: 72, color: 'var(--accent-green)' },
    { label: 'Human Resolved', value: 28, color: 'var(--border-primary)' },
];

const categoryData = [
    { category: 'Shipping', count: 156, percentage: 35 },
    { category: 'Returns', count: 98, percentage: 22 },
    { category: 'Product', count: 89, percentage: 20 },
    { category: 'Billing', count: 67, percentage: 15 },
    { category: 'General', count: 35, percentage: 8 },
];

// Mini Bar Chart Component
function VolumeChart() {
    const maxValue = Math.max(...volumeData.map(d => d.tickets));

    return (
        <div className="h-48 flex items-end justify-between gap-3 pt-8">
            {volumeData.map((day, i) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.tickets / maxValue) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full rounded-t-lg min-h-[4px]"
                        style={{ background: 'var(--accent-green)' }}
                    />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {day.day}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Donut Chart Component
function ResolutionChart() {
    const total = resolutionData.reduce((sum, d) => sum + d.value, 0);
    const aiPercentage = (resolutionData[0].value / total) * 100;

    return (
        <div className="flex items-center justify-center gap-8">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="12"
                        style={{ stroke: 'var(--border-primary)' }}
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="12"
                        strokeLinecap="round"
                        style={{ stroke: 'var(--accent-green)' }}
                        initial={{ strokeDasharray: '251.2', strokeDashoffset: '251.2' }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * aiPercentage / 100) }}
                        transition={{ duration: 1, delay: 0.3 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {aiPercentage.toFixed(0)}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>AI</span>
                </div>
            </div>
            <div className="space-y-3">
                {resolutionData.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {item.label}
                        </span>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {item.value}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Category List Component
function CategoryChart() {
    return (
        <div className="space-y-4">
            {categoryData.map((item, i) => (
                <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4"
                >
                    <span
                        className="w-20 text-sm font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {item.category}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent-green)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        />
                    </div>
                    <span
                        className="w-12 text-right text-sm tabular-nums"
                        style={{ color: 'var(--text-tertiary)' }}
                    >
                        {item.count}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Analytics
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Track your AI agent&apos;s performance and support metrics.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn btn-secondary">Last 7 days</button>
                        <button className="btn btn-primary">Export</button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Tickets', value: '445', trend: '+12%', up: true },
                        { label: 'AI Resolution', value: '72%', trend: '+5%', up: true },
                        { label: 'Avg Handle Time', value: '2m 15s', trend: '-18%', up: false },
                        { label: 'CSAT Score', value: '4.8', trend: '+0.2', up: true },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bento-card"
                        >
                            <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                                    {stat.value}
                                </span>
                                <span className={`text-sm flex items-center gap-1 ${stat.up ? 'trend-up' : 'trend-down'}`}>
                                    {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {stat.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-12 gap-4">
                    {/* Volume Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="col-span-8 bento-card"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                    <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                                </div>
                                <div>
                                    <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                        Ticket Volume
                                    </h3>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        Daily incoming tickets
                                    </p>
                                </div>
                            </div>
                        </div>
                        <VolumeChart />
                    </motion.div>

                    {/* Resolution Rate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="col-span-4 bento-card"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                <PieChart className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                            </div>
                            <div>
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Resolution Rate
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    AI vs Human
                                </p>
                            </div>
                        </div>
                        <ResolutionChart />
                    </motion.div>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="col-span-6 bento-card"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                <LineChart className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                            </div>
                            <div>
                                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    Top Categories
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                    Most common ticket types
                                </p>
                            </div>
                        </div>
                        <CategoryChart />
                    </motion.div>

                    {/* AI Insights Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="col-span-6 bento-card"
                        style={{ background: 'linear-gradient(135deg, var(--accent-green-bg), var(--bg-card))' }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="ai-status-dot" />
                            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                AI Insights
                            </h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500">✓</span>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Shipping queries increased 23% this week - consider updating FAQ
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500">✓</span>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    AI confidence improved for refund requests after template update
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-yellow-500">!</span>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    3 edge cases flagged for human review in billing category
                                </span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
