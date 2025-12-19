'use client';

import Link from 'next/link';
import { ArrowRight, Check, Lock } from 'lucide-react';

export const PricingSection = () => {
    const plans = [
        {
            name: 'Starter',
            price: '$49',
            period: '/month',
            description: 'Perfect for small teams getting started',
            popular: false,
            features: [
                'Up to 3 team members',
                '1,000 tickets/month',
                'Email channel',
                'Live chat widget',
                'AI draft suggestions',
                'Basic analytics',
            ],
        },
        {
            name: 'Pro',
            price: '$149',
            period: '/month',
            description: 'For growing teams that need more power',
            popular: true,
            features: [
                'Unlimited team members',
                'Unlimited tickets',
                'All channels (Email, Chat, Social, SMS)',
                'Advanced AI drafts',
                'Customer profiles & history',
                'Priority support',
                'Custom integrations',
                'Advanced analytics & reports',
            ],
        },
    ];

    return (
        <section id="pricing" className="py-16 bg-[var(--bg-secondary)]">
            <div className="max-w-5xl mx-auto px-4 space-y-8 text-center">
                {/* Header */}
                <div className="space-y-4">
                    <div className="inline-flex items-center rounded-full border border-[var(--border-primary)] px-4 py-1.5">
                        <span className="text-sm font-medium text-[var(--text-primary)]">Simple Pricing</span>
                    </div>
                    <h2 className="text-4xl font-medium text-[var(--text-primary)]">
                        Choose your plan
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)]">
                        Start free for 14 days. No credit card required.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 mt-12">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`bento-card p-8 relative ${plan.popular ? 'border-2 border-[var(--accent-green)]' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-[var(--accent-green)] text-[#0f172a] text-xs font-medium px-3 py-1 rounded-full">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-medium text-[var(--text-primary)]">{plan.name}</h3>
                                    <p className="text-[var(--text-secondary)] mt-1">{plan.description}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-5xl font-medium text-[var(--text-primary)]">
                                        {plan.price}
                                        <span className="text-xl text-[var(--text-tertiary)]">{plan.period}</span>
                                    </p>
                                </div>

                                <div className="mt-8">
                                    <Link
                                        href="/dashboard"
                                        className="btn btn-primary w-full py-3 group"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>

                                <ul className="space-y-4 pt-8 text-left">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-[var(--accent-green)] flex-shrink-0" />
                                            <span className="text-[var(--text-secondary)] text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Secure Payment Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]">
                    <Lock className="h-4 w-4" />
                    Payments are secure & encrypted
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
