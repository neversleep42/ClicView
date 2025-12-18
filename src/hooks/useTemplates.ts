'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/apiClient';
import type { CreateTemplateRequest, PatchTemplateRequest, TemplateDTO, ListResponse } from '@/lib/api/contracts';

export type TemplatesSortField = 'updatedAt' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export type TemplatesListParams = {
    limit?: number;
    cursor?: string | null;
    sort?: TemplatesSortField;
    order?: SortOrder;
    search?: string;
};

export function useTemplates(params: TemplatesListParams) {
    return useQuery({
        queryKey: ['templates', params],
        queryFn: ({ signal }) => apiGet<ListResponse<TemplateDTO>>('/api/templates', params, signal),
        placeholderData: (prev) => prev,
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateTemplateRequest) => apiPost<{ template: TemplateDTO }>('/api/templates', body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
}

export function usePatchTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: PatchTemplateRequest }) =>
            apiPatch<{ template: TemplateDTO }>(`/api/templates/${id}`, body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => apiDelete<{ ok: true }>(`/api/templates/${id}`),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
}

