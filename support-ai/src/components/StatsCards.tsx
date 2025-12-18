'use client';

import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { dashboardStats } from '@/lib/data';

interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    trendDirection: 'up' | 'down';
    trendLabel: string;
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

                <div className={`trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : (
                        <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{trend}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{trendLabel}</span>
                </div>
            </div>
        </div>
    );
}

export function StatsCards() {
    const stats = [
        {
            title: 'Pending Tickets',
            value: dashboardStats.pendingTickets.value,
            trend: dashboardStats.pendingTickets.trend,
            trendDirection: dashboardStats.pendingTickets.trendDirection,
            trendLabel: dashboardStats.pendingTickets.label,
        },
        {
            title: 'Avg Response Time',
            value: dashboardStats.avgResponseTime.value,
            trend: dashboardStats.avgResponseTime.trend,
            trendDirection: dashboardStats.avgResponseTime.trendDirection,
            trendLabel: dashboardStats.avgResponseTime.label,
        },
        {
            title: 'AI Resolution Rate',
            value: dashboardStats.aiResolutionRate.value,
            trend: dashboardStats.aiResolutionRate.trend,
            trendDirection: dashboardStats.aiResolutionRate.trendDirection,
            trendLabel: dashboardStats.aiResolutionRate.label,
        },
        {
            title: 'Customer Satisfaction',
            value: dashboardStats.customerSatisfaction.value,
            trend: dashboardStats.customerSatisfaction.trend,
            trendDirection: dashboardStats.customerSatisfaction.trendDirection,
            trendLabel: dashboardStats.customerSatisfaction.label,
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
