'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPost } from '@/lib/apiClient';
import type { ListResponse, TicketMessageDTO } from '@/lib/api/contracts';

export type TicketMessagesListParams = {
    limit?: number;
    cursor?: string | null;
    order?: 'asc' | 'desc';
};

export type CreateTicketMessageRequest = {
    authorType?: TicketMessageDTO['authorType'];
    authorName?: string;
    content: string;
};

export function useTicketMessages(ticketId: string | null | undefined, params: TicketMessagesListParams) {
    return useQuery({
        queryKey: ['ticket-messages', ticketId, params],
        enabled: Boolean(ticketId),
        queryFn: ({ signal }) => {
            if (!ticketId) throw new Error('Missing ticket id.');
            return apiGet<ListResponse<TicketMessageDTO>>(`/api/tickets/${ticketId}/messages`, params, signal);
        },
        placeholderData: (prev) => prev,
    });
}

export type CreateTicketMessageInput = CreateTicketMessageRequest & { ticketId: string };

export function useCreateTicketMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ticketId, ...body }: CreateTicketMessageInput) =>
            apiPost<{ message: TicketMessageDTO }>(`/api/tickets/${ticketId}/messages`, body),
        onSuccess: (_data, variables) => {
            void queryClient.invalidateQueries({ queryKey: ['ticket-messages', variables.ticketId] });
        },
    });
}

