'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import {
    Bot,
    Sparkles,
    MessageSquare,
    Shield,
    Sliders,
    Save,
    RotateCcw,
    AlertCircle,
    CheckCircle,
    Zap
} from 'lucide-react';
import { AddTemplateModal } from '@/components/AddTemplateModal';
import { useToast } from '@/components/Toast';

// Toggle Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{ background: enabled ? 'var(--accent-green)' : 'var(--border-primary)' }}
        >
            <motion.div
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                animate={{ x: enabled ? 26 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );
}

// Slider Component
function Slider({ value, onChange, min = 0, max = 100, labels }: {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    labels?: string[];
}) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-3">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, var(--accent-green) ${percentage}%, var(--border-primary) ${percentage}%)`,
                }}
            />
            {labels && (
                <div className="flex justify-between">
                    {labels.map((label, i) => (
                        <span key={i} className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

// Persona Card Component
function PersonaCard({
    name,
    description,
    icon,
    selected,
    onClick
}: {
    name: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            className="p-4 rounded-xl text-left transition-all"
            style={{
                background: selected ? 'var(--accent-green-bg)' : 'var(--bg-secondary)',
                border: `2px solid ${selected ? 'var(--accent-green)' : 'var(--border-primary)'}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3 mb-2">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                        background: selected ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                        color: selected ? 'white' : 'var(--text-secondary)',
                    }}
                >
                    {icon}
                </div>
                <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{name}</p>
                    {selected && (
                        <span className="text-xs" style={{ color: 'var(--accent-green-dark)' }}>Active</span>
                    )}
                </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{description}</p>
        </motion.button>
    );
}

// Template Preview Card
function TemplateCard({ title, category, preview }: { title: string; category: string; preview: string }) {
    return (
        <div
            className="p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{title}</span>
                <span
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ background: 'var(--accent-green-bg)', color: 'var(--accent-green-dark)' }}
                >
                    {category}
                </span>
            </div>
            <p className="text-sm line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{preview}</p>
        </div>
    );
}

export default function AISettingsPage() {
    const { addToast } = useToast();
    const [settings, setSettings] = useState({
        aiEnabled: true,
        autoReply: true,
        learningMode: true,
        confidenceThreshold: 75,
        maxResponseLength: 300,
        toneValue: 50,
        selectedPersona: 'professional',
    });
    const [saved, setSaved] = useState(false);
    const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);

    // Default templates moved to state
    const [templates, setTemplates] = useState([
        { title: 'Order Status Update', category: 'Shipping', preview: 'Thank you for reaching out! I can see your order #{{order_id}} is currently...' },
        { title: 'Refund Confirmation', category: 'Returns', preview: 'Your refund request has been approved. You should see the amount...' },
        { title: 'Product Inquiry', category: 'General', preview: 'Great question! The {{product_name}} is available in multiple sizes...' },
    ]);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        addToast('success', 'Settings Saved', 'Your AI configuration has been updated.');
    };

    const handleAddTemplate = (newTemplate: any) => {
        setTemplates([...templates, newTemplate]);
        addToast('success', 'Template Created', `New template "${newTemplate.title}" added.`);
    };

    const personas = [
        { id: 'professional', name: 'Professional', description: 'Formal and courteous business tone', icon: <Shield className="w-5 h-5" /> },
        { id: 'friendly', name: 'Friendly', description: 'Warm and approachable casual style', icon: <MessageSquare className="w-5 h-5" /> },
        { id: 'concise', name: 'Concise', description: 'Short and straight to the point', icon: <Zap className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            AI Settings
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Configure your AI agent&apos;s behavior, tone, and response preferences.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            className="btn btn-secondary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Default
                        </motion.button>
                        <motion.button
                            onClick={handleSave}
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved ? 'Saved!' : 'Save Changes'}
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - Main Settings */}
                    <div className="col-span-8 space-y-6">
                        {/* AI Core Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bento-card"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                    <Bot className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Core Settings</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Control the AI agent&apos;s main behavior</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>AI Agent Enabled</p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Turn the AI assistant on or off globally</p>
                                    </div>
                                    <Toggle enabled={settings.aiEnabled} onChange={(val) => setSettings({ ...settings, aiEnabled: val })} />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Auto-Reply</p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Automatically send responses for high-confidence tickets</p>
                                    </div>
                                    <Toggle enabled={settings.autoReply} onChange={(val) => setSettings({ ...settings, autoReply: val })} />
                                </div>

                                <div className="flex items-center justify-between py-4">
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Learning Mode</p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Allow AI to learn from your corrections and feedback</p>
                                    </div>
                                    <Toggle enabled={settings.learningMode} onChange={(val) => setSettings({ ...settings, learningMode: val })} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Response Configuration */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bento-card"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                    <Sliders className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Response Configuration</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Fine-tune how AI generates responses</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Confidence Threshold</p>
                                        <span className="text-sm font-mono tabular-nums" style={{ color: 'var(--accent-green-dark)' }}>{settings.confidenceThreshold}%</span>
                                    </div>
                                    <Slider
                                        value={settings.confidenceThreshold}
                                        onChange={(val) => setSettings({ ...settings, confidenceThreshold: val })}
                                        min={50}
                                        max={95}
                                        labels={['Aggressive (50%)', 'Balanced (75%)', 'Conservative (95%)']}
                                    />
                                    <div className="mt-3 p-3 rounded-lg flex items-start gap-2" style={{ background: 'var(--status-delivery-bg)' }}>
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--status-delivery)' }} />
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            Tickets below {settings.confidenceThreshold}% confidence will require human review before sending.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Max Response Length</p>
                                        <span className="text-sm font-mono tabular-nums" style={{ color: 'var(--accent-green-dark)' }}>{settings.maxResponseLength} words</span>
                                    </div>
                                    <Slider
                                        value={settings.maxResponseLength}
                                        onChange={(val) => setSettings({ ...settings, maxResponseLength: val })}
                                        min={100}
                                        max={500}
                                        labels={['Short (100)', 'Medium (300)', 'Long (500)']}
                                    />
                                </div>

                                <div>
                                    <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Tone of Voice</p>
                                    <Slider
                                        value={settings.toneValue}
                                        onChange={(val) => setSettings({ ...settings, toneValue: val })}
                                        labels={['Formal', 'Balanced', 'Casual']}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* AI Personas */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bento-card"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-green-bg)' }}>
                                    <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>AI Persona</h3>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Choose your AI&apos;s communication style</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {personas.map((persona) => (
                                    <PersonaCard
                                        key={persona.id}
                                        {...persona}
                                        selected={settings.selectedPersona === persona.id}
                                        onClick={() => setSettings({ ...settings, selectedPersona: persona.id })}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Templates & Preview */}
                    <div className="col-span-4 space-y-6">
                        {/* AI Status */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bento-card"
                            style={{ background: 'linear-gradient(135deg, var(--accent-green-bg), var(--bg-card))' }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="ai-status-dot" />
                                <span className="font-medium" style={{ color: 'var(--accent-green-dark)' }}>AI Agent Active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>847</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Responses today</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>94%</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Accuracy rate</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Response Templates */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bento-card"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Response Templates</h3>
                                <button className="text-sm font-medium" style={{ color: 'var(--accent-green-dark)' }}>View All</button>
                            </div>
                            <div className="space-y-3">
                                {templates.map((template, i) => (
                                    <TemplateCard key={i} {...template} />
                                ))}
                            </div>
                            <button
                                onClick={() => setIsAddTemplateOpen(true)}
                                className="btn btn-secondary w-full mt-4"
                            >
                                + Add New Template
                            </button>
                        </motion.div>

                        {/* Tips */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bento-card"
                        >
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>💡 Pro Tips</h3>
                            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <li>• Lower confidence thresholds increase automation but may reduce accuracy</li>
                                <li>• Enable Learning Mode to improve AI over time</li>
                                <li>• Use templates for consistent brand voice</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </main>

            <AddTemplateModal
                isOpen={isAddTemplateOpen}
                onClose={() => setIsAddTemplateOpen(false)}
                onSubmit={handleAddTemplate}
            />
        </div>
    );
}
