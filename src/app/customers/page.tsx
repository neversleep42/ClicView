'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Search, X, Mail, Package, DollarSign, Calendar } from 'lucide-react';

// Mock customer data
const mockCustomers = [
    { id: '1', name: 'Emma Johnson', email: 'emma.j@email.com', orders: 12, lastTicket: '2024-06-27', ltv: 2450 },
    { id: '2', name: 'Michael Chen', email: 'm.chen@email.com', orders: 8, lastTicket: '2024-06-27', ltv: 1890 },
    { id: '3', name: 'Sarah Miller', email: 'sarah.m@email.com', orders: 15, lastTicket: '2024-06-26', ltv: 3200 },
    { id: '4', name: 'James Wilson', email: 'j.wilson@email.com', orders: 5, lastTicket: '2024-06-24', ltv: 890 },
    { id: '5', name: 'Lisa Park', email: 'lisa.p@email.com', orders: 23, lastTicket: '2024-06-24', ltv: 4560 },
    { id: '6', name: 'Robert Davis', email: 'r.davis@email.com', orders: 7, lastTicket: '2024-06-23', ltv: 1200 },
    { id: '7', name: 'Anna Thompson', email: 'anna.t@email.com', orders: 31, lastTicket: '2024-06-22', ltv: 6780 },
    { id: '8', name: 'David Kim', email: 'd.kim@email.com', orders: 4, lastTicket: '2024-06-21', ltv: 650 },
];

interface Customer {
    id: string;
    name: string;
    email: string;
    orders: number;
    lastTicket: string;
    ltv: number;
}

// Customer Profile Drawer
function CustomerDrawer({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
    if (!customer) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="panel-overlay"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="panel"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Customer Profile
                    </h2>
                    <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-semibold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white' }}>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{customer.name}</h3>
                            <p style={{ color: 'var(--text-tertiary)' }}>{customer.email}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Total Orders</span>
                            </div>
                            <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{customer.orders}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Lifetime Value</span>
                            </div>
                            <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>${customer.ltv.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
                            Recent Activity
                        </h4>
                        <div className="space-y-3">
                            {[
                                { action: 'Submitted ticket #61391', date: '2 days ago', type: 'ticket' },
                                { action: 'Order #45230 delivered', date: '5 days ago', type: 'order' },
                                { action: 'Left 5-star review', date: '1 week ago', type: 'review' },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activity.action}</span>
                                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{activity.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button className="btn btn-secondary flex-1">
                            <Mail className="w-4 h-4" />
                            Send Email
                        </button>
                        <button className="btn btn-primary flex-1">
                            View Orders
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const filteredCustomers = mockCustomers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar />

            <main className="ml-[240px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Customers
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Manage your customer relationships and view purchase history.
                        </p>
                    </div>
                    <button className="btn btn-primary">+ Add Customer</button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="search-input max-w-md">
                        <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="data-table">
                    <div className="flex items-center px-6 py-4 text-xs font-semibold uppercase tracking-wide border-b" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-primary)' }}>
                        <div className="w-[280px]">Customer</div>
                        <div className="w-32 tabular-nums">Total Orders</div>
                        <div className="w-40">Last Ticket</div>
                        <div className="w-32 tabular-nums text-right">Lifetime Value</div>
                    </div>

                    {filteredCustomers.map((customer, i) => (
                        <motion.div
                            key={customer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="table-row"
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            <div className="w-[280px] flex items-center gap-3">
                                <div className="avatar">
                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{customer.email}</p>
                                </div>
                            </div>
                            <div className="w-32">
                                <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{customer.orders}</span>
                            </div>
                            <div className="w-40">
                                <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>{customer.lastTicket}</span>
                            </div>
                            <div className="w-32 text-right">
                                <span className="font-medium tabular-nums" style={{ color: 'var(--accent-green-dark)' }}>
                                    ${customer.ltv.toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Customer Drawer */}
            {selectedCustomer && (
                <CustomerDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
            )}
        </div>
    );
}
