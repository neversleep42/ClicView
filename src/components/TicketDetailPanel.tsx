'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, Clock, Loader2, RefreshCcw, Send, Sparkles, ThumbsDown, ThumbsUp, User, X } from 'lucide-react';

import type { TicketDTO } from '@/lib/api/contracts';
import { useArchiveTicket, usePatchTicket, useTriggerAIRun } from '@/hooks/useTickets';
import { formatTicketDate, getCategoryLabel, getSentimentEmoji } from '@/lib/ticketUi';

import { useToast } from './Toast';

interface TicketDetailPanelProps {
    ticket: TicketDTO | null;
    isOpen: boolean;
    onClose: () => void;
    onTicketUpdated?: (ticket: TicketDTO) => void;
}

export function TicketDetailPanel({ ticket, isOpen, onClose, onTicketUpdated }: TicketDetailPanelProps) {
    const { addToast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const patchTicket = usePatchTicket();
    const archiveTicket = useArchiveTicket();
    const triggerRun = useTriggerAIRun();

    const [draftContent, setDraftContent] = useState('');

    useEffect(() => {
        setDraftContent(ticket?.draftResponse ?? '');
    }, [ticket?.id, ticket?.draftResponse]);

    if (!ticket) return null;

    const saveDraftIfDirty = async () => {
        const current = ticket.draftResponse ?? '';
        if (draftContent === current) return;

        const nextDraft = draftContent.trim().length === 0 ? null : draftContent;
        const res = await patchTicket.mutateAsync({
            id: ticket.id,
            body: { draftResponse: nextDraft },
        });
        onTicketUpdated?.(res.ticket);
    };

    const handleSend = async () => {
        if (draftContent.trim().length === 0) {
            addToast('warning', 'Draft Empty', 'Write a reply before marking the ticket resolved.');
            return;
        }

        try {
            const res = await patchTicket.mutateAsync({
                id: ticket.id,
                body: { status: 'resolved', draftResponse: draftContent },
            });
            onTicketUpdated?.(res.ticket);
            addToast('success', 'Ticket Resolved', `Reply saved and ticket ${ticket.ticketNumber} marked as resolved.`);
            onClose();
        } catch (err: any) {
            addToast('error', 'Send Failed', err?.message ?? 'Could not resolve ticket.');
        }
    };

    const handleArchive = async () => {
        try {
            const res = await archiveTicket.mutateAsync(ticket.id);
            onTicketUpdated?.(res.ticket);
            addToast('info', 'Ticket Archived', `Ticket ${ticket.ticketNumber} moved to archive.`);
            onClose();
        } catch (err: any) {
            addToast('error', 'Archive Failed', err?.message ?? 'Could not archive ticket.');
        }
    };

    const handleRegenerate = async () => {
        try {
            const res = await triggerRun.mutateAsync({ id: ticket.id, force: true });
            onTicketUpdated?.(res.ticket);
            addToast('info', 'AI Run Started', 'Regenerating draft in the background.');
        } catch (err: any) {
            addToast('error', 'AI Run Failed', err?.message ?? 'Could not start AI run.');
        }
    };

    const isBusy = patchTicket.isPending || archiveTicket.isPending || triggerRun.isPending;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white shadow-lg flex flex-col z-50 border-l"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Ticket {ticket.ticketNumber}
                            </h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Main */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Customer */}
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-secondary/50">
                                <User size={20} className="text-gray-500" />
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {ticket.customer.name} ({ticket.customer.email})
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {ticket.subject}
                                </h3>
                                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                                    {ticket.content}
                                </p>
                                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 pt-2">
                                    <Clock size={14} />
                                    <span>{formatTicketDate(ticket.createdAt)}</span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {getCategoryLabel(ticket.category)}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {ticket.priority}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        {getSentimentEmoji(ticket.sentiment)} {ticket.sentiment == null ? '—/10' : `${ticket.sentiment}/10`}
                                    </span>
                                </div>
                            </div>

                            {/* Draft */}
                            <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <Sparkles size={16} className="text-yellow-500" /> Draft Response
                                    </h4>
                                    <button
                                        onClick={handleRegenerate}
                                        className="btn btn-ghost btn-sm h-8 px-2 text-xs flex items-center gap-1"
                                        disabled={triggerRun.isPending || isBusy}
                                        title="Regenerate AI draft"
                                    >
                                        {triggerRun.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                                        {triggerRun.isPending ? 'Regenerating...' : 'Regenerate'}
                                    </button>
                                </div>

                                <textarea
                                    ref={textareaRef}
                                    value={draftContent}
                                    onChange={(e) => setDraftContent(e.target.value)}
                                    onBlur={() => {
                                        void saveDraftIfDirty().catch((err: any) =>
                                            addToast('error', 'Save Failed', err?.message ?? 'Could not save draft.')
                                        );
                                    }}
                                    className="w-full p-4 rounded-xl text-sm leading-relaxed resize-none min-h-[200px] outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary/30"
                                    style={{ color: 'var(--text-primary)' }}
                                />

                                <div className="flex justify-end gap-2 pt-2">
                                    <button className="btn btn-ghost btn-sm h-8 px-2 flex items-center gap-1 text-gray-500 hover:text-green-500" disabled={isBusy}>
                                        <ThumbsUp size={14} />
                                    </button>
                                    <button className="btn btn-ghost btn-sm h-8 px-2 flex items-center gap-1 text-gray-500 hover:text-red-500" disabled={isBusy}>
                                        <ThumbsDown size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="sticky bottom-0 flex items-center justify-between p-5 border-t bg-white dark:bg-slate-900"
                            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
                        >
                            <button onClick={() => textareaRef.current?.focus()} className="btn btn-secondary" disabled={isBusy}>
                                Edit Draft
                            </button>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleArchive}
                                    className="btn btn-secondary flex items-center gap-2"
                                    disabled={archiveTicket.isPending || isBusy}
                                >
                                    {archiveTicket.isPending ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
                                    Archive
                                </button>
                                <button onClick={handleSend} className="btn btn-primary flex items-center gap-2" disabled={patchTicket.isPending || isBusy}>
                                    {patchTicket.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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

