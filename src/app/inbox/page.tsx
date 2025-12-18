'use client';

import { Sidebar } from '@/components/Sidebar';
import { StatsCards } from '@/components/StatsCards';
import { TicketTable } from '@/components/TicketTable';

export default function InboxPage() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Stats Row */}
                <div className="mb-6">
                    <StatsCards />
                </div>

                {/* Main Table */}
                <TicketTable />
            </main>
        </div>
    );
}
