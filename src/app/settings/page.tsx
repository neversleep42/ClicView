'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Settings as SettingsIcon, Bot, Puzzle, Check, AlertCircle } from 'lucide-react';

type TabType = 'general' | 'ai-persona' | 'integrations';

const tabs = [
    { id: 'general' as TabType, label: 'General', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'ai-persona' as TabType, label: 'AI Persona', icon: <Bot className="w-4 h-4" /> },
    { id: 'integrations' as TabType, label: 'Integrations', icon: <Puzzle className="w-4 h-4" /> },
];

// Toggle Switch Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className="w-11 h-6 rounded-full relative transition-colors"
            style={{ background: enabled ? 'var(--accent-green)' : 'var(--border-primary)' }}
        >
            <motion.div
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                animate={{ x: enabled ? 24 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
}

// Slider Component
function Slider({ value, onChange, labels }: { value: number; onChange: (val: number) => void; labels: string[] }) {
    return (
        <div className="space-y-3">
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, var(--accent-green) ${value}%, var(--border-primary) ${value}%)`,
                }}
            />
            <div className="flex justify-between">
                {labels.map((label, i) => (
                    <span key={i} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                ))}
            </div>
        </div>
    );
}

// Integration Card
function IntegrationCard({ name, description, connected, icon }: { name: string; description: string; connected: boolean; icon: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'var(--bg-secondary)' }}>
                    {icon}
                </div>
                <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
                </div>
            </div>
            {connected ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-green-bg)' }}>
                    <Check className="w-4 h-4" style={{ color: 'var(--accent-green-dark)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--accent-green-dark)' }}>Connected</span>
                </div>
            ) : (
                <button className="btn btn-secondary">Connect</button>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [settings, setSettings] = useState({
        autoReply: true,
        emailNotifications: true,
        slackNotifications: false,
        aiEnabled: true,
        toneValue: 50,
        confidenceThreshold: 75,
    });

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Settings
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Configure your AI agent and account preferences.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id ? 'shadow-sm' : ''
                                }`}
                            style={{
                                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bento-card max-w-2xl"
                >
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>General Settings</h3>

                            <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>AI Auto-Reply</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Automatically respond to high-confidence tickets</p>
                                </div>
                                <Toggle enabled={settings.autoReply} onChange={(val) => setSettings({ ...settings, autoReply: val })} />
                            </div>

                            <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Email Notifications</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Receive email alerts for escalated tickets</p>
                                </div>
                                <Toggle enabled={settings.emailNotifications} onChange={(val) => setSettings({ ...settings, emailNotifications: val })} />
                            </div>

                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Slack Notifications</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Post updates to your Slack channel</p>
                                </div>
                                <Toggle enabled={settings.slackNotifications} onChange={(val) => setSettings({ ...settings, slackNotifications: val })} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai-persona' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Persona Configuration</h3>

                            <div className="py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>AI Agent Enabled</p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Toggle AI assistance on/off</p>
                                    </div>
                                    <Toggle enabled={settings.aiEnabled} onChange={(val) => setSettings({ ...settings, aiEnabled: val })} />
                                </div>
                            </div>

                            <div className="py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <p className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Tone of Voice</p>
                                <Slider
                                    value={settings.toneValue}
                                    onChange={(val) => setSettings({ ...settings, toneValue: val })}
                                    labels={['Formal', 'Balanced', 'Friendly']}
                                />
                            </div>

                            <div className="py-4">
                                <p className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Confidence Threshold</p>
                                <Slider
                                    value={settings.confidenceThreshold}
                                    onChange={(val) => setSettings({ ...settings, confidenceThreshold: val })}
                                    labels={['Low (50%)', 'Medium (75%)', 'High (95%)']}
                                />
                                <div className="mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: 'var(--status-delivery-bg)' }}>
                                    <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: 'var(--status-delivery)' }} />
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        Tickets below {settings.confidenceThreshold}% confidence will be flagged for human review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Connected Services</h3>

                            <div className="space-y-4">
                                <IntegrationCard name="Shopify" description="Sync orders and customer data" connected={true} icon="🛒" />
                                <IntegrationCard name="Supabase" description="Database and authentication" connected={true} icon="⚡" />
                                <IntegrationCard name="Slack" description="Team notifications" connected={false} icon="💬" />
                                <IntegrationCard name="Zendesk" description="Import existing tickets" connected={false} icon="🎫" />
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}
