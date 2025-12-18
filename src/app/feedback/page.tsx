'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import {
    MessageSquare,
    Send,
    ThumbsUp,
    ThumbsDown,
    Star,
    Lightbulb,
    Bug,
    HelpCircle,
    CheckCircle,
    Clock,
    ChevronDown,
    Sparkles,
    Heart
} from 'lucide-react';

type FeedbackType = 'suggestion' | 'bug' | 'question' | 'praise';

interface FeedbackItem {
    id: string;
    type: FeedbackType;
    title: string;
    message: string;
    date: string;
    status: 'pending' | 'reviewed' | 'resolved';
    response?: string;
}

const feedbackHistory: FeedbackItem[] = [
    { id: '1', type: 'suggestion', title: 'Add bulk actions to inbox', message: 'Would be great to archive multiple tickets at once.', date: '2024-12-14', status: 'reviewed', response: "Great idea! We're adding this in the next update." },
    { id: '2', type: 'bug', title: 'Slow loading on Analytics', message: 'Charts take 5+ seconds to load on slow connections.', date: '2024-12-12', status: 'resolved', response: 'Fixed in version 2.1.3. Please refresh to see improvements.' },
    { id: '3', type: 'praise', title: 'Love the AI drafts!', message: 'The AI suggestions have cut our response time in half. Amazing work!', date: '2024-12-10', status: 'reviewed' },
    { id: '4', type: 'question', title: 'Custom webhook support?', message: 'Is it possible to add custom webhooks for our internal tools?', date: '2024-12-08', status: 'pending' },
];

const feedbackTypes: { id: FeedbackType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
    { id: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="w-5 h-5" />, color: 'var(--status-delivery)', bg: 'var(--status-delivery-bg)' },
    { id: 'bug', label: 'Bug Report', icon: <Bug className="w-5 h-5" />, color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
    { id: 'question', label: 'Question', icon: <HelpCircle className="w-5 h-5" />, color: '#7c3aed', bg: 'var(--status-human-bg)' },
    { id: 'praise', label: 'Praise', icon: <Heart className="w-5 h-5" />, color: 'var(--accent-green-dark)', bg: 'var(--accent-green-bg)' },
];

function StarRating({ rating, onChange }: { rating: number; onChange: (val: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                    key={star}
                    onClick={() => onChange(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1"
                >
                    <Star
                        className="w-6 h-6"
                        style={{
                            fill: star <= rating ? 'var(--status-delivery)' : 'transparent',
                            color: star <= rating ? 'var(--status-delivery)' : 'var(--border-primary)',
                        }}
                    />
                </motion.button>
            ))}
        </div>
    );
}

function FeedbackTypeCard({ type, selected, onClick }: {
    type: typeof feedbackTypes[0];
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            onClick={onClick}
            className="p-4 rounded-xl text-center transition-all"
            style={{
                background: selected ? type.bg : 'var(--bg-secondary)',
                border: `2px solid ${selected ? type.color : 'var(--border-primary)'}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div
                className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
                style={{ background: selected ? type.color : 'var(--bg-tertiary)', color: selected ? 'white' : type.color }}
            >
                {type.icon}
            </div>
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{type.label}</p>
        </motion.button>
    );
}

function FeedbackHistoryCard({ item }: { item: FeedbackItem }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const typeInfo = feedbackTypes.find(t => t.id === item.type)!;

    const statusColors: Record<string, { color: string; bg: string }> = {
        pending: { color: 'var(--status-delivery)', bg: 'var(--status-delivery-bg)' },
        reviewed: { color: '#7c3aed', bg: 'var(--status-human-bg)' },
        resolved: { color: 'var(--accent-green-dark)', bg: 'var(--accent-green-bg)' },
    };

    return (
        <motion.div
            layout
            className="p-4 rounded-xl border transition-all"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-card)' }}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: typeInfo.bg, color: typeInfo.color }}
                    >
                        {typeInfo.icon}
                    </div>
                    <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{item.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{ background: statusColors[item.status].bg, color: statusColors[item.status].color }}
                    >
                        {item.status}
                    </span>
                    <motion.button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="btn-ghost p-1 rounded"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                    >
                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{item.message}</p>
                            {item.response && (
                                <div className="p-3 rounded-lg" style={{ background: 'var(--accent-green-bg)' }}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-green-dark)' }} />
                                        <span className="text-xs font-medium" style={{ color: 'var(--accent-green-dark)' }}>Team Response</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.response}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FeedbackPage() {
    const [selectedType, setSelectedType] = useState<FeedbackType>('suggestion');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setSubmitted(true);

        // Reset after showing success
        setTimeout(() => {
            setSubmitted(false);
            setTitle('');
            setMessage('');
            setRating(0);
        }, 3000);
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        Feedback
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Help us improve SupportAI by sharing your thoughts.
                    </p>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Feedback Form */}
                    <div className="col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bento-card"
                        >
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                                            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                                            style={{ background: 'var(--accent-green-bg)' }}
                                        >
                                            <CheckCircle className="w-10 h-10" style={{ color: 'var(--accent-green-dark)' }} />
                                        </motion.div>
                                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                            Thank you for your feedback!
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>
                                            We appreciate you taking the time to help us improve.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                    >
                                        <h3 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                                            What would you like to share?
                                        </h3>

                                        {/* Type Selection */}
                                        <div className="grid grid-cols-4 gap-3 mb-6">
                                            {feedbackTypes.map(type => (
                                                <FeedbackTypeCard
                                                    key={type.id}
                                                    type={type}
                                                    selected={selectedType === type.id}
                                                    onClick={() => setSelectedType(type.id)}
                                                />
                                            ))}
                                        </div>

                                        {/* Title */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Brief summary of your feedback"
                                                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                                                style={{
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-primary)',
                                                    color: 'var(--text-primary)',
                                                }}
                                                required
                                            />
                                        </div>

                                        {/* Message */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                Details
                                            </label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Tell us more about your feedback..."
                                                rows={5}
                                                className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
                                                style={{
                                                    background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--border-primary)',
                                                    color: 'var(--text-primary)',
                                                }}
                                                required
                                            />
                                        </div>

                                        {/* Rating */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                                How would you rate your overall experience?
                                            </label>
                                            <StarRating rating={rating} onChange={setRating} />
                                        </div>

                                        {/* Submit */}
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting || !title || !message}
                                            className="btn btn-primary w-full"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <motion.div
                                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                    />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Submit Feedback
                                                </>
                                            )}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* History & Stats */}
                    <div className="col-span-5 space-y-6">
                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bento-card"
                            style={{ background: 'linear-gradient(135deg, var(--accent-green-bg), var(--bg-card))' }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <MessageSquare className="w-5 h-5" style={{ color: 'var(--accent-green-dark)' }} />
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Your Contributions</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>4</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Submitted</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>2</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Implemented</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>1</p>
                                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Pending</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feedback History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Your Feedback History</h3>
                            </div>
                            <div className="space-y-3">
                                {feedbackHistory.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <FeedbackHistoryCard item={item} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Tip */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-4 rounded-xl"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--status-delivery-bg)' }}>
                                    <Lightbulb className="w-4 h-4" style={{ color: 'var(--status-delivery)' }} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Pro tip</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        The more specific your feedback, the faster we can implement it!
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
