'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Download,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Sparkles,
    Archive,
    Mail,
    MoreHorizontal
} from 'lucide-react';
import {
    mockTickets as initialTickets,
    Ticket,
    getCategoryLabel,
    getAiStatusLabel,
    getAiStatusClass,
    getPriorityLabel,
    getSentimentEmoji
} from '@/lib/data';
import { TicketDetailPanel } from './TicketDetailPanel';

type TabType = 'all' | 'priority' | 'drafts_ready' | 'completed';

const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'priority', label: 'Priority' },
    { id: 'drafts_ready', label: 'Drafts Ready' },
    { id: 'completed', label: 'Completed' },
];

// Mini Confidence Ring
function ConfidenceMiniRing({ value }: { value: number }) {
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg width="20" height="20" className="flex-shrink-0">
            <circle cx="10" cy="10" r={radius} fill="none" strokeWidth="2" style={{ stroke: 'var(--border-primary)' }} />
            <circle
                cx="10" cy="10" r={radius} fill="none" strokeWidth="2" strokeLinecap="round"
                style={{
                    stroke: value >= 80 ? 'var(--accent-green)' : value >= 60 ? 'var(--status-delivery)' : 'var(--status-pending)',
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                }}
            />
        </svg>
    );
}

// Dropdown Component
function Dropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {label}: {value}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 z-20 min-w-[160px] rounded-xl p-1 shadow-lg backdrop-blur-sm"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-primary)',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                            }}
                        >
                            {options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => { onChange(option); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                                    style={{
                                        color: value === option ? 'var(--accent-green-dark)' : 'var(--text-secondary)',
                                        background: value === option ? 'var(--accent-green-bg)' : 'transparent',
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

interface TicketTableProps {
    onCountChange?: (count: number) => void;
}

export function TicketTable({ onCountChange }: TicketTableProps) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState('June');

    const filteredTickets = tickets.filter(ticket => {
        switch (activeTab) {
            case 'priority': return ticket.priority === 'high';
            case 'drafts_ready': return ticket.aiStatus === 'draft_ready';
            case 'completed': return ticket.aiStatus === 'resolved';
            default: return true;
        }
    });

    const getTabCount = useCallback((tabId: TabType) => {
        switch (tabId) {
            case 'all': return tickets.length;
            case 'priority': return tickets.filter(t => t.priority === 'high').length;
            case 'drafts_ready': return tickets.filter(t => t.aiStatus === 'draft_ready').length;
            case 'completed': return tickets.filter(t => t.aiStatus === 'resolved').length;
        }
    }, [tickets]);

    const handleRowClick = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedTicket(null), 300);
    };

    // Optimistic UI: Remove ticket on send
    const handleSend = (ticketId: string) => {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        onCountChange?.(tickets.length - 1);
    };

    // Optimistic UI: Remove ticket on archive
    const handleArchive = (ticketId: string) => {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        onCountChange?.(tickets.length - 1);
    };

    const toggleCheck = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newChecked = new Set(checkedItems);
        if (newChecked.has(id)) newChecked.delete(id);
        else newChecked.add(id);
        setCheckedItems(newChecked);
    };

    const handleQuickArchive = (ticket: Ticket, e: React.MouseEvent) => {
        e.stopPropagation();
        setTickets(prev => prev.filter(t => t.id !== ticket.id));
    };

    const getConfidence = (ticket: Ticket) => {
        if (ticket.aiStatus === 'resolved') return 95;
        if (ticket.aiStatus === 'draft_ready') return 85;
        if (ticket.aiStatus === 'human_needed') return 45;
        return 70;
    };

    return (
        <>
            <div className="data-table rounded-2xl">
                {/* Header */}
                <div className="table-header flex-wrap gap-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Inbox</h2>
                    <div className="flex-1" />

                    {/* Search */}
                    <div className="search-input">
                        <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input type="text" placeholder="Search tickets..." />
                        <span className="kbd">⌘K</span>
                    </div>

                    {/* Date Filter Dropdown */}
                    <Dropdown
                        label="Date"
                        options={['June', 'May', 'April', 'All Time']}
                        value={dateFilter}
                        onChange={setDateFilter}
                    />

                    {/* Export */}
                    <motion.button className="btn btn-secondary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                        <Download className="w-4 h-4" />
                        Export
                    </motion.button>

                    {/* New Ticket */}
                    <motion.button className="btn btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                        + New Ticket
                    </motion.button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="tab-group">
                        {tabs.map(tab => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-item flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {tab.label}
                                <span
                                    className="px-1.5 py-0.5 rounded text-xs font-medium tabular-nums"
                                    style={{
                                        background: tab.id === 'drafts_ready' && activeTab === tab.id ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                                        color: tab.id === 'drafts_ready' && activeTab === tab.id ? '#0f172a' : 'var(--text-tertiary)',
                                    }}
                                >
                                    {getTabCount(tab.id)}
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
                    <div className="w-36">AI Status</div>
                    <div className="w-20">Priority</div>
                    <div className="w-24">Sentiment</div>
                    <div className="w-24" />
                </div>

                {/* Table Rows */}
                <AnimatePresence mode="popLayout">
                    {filteredTickets.map((ticket, index) => (
                        <motion.div
                            key={ticket.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100, height: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="table-row h-16 group"
                            onClick={() => handleRowClick(ticket)}
                            onMouseEnter={() => setHoveredRow(ticket.id)}
                            onMouseLeave={() => setHoveredRow(null)}
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
                                <span className="font-mono text-xs text-slate-400 tabular-nums">{ticket.date}</span>
                            </div>

                            {/* Category */}
                            <div className="w-24">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{getCategoryLabel(ticket.category)}</span>
                            </div>

                            {/* Customer */}
                            <div className="w-40 flex items-center gap-3">
                                <div className="avatar text-xs">{ticket.customer.name.split(' ').map(n => n[0]).join('')}</div>
                                <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{ticket.customer.name}</span>
                            </div>

                            {/* AI Status with Confidence */}
                            <div className="w-36 flex items-center gap-2">
                                <ConfidenceMiniRing value={getConfidence(ticket)} />
                                <span className={`badge ${getAiStatusClass(ticket.aiStatus)}`}>
                                    {ticket.aiStatus === 'draft_ready' && <Sparkles className="w-3 h-3" />}
                                    {getAiStatusLabel(ticket.aiStatus)}
                                </span>
                            </div>

                            {/* Priority */}
                            <div className="w-20">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: ticket.priority === 'high' ? '#ef4444' : ticket.priority === 'medium' ? '#f59e0b' : 'var(--text-secondary)',
                                    }}
                                >
                                    {getPriorityLabel(ticket.priority)}
                                </span>
                            </div>

                            {/* Sentiment */}
                            <div className="w-24 flex items-center gap-1">
                                <span>{getSentimentEmoji(ticket.sentiment)}</span>
                                <span className="text-sm tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{ticket.sentiment}/10</span>
                            </div>

                            {/* Quick Actions (reveal on hover) */}
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
                {filteredTickets.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No tickets found</p>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>All caught up! 🎉</p>
                    </div>
                )}

                {/* Pagination */}
                {filteredTickets.length > 0 && (
                    <div className="pagination py-4">
                        <motion.button className="page-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>
                        <motion.button className="page-btn active" whileTap={{ scale: 0.9 }}>1</motion.button>
                        <motion.button className="page-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>2</motion.button>
                        <motion.button className="page-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>3</motion.button>
                        <span className="px-2" style={{ color: 'var(--text-tertiary)' }}>...</span>
                        <motion.button className="page-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>13</motion.button>
                        <motion.button className="page-btn" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Detail Panel */}
            <TicketDetailPanel
                ticket={selectedTicket}
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                onSend={handleSend}
                onArchive={handleArchive}
            />
        </>
    );
}
