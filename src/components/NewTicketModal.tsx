'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Tag, AlertCircle } from 'lucide-react';
import { Ticket } from '@/lib/data';

interface NewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (ticket: Partial<Ticket>) => void;
}

export function NewTicketModal({ isOpen, onClose, onSubmit }: NewTicketModalProps) {
    const [subject, setSubject] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [category, setCategory] = useState<'shipping' | 'refund' | 'product' | 'billing' | 'general'>('general');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            subject,
            customer: {
                name: customerName,
                email: 'user@example.com', // Mock
                avatar: '/avatars/default.png',
                stats: { totalTickets: 1, lat: '24h', ltv: 0 }
            },
            priority,
            category,
            content,
            date: 'Just now',
            status: 'open',
            aiStatus: 'pending',
            sentiment: 5
        });
        onClose();
        // Reset form
        setSubject('');
        setCustomerName('');
        setPriority('medium');
        setCategory('general');
        setContent('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="panel-overlay"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>New Ticket</h2>
                                <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-transparent border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                        placeholder="e.g., Warning: Shipping Delay"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Customer Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={customerName}
                                                onChange={e => setCustomerName(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value as any)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-transparent border outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                                                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                            >
                                                <option value="general">General</option>
                                                <option value="shipping">Shipping</option>
                                                <option value="refund">Refund</option>
                                                <option value="product">Product</option>
                                                <option value="billing">Billing</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Priority</label>
                                    <div className="flex gap-2">
                                        {(['low', 'medium', 'high'] as const).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${priority === p
                                                    ? 'bg-opacity-10 dark:bg-opacity-20 border-transparent'
                                                    : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500'
                                                    }`}
                                                style={{
                                                    backgroundColor: priority === p
                                                        ? p === 'high' ? 'var(--status-pending-bg)' : p === 'medium' ? '#fff7ed' : '#f0fdf4'
                                                        : undefined,
                                                    color: priority === p
                                                        ? p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#22c55e'
                                                        : undefined,
                                                    borderColor: priority === p ? 'transparent' : 'var(--border-primary)'
                                                }}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Message</label>
                                    <textarea
                                        required
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-transparent border outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                        style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                        rows={4}
                                        placeholder="Ticket description..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Create Ticket
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
