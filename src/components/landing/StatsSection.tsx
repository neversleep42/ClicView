'use client';

import { TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';

export const StatsSection = () => {
    const stats = [
        {
            value: '98%',
            label: 'Response Accuracy',
            description: 'AI-powered drafts that match your brand voice and resolve tickets effectively.',
            icon: TrendingUp,
        },
        {
            value: '5s',
            label: 'Avg Response Time',
            description: 'Instant AI suggestions help your team respond faster than ever before.',
            icon: Clock,
        },
        {
            value: '10K+',
            label: 'Tickets Resolved',
            description: 'Trusted by support teams handling thousands of customer inquiries daily.',
            icon: CheckCircle,
        },
        {
            value: '95%',
            label: 'Customer Satisfaction',
            description: 'Happy customers thanks to quick, accurate, and personalized responses.',
            icon: Users,
        },
    ];

    return (
        <section className="py-16 bg-[var(--bg-primary)]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bento-card p-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <span className="text-base text-[var(--text-secondary)]">
                            From inbox chaos to customer delight
                        </span>
                        <h2 className="text-4xl font-medium tracking-tight text-[var(--text-primary)]">
                            AI-Powered Support That Scales With You
                        </h2>
                        <p className="text-xl text-[var(--text-secondary)] max-w-3xl">
                            SupportAI handles the heavy lifting so your team can focus on what matters most — building relationships with customers.
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="space-y-2">
                                    <h3 className="text-4xl font-medium text-[var(--accent-green-dark)]">{stat.value}</h3>
                                    <h4 className="font-medium text-[var(--text-primary)]">{stat.label}</h4>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                        {stat.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
