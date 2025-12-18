'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Loader2, List, FileText, Tag } from 'lucide-react';
import type { CreateTemplateRequest } from '@/lib/api/contracts';

interface AddTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (template: CreateTemplateRequest) => Promise<void> | void;
}

export function AddTemplateModal({ isOpen, onClose, onSubmit }: AddTemplateModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ title, category, content });
            onClose();
            resetForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setCategory('General');
        setContent('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-[#1c1c2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h2 className="text-xl font-semibold text-white">Create Response Template</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Template Title</label>
                                <div className="relative">
                                    <List className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-500"
                                        placeholder="e.g. Order Status Update"
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="General" className="bg-[#1c1c2e]">General</option>
                                        <option value="Shipping" className="bg-[#1c1c2e]">Shipping</option>
                                        <option value="Returns" className="bg-[#1c1c2e]">Returns</option>
                                        <option value="Billing" className="bg-[#1c1c2e]">Billing</option>
                                        <option value="Technical" className="bg-[#1c1c2e]">Technical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Template Content</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <textarea
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-500 min-h-[120px] resize-none leading-relaxed"
                                        placeholder="Hi {{customer_name}}, thank you for reaching out..."
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Use variable placeholders like {'{{customer_name}}'} or {'{{order_id}}'}.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Create Template
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
