'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Sparkles,
    Send,
    RefreshCcw,
    ThumbsUp,
    ThumbsDown,
    Clock,
    User,
    Archive,
    Loader2
} from 'lucide-react';
import { Ticket, getCategoryLabel, getSentimentEmoji } from '@/lib/data';
import { useToast } from './Toast';

interface TicketDetailPanelProps {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
    onSend?: (ticketId: string) => void;
    onArchive?: (ticketId: string) => void;
}

export function TicketDetailPanel({ ticket, isOpen, onClose, onSend, onArchive }: TicketDetailPanelProps) {
    const { addToast } = useToast();
    const [isSending, setIsSending] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [draftContent, setDraftContent] = useState('');

    // Initialize draft content when ticket changes
    useState(() => {
        if (ticket?.draftResponse) {
            setDraftContent(ticket.draftResponse);
        }
    });

    if (!ticket) return null;

    const handleSend = async () => {
        setIsSending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSending(false);

        addToast('success', 'Reply Sent', `Response sent to ${ticket.customer.name}`);
        onSend?.(ticket.id);
        onClose();
    };

    const handleArchive = async () => {
        setIsArchiving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsArchiving(false);

        addToast('info', 'Ticket Archived', `Ticket ${ticket.ticketNumber} moved to archive`);
        onArchive?.(ticket.id);
        onClose();
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRegenerating(false);
        addToast('success', 'Draft Regenerated', 'AI has created a new response');
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
                        {/* Header */}
                        <div
                            className="sticky top-0 z-10 flex items-center justify-between p-5 border-b"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                                        {ticket.ticketNumber}
                                    </span>
                                    <span className={`badge ${ticket.aiStatus === 'resolved' ? 'badge-completed' :
                                            ticket.aiStatus === 'draft_ready' ? 'badge-process' :
                                                ticket.aiStatus === 'human_needed' ? 'badge-human' : 'badge-pending'
                                        }`}>
                                        {ticket.aiStatus === 'resolved' ? 'Resolved' :
                                            ticket.aiStatus === 'draft_ready' ? 'Draft Ready' :
                                                ticket.aiStatus === 'human_needed' ? 'Human Needed' : 'Pending'}
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {ticket.subject}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    onClick={handleArchive}
                                    disabled={isArchiving}
                                    className="btn btn-secondary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                                    Archive
                                </motion.button>
                                <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-6">
                            {/* AI Insight Card */}
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-green-bg), transparent)',
                                    border: '1px solid var(--accent-green-light)',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-green-dark)' }} />
                                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-green-dark)' }}>
                                        AI Analysis
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Category</p>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {getCategoryLabel(ticket.category)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Sentiment</p>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {getSentimentEmoji(ticket.sentiment)} {ticket.sentiment}/10
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Confidence</p>
                                        <p className="font-medium" style={{ color: 'var(--accent-green-dark)' }}>
                                            {ticket.aiStatus === 'resolved' ? '95%' :
                                                ticket.aiStatus === 'draft_ready' ? '85%' : '45%'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        {ticket.customer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.customer.name}</p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{ticket.customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>{ticket.date}</span>
                                </div>
                            </div>

                            {/* Original Message */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <User className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                                    <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                                        Customer Message
                                    </h3>
                                </div>
                                <div
                                    className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-line"
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                >
                                    {ticket.content}
                                </div>
                            </div>

                            {/* AI Draft Response */}
                            {ticket.draftResponse && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                            <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                                                AI Draft Response
                                            </h3>
                                        </div>
                                        <motion.button
                                            onClick={handleRegenerate}
                                            disabled={isRegenerating}
                                            className="btn-ghost p-2 rounded-lg text-sm flex items-center gap-1"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isRegenerating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCcw className="w-4 h-4" />
                                            )}
                                            Regenerate
                                        </motion.button>
                                    </div>

                                    {isRegenerating ? (
                                        <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--accent-green-bg)' }}>
                                            <div className="skeleton h-4 w-full" />
                                            <div className="skeleton h-4 w-4/5" />
                                            <div className="skeleton h-4 w-3/4" />
                                            <div className="skeleton h-4 w-full" />
                                        </div>
                                    ) : (
                                        <textarea
                                            value={draftContent || ticket.draftResponse}
                                            onChange={(e) => setDraftContent(e.target.value)}
                                            className="w-full p-4 rounded-xl text-sm leading-relaxed resize-none min-h-[200px] outline-none focus:ring-2"
                                            style={{
                                                background: 'var(--accent-green-bg)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid var(--accent-green-light)',
                                            }}
                                        />
                                    )}

                                    {/* Feedback */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <motion.button
                                            className="btn-ghost p-2 rounded-lg"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            className="btn-ghost p-2 rounded-lg"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                        </motion.button>
                                        <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>
                                            Was this draft helpful?
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Human Review Notice */}
                            {!ticket.draftResponse && ticket.aiStatus === 'human_needed' && (
                                <div className="p-4 rounded-xl text-center" style={{ background: 'var(--status-human-bg)', border: '1px solid #c4b5fd' }}>
                                    <p className="font-medium mb-2" style={{ color: '#7c3aed' }}>Human Review Required</p>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                        This ticket requires manual review due to its complexity.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div
                            className="sticky bottom-0 flex items-center justify-between p-5 border-t"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            <button className="btn btn-secondary">Edit Draft</button>
                            <motion.button
                                onClick={handleSend}
                                disabled={isSending}
                                className="btn btn-primary min-w-[140px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Response
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
