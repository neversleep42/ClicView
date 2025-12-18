'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import {
    Puzzle,
    Check,
    X,
    ExternalLink,
    RefreshCw,
    Settings,
    Loader2,
    ShoppingBag,
    MessageSquare,
    Database,
    Mail,
    Headphones,
    BarChart3,
    Webhook,
    Key
} from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'ecommerce' | 'communication' | 'database' | 'analytics' | 'other';
    connected: boolean;
    status?: 'healthy' | 'warning' | 'error';
    lastSync?: string;
}

const integrations: Integration[] = [
    { id: 'shopify', name: 'Shopify', description: 'Sync orders, customers, and product data', icon: <ShoppingBag className="w-6 h-6" />, category: 'ecommerce', connected: true, status: 'healthy', lastSync: '2 min ago' },
    { id: 'supabase', name: 'Supabase', description: 'Database and authentication backend', icon: <Database className="w-6 h-6" />, category: 'database', connected: true, status: 'healthy', lastSync: 'Real-time' },
    { id: 'slack', name: 'Slack', description: 'Team notifications and alerts', icon: <MessageSquare className="w-6 h-6" />, category: 'communication', connected: false },
    { id: 'zendesk', name: 'Zendesk', description: 'Import existing tickets and contacts', icon: <Headphones className="w-6 h-6" />, category: 'communication', connected: false },
    { id: 'gmail', name: 'Gmail', description: 'Send and receive support emails', icon: <Mail className="w-6 h-6" />, category: 'communication', connected: true, status: 'warning', lastSync: '15 min ago' },
    { id: 'analytics', name: 'Google Analytics', description: 'Track support metrics and trends', icon: <BarChart3 className="w-6 h-6" />, category: 'analytics', connected: false },
    { id: 'webhook', name: 'Webhooks', description: 'Custom integrations via webhooks', icon: <Webhook className="w-6 h-6" />, category: 'other', connected: true, status: 'healthy', lastSync: 'Active' },
];

const categories = [
    { id: 'all', label: 'All' },
    { id: 'ecommerce', label: 'E-commerce' },
    { id: 'communication', label: 'Communication' },
    { id: 'database', label: 'Database' },
    { id: 'analytics', label: 'Analytics' },
];

function IntegrationCard({ integration, onToggle }: { integration: Integration; onToggle: () => void }) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsConnecting(false);
        onToggle();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border transition-all hover:shadow-md"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{
                            background: integration.connected ? 'var(--accent-green-bg)' : 'var(--bg-secondary)',
                            color: integration.connected ? 'var(--accent-green-dark)' : 'var(--text-tertiary)'
                        }}
                    >
                        {integration.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{integration.name}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{integration.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                {integration.connected ? (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: integration.status === 'healthy' ? 'var(--accent-green)' :
                                        integration.status === 'warning' ? 'var(--status-delivery)' : 'var(--status-pending)'
                                }}
                            />
                            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                {integration.status === 'healthy' ? 'Connected' :
                                    integration.status === 'warning' ? 'Sync delayed' : 'Error'}
                            </span>
                        </div>
                        {integration.lastSync && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                Last sync: {integration.lastSync}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Not connected</span>
                )}

                <div className="flex items-center gap-2">
                    {integration.connected && (
                        <>
                            <motion.button
                                className="btn-ghost p-2 rounded-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Settings"
                            >
                                <Settings className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            </motion.button>
                            <motion.button
                                className="btn-ghost p-2 rounded-lg"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Refresh"
                            >
                                <RefreshCw className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                            </motion.button>
                        </>
                    )}
                    <motion.button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className={`btn ${integration.connected ? 'btn-secondary' : 'btn-primary'} min-w-[100px]`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isConnecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : integration.connected ? (
                            <>
                                <X className="w-4 h-4" />
                                Disconnect
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Connect
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

export default function IntegrationsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [connectedIntegrations, setConnectedIntegrations] = useState<Record<string, boolean>>(
        Object.fromEntries(integrations.map(i => [i.id, i.connected]))
    );

    const filteredIntegrations = integrations.filter(i =>
        selectedCategory === 'all' || i.category === selectedCategory
    );

    const toggleConnection = (id: string) => {
        setConnectedIntegrations(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const connectedCount = Object.values(connectedIntegrations).filter(Boolean).length;

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Integrations
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Connect your favorite tools to supercharge SupportAI.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Key className="w-4 h-4" />
                            API Keys
                        </motion.button>
                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ExternalLink className="w-4 h-4" />
                            Browse Marketplace
                        </motion.button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bento-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                <Puzzle className="w-6 h-6" style={{ color: 'var(--accent-green-dark)' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{connectedCount}</p>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Connected</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bento-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--status-completed-bg)' }}>
                                <Check className="w-6 h-6" style={{ color: '#15803d' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>3</p>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Healthy</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bento-card"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                                <RefreshCw className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>12.4k</p>
                                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Syncs today</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="tab-group">
                        {categories.map(cat => (
                            <motion.button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`tab-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {cat.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Integration Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredIntegrations.map((integration, i) => (
                            <IntegrationCard
                                key={integration.id}
                                integration={{ ...integration, connected: connectedIntegrations[integration.id] }}
                                onToggle={() => toggleConnection(integration.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Request Integration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-6 rounded-xl border-2 border-dashed text-center"
                    style={{ borderColor: 'var(--border-primary)' }}
                >
                    <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Don&apos;t see what you need?
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                        Request a new integration and we&apos;ll prioritize it based on demand.
                    </p>
                    <button className="btn btn-secondary">Request Integration</button>
                </motion.div>
            </main>
        </div>
    );
}
