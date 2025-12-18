'use client';

import { ReactNode } from 'react';
import {
    ArrowLeft,
    Package,
    Truck,
    RefreshCcw,
    HelpCircle,
    ThumbsUp,
    Store,
    AlertTriangle,
    Clock,
    CheckCircle2
} from 'lucide-react';

// Status Badge
type StatusType = 'open' | 'read' | 'done' | 'pending' | 'escalated';

const statusConfig: Record<StatusType, { color: string; icon?: ReactNode; label: string }> = {
    open: {
        color: 'bg-red-500',
        label: 'Open'
    },
    read: {
        color: 'bg-gray-400',
        label: 'Read'
    },
    done: {
        color: 'bg-emerald-500',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: 'Done'
    },
    pending: {
        color: 'bg-amber-500',
        icon: <Clock className="w-3 h-3" />,
        label: 'Pending'
    },
    escalated: {
        color: 'bg-violet-500',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: 'Escalated'
    },
};

interface StatusBadgeProps {
    status: StatusType;
    showLabel?: boolean;
}

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <div className="flex items-center gap-2">
            <div className={`status-dot ${config.color}`} />
            {showLabel && (
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {config.label}
                </span>
            )}
        </div>
    );
}

// Category Badge
type CategoryType = 'returns' | 'shipping' | 'refund' | 'general' | 'feedback' | 'store';

const categoryConfig: Record<CategoryType, {
    icon: ReactNode;
    label: string;
    className: string;
}> = {
    returns: {
        icon: <ArrowLeft className="w-3 h-3" />,
        label: 'Returns',
        className: 'badge-returns',
    },
    shipping: {
        icon: <Truck className="w-3 h-3" />,
        label: 'Shipping',
        className: 'badge-shipping',
    },
    refund: {
        icon: <RefreshCcw className="w-3 h-3" />,
        label: 'Refund',
        className: 'badge-refund',
    },
    general: {
        icon: <HelpCircle className="w-3 h-3" />,
        label: 'General',
        className: 'badge-general',
    },
    feedback: {
        icon: <ThumbsUp className="w-3 h-3" />,
        label: 'Feedback',
        className: 'badge-feedback',
    },
    store: {
        icon: <Store className="w-3 h-3" />,
        label: 'Store',
        className: 'badge-store',
    },
};

interface CategoryBadgeProps {
    category: CategoryType;
    showIcon?: boolean;
}

export function CategoryBadge({ category, showIcon = true }: CategoryBadgeProps) {
    const config = categoryConfig[category];

    return (
        <span className={`badge ${config.className}`}>
            {showIcon && config.icon}
            {config.label}
        </span>
    );
}

// Score Badge - displays AI confidence score
interface ScoreBadgeProps {
    score: number;
    size?: 'sm' | 'md';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
    let colorClass = 'score-high';
    if (score < 60) {
        colorClass = 'score-low';
    } else if (score < 80) {
        colorClass = 'score-medium';
    }

    const sizeClasses = size === 'sm'
        ? 'text-xs px-1.5 py-0.5 min-w-[32px]'
        : 'text-sm px-2 py-1 min-w-[40px]';

    return (
        <span
            className={`inline-flex items-center justify-center rounded-md font-semibold ${colorClass} ${sizeClasses}`}
        >
            {score}
        </span>
    );
}

// Base Badge for custom use
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'ai';
    className?: string;
}

const variantClasses: Record<string, string> = {
    default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    ai: 'badge-ai',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    return (
        <span className={`badge ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
}

// Activity Badge for Recent Activity
type ActivityType = 'resolved' | 'drafted' | 'escalated' | 'pending';

const activityConfig: Record<ActivityType, { label: string; className: string }> = {
    resolved: { label: 'RESOLVED', className: 'badge-success' },
    drafted: { label: 'DRAFTED', className: 'badge-info' },
    escalated: { label: 'ESCALATED', className: 'badge-warning' },
    pending: { label: 'PENDING', className: 'badge-error' },
};

interface ActivityBadgeProps {
    type: ActivityType;
}

export function ActivityBadge({ type }: ActivityBadgeProps) {
    const config = activityConfig[type];
    return (
        <span className={`badge text-[10px] uppercase tracking-wider ${config.className}`}>
            {config.label}
        </span>
    );
}
