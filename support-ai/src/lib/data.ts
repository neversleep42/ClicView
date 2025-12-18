// Mock data for Support AI Agent - Mindweave Style

export interface Ticket {
    id: string;
    ticketNumber: string;
    subject: string;
    excerpt: string;
    content: string;
    date: string;
    category: 'refund' | 'shipping' | 'product' | 'billing' | 'general';
    customer: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    aiStatus: 'resolved' | 'draft_ready' | 'human_needed' | 'pending';
    priority: 'high' | 'medium' | 'low';
    sentiment: number; // 1-10
    draftResponse?: string;
}

export const mockTickets: Ticket[] = [
    {
        id: '1',
        ticketNumber: '#61391',
        subject: 'Request for refund on damaged item',
        excerpt: 'The package arrived with visible damage and the product inside...',
        content: `Hi Support Team,

I received my order #61391 yesterday, but unfortunately the package arrived with visible damage. The product inside (Flexy Chair) has a bent leg and scratches on the surface.

I would like to request a full refund or a replacement. I've attached photos of the damage.

Please advise on the next steps.

Best regards,
Emma`,
        date: '27/06/24',
        category: 'refund',
        customer: {
            id: 'C001',
            name: 'Emma Johnson',
            email: 'emma.j@email.com',
        },
        aiStatus: 'resolved',
        priority: 'high',
        sentiment: 4,
        draftResponse: `Dear Emma,

I'm so sorry about the damaged item you received. This isn't the experience we want for our customers.

I've processed a full refund of $183 to your original payment method. You should see it within 3-5 business days.

You don't need to return the damaged chair - please dispose of it as you see fit or donate it if possible.

As an apology, I'm also adding a 15% discount code for your next order: SORRY15

Best regards,
Support Team`,
    },
    {
        id: '2',
        ticketNumber: '#61390',
        subject: 'Where is my package? Order delayed',
        excerpt: 'I ordered 2 weeks ago and tracking still shows processing...',
        content: `Hello,

I placed order #61390 two weeks ago and the tracking still shows "Processing". This is unacceptable as I paid for express shipping.

Items ordered:
- Cascade Bookshelf
- Zenith Sofa
- Nova Bar Stool
- Harmony Wardrobe

When will my order ship? I need these for my new apartment.

Thanks,
Michael`,
        date: '27/06/24',
        category: 'shipping',
        customer: {
            id: 'C002',
            name: 'Michael Chen',
            email: 'm.chen@email.com',
        },
        aiStatus: 'draft_ready',
        priority: 'high',
        sentiment: 3,
        draftResponse: `Hi Michael,

I apologize for the delay with your order. I've looked into this and found that the Harmony Wardrobe is currently backordered, which has held up your entire shipment.

Here's what I can do:
1. Ship the available items (Cascade Bookshelf, Zenith Sofa, Nova Bar Stool) today with overnight delivery at no extra cost
2. Ship the Wardrobe separately when it's back in stock (est. 5 days)
3. Refund your express shipping fee ($45)

Would this work for you? Please let me know and I'll process it immediately.

Best,
Support Team`,
    },
    {
        id: '3',
        ticketNumber: '#61389',
        subject: 'Product assembly instructions missing',
        excerpt: 'Received the Nova Bar Stool but no assembly guide included...',
        content: `Hi,

I just received my Nova Bar Stool order but there were no assembly instructions in the box. I've tried looking online but can't find the right manual.

Can you send me a PDF or link to the assembly guide?

Thanks,
Sarah`,
        date: '26/06/24',
        category: 'product',
        customer: {
            id: 'C003',
            name: 'Sarah Miller',
            email: 'sarah.m@email.com',
        },
        aiStatus: 'resolved',
        priority: 'low',
        sentiment: 7,
        draftResponse: `Hi Sarah,

Here's the assembly guide for your Nova Bar Stool: [link]

Quick tips:
- Start with Step 3 (base assembly)
- The allen key included works for all bolts
- Don't fully tighten bolts until final step

If you need any help, just reply to this email!

Happy assembling,
Support Team`,
    },
    {
        id: '4',
        ticketNumber: '#61388',
        subject: 'Billing issue - double charged',
        excerpt: 'My credit card was charged twice for the same order...',
        content: `URGENT!

I was charged TWICE for order #61388:
- $112 on June 24
- $112 on June 25

Please fix this immediately. I want a refund for the duplicate charge.

Haven Armchair was the item.

- James`,
        date: '24/06/24',
        category: 'billing',
        customer: {
            id: 'C004',
            name: 'James Wilson',
            email: 'j.wilson@email.com',
        },
        aiStatus: 'human_needed',
        priority: 'high',
        sentiment: 2,
    },
    {
        id: '5',
        ticketNumber: '#61387',
        subject: 'Love the new collection!',
        excerpt: 'Just wanted to say how much I appreciate the quality...',
        content: `Hi there!

Just wanted to reach out and say how much I LOVE my new Nova Coffee Table! The quality is amazing and it looks exactly like the pictures.

The delivery was also super fast. Will definitely be ordering more!

Best,
Lisa`,
        date: '24/06/24',
        category: 'general',
        customer: {
            id: 'C005',
            name: 'Lisa Park',
            email: 'lisa.p@email.com',
        },
        aiStatus: 'resolved',
        priority: 'low',
        sentiment: 10,
        draftResponse: `Hi Lisa!

Thank you so much for the kind words! It means a lot to our team to hear you're loving your Nova Coffee Table.

As a thank you, here's a 10% discount on your next order: THANKYOU10

We can't wait to see what you add to your home next!

Warmly,
Support Team`,
    },
    {
        id: '6',
        ticketNumber: '#61386',
        subject: 'Warranty claim for defective motor',
        excerpt: 'The recliner motor stopped working after 3 months...',
        content: `Hello Support,

I purchased the Zenith Console recliner 3 months ago and the motor has stopped working. The chair won't recline anymore.

This should be covered under warranty. How do I get this fixed?

Order #61386
Purchase date: March 23, 2024

Thanks,
Robert`,
        date: '23/06/24',
        category: 'product',
        customer: {
            id: 'C006',
            name: 'Robert Davis',
            email: 'r.davis@email.com',
        },
        aiStatus: 'draft_ready',
        priority: 'medium',
        sentiment: 5,
        draftResponse: `Hi Robert,

Your Zenith Console is definitely covered under our 2-year warranty. I'm sorry about the motor issue.

Here's what happens next:
1. I'm scheduling a technician visit to your address (confirm: 123 Main St?)
2. They'll either repair or replace the motor on-site
3. If replacement is needed, we'll provide a brand new recliner

Available slots:
- Thursday, June 27, 10am-12pm
- Friday, June 28, 2pm-4pm

Which works best?

Best,
Support Team`,
    },
];

// Dashboard stats
export const dashboardStats = {
    pendingTickets: {
        value: 14,
        trend: '+2',
        trendDirection: 'up' as const,
        label: 'from yesterday',
    },
    avgResponseTime: {
        value: '2m 30s',
        trend: '-12%',
        trendDirection: 'down' as const,
        label: 'improvement',
    },
    aiResolutionRate: {
        value: '85%',
        trend: '+5%',
        trendDirection: 'up' as const,
        label: 'from last week',
    },
    customerSatisfaction: {
        value: '4.8/5',
        trend: '+0.2',
        trendDirection: 'up' as const,
        label: 'from last month',
    },
};

// Tab counts
export const tabCounts = {
    all: mockTickets.length,
    priority: mockTickets.filter(t => t.priority === 'high').length,
    draftsReady: mockTickets.filter(t => t.aiStatus === 'draft_ready').length,
    completed: mockTickets.filter(t => t.aiStatus === 'resolved').length,
};

// Helper functions
export function getCategoryLabel(category: Ticket['category']): string {
    const labels: Record<Ticket['category'], string> = {
        refund: 'Refund',
        shipping: 'Shipping',
        product: 'Product',
        billing: 'Billing',
        general: 'General',
    };
    return labels[category];
}

export function getAiStatusLabel(status: Ticket['aiStatus']): string {
    const labels: Record<Ticket['aiStatus'], string> = {
        resolved: 'Resolved',
        draft_ready: 'Draft Ready',
        human_needed: 'Human Needed',
        pending: 'Pending',
    };
    return labels[status];
}

export function getAiStatusClass(status: Ticket['aiStatus']): string {
    const classes: Record<Ticket['aiStatus'], string> = {
        resolved: 'badge-completed',
        draft_ready: 'badge-process',
        human_needed: 'badge-human',
        pending: 'badge-pending',
    };
    return classes[status];
}

export function getPriorityLabel(priority: Ticket['priority']): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getSentimentEmoji(score: number): string {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😕';
    return '😠';
}
