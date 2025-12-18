'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPatch } from '@/lib/apiClient';
import type { AISettingsDTO, PatchAISettingsRequest } from '@/lib/api/contracts';

export function useAISettings() {
    return useQuery({
        queryKey: ['ai-settings'],
        queryFn: ({ signal }) => apiGet<{ settings: AISettingsDTO }>('/api/ai-settings', undefined, signal),
    });
}

export function usePatchAISettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: PatchAISettingsRequest) => apiPatch<{ settings: AISettingsDTO }>('/api/ai-settings', body),
        onSuccess: (data) => {
            queryClient.setQueryData(['ai-settings'], data);
        },
    });
}

