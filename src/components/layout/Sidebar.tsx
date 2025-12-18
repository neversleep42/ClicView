'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Inbox,
    Settings,
    BarChart3,
    Bot,
    ChevronDown
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Inbox', href: '/inbox', icon: <Inbox className="w-4 h-4" />, badge: 12 },
    { name: 'AI Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar w-60 h-screen flex flex-col fixed left-0 top-0">
            {/* Logo */}
            <div className="p-4 flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-ai), var(--accent-primary))',
                    }}
                >
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        Support AI
                    </h1>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        v2.4 Active
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.15 }}
                            >
                                {item.icon}
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <span
                                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                                        style={{
                                            background: 'var(--accent-primary)',
                                            color: 'white',
                                        }}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div
                className="p-4 border-t"
                style={{ borderColor: 'var(--border-primary)' }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            color: 'white',
                        }}
                    >
                        AC
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            Alex Chen
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                            Admin
                        </p>
                    </div>
                    <ChevronDown
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: 'var(--text-tertiary)' }}
                    />
                </div>
            </div>
        </aside>
    );
}
