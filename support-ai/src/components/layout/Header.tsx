'use client';

import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { IconButton } from '@/components/ui/Button';

interface HeaderProps {
    title?: string;
    showSearch?: boolean;
    tabs?: { name: string; active?: boolean; href?: string }[];
}

export function Header({ title, showSearch = true, tabs }: HeaderProps) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <header
            className="h-14 flex items-center justify-between px-6 border-b"
            style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
            }}
        >
            {/* Left side - Title or Search */}
            <div className="flex items-center gap-4">
                {title && (
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                )}

                {showSearch && (
                    <div
                        className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg w-80"
                        style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-primary)',
                        }}
                    >
                        <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search emails, clients, or orders (Cmd+K)"
                            className="flex-1 bg-transparent text-sm outline-none"
                            style={{ color: 'var(--text-primary)' }}
                        />
                        <kbd
                            className="px-1.5 py-0.5 rounded text-xs font-mono"
                            style={{
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-tertiary)',
                            }}
                        >
                            ⌘K
                        </kbd>
                    </div>
                )}
            </div>

            {/* Center - Tabs */}
            {tabs && tabs.length > 0 && (
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab.active
                                    ? 'bg-[var(--bg-tertiary)]'
                                    : 'hover:bg-[var(--bg-secondary)]'
                                }`}
                            style={{
                                color: tab.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                            }}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
                <IconButton
                    icon={resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    onClick={toggleTheme}
                    tooltip={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                />
                <IconButton
                    icon={<Bell className="w-4 h-4" />}
                    tooltip="Notifications"
                />
                <IconButton
                    icon={<Settings className="w-4 h-4" />}
                    tooltip="Settings"
                />
                <div
                    className="w-8 h-8 rounded-full ml-2 overflow-hidden"
                    style={{ background: 'var(--bg-tertiary)' }}
                >
                    <div
                        className="w-full h-full flex items-center justify-center text-xs font-medium"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            color: 'white',
                        }}
                    >
                        AC
                    </div>
                </div>
            </div>
        </header>
    );
}
