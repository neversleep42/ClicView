'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, MessageSquare, Zap } from 'lucide-react';

export const HeroSection = () => {
    return (
        <section className="relative min-h-screen pt-[72px]">
            {/* Grid Background */}
            <div
                className="absolute inset-0 w-full"
                style={{
                    backgroundImage: `
            linear-gradient(rgb(100 100 100 / 0.03) 1px, transparent 1px),
            linear-gradient(to right, rgb(100 100 100 / 0.03) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    zIndex: -1
                }}
            />

            {/* Floating Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] animate-float-1">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent-green-bg)] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[var(--accent-green-dark)]" />
                    </div>
                </div>
                <div className="absolute top-[30%] right-[15%] animate-float-2">
                    <div className="w-12 h-12 rounded-xl bg-[var(--status-process-bg)] flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-[#65a30d]" />
                    </div>
                </div>
                <div className="absolute bottom-[30%] left-[20%] animate-float-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--status-delivery-bg)] flex items-center justify-center">
                        <Zap className="w-6 h-6 text-[#d97706]" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-24 md:pt-16 md:pb-32 relative z-10">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Badge */}
                    <div className="flex justify-center">
                        <span className="inline-flex items-center rounded-full border border-[var(--border-primary)] px-3 py-1 text-sm text-[var(--text-secondary)]">
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-green)] animate-flicker"></span>
                            <b>New</b>: AI-powered response drafting
                        </span>
                    </div>

                    {/* Hero Title */}
                    <h1 className="text-center text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-[var(--text-primary)]">
                        Customer Support That<br />
                        <span className="bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-green-dark)] bg-clip-text text-transparent">
                            Actually Works
                        </span>
                    </h1>

                    {/* Hero Description */}
                    <p className="mx-auto max-w-2xl text-center text-lg text-[var(--text-secondary)] font-light leading-relaxed">
                        SupportAI handles your customer tickets with intelligent AI drafts,
                        multi-channel inbox, and deep customer insights. <b>Resolve tickets 10x faster</b>.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/dashboard"
                            className="btn btn-primary px-8 py-3 group"
                        >
                            Start Free Trial
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <button
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-secondary px-8 py-3"
                        >
                            See How It Works
                        </button>
                    </div>

                    {/* Trusted By Section */}
                    <div className="mt-24 space-y-4">
                        <p className="text-center text-sm text-[var(--text-tertiary)] font-light">
                            Trusted by support teams everywhere
                        </p>
                        <div className="relative mx-auto max-w-2xl">
                            {/* Fade gradients */}
                            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent z-10"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent z-10"></div>

                            {/* Scrolling content */}
                            <div className="overflow-hidden relative">
                                <div className="flex whitespace-nowrap animate-marquee">
                                    {[...Array(2)].flatMap((_, i) => (
                                        ['TechFlow', 'CloudBase', 'DataSync', 'AppWorks', 'DevHub', 'ScaleUp'].map((company) => (
                                            <span
                                                key={`${company}-${i}`}
                                                className="inline-block mx-6 text-xl font-semibold tracking-tight text-[var(--text-muted)]"
                                            >
                                                {company}
                                            </span>
                                        ))
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
