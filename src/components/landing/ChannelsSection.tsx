'use client';

import { ArrowUpRight, Mail, MessageCircle, Twitter, MessageSquare, Hash, Phone } from 'lucide-react';

export const ChannelsSection = () => {
    const channels = [
        {
            icon: Mail,
            name: 'Email',
            bgColor: '#4285F4',
            description: 'Connect Gmail, Outlook, and any IMAP inbox to receive and send emails directly.',
            cta: 'Connect Email',
        },
        {
            icon: MessageCircle,
            name: 'Live Chat',
            bgColor: '#22c55e',
            description: 'Embed our chat widget on your website and respond to visitors in real-time.',
            cta: 'Setup Chat',
        },
        {
            icon: Twitter,
            name: 'Social Media',
            bgColor: '#1DA1F2',
            description: 'Monitor and respond to mentions on Twitter, Facebook, and Instagram.',
            cta: 'Connect Social',
        },
        {
            icon: MessageSquare,
            name: 'WhatsApp',
            bgColor: '#25D366',
            description: 'Engage with customers on WhatsApp Business for instant communication.',
            cta: 'Connect WhatsApp',
        },
        {
            icon: Hash,
            name: 'Slack',
            bgColor: '#4A154B',
            description: 'Receive ticket notifications and respond directly from your Slack workspace.',
            cta: 'Add to Slack',
        },
        {
            icon: Phone,
            name: 'SMS',
            bgColor: '#8B5CF6',
            description: 'Send and receive text messages for urgent customer communications.',
            cta: 'Enable SMS',
        },
    ];

    return (
        <section id="channels" className="py-16 bg-[var(--bg-primary)]">
            <div className="max-w-7xl mx-auto px-4 space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-medium text-[var(--text-primary)]">
                        Meet Your Customers Where They Are
                    </h2>
                    <p className="text-xl text-[var(--text-secondary)]">
                        Connect all your support channels into one unified inbox.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 pt-4">
                        <button
                            className="btn btn-secondary px-6"
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            View Pricing
                        </button>
                    </div>
                </div>

                {/* Channels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {channels.map((channel, index) => (
                        <div key={index} className="bento-card p-8">
                            <div className="space-y-4">
                                <div
                                    className="h-10 w-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: channel.bgColor }}
                                >
                                    <channel.icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-medium text-[var(--text-primary)]">{channel.name}</h3>
                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                    {channel.description}
                                </p>
                                <div className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                                    <span className="text-sm">{channel.cta}</span>
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ChannelsSection;
