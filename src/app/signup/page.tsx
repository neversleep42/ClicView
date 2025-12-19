'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Loader2, UserPlus, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

import { useToast } from '@/components/Toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignUpPage() {
    const { addToast } = useToast();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            addToast('error', 'Password Too Short', 'Must be at least 8 characters.');
            return;
        }
        setIsSubmitting(true);
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`.trim(),
                    },
                },
            });
            if (error) throw error;
            addToast('success', 'Account Created', 'Check your email to confirm your account.');
            router.push('/login');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Could not create account.';
            addToast('error', 'Sign Up Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOAuthSignUp = async (provider: 'google' | 'github') => {
        try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'OAuth failed.';
            addToast('error', 'OAuth Failed', message);
        }
    };

    const steps = [
        { number: 1, label: 'Sign up your account', active: true },
        { number: 2, label: 'Set up your workspace', active: false },
        { number: 3, label: 'Set up your profile', active: false },
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
                        Get Started with Us
                    </h1>
                    <p className="text-[#888] text-lg mb-12">
                        Complete these easy steps to register your account.
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

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-2">Sign Up Account</h2>
                        <p className="text-[#888]">Enter your personal data to create your account.</p>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => handleOAuthSignUp('google')}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white hover:bg-[#222] transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuthSignUp('github')}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white hover:bg-[#222] transition-colors"
                        >
                            <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Github
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#111] text-[#666]">Or</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignUp} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#888] mb-2">
                                    First Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-[#666] outline-none focus:border-[var(--accent-green)] transition-colors"
                                        placeholder="eg. John"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#888] mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-[#666] outline-none focus:border-[var(--accent-green)] transition-colors"
                                    placeholder="eg. Francisco"
                                />
                            </div>
                        </div>

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
                                    placeholder="eg. johnfrans@gmail.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#888] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder-[#666] outline-none focus:border-[var(--accent-green)] transition-colors"
                                    placeholder="Enter your password"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <UserPlus className="w-5 h-5" />
                            )}
                            {isSubmitting ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center mt-6 text-[#888]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-white font-medium hover:underline">
                            Log In
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
