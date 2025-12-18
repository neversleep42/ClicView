'use client';

import { useQuery } from '@tanstack/react-query';

import { apiGet } from '@/lib/apiClient';
import type { AnalyticsDTO } from '@/lib/api/contracts';

export type AnalyticsRange = '7d' | '30d';

export function useAnalytics(range: AnalyticsRange) {
    return useQuery({
        queryKey: ['analytics', range],
        queryFn: ({ signal }) => apiGet<{ analytics: AnalyticsDTO }>('/api/analytics', { range }, signal),
    });
}

