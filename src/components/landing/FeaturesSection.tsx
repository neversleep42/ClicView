'use client';

import { ArrowRight, Inbox, Sparkles, BarChart3 } from 'lucide-react';

export const FeaturesSection = () => {
    const features = [
        {
            icon: Inbox,
            title: 'Smart Unified Inbox',
            description: 'All your support channels in one powerful inbox. Email, chat, social — everything organized and prioritized automatically.',
            cta: 'Explore Inbox',
        },
        {
            icon: Sparkles,
            title: 'AI-Powered Drafts',
            description: "Get intelligent response suggestions based on ticket context and customer history. Edit, approve, and send in seconds.",
            cta: 'See AI in Action',
        },
        {
            icon: BarChart3,
            title: 'Customer Insights',
            description: 'Deep analytics and customer profiles at your fingertips. Understand patterns, track satisfaction, and improve continuously.',
            cta: 'View Analytics',
        },
    ];

    return (
        <section id="features" className="py-16 bg-[var(--bg-secondary)]">
            <div className="max-w-7xl mx-auto px-4 space-y-12">
                {/* Section Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-5xl font-medium tracking-tight text-[var(--text-primary)]">
                        Everything You Need to{' '}<br />
                        <span className="font-light italic">Delight</span>{' '}
                        <span className="text-[var(--text-tertiary)]">Your Customers</span>
                    </h2>
                    <p className="text-xl text-[var(--text-secondary)]">
                        From ticket to resolution — intelligent tools that make support effortless.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    {features.map((feature, index) => (
                        <div key={index} className="space-y-6">
                            <div className="aspect-square bg-[var(--bg-tertiary)] rounded-xl p-8 relative flex items-center justify-center">
                                <feature.icon className="w-24 h-24 text-[var(--accent-green)]" strokeWidth={1} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-medium text-[var(--text-primary)]">{feature.title}</h3>
                                <p className="text-[var(--text-secondary)]">
                                    {feature.description}
                                </p>
                                <div className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer group">
                                    <span className="text-sm font-medium">{feature.cta}</span>
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
