'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import type { CreateCustomerRequest } from '@/lib/api/contracts';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customerData: CreateCustomerRequest) => Promise<void> | void;
}

export function AddCustomerModal({ isOpen, onClose, onSubmit }: AddCustomerModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('active');
    const [location, setLocation] = useState('USA');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ name, email });
            onClose();
            resetForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setStatus('active');
        setLocation('USA');
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
                    className="relative w-full max-w-md bg-[#1c1c2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <h2 className="text-xl font-semibold text-white">Add New Customer</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-500"
                                        placeholder="e.g. Alice Smith"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-gray-500"
                                        placeholder="alice@example.com"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Location</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <select
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="USA" className="bg-[#1c1c2e]">USA</option>
                                        <option value="UK" className="bg-[#1c1c2e]">UK</option>
                                        <option value="Europe" className="bg-[#1c1c2e]">Europe</option>
                                        <option value="Asia" className="bg-[#1c1c2e]">Asia</option>
                                        <option value="Other" className="bg-[#1c1c2e]">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">Status</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="active"
                                            checked={status === 'active'}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400 peer-checked:bg-green-500/20 peer-checked:text-green-400 peer-checked:border-green-500/50 transition-all">
                                            Active
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="inactive"
                                            checked={status === 'inactive'}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400 peer-checked:bg-gray-500/20 peer-checked:text-gray-300 peer-checked:border-gray-500/50 transition-all">
                                            Inactive
                                        </div>
                                    </label>
                                </div>
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
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Create Customer
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
