'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { ToastProvider } from '@/components/Toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function extractId(payload: unknown): string | null {
    const row = (payload as { new?: { id?: unknown }; old?: { id?: unknown } } | null | undefined)?.new ??
        (payload as { new?: { id?: unknown }; old?: { id?: unknown } } | null | undefined)?.old;
    const id = row?.id;
    return typeof id === 'string' ? id : null;
}

function extractTicketId(payload: unknown): string | null {
    const row = (payload as { new?: { ticket_id?: unknown }; old?: { ticket_id?: unknown } } | null | undefined)?.new ??
        (payload as { new?: { ticket_id?: unknown }; old?: { ticket_id?: unknown } } | null | undefined)?.old;
    const id = row?.ticket_id;
    return typeof id === 'string' ? id : null;
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !anonKey) return;

        const supabase = createSupabaseBrowserClient();
        const channel = supabase.channel('realtime:v1');

        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tickets' },
            (payload) => {
                const ticketId = extractId(payload);
                void queryClient.invalidateQueries({ queryKey: ['tickets'] });
                void queryClient.invalidateQueries({ queryKey: ['analytics'] });
                if (ticketId) void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            }
        );

        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'ticket_messages' },
            (payload) => {
                const ticketId = extractTicketId(payload);
                if (ticketId) void queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
            }
        );

        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'notifications' },
            () => {
                void queryClient.invalidateQueries({ queryKey: ['notifications'] });
            }
        );

        channel.on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'ai_runs' },
            (payload) => {
                const ticketId = extractTicketId(payload);
                void queryClient.invalidateQueries({ queryKey: ['tickets'] });
                void queryClient.invalidateQueries({ queryKey: ['analytics'] });
                if (ticketId) void queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
            }
        );

        channel.subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
    );
}

