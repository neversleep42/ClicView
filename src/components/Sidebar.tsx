'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Inbox,
    BarChart3,
    Users,
    Settings,
    Puzzle,
    Bell,
    MessageSquare,
    Moon,
    Sun,
    Bot
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Inbox', href: '/inbox', icon: <Inbox className="w-5 h-5" />, badge: 14 },
    { name: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Customers', href: '/customers', icon: <Users className="w-5 h-5" />, badge: 23 },
    { name: 'AI Settings', href: '/ai-settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Integrations', href: '/integrations', icon: <Puzzle className="w-5 h-5" /> },
];

const bottomItems = [
    { name: 'Notifications', href: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Feedback', href: '/feedback', icon: <MessageSquare className="w-5 h-5" /> },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
                    >
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                        SupportAI
                    </span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link key={item.href} href={item.href}>
                            <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                                {item.icon}
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <span className="sidebar-badge">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}

                {/* Divider */}
                <div
                    className="mx-4 my-4 h-px"
                    style={{ background: 'var(--border-primary)' }}
                />

                {/* Bottom items */}
                {bottomItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div className="sidebar-item">
                            {item.icon}
                            <span className="flex-1">{item.name}</span>
                        </div>
                    </Link>
                ))}

                {/* Settings */}
                <Link href="/settings">
                    <div className="sidebar-item">
                        <Settings className="w-5 h-5" />
                        <span className="flex-1">Settings</span>
                    </div>
                </Link>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="sidebar-item w-full"
                >
                    {isDarkMode ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                    <span className="flex-1">Dark mode</span>
                    <div
                        className="w-10 h-5 rounded-full relative transition-colors"
                        style={{
                            background: isDarkMode ? 'var(--accent-green)' : 'var(--border-primary)',
                        }}
                    >
                        <div
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                            style={{
                                transform: isDarkMode ? 'translateX(20px)' : 'translateX(2px)',
                            }}
                        />
                    </div>
                </button>
            </nav>

            {/* User Profile */}
            <div
                className="p-4 border-t mx-3 mb-3"
                style={{ borderColor: 'var(--border-primary)' }}
            >
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        AC
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            Alex Chen
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                            alex@company.com
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
