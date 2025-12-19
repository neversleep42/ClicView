'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, ChevronLeft, ChevronRight, Mail, MoreHorizontal, Search, Sparkles } from 'lucide-react';

import type { CreateTicketRequest, TicketDTO } from '@/lib/api/contracts';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useArchiveTicket, useCreateTicket, useTickets } from '@/hooks/useTickets';
import {
    formatTicketDate,
    getCategoryLabel,
    getPriorityLabel,
    getSentimentEmoji,
    getTicketConfidence,
    getTicketStageClass,
    getTicketStageLabel,
} from '@/lib/ticketUi';

import { TicketDetailPanel } from './TicketDetailPanel';
import { useToast } from './Toast';
import { NewTicketModal } from './NewTicketModal';

type TabType = 'all' | 'priority' | 'draft_ready' | 'human_needed' | 'resolved' | 'archived';

const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'priority', label: 'Priority' },
    { id: 'draft_ready', label: 'Drafts Ready' },
    { id: 'human_needed', label: 'Human Needed' },
    { id: 'resolved', label: 'Completed' },
    { id: 'archived', label: 'Archived' },
];

function ConfidenceMiniRing({ value }: { value: number }) {
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg width="20" height="20" className="flex-shrink-0">
            <circle cx="10" cy="10" r={radius} fill="none" strokeWidth="2" style={{ stroke: 'var(--border-primary)' }} />
            <circle
                cx="10"
                cy="10"
                r={radius}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                    stroke:
                        value >= 80
                            ? 'var(--accent-green)'
                            : value >= 60
                              ? 'var(--status-delivery)'
                              : 'var(--status-pending)',
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                }}
            />
        </svg>
    );
}

interface TicketTableProps {
    onCountChange?: (count: number) => void;
}

export function TicketTable({ onCountChange }: TicketTableProps) {
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 300);

    const [cursor, setCursor] = useState<string | null>(null);
    const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
    const page = cursorStack.length + 1;

    const ticketsQuery = useTickets({
        tab: activeTab,
        limit: 20,
        cursor,
        sort: 'updatedAt',
        order: 'desc',
        search: debouncedSearch,
    });

    const tickets = ticketsQuery.data?.items ?? [];
    const nextCursor = ticketsQuery.data?.nextCursor ?? null;

    const archiveTicket = useArchiveTicket();
    const createTicket = useCreateTicket();

    const handleRowClick = (ticket: TicketDTO) => {
        setSelectedTicket(ticket);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedTicket(null), 300);
    };

    const toggleCheck = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const next = new Set(checkedItems);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCheckedItems(next);
    };

    const handleQuickArchive = (ticket: TicketDTO, e: React.MouseEvent) => {
        e.stopPropagation();
        archiveTicket.mutate(ticket.id, {
            onSuccess: () => {
                addToast('info', 'Ticket Archived', `Ticket ${ticket.ticketNumber} moved to archive.`);
                onCountChange?.(Math.max(0, tickets.length - 1));
                if (selectedTicket?.id === ticket.id) handleClosePanel();
            },
            onError: (err: unknown) => {
                const message = err instanceof Error ? err.message : 'Could not archive ticket.';
                addToast('error', 'Archive Failed', message);
            },
        });
    };

    const handleCreateTicket = async (req: CreateTicketRequest) => {
        try {
            const { ticket, runId } = await createTicket.mutateAsync(req);
            addToast(
                'success',
                'Ticket Created',
                runId ? `AI run queued for ticket ${ticket.ticketNumber}.` : `Ticket ${ticket.ticketNumber} created.`
            );
            setIsNewTicketModalOpen(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not create ticket.';
            addToast('error', 'Create Failed', message);
            throw err;
        }
    };

    return (
        <>
            <div className="data-table rounded-2xl">
                {/* Header */}
                <div className="table-header flex-wrap gap-4">
                    <div className="search-input max-w-md flex-1">
                        <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCursor(null);
                                setCursorStack([]);
                            }}
                        />
                    </div>

                    <motion.button
                        onClick={() => setIsNewTicketModalOpen(true)}
                        className="btn btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        + New Ticket
                    </motion.button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="tab-group">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCursor(null);
                                    setCursorStack([]);
                                }}
                                className={`tab-item flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {tab.label}
                                <span
                                    className="px-1.5 py-0.5 rounded text-xs font-medium tabular-nums"
                                    style={{
                                        background: tab.id === 'draft_ready' && activeTab === tab.id ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                                        color: tab.id === 'draft_ready' && activeTab === tab.id ? '#0f172a' : 'var(--text-tertiary)',
                                    }}
                                >
                                    {activeTab === tab.id ? tickets.length : '—'}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                    <div className="flex-1" />
                    <motion.button className="btn-ghost p-2 rounded-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <MoreHorizontal className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    </motion.button>
                </div>

                {/* Table Header */}
                <div
                    className="flex items-center px-6 py-4 text-xs font-semibold uppercase tracking-wide border-b"
                    style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-secondary)' }}
                >
                    <div className="w-12" />
                    <div className="flex-1 min-w-[280px]">Ticket / Subject</div>
                    <div className="w-28 font-mono">Date</div>
                    <div className="w-24">Category</div>
                    <div className="w-40">Customer</div>
                    <div className="w-36">Status</div>
                    <div className="w-20">Priority</div>
                    <div className="w-24">Sentiment</div>
                    <div className="w-24" />
                </div>

                {/* Loading state */}
                {ticketsQuery.isLoading && (
                    <div className="py-10 text-center">
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            Loading tickets...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {ticketsQuery.error && !ticketsQuery.isLoading && (
                    <div className="py-10 text-center">
                        <p className="text-sm" style={{ color: 'var(--status-pending)' }}>
                            Failed to load tickets.
                        </p>
                    </div>
                )}

                {/* Table Rows */}
                <AnimatePresence mode="popLayout">
                    {tickets.map((ticket, index) => (
                        <motion.div
                            key={ticket.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100, height: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="table-row h-16 group"
                            onClick={() => handleRowClick(ticket)}
                        >
                            {/* Checkbox */}
                            <div className="w-12">
                                <motion.div
                                    className={`checkbox ${checkedItems.has(ticket.id) ? 'checked' : ''}`}
                                    onClick={(e) => toggleCheck(ticket.id, e)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                />
                            </div>

                            {/* Subject */}
                            <div className="flex-1 min-w-[280px] pr-6">
                                <p className="font-medium text-slate-900 truncate">{ticket.subject}</p>
                                <p className="text-sm text-slate-500 truncate">{ticket.excerpt}</p>
                            </div>

                            {/* Date */}
                            <div className="w-28">
                                <span className="font-mono text-xs text-slate-400 tabular-nums">{formatTicketDate(ticket.createdAt)}</span>
                            </div>

                            {/* Category */}
                            <div className="w-24">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {getCategoryLabel(ticket.category)}
                                </span>
                            </div>

                            {/* Customer */}
                            <div className="w-40 flex items-center gap-3">
                                <div className="avatar text-xs">
                                    {ticket.customer.name
                                        .split(' ')
                                        .filter(Boolean)
                                        .map((n) => n[0])
                                        .join('')}
                                </div>
                                <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                                    {ticket.customer.name}
                                </span>
                            </div>

                            {/* Status with Confidence */}
                            <div className="w-36 flex items-center gap-2">
                                <ConfidenceMiniRing value={getTicketConfidence(ticket)} />
                                <span className={`badge ${getTicketStageClass(ticket)}`}>
                                    {ticket.aiStatus === 'draft_ready' && <Sparkles className="w-3 h-3" />}
                                    {getTicketStageLabel(ticket)}
                                </span>
                            </div>

                            {/* Priority */}
                            <div className="w-20">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color:
                                            ticket.priority === 'high'
                                                ? '#ef4444'
                                                : ticket.priority === 'medium'
                                                  ? '#f59e0b'
                                                  : 'var(--text-secondary)',
                                    }}
                                >
                                    {getPriorityLabel(ticket.priority)}
                                </span>
                            </div>

                            {/* Sentiment */}
                            <div className="w-24 flex items-center gap-1">
                                <span>{getSentimentEmoji(ticket.sentiment)}</span>
                                <span className="text-sm tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                                    {ticket.sentiment == null ? '—' : `${ticket.sentiment}/10`}
                                </span>
                            </div>

                            {/* Quick Actions */}
                            <div className="w-24 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button
                                    onClick={(e) => handleQuickArchive(ticket, e)}
                                    className="p-2 rounded-lg hover:bg-slate-100"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Archive"
                                >
                                    <Archive className="w-4 h-4 text-slate-400" />
                                </motion.button>
                                <motion.button
                                    className="p-2 rounded-lg hover:bg-slate-100"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Mark as Read"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Mail className="w-4 h-4 text-slate-400" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {!ticketsQuery.isLoading && tickets.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                            No tickets found
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                            All caught up!
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {tickets.length > 0 && (
                    <div className="pagination py-4 flex items-center justify-center gap-3">
                        <motion.button
                            className="page-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={cursorStack.length === 0}
                            onClick={() => {
                                if (cursorStack.length === 0) return;
                                const prev = cursorStack[cursorStack.length - 1];
                                setCursorStack((s) => s.slice(0, -1));
                                setCursor(prev);
                            }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>
                        <span className="text-sm tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                            Page {page}
                        </span>
                        <motion.button
                            className="page-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={!nextCursor}
                            onClick={() => {
                                if (!nextCursor) return;
                                setCursorStack((s) => [...s, cursor]);
                                setCursor(nextCursor);
                            }}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Detail Panel */}
            <TicketDetailPanel
                key={selectedTicket?.id ?? 'empty'}
                ticket={selectedTicket}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                onTicketUpdated={(t) => setSelectedTicket(t)}
            />

            {/* New Ticket Modal */}
            <NewTicketModal isOpen={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} onSubmit={handleCreateTicket} />
        </>
    );
}
