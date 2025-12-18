// Mock data for the AI E-commerce Support Agent

export interface Email {
    id: string;
    ticketNumber: string;
    status: 'open' | 'read' | 'done' | 'pending' | 'escalated';
    score: number;
    category: 'returns' | 'shipping' | 'refund' | 'general' | 'feedback' | 'store';
    subject: string;
    preview: string;
    content: string;
    client: {
        name: string;
        email: string;
        avatar?: string;
        isHighValue?: boolean;
    };
    orderId?: string;
    receivedAt: Date;
    aiAnalysis?: {
        intent: string;
        urgency: 'low' | 'medium' | 'high';
        confidence: number;
        processingTime: string;
    };
    draftResponse?: {
        content: string;
        attachments?: { name: string; size: string }[];
    };
}

export const mockEmails: Email[] = [
    {
        id: '1',
        ticketNumber: '#29402',
        status: 'open',
        score: 98,
        category: 'returns',
        subject: 'Order #12345 never arrived...',
        preview: 'Customer is requesting an immediate refund due to delay in shipping carrier updates.',
        content: `Hi, I received my order #4002 yesterday but the size is too small. I'd like to return it and get a refund if possible. Could you please guide me on the process?

I tried looking for the return label in the package but couldn't find one. Thanks in advance!`,
        client: {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            isHighValue: true,
        },
        orderId: '#4002',
        receivedAt: new Date(Date.now() - 2 * 60 * 1000),
        aiAnalysis: {
            intent: 'Refund Request',
            urgency: 'medium',
            confidence: 98,
            processingTime: '0.4s',
        },
        draftResponse: {
            content: `Hi Jane,

I'm sorry to hear the size didn't work out! I've gone ahead and processed a return for Order #4002.

Since you couldn't find the label, I have attached a new prepaid return label to this email. Please print it out and attach it to your package. Once we receive the item, we will issue a full refund to your original payment method within 3-5 business days.

Let me know if there is anything else I can help you with!

Best regards,
Customer Support Team`,
            attachments: [{ name: 'Return_Label_4002.pdf', size: '124kb' }],
        },
    },
    {
        id: '2',
        ticketNumber: '#29401',
        status: 'open',
        score: 85,
        category: 'shipping',
        subject: 'Where is my package?',
        preview: "Tracking hasn't updated in 48 hours, looking for status.",
        content: `Hello,

I placed an order 5 days ago and the tracking hasn't updated since Tuesday. The last update shows it's still at the sorting facility. Can you please check what's happening with my package?

Order number: #3891

Thanks,
Mark`,
        client: {
            name: 'Mark Smith',
            email: 'mark.smith@example.com',
        },
        orderId: '#3891',
        receivedAt: new Date(Date.now() - 15 * 60 * 1000),
        aiAnalysis: {
            intent: 'Shipping Inquiry',
            urgency: 'medium',
            confidence: 85,
            processingTime: '0.3s',
        },
        draftResponse: {
            content: `Hi Mark,

I understand the frustration with delayed tracking updates. I've looked into your order #3891 and contacted our shipping partner.

The package is currently at a regional sorting facility and should resume movement within the next 24 hours. You should see updated tracking information by tomorrow.

If you don't see any updates within 48 hours, please reply to this email and I'll investigate further.

Best regards,
Customer Support Team`,
        },
    },
    {
        id: '3',
        ticketNumber: '#29400',
        status: 'read',
        score: 45,
        category: 'general',
        subject: 'Product question regarding sizing',
        preview: 'Does the new summer collection run true to size?',
        content: `Hi there,

I'm interested in ordering from your new summer collection. Before I do, could you tell me if the sizes run true to size or should I size up?

I'm usually a medium but sometimes need a large depending on the brand.

Thanks!
Sarah`,
        client: {
            name: 'Sarah L.',
            email: 'sarah.l@example.com',
        },
        receivedAt: new Date(Date.now() - 60 * 60 * 1000),
        aiAnalysis: {
            intent: 'Product Inquiry',
            urgency: 'low',
            confidence: 45,
            processingTime: '0.2s',
        },
    },
    {
        id: '4',
        ticketNumber: '#29399',
        status: 'read',
        score: 30,
        category: 'feedback',
        subject: 'Love the new collection!',
        preview: 'Just wanted to say the new aesthetics are amazing.',
        content: `Hi,

I just wanted to drop a quick note to say how much I love your new summer collection! The designs are beautiful and the quality is amazing as always.

Keep up the great work!

Best,
Mike`,
        client: {
            name: 'Mike R.',
            email: 'mike.r@example.com',
        },
        receivedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
        id: '5',
        ticketNumber: '#29398',
        status: 'open',
        score: 92,
        category: 'refund',
        subject: 'Wrong item received - Urgent',
        preview: 'I ordered a laptop and received a tablet. Please resolve.',
        content: `This is urgent!

I ordered a laptop (Order #4521) but received a tablet instead. This is completely wrong and I need this resolved immediately. I need the laptop for work next week.

Please advise on how to fix this ASAP.

Alex`,
        client: {
            name: 'Alex W.',
            email: 'alex.w@example.com',
            isHighValue: true,
        },
        orderId: '#4521',
        receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        aiAnalysis: {
            intent: 'Wrong Item Received',
            urgency: 'high',
            confidence: 92,
            processingTime: '0.3s',
        },
        draftResponse: {
            content: `Hi Alex,

I sincerely apologize for this error - receiving the wrong item is extremely frustrating and I understand you need the laptop urgently.

I've immediately escalated this to our fulfillment team and here's what we're doing:
1. Expediting shipment of the correct laptop today with overnight shipping at no extra cost
2. Arranging a free pickup for the tablet you received

You should receive your laptop within 1-2 business days. I'll send you the tracking number as soon as it ships.

Again, I'm very sorry for this mistake. Is there anything else I can do to help?

Best regards,
Customer Support Team`,
        },
    },
    {
        id: '6',
        ticketNumber: '#29397',
        status: 'done',
        score: 12,
        category: 'store',
        subject: 'Store hours inquiry',
        preview: 'What time do you close on Sundays?',
        content: `Hi,

Quick question - what are your store hours on Sundays?

Thanks,
Guest`,
        client: {
            name: 'Guest',
            email: 'guest@example.com',
        },
        receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
];

// Dashboard data
export const dashboardStats = {
    untriagedEmails: 12,
    lowConfidenceFlags: 5,
    autoResolutionRate: 84,
    autoResolutionTrend: 2.4,
    avgConfidenceScore: 92,
};

export const ticketVelocityData = [
    { day: 'Mon', standard: 45, urgent: 12 },
    { day: 'Tue', standard: 52, urgent: 8 },
    { day: 'Wed', standard: 38, urgent: 15 },
    { day: 'Thu', standard: 65, urgent: 10 },
    { day: 'Fri', standard: 48, urgent: 18 },
    { day: 'Sat', standard: 25, urgent: 5 },
    { day: 'Sun', standard: 18, urgent: 3 },
];

export interface RecentActivity {
    id: string;
    type: 'resolved' | 'drafted' | 'escalated' | 'pending';
    orderNumber: string;
    description: string;
    confidence?: number;
    timestamp: Date;
}

export const recentActivity: RecentActivity[] = [
    {
        id: '1',
        type: 'resolved',
        orderNumber: '#4422',
        description: 'Refund Processed automatically',
        confidence: 99,
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
        id: '2',
        type: 'drafted',
        orderNumber: '#4425',
        description: 'Drafted response for review',
        confidence: 64,
        timestamp: new Date(Date.now() - 14 * 60 * 1000),
    },
    {
        id: '3',
        type: 'escalated',
        orderNumber: '#9901',
        description: 'Escalated to Tier 2 Support',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
        id: '4',
        type: 'resolved',
        orderNumber: '#4419',
        description: 'Return label generated',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
];

// Helper function for relative time
export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
}
