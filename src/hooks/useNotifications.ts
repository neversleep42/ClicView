'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiGet, apiPost } from '@/lib/apiClient';
import type { ListResponse, NotificationDTO } from '@/lib/api/contracts';

export type NotificationsListParams = {
    limit?: number;
    cursor?: string | null;
    sort?: 'createdAt';
    order?: 'desc' | 'asc';
    unreadOnly?: boolean;
    search?: string;
};

function updateNotificationCaches(queryClient: ReturnType<typeof useQueryClient>, notification: NotificationDTO) {
    const queries = queryClient.getQueriesData<ListResponse<NotificationDTO>>({ queryKey: ['notifications'] });
    for (const [key, data] of queries) {
        if (!data) continue;
        const nextItems = data.items.map((n) => (n.id === notification.id ? notification : n));
        queryClient.setQueryData(key, { ...data, items: nextItems });
    }
}

export function useNotifications(params: NotificationsListParams) {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: ({ signal }) => apiGet<ListResponse<NotificationDTO>>('/api/notifications', params, signal),
        placeholderData: (prev) => prev,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiPost<{ notification: NotificationDTO }>(`/api/notifications/${id}/read`),
        onSuccess: ({ notification }) => {
            updateNotificationCaches(queryClient, notification);
            void queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

