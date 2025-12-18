'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPatch, apiPost } from '@/lib/apiClient';
import type { CreateTicketRequest, PatchTicketRequest, TicketDTO, ListResponse } from '@/lib/api/contracts';

export type TicketsTab = 'all' | 'priority' | 'draft_ready' | 'human_needed' | 'resolved' | 'archived';
export type TicketSortField = 'updatedAt' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export type TicketsListParams = {
    tab?: TicketsTab;
    limit?: number;
    cursor?: string | null;
    sort?: TicketSortField;
    order?: SortOrder;
    search?: string;
};

function updateTicketCaches(queryClient: ReturnType<typeof useQueryClient>, ticket: TicketDTO) {
    const queries = queryClient.getQueriesData<ListResponse<TicketDTO>>({ queryKey: ['tickets'] });
    for (const [key, data] of queries) {
        if (!data) continue;
        const nextItems = data.items.map((item) => (item.id === ticket.id ? ticket : item));
        queryClient.setQueryData(key, { ...data, items: nextItems });
    }
}

function removeTicketFromCaches(queryClient: ReturnType<typeof useQueryClient>, ticketId: string) {
    const queries = queryClient.getQueriesData<ListResponse<TicketDTO>>({ queryKey: ['tickets'] });
    for (const [key, data] of queries) {
        if (!data) continue;
        const nextItems = data.items.filter((item) => item.id !== ticketId);
        queryClient.setQueryData(key, { ...data, items: nextItems });
    }
}

export function useTickets(params: TicketsListParams) {
    return useQuery({
        queryKey: ['tickets', params],
        queryFn: ({ signal }) => apiGet<ListResponse<TicketDTO>>('/api/tickets', params, signal),
        placeholderData: (prev) => prev,
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateTicketRequest) => apiPost<{ ticket: TicketDTO; runId: string | null }>('/api/tickets', body),
        onSuccess: ({ ticket }) => {
            updateTicketCaches(queryClient, ticket);
            void queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}

export function usePatchTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: PatchTicketRequest }) =>
            apiPatch<{ ticket: TicketDTO }>(`/api/tickets/${id}`, body),
        onSuccess: ({ ticket }) => {
            updateTicketCaches(queryClient, ticket);
            void queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}

export function useArchiveTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiPost<{ ticket: TicketDTO }>(`/api/tickets/${id}/archive`),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tickets'] });
            const snapshot = queryClient.getQueriesData<ListResponse<TicketDTO>>({ queryKey: ['tickets'] });
            removeTicketFromCaches(queryClient, id);
            return { snapshot };
        },
        onError: (_err, _id, context) => {
            if (!context?.snapshot) return;
            for (const [key, data] of context.snapshot) {
                queryClient.setQueryData(key, data);
            }
        },
        onSuccess: ({ ticket }) => {
            updateTicketCaches(queryClient, ticket);
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}

export function useTriggerAIRun() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
            apiPost<{ runId: string | null; ticket: TicketDTO }>(`/api/tickets/${id}/ai/run`, { force }),
        onSuccess: ({ ticket }) => {
            updateTicketCaches(queryClient, ticket);
            void queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}

