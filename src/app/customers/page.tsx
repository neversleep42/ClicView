'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Search, X, Mail, Package, DollarSign, Calendar, Trash2, Edit2, Save, XCircle } from 'lucide-react';
import { AddCustomerModal } from '@/components/AddCustomerModal';
import { useToast } from '@/components/Toast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCreateCustomer, useCustomers, useDeleteCustomer, usePatchCustomer } from '@/hooks/useCustomers';
import { isApiClientError } from '@/lib/apiClient';
import type { CreateCustomerRequest, CustomerDTO, PatchCustomerRequest } from '@/lib/api/contracts';

function formatLastTicket(lastTicketAt: string | null) {
    if (!lastTicketAt) return 'Never';
    const d = new Date(lastTicketAt);
    if (Number.isNaN(d.getTime())) return lastTicketAt;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Customer Profile Drawer
function CustomerDrawer({
    customer,
    onClose,
    onDelete,
    onUpdate
}: {
    customer: CustomerDTO | null;
    onClose: () => void;
    onDelete: (id: string) => Promise<void> | void;
    onUpdate: (id: string, data: PatchCustomerRequest) => Promise<void> | void;
}) {
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<CustomerDTO>>({});

    if (!customer) return null;

    // Initialize form data when entering edit mode
    const startEditing = () => {
        setFormData({
            name: customer.name,
            email: customer.email,
            orders: customer.orders,
            ltv: customer.ltv,
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        const patch: PatchCustomerRequest = {};
        if (formData.name !== undefined) patch.name = formData.name;
        if (formData.email !== undefined) patch.email = formData.email;
        if (formData.orders !== undefined) patch.orders = formData.orders;
        if (formData.ltv !== undefined) patch.ltv = formData.ltv;

        try {
            await onUpdate(customer.id, patch);
            setIsEditing(false);
            addToast('success', 'Customer Updated', `${formData.name || customer.name}'s profile has been updated.`);
        } catch (err: any) {
            addToast('error', 'Update Failed', err?.message ?? 'Could not update customer.');
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                await onDelete(customer.id);
                onClose();
                addToast('info', 'Customer Deleted', `${customer.name} has been removed.`);
            } catch (err: any) {
                addToast('error', 'Delete Failed', err?.message ?? 'Could not delete customer.');
            }
        }
    };

    const handleSendEmail = () => {
        addToast('success', 'Email Sent', `Email sent to ${customer.email}`);
    };

    const handleViewOrders = () => {
        addToast('info', 'View Orders', `Navigating to orders for ${customer.name}`);
    };

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
                        {isEditing ? 'Edit Customer' : 'Customer Profile'}
                    </h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={handleDelete}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                                title="Delete Customer"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-semibold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white' }}>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-gray-700 text-lg font-semibold focus:outline-none focus:border-indigo-500"
                                        placeholder="Name"
                                        style={{ color: 'var(--text-primary)' }}
                                    />
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-gray-700 text-sm focus:outline-none focus:border-indigo-500"
                                        placeholder="Email"
                                        style={{ color: 'var(--text-tertiary)' }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{customer.name}</h3>
                                    <p style={{ color: 'var(--text-tertiary)' }}>{customer.email}</p>
                                </>
                            )}
                        </div>
                        {!isEditing && (
                            <button
                                onClick={startEditing}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <Edit2 className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Total Orders</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={formData.orders || 0}
                                    onChange={e => setFormData({ ...formData, orders: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                                    className="w-full bg-transparent border-b border-gray-700 text-2xl font-semibold tabular-nums focus:outline-none focus:border-indigo-500"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            ) : (
                                <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{customer.orders}</p>
                            )}
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Lifetime Value</span>
                            </div>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={formData.ltv || 0}
                                    onChange={e => setFormData({ ...formData, ltv: Math.max(0, Number(e.target.value) || 0) })}
                                    className="w-full bg-transparent border-b border-gray-700 text-2xl font-semibold tabular-nums focus:outline-none focus:border-indigo-500"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            ) : (
                                <p className="text-2xl font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>${customer.ltv.toLocaleString()}</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    {!isEditing && (
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
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary flex-1"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleSendEmail} className="btn btn-secondary flex-1 gap-2">
                                    <Mail className="w-4 h-4" />
                                    Send Email
                                </button>
                                <button onClick={handleViewOrders} className="btn btn-primary flex-1 gap-2">
                                    View Orders
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function CustomersPage() {
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebouncedValue(searchQuery, 300);

    const customersQuery = useCustomers({
        limit: 100,
        cursor: null,
        sort: 'name',
        order: 'asc',
        search: debouncedSearch,
    });
    const customers = customersQuery.data?.items ?? [];
    const filteredCustomers = customers;

    const createCustomer = useCreateCustomer();
    const patchCustomer = usePatchCustomer();
    const deleteCustomer = useDeleteCustomer();

    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleAddCustomer = async (newCustomer: CreateCustomerRequest) => {
        try {
            const { customer } = await createCustomer.mutateAsync(newCustomer);
            addToast('success', 'Customer Added', `${customer.name} has been added to the database.`);
            setIsAddModalOpen(false);
        } catch (err: any) {
            if (isApiClientError(err) && err.code === 'CUSTOMER_EMAIL_EXISTS') {
                addToast('warning', 'Customer Exists', 'Customer email already exists in this workspace.');
            } else {
                addToast('error', 'Create Failed', err?.message ?? 'Could not create customer.');
            }
            throw err;
        }
    };

    const handleUpdateCustomer = async (id: string, data: PatchCustomerRequest) => {
        const { customer } = await patchCustomer.mutateAsync({ id, body: data });
        if (selectedCustomer?.id === id) setSelectedCustomer(customer);
    };

    const handleDeleteCustomer = async (id: string) => {
        await deleteCustomer.mutateAsync(id);
        setSelectedCustomer(null);
    };

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
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-primary"
                    >
                        + Add Customer
                    </button>
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

                    {customersQuery.isLoading && (
                        <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                            Loading customers...
                        </div>
                    )}

                    {!customersQuery.isLoading && customersQuery.error && (
                        <div className="p-8 text-center" style={{ color: 'var(--status-pending)' }}>
                            Failed to load customers.
                        </div>
                    )}

                    {!customersQuery.isLoading &&
                        !customersQuery.error &&
                        filteredCustomers.map((customer, i) => (
                            <motion.div
                                key={customer.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="table-row cursor-pointer"
                                onClick={() => setSelectedCustomer(customer)}
                            >
                                <div className="w-[280px] flex items-center gap-3">
                                    <div className="avatar">{customer.name.split(' ').map(n => n[0]).join('')}</div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {customer.name}
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                            {customer.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-32">
                                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                                        {customer.orders}
                                    </span>
                                </div>
                                <div className="w-40">
                                    <span className="text-sm font-mono" style={{ color: 'var(--text-tertiary)' }}>
                                        {formatLastTicket(customer.lastTicketAt)}
                                    </span>
                                </div>
                                <div className="w-32 text-right">
                                    <span className="font-medium tabular-nums" style={{ color: 'var(--accent-green-dark)' }}>
                                        ${customer.ltv.toLocaleString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                    {!customersQuery.isLoading && !customersQuery.error && filteredCustomers.length === 0 && (
                        <div className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                            No customers found.
                        </div>
                    )}
                </div>
            </main>

            {/* Customer Drawer */}
            {selectedCustomer && (
                <CustomerDrawer
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onDelete={handleDeleteCustomer}
                    onUpdate={handleUpdateCustomer}
                />
            )}

            {/* Add Customer Modal */}
            <AddCustomerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddCustomer}
            />
        </div>
    );
}
