'use client';

import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendDirection?: 'up' | 'down';
    trendLabel?: string;
}

function StatCard({ title, value, trend, trendDirection, trendLabel }: StatCardProps) {
    const isPositive = trendDirection === 'up';

    return (
        <div className="stat-card">
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {title}
                </h3>
                <Info className="info-icon" />
            </div>

            <div className="flex items-end gap-3">
                <span
                    className="text-3xl font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {value}
                </span>

                {trend && trendDirection && trendLabel && (
                    <div className={`trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{trend}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{trendLabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function StatsCards() {
    const analyticsQuery = useAnalytics('7d');
    const analytics = analyticsQuery.data?.analytics;

    const formatDuration = (seconds: number | null | undefined) => {
        if (seconds == null) return '—';
        const s = Math.max(0, Math.floor(seconds));
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}m ${secs}s`;
    };

    const stats = [
        {
            title: 'Pending Tickets',
            value: analytics ? analytics.summary.openTickets : '—',
        },
        {
            title: 'Avg Handle Time',
            value: analytics ? formatDuration(analytics.summary.avgHandleTimeSeconds) : '—',
        },
        {
            title: 'AI Resolution Rate',
            value: analytics?.summary.aiResolutionRate == null ? '—' : `${Math.round(analytics.summary.aiResolutionRate * 100)}%`,
        },
        {
            title: 'Customer Satisfaction',
            value: analytics?.summary.csatScore == null ? '—' : analytics.summary.csatScore.toFixed(1),
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
}
