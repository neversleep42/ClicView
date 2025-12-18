'use client';

import { useState, useRef, useEffect } from 'react';
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize draft content when ticket changes
    useEffect(() => {
        if (ticket?.draftResponse) {
            setDraftContent(ticket.draftResponse);
        } else {
            setDraftContent('');
        }
    }, [ticket]);

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
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white shadow-lg flex flex-col z-50 border-l"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                    >
                        {/* Header */}
                        <div
                            className="flex items-center justify-between p-5 border-b"
                            style={{ borderColor: 'var(--border-primary)' }}
                        >
                            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Ticket {ticket.ticketNumber}
                            </h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Customer Info */}
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-secondary/50">
                                <User size={20} className="text-gray-500" />
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {ticket.customer.name} ({ticket.customer.email})
                                </span>
                            </div>

                            {/* Ticket Details */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {ticket.subject}
                                </h3>
                                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                    {ticket.content}
                                </p>
                                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 pt-2">
                                    <Clock size={14} />
                                    <span>{ticket.date}</span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {getCategoryLabel(ticket.category)}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {ticket.priority}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        {getSentimentEmoji(ticket.sentiment)} {ticket.sentiment}/10
                                    </span>
                                </div>
                            </div>

                            {/* AI Draft Response */}
                            {ticket.draftResponse && (
                                <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                            <Sparkles size={16} className="text-yellow-500" /> AI Draft Response
                                        </h4>
                                        <button
                                            onClick={handleRegenerate}
                                            className="btn btn-ghost btn-sm h-8 px-2 text-xs flex items-center gap-1"
                                            disabled={isRegenerating}
                                        >
                                            {isRegenerating ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <RefreshCcw size={14} />
                                            )}
                                            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                                        </button>
                                    </div>

                                    {isRegenerating ? (
                                        <div className="space-y-3 p-4 rounded-xl bg-secondary/30 animate-pulse">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                                        </div>
                                    ) : (
                                        <textarea
                                            ref={textareaRef}
                                            value={draftContent}
                                            onChange={(e) => setDraftContent(e.target.value)}
                                            className="w-full p-4 rounded-xl text-sm leading-relaxed resize-none min-h-[200px] outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary/30"
                                            style={{
                                                color: 'var(--text-primary)',
                                            }}
                                        />
                                    )}

                                    {/* Feedback */}
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button className="btn btn-ghost btn-sm h-8 px-2 flex items-center gap-1 text-gray-500 hover:text-green-500">
                                            <ThumbsUp size={14} />
                                        </button>
                                        <button className="btn btn-ghost btn-sm h-8 px-2 flex items-center gap-1 text-gray-500 hover:text-red-500">
                                            <ThumbsDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div
                            className="sticky bottom-0 flex items-center justify-between p-5 border-t bg-white dark:bg-slate-900"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            <button
                                onClick={() => textareaRef.current?.focus()}
                                className="btn btn-secondary"
                            >
                                Edit Draft
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleArchive}
                                    className="btn btn-secondary flex items-center gap-2"
                                    disabled={isArchiving}
                                >
                                    {isArchiving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Archive size={16} />
                                    )}
                                    Archive
                                </button>
                                <button
                                    onClick={handleSend}
                                    className="btn btn-primary flex items-center gap-2"
                                    disabled={isSending}
                                >
                                    {isSending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
