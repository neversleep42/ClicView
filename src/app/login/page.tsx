'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Loader2, LogIn, UserPlus } from 'lucide-react';

import { useToast } from '@/components/Toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const { addToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectedFrom = searchParams.get('redirectedFrom');

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const supabase = createSupabaseBrowserClient();

            if (mode === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                addToast('success', 'Signed In', 'Welcome back.');
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                addToast('success', 'Account Created', 'Check your email if confirmation is required.');
            }

            router.push(redirectedFrom || '/dashboard');
            router.refresh();
        } catch (err: any) {
            addToast('error', 'Auth Failed', err?.message ?? 'Could not authenticate.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-secondary)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-2xl border shadow-lg overflow-hidden"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}
            >
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }}
                        >
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                SupportAI
                            </h1>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                Sign in to continue
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex gap-2 mb-5">
                        <button
                            type="button"
                            onClick={() => setMode('signin')}
                            className={`flex-1 btn ${mode === 'signin' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className={`flex-1 btn ${mode === 'signup' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-transparent border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                placeholder="you@company.com"
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-transparent border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                                placeholder="••••••••"
                                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

