'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, Clock, Loader2, RefreshCcw, Send, Sparkles, User, X } from 'lucide-react';

import type { TicketDTO, TicketMessageDTO } from '@/lib/api/contracts';
import { useArchiveTicket, usePatchTicket, useTicket, useTriggerAIRun } from '@/hooks/useTickets';
import { useCreateTicketMessage, useTicketMessages } from '@/hooks/useTicketMessages';
import { formatTicketDate, getCategoryLabel, getSentimentEmoji } from '@/lib/ticketUi';

import { useToast } from './Toast';

interface TicketDetailPanelProps {
    ticket: TicketDTO | null;
    isOpen: boolean;
    onClose: () => void;
    onTicketUpdated?: (ticket: TicketDTO) => void;
}

function formatMessageTime(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ message, customerName }: { message: TicketMessageDTO; customerName: string }) {
    const isCustomer = message.authorType === 'customer';
    const isAgent = message.authorType === 'agent';

    const label = isCustomer ? customerName : message.authorName ?? (isAgent ? 'Support Team' : 'System');

    const wrapperClass = isAgent ? 'justify-end' : isCustomer ? 'justify-start' : 'justify-center';
    const bubbleBg = isAgent ? 'var(--accent-green-bg)' : isCustomer ? 'var(--bg-secondary)' : 'var(--bg-tertiary)';
    const bubbleBorder = isAgent ? 'var(--accent-green-light)' : 'var(--border-primary)';

    return (
        <div className={`flex ${wrapperClass}`}>
            <div
                className="max-w-[85%] rounded-xl border px-4 py-3"
                style={{
                    background: bubbleBg,
                    borderColor: bubbleBorder,
                }}
            >
                <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {label}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                        {formatMessageTime(message.createdAt)}
                    </span>
                </div>
                <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                    {message.content}
                </p>
            </div>
        </div>
    );
}

export function TicketDetailPanel({ ticket, isOpen, onClose, onTicketUpdated }: TicketDetailPanelProps) {
    const { addToast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const patchTicket = usePatchTicket();
    const archiveTicket = useArchiveTicket();
    const triggerRun = useTriggerAIRun();
    const createMessage = useCreateTicketMessage();

    const ticketQuery = useTicket(ticket?.id ?? null, ticket ?? undefined);
    const displayTicket = ticketQuery.data?.ticket ?? ticket;

    const messagesQuery = useTicketMessages(displayTicket?.id ?? null, {
        limit: 200,
        cursor: null,
        order: 'asc',
    });
    const messages = messagesQuery.data?.items ?? [];

    const [draftContent, setDraftContent] = useState(() => displayTicket?.draftResponse ?? '');
    const lastTicketDraftRef = useRef(displayTicket?.draftResponse ?? '');

    useEffect(() => {
        const nextDraft = displayTicket?.draftResponse ?? '';
        const previousTicketDraft = lastTicketDraftRef.current;

        setDraftContent((current) => (current === previousTicketDraft ? nextDraft : current));
        lastTicketDraftRef.current = nextDraft;
    }, [displayTicket?.draftResponse]);

    const saveDraftIfDirty = async () => {
        if (!displayTicket) return;

        const current = displayTicket.draftResponse ?? '';
        if (draftContent === current) return;

        const nextDraft = draftContent.trim().length === 0 ? null : draftContent;
        const res = await patchTicket.mutateAsync({
            id: displayTicket.id,
            body: { draftResponse: nextDraft },
        });
        onTicketUpdated?.(res.ticket);
    };

    const handleSend = async () => {
        if (!displayTicket) return;

        const content = draftContent.trim();
        if (content.length === 0) {
            addToast('warning', 'Draft Empty', 'Write a reply before marking the ticket resolved.');
            return;
        }

        try {
            await createMessage.mutateAsync({
                ticketId: displayTicket.id,
                authorType: 'agent',
                authorName: 'Support Team',
                content,
            });

            const res = await patchTicket.mutateAsync({
                id: displayTicket.id,
                body: { status: 'resolved', draftResponse: content },
            });
            onTicketUpdated?.(res.ticket);
            addToast('success', 'Ticket Resolved', `Reply sent and ticket ${displayTicket.ticketNumber} marked as resolved.`);
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not resolve ticket.';
            addToast('error', 'Send Failed', message);
        }
    };

    const handleArchive = async () => {
        if (!displayTicket) return;

        try {
            const res = await archiveTicket.mutateAsync(displayTicket.id);
            onTicketUpdated?.(res.ticket);
            addToast('info', 'Ticket Archived', `Ticket ${displayTicket.ticketNumber} moved to archive.`);
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not archive ticket.';
            addToast('error', 'Archive Failed', message);
        }
    };

    const handleRegenerate = async () => {
        if (!displayTicket) return;

        try {
            const res = await triggerRun.mutateAsync({ id: displayTicket.id, force: true });
            onTicketUpdated?.(res.ticket);
            addToast('info', 'AI Run Started', 'Regenerating draft in the background.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not start AI run.';
            addToast('error', 'AI Run Failed', message);
        }
    };

    const isBusy =
        patchTicket.isPending ||
        archiveTicket.isPending ||
        triggerRun.isPending ||
        createMessage.isPending;

    return (
        <AnimatePresence>
            {isOpen && displayTicket && (
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
                                Ticket {displayTicket.ticketNumber}
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
                                    {displayTicket.customer.name} ({displayTicket.customer.email})
                                </span>
                            </div>

                            {/* Ticket meta */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {displayTicket.subject}
                                </h3>
                                <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 pt-1">
                                    <Clock size={14} />
                                    <span>{formatTicketDate(displayTicket.createdAt)}</span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {getCategoryLabel(displayTicket.category)}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {displayTicket.priority}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                        {getSentimentEmoji(displayTicket.sentiment)}{' '}
                                        {displayTicket.sentiment == null ? '—/10' : `${displayTicket.sentiment}/10`}
                                    </span>
                                </div>
                            </div>

                            {/* Thread */}
                            <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        Thread
                                    </h4>
                                    <span className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                                        {messages.length} messages
                                    </span>
                                </div>

                                {messagesQuery.isLoading && (
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        Loading conversation...
                                    </p>
                                )}

                                {!messagesQuery.isLoading && messagesQuery.error && (
                                    <p className="text-sm" style={{ color: 'var(--status-pending)' }}>
                                        Failed to load messages.
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {!messagesQuery.isLoading &&
                                        !messagesQuery.error &&
                                        messages.map((message) => (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                                customerName={displayTicket.customer.name}
                                            />
                                        ))}

                                    {!messagesQuery.isLoading && !messagesQuery.error && messages.length === 0 && (
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            No messages yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Reply */}
                            <div className="border rounded-xl p-4 space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <Sparkles size={16} className="text-yellow-500" /> Reply
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

                                {displayTicket.aiStatus === 'pending' && (
                                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                        <Loader2 size={14} className="animate-spin" />
                                        AI is generating a draft...
                                    </div>
                                )}

                                <textarea
                                    ref={textareaRef}
                                    value={draftContent}
                                    onChange={(e) => setDraftContent(e.target.value)}
                                    onBlur={() => {
                                        void saveDraftIfDirty().catch((err: unknown) => {
                                            const message = err instanceof Error ? err.message : 'Could not save draft.';
                                            addToast('error', 'Save Failed', message);
                                        });
                                    }}
                                    className="w-full p-4 rounded-xl text-sm leading-relaxed resize-none min-h-[180px] outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-secondary/30"
                                    style={{ color: 'var(--text-primary)' }}
                                />
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

