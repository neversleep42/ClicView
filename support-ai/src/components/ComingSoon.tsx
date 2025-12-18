'use client';

import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';

interface ComingSoonProps {
    title: string;
    description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6 flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-md"
                >
                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-green-bg), var(--accent-green-light))',
                            border: '1px solid var(--accent-green-light)',
                        }}
                    >
                        <Construction className="w-10 h-10" style={{ color: 'var(--accent-green-dark)' }} />
                    </motion.div>

                    {/* Title */}
                    <h1
                        className="text-2xl font-semibold mb-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {title}
                    </h1>

                    {/* Description */}
                    <p
                        className="mb-8"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        {description || "We're working hard to bring you this feature. Check back soon!"}
                    </p>

                    {/* Progress indicator */}
                    <div className="mb-8">
                        <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--border-primary)' }}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'var(--accent-green)' }}
                                initial={{ width: '0%' }}
                                animate={{ width: '65%' }}
                                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                        <p
                            className="text-xs mt-2"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            65% complete
                        </p>
                    </div>

                    {/* Back button */}
                    <Link href="/dashboard">
                        <motion.button
                            className="btn btn-secondary inline-flex items-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </motion.button>
                    </Link>
                </motion.div>
            </main>
        </div>
    );
}
