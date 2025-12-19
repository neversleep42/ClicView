'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { AnalyticsDTO, TicketCategory } from '@/lib/api/contracts';
import { getCategoryLabel } from '@/lib/ticketUi';

type VolumePoint = { label: string; tickets: number };
type ResolutionPoint = { label: string; value: number; color: string };
type CategoryPoint = { category: TicketCategory; count: number; percentage: number };

function formatDuration(seconds: number | null) {
    if (seconds == null) return '—';
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}s`;
}

function VolumeChart({ data }: { data: VolumePoint[] }) {
    const maxValue = Math.max(1, ...data.map((d) => d.tickets));

    return (
        <div className="h-48 flex items-end justify-between gap-3 pt-8">
            {data.map((day, i) => (
                <div key={`${day.label}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.tickets / maxValue) * 100}%` }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                        className="w-full rounded-t-lg min-h-[4px]"
                        style={{ background: 'var(--accent-green)' }}
                    />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {day.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ResolutionChart({ data }: { data: ResolutionPoint[] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    const aiPercentage = (data[0]?.value ?? 0) / total * 100;

    return (
        <div className="flex items-center justify-center gap-8">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" style={{ stroke: 'var(--border-primary)' }} />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="12"
                        strokeLinecap="round"
                        style={{ stroke: 'var(--accent-green)' }}
                        initial={{ strokeDasharray: '251.2', strokeDashoffset: '251.2' }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * aiPercentage) / 100 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {aiPercentage.toFixed(0)}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        AI
                    </span>
                </div>
            </div>
            <div className="space-y-3">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {item.label}
                        </span>
                        <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                            {Math.round(item.value)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CategoryChart({ data }: { data: CategoryPoint[] }) {
    return (
        <div className="space-y-4">
            {data.map((item, i) => (
                <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4"
                >
                    <span className="w-24 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {getCategoryLabel(item.category)}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-primary)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent-green)' }}
                        />
                    </div>
                    <span className="w-10 text-sm font-medium tabular-nums text-right" style={{ color: 'var(--text-primary)' }}>
                        {item.count}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

function buildDerived(analytics: AnalyticsDTO | undefined) {
    const totalTickets = analytics?.summary.totalTickets ?? 0;

    const volume: VolumePoint[] = (analytics?.ticketVolume ?? []).map((bucket) => {
        const d = new Date(bucket.bucketStart);
        const label = Number.isNaN(d.getTime()) ? bucket.bucketStart : d.toLocaleDateString(undefined, { weekday: 'short' });
        return { label, tickets: bucket.tickets };
    });

    const totalResolved = (analytics?.resolutionSplit.aiResolved ?? 0) + (analytics?.resolutionSplit.humanResolved ?? 0);
    const aiPct = totalResolved > 0 ? (analytics!.resolutionSplit.aiResolved / totalResolved) * 100 : 0;
    const humanPct = totalResolved > 0 ? (analytics!.resolutionSplit.humanResolved / totalResolved) * 100 : 0;

    const resolution: ResolutionPoint[] = [
        { label: 'AI Resolved', value: aiPct, color: 'var(--accent-green)' },
        { label: 'Human Resolved', value: humanPct, color: 'var(--border-primary)' },
    ];

    const categories: CategoryPoint[] = (analytics?.categories ?? []).map((c) => ({
        category: c.category,
        count: c.count,
        percentage: totalTickets > 0 ? (c.count / totalTickets) * 100 : 0,
    }));

    return { volume, resolution, categories };
}

export default function AnalyticsPage() {
    const [range, setRange] = useState<'7d' | '30d'>('7d');
    const analyticsQuery = useAnalytics(range);
    const analytics = analyticsQuery.data?.analytics;

    const derived = useMemo(() => buildDerived(analytics), [analytics]);

    const summaryCards = useMemo(() => {
        const totalTickets = analytics?.summary.totalTickets ?? null;
        const aiRate = analytics?.summary.aiResolutionRate;
        const avgHandle = analytics?.summary.avgHandleTimeSeconds ?? null;
        const csat = analytics?.summary.csatScore ?? null;

        return [
            { label: 'Total Tickets', value: totalTickets == null ? '—' : String(totalTickets) },
            { label: 'AI Resolution', value: aiRate == null ? '—' : `${Math.round(aiRate * 100)}%` },
            { label: 'Avg Handle Time', value: formatDuration(avgHandle) },
            { label: 'CSAT Score', value: csat == null ? '—' : csat.toFixed(1) },
        ];
    }, [analytics]);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Analytics
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Track your AI agent&apos;s performance and support metrics.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className={`btn ${range === '7d' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setRange('7d')}
                        >
                            Last 7 days
                        </button>
                        <button
                            className={`btn ${range === '30d' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setRange('30d')}
                        >
                            Last 30 days
                        </button>
                    </div>
                </div>

                {analyticsQuery.isLoading && (
                    <div className="py-10 text-center" style={{ color: 'var(--text-tertiary)' }}>
                        Loading analytics...
                    </div>
                )}

                {!analyticsQuery.isLoading && analyticsQuery.error && (
                    <div className="py-10 text-center" style={{ color: 'var(--status-pending)' }}>
                        Failed to load analytics.
                    </div>
                )}

                {!analyticsQuery.isLoading && !analyticsQuery.error && (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            {summaryCards.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bento-card"
                                >
                                    <p className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                        {stat.label}
                                    </p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                                            {stat.value}
                                        </span>
                                        <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                            <TrendingUp className="w-3 h-3 opacity-40" />
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-12 gap-4">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-8 bento-card">
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
                                <VolumeChart data={derived.volume} />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="col-span-4 bento-card">
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
                                <ResolutionChart data={derived.resolution} />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="col-span-6 bento-card">
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
                                <CategoryChart data={derived.categories} />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
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
                                        <span className="text-green-500">•</span>
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            Shipping queries trend may fluctuate in real-time systems.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-500">•</span>
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            AI confidence improves as templates and policies are tuned.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-yellow-500">•</span>
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            Some tickets will be flagged for human review based on confidence threshold.
                                        </span>
                                    </li>
                                </ul>
                            </motion.div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
