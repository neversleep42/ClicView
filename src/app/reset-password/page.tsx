'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { useToast } from '@/components/Toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
    const { addToast } = useToast();

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            setEmailSent(true);
            addToast('success', 'Email Sent', 'Check your inbox for the reset link.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not send reset email.';
            addToast('error', 'Reset Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, label: 'Enter your email', active: !emailSent },
        { number: 2, label: 'Check your inbox', active: emailSent },
        { number: 3, label: 'Create new password', active: false },
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
                        Reset Password
                    </h1>
                    <p className="text-[#888] text-lg mb-12">
                        Follow these steps to recover access to your account.
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

                    {/* Back Link */}
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-[#888] hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to login
                    </Link>

                    {emailSent ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--accent-green)]/20 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-[var(--accent-green)]" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-2">Check Your Email</h2>
                            <p className="text-[#888] mb-6">
                                We've sent a password reset link to <span className="text-white">{email}</span>
                            </p>
                            <p className="text-[#666] text-sm">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-[var(--accent-green)] hover:underline"
                                >
                                    Try again
                                </button>
                            </p>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-semibold text-white mb-2">Forgot Password?</h2>
                                <p className="text-[#888]">Enter your email and we'll send you a reset link.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-[#888] mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-[#666] outline-none focus:border-[var(--accent-green)] transition-colors"
                                            placeholder="eg. john@company.com"
                                            autoComplete="email"
                                        />
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
                                        <Mail className="w-5 h-5" />
                                    )}
                                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Sign Up Link */}
                    {!emailSent && (
                        <p className="text-center mt-6 text-[#888]">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-white font-medium hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
