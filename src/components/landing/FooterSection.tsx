'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

export const FooterSection = () => {
    return (
        <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-primary)]">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col items-center gap-8">
                    {/* Logo */}
                    <Link href="/landing" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-[var(--accent-green)] flex items-center justify-center">
                            <span className="text-white font-bold">S</span>
                        </div>
                        <span className="font-semibold text-xl text-[var(--text-primary)]">SupportAI</span>
                    </Link>

                    {/* Links */}
                    <ul className="flex flex-wrap justify-center gap-8">
                        <li>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Features
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Pricing
                            </button>
                        </li>
                        <li>
                            <Link
                                href="/dashboard"
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <a
                                href="mailto:support@supportai.com"
                                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" />
                                support@supportai.com
                            </a>
                        </li>
                    </ul>

                    {/* Copyright */}
                    <p className="text-sm text-[var(--text-tertiary)]">
                        © {new Date().getFullYear()} SupportAI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
