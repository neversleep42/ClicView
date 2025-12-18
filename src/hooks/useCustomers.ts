'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/apiClient';
import type { CreateCustomerRequest, PatchCustomerRequest, CustomerDTO, ListResponse } from '@/lib/api/contracts';

export type CustomersSortField = 'name' | 'updatedAt' | 'createdAt' | 'ltv';
export type SortOrder = 'asc' | 'desc';

export type CustomersListParams = {
    limit?: number;
    cursor?: string | null;
    sort?: CustomersSortField;
    order?: SortOrder;
    search?: string;
};

function updateCustomerCaches(queryClient: ReturnType<typeof useQueryClient>, customer: CustomerDTO) {
    const queries = queryClient.getQueriesData<ListResponse<CustomerDTO>>({ queryKey: ['customers'] });
    for (const [key, data] of queries) {
        if (!data) continue;
        const nextItems = data.items.map((item) => (item.id === customer.id ? customer : item));
        queryClient.setQueryData(key, { ...data, items: nextItems });
    }
}

function removeCustomerFromCaches(queryClient: ReturnType<typeof useQueryClient>, customerId: string) {
    const queries = queryClient.getQueriesData<ListResponse<CustomerDTO>>({ queryKey: ['customers'] });
    for (const [key, data] of queries) {
        if (!data) continue;
        queryClient.setQueryData(key, { ...data, items: data.items.filter((c) => c.id !== customerId) });
    }
}

export function useCustomers(params: CustomersListParams) {
    return useQuery({
        queryKey: ['customers', params],
        queryFn: ({ signal }) => apiGet<ListResponse<CustomerDTO>>('/api/customers', params, signal),
        placeholderData: (prev) => prev,
    });
}

export function useCreateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateCustomerRequest) => apiPost<{ customer: CustomerDTO }>('/api/customers', body),
        onSuccess: ({ customer }) => {
            updateCustomerCaches(queryClient, customer);
            void queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

export function usePatchCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: PatchCustomerRequest }) =>
            apiPatch<{ customer: CustomerDTO }>(`/api/customers/${id}`, body),
        onSuccess: ({ customer }) => {
            updateCustomerCaches(queryClient, customer);
            void queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<{ ok: true }>(`/api/customers/${id}`),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['customers'] });
            const snapshot = queryClient.getQueriesData<ListResponse<CustomerDTO>>({ queryKey: ['customers'] });
            removeCustomerFromCaches(queryClient, id);
            return { snapshot };
        },
        onError: (_err, _id, context) => {
            if (!context?.snapshot) return;
            for (const [key, data] of context.snapshot) {
                queryClient.setQueryData(key, data);
            }
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
}

