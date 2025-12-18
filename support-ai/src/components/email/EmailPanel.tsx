'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronUp,
    ChevronDown,
    Link2,
    Sparkles,
    RefreshCcw,
    SlidersHorizontal,
    Edit3,
    Send,
    Paperclip,
    CheckCircle2
} from 'lucide-react';
import { Email } from '@/lib/mockData';
import { Button, IconButton } from '@/components/ui/Button';
import { Badge, ScoreBadge } from '@/components/ui/Badge';

interface EmailPanelProps {
    email: Email | null;
    isOpen: boolean;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export function EmailPanel({ email, isOpen, onClose, onNext, onPrev }: EmailPanelProps) {
    if (!email) return null;

    const urgencyColors = {
        low: 'var(--status-success)',
        medium: 'var(--status-warning)',
        high: 'var(--status-error)',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="panel-overlay"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="panel"
                    >
                        {/* Panel Header */}
                        <div
                            className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
                            style={{
                                background: 'var(--bg-primary)',
                                borderColor: 'var(--border-primary)',
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--bg-tertiary)' }}
                                >
                                    <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-ai)' }} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        Ticket {email.ticketNumber}
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {email.aiAnalysis?.intent || email.category}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <IconButton icon={<ChevronUp className="w-4 h-4" />} onClick={onPrev} tooltip="Previous" />
                                <IconButton icon={<ChevronDown className="w-4 h-4" />} onClick={onNext} tooltip="Next" />
                                <div className="w-px h-4 mx-2" style={{ background: 'var(--border-primary)' }} />
                                <IconButton icon={<Link2 className="w-4 h-4" />} tooltip="Copy link" />
                                <IconButton icon={<X className="w-4 h-4" />} onClick={onClose} tooltip="Close" />
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
                                        style={{
                                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                            color: 'white',
                                        }}
                                    >
                                        {email.client.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {email.client.name}
                                            </h4>
                                            {email.client.isHighValue && (
                                                <Badge variant="success">HIGH VALUE</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {email.client.email} • 2 hours ago
                                        </p>
                                        {email.orderId && (
                                            <button
                                                className="text-sm font-medium mt-1"
                                                style={{ color: 'var(--accent-primary)' }}
                                            >
                                                Order {email.orderId}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <Button variant="secondary" size="sm">
                                    View Profile
                                </Button>
                            </div>

                            {/* Email Content */}
                            <div
                                className="p-4 rounded-lg text-sm leading-relaxed"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {email.content}
                            </div>

                            {/* AI Analysis */}
                            {email.aiAnalysis && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-ai)' }} />
                                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                                                AI Analysis
                                            </span>
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            Processed in {email.aiAnalysis.processingTime}
                                        </span>
                                    </div>

                                    <div
                                        className="grid grid-cols-3 gap-4 p-4 rounded-lg"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border-primary)',
                                        }}
                                    >
                                        <div>
                                            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                                Intent Detected
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-ai)' }} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {email.aiAnalysis.intent}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                                Urgency
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: urgencyColors[email.aiAnalysis.urgency] }}
                                                />
                                                <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                                                    {email.aiAnalysis.urgency}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                                Confidence Score
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {email.aiAnalysis.confidence}% High
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Draft Response */}
                            {email.draftResponse && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                Draft Response
                                            </h4>
                                            <Badge variant="ai">AI GENERATED</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                <RefreshCcw className="w-3 h-3" />
                                                Regenerate
                                            </button>
                                            <button
                                                className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors"
                                                style={{ color: 'var(--text-secondary)' }}
                                            >
                                                <SlidersHorizontal className="w-3 h-3" />
                                                Adjust Tone
                                            </button>
                                        </div>
                                    </div>

                                    <div
                                        className="p-4 rounded-lg text-sm leading-relaxed whitespace-pre-line"
                                        style={{
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border-primary)',
                                            color: 'var(--text-primary)',
                                        }}
                                    >
                                        {email.draftResponse.content}

                                        {/* Attachments */}
                                        {email.draftResponse.attachments && email.draftResponse.attachments.length > 0 && (
                                            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                                {email.draftResponse.attachments.map((attachment, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs"
                                                        style={{
                                                            background: 'var(--bg-secondary)',
                                                            color: 'var(--text-secondary)',
                                                        }}
                                                    >
                                                        <Paperclip className="w-3 h-3" style={{ color: 'var(--status-error)' }} />
                                                        <span>{attachment.name}</span>
                                                        <span style={{ color: 'var(--text-tertiary)' }}>{attachment.size}</span>
                                                        <button className="ml-1">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div
                            className="sticky bottom-0 flex items-center justify-between p-4 border-t"
                            style={{
                                background: 'var(--bg-primary)',
                                borderColor: 'var(--border-primary)',
                            }}
                        >
                            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <span className="flex items-center gap-1">
                                    <kbd
                                        className="px-1.5 py-0.5 rounded font-mono"
                                        style={{ background: 'var(--bg-tertiary)' }}
                                    >
                                        ⌘ ↵
                                    </kbd>
                                    to send
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd
                                        className="px-1.5 py-0.5 rounded font-mono"
                                        style={{ background: 'var(--bg-tertiary)' }}
                                    >
                                        Esc
                                    </kbd>
                                    to close
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" icon={<Edit3 className="w-4 h-4" />}>
                                    Modify Draft
                                </Button>
                                <Button variant="primary" icon={<Send className="w-4 h-4" />} iconPosition="right">
                                    Send Response
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
