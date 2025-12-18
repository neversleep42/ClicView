import type { TicketAIStatus, TicketCategory, TicketDTO, TicketPriority, TicketStatus } from '@/lib/api/contracts';

export function getCategoryLabel(category: TicketCategory): string {
    const labels: Record<TicketCategory, string> = {
        refund: 'Refund',
        shipping: 'Shipping',
        product: 'Product',
        billing: 'Billing',
        general: 'General',
    };
    return labels[category];
}

export function getPriorityLabel(priority: TicketPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function getSentimentEmoji(score: number | null): string {
    if (score == null) return '—';
    if (score >= 8) return '😁';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '🙁';
    return '😠';
}

export function formatTicketDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function statusLabel(status: TicketStatus): string {
    return status === 'resolved' ? 'Resolved' : 'Open';
}

function aiStatusLabel(aiStatus: TicketAIStatus | null): string {
    if (aiStatus === 'draft_ready') return 'Draft Ready';
    if (aiStatus === 'human_needed') return 'Human Needed';
    if (aiStatus === 'pending') return 'Pending';
    return 'AI Off';
}

export function getTicketStageLabel(ticket: Pick<TicketDTO, 'status' | 'aiStatus'>): string {
    if (ticket.status === 'resolved') return statusLabel(ticket.status);
    return aiStatusLabel(ticket.aiStatus);
}

export function getTicketStageClass(ticket: Pick<TicketDTO, 'status' | 'aiStatus'>): string {
    if (ticket.status === 'resolved') return 'badge-completed';
    if (ticket.aiStatus === 'draft_ready') return 'badge-process';
    if (ticket.aiStatus === 'human_needed') return 'badge-human';
    if (ticket.aiStatus === 'pending') return 'badge-pending';
    return 'badge-pending';
}

export function getTicketConfidence(ticket: Pick<TicketDTO, 'status' | 'aiStatus' | 'confidence'>): number {
    if (ticket.confidence != null) return Math.max(0, Math.min(100, ticket.confidence));
    if (ticket.status === 'resolved') return 95;
    if (ticket.aiStatus === 'draft_ready') return 85;
    if (ticket.aiStatus === 'human_needed') return 45;
    if (ticket.aiStatus === 'pending') return 70;
    return 0;
}

