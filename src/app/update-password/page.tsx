'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Loader2, Lock, Eye, EyeOff, CheckCircle, KeyRound } from 'lucide-react';

import { useToast } from '@/components/Toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
    const { addToast } = useToast();
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            addToast('error', 'Password Too Short', 'Must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            addToast('error', 'Passwords Don\'t Match', 'Please make sure both passwords are identical.');
            return;
        }

        setIsSubmitting(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setIsSuccess(true);
            addToast('success', 'Password Updated', 'Your password has been changed successfully.');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not update password.';
            addToast('error', 'Update Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, label: 'Request reset link', active: false },
        { number: 2, label: 'Check your inbox', active: false },
        { number: 3, label: 'Create new password', active: !isSuccess },
    ];

    return (
        <div className="min-h-screen flex bg-[#0a0a0a]">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-40"
                        style={{
                            background: 'radial-gradient(circle, rgba(74, 222, 128, 0.4) 0%, rgba(34, 197, 94, 0.2) 40%, transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-green)] flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-xl font-semibold">SupportAI</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-medium text-white mb-4">
                        Create New Password
                    </h1>
                    <p className="text-[#888] text-lg mb-12">
                        Almost done! Enter your new password below.
                    </p>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: step.number * 0.1 }}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${step.active
                                        ? 'bg-white/5 border-white/20'
                                        : 'bg-transparent border-white/10'
                                    }`}
                            >
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${step.active
                                        ? 'bg-[var(--accent-green)] text-white'
                                        : 'bg-white/10 text-[#666]'
                                    }`}>
                                    {step.number}
                                </span>
                                <span className={step.active ? 'text-white' : 'text-[#666]'}>
                                    {step.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#111]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-green)] flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white text-xl font-semibold">SupportAI</span>
                    </div>

                    {isSuccess ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-green)]/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-[var(--accent-green)]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-2">Password Updated!</h2>
                            <p className="text-[#888] mb-6">
                                Your password has been changed successfully. Redirecting to login...
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-[var(--accent-green)] hover:underline"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-white mb-2">New Password</h2>
                                <p className="text-[#888]">Please enter your new password below.</p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#888] mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-[#666] outline-none focus:border-[var(--accent-green)] transition-colors"
                                            placeholder="Enter new password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#666] mt-2">Must be at least 8 characters.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#888] mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-[#666] outline-none focus:border-[var(--accent-green)] transition-colors"
                                            placeholder="Confirm your password"
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Lock className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
