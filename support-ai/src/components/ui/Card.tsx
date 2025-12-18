'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    elevated?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

const paddingMap = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export function Card({
    children,
    className = '',
    hover = true,
    elevated = false,
    padding = 'md',
    onClick,
}: CardProps) {
    const baseClasses = elevated ? 'card-elevated' : 'card';
    const paddingClass = paddingMap[padding];
    const cursorClass = onClick ? 'cursor-pointer' : '';

    return (
        <motion.div
            className={`${baseClasses} ${paddingClass} ${cursorClass} ${className}`}
            onClick={onClick}
            whileHover={hover ? { scale: 1.005 } : undefined}
            transition={{ duration: 0.15 }}
        >
            {children}
        </motion.div>
    );
}

// Stat Card for dashboard KPIs
interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    badge?: {
        text: string;
        variant: 'success' | 'warning' | 'error' | 'info';
    };
    trend?: {
        value: string;
        positive?: boolean;
    };
    className?: string;
}

const badgeVariants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
};

export function StatCard({
    label,
    value,
    icon,
    badge,
    trend,
    className = ''
}: StatCardProps) {
    return (
        <Card className={className} hover>
            <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </span>
                {icon && (
                    <span style={{ color: 'var(--text-tertiary)' }}>
                        {icon}
                    </span>
                )}
            </div>

            <div className="flex items-end gap-3">
                <span className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {value}
                </span>

                {badge && (
                    <span className={`badge ${badgeVariants[badge.variant]}`}>
                        {badge.text}
                    </span>
                )}

                {trend && (
                    <span
                        className="text-sm font-medium"
                        style={{ color: trend.positive ? 'var(--status-success)' : 'var(--status-error)' }}
                    >
                        {trend.positive ? '↗' : '↘'} {trend.value}
                    </span>
                )}
            </div>
        </Card>
    );
}
