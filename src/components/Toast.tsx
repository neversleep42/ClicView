'use client';

import { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (type: ToastType, title: string, message?: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(0);

    const addToast = (type: ToastType, title: string, message?: string) => {
        nextId.current += 1;
        const id = String(nextId.current);
        setToasts(prev => [...prev, { id, type, title, message }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    const icons = {
        success: <Check className="w-5 h-5" />,
        error: <X className="w-5 h-5" />,
        warning: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const colors = {
        success: { bg: 'var(--accent-green-bg)', border: 'var(--accent-green)', icon: 'var(--accent-green-dark)' },
        error: { bg: 'var(--status-pending-bg)', border: 'var(--status-pending)', icon: '#dc2626' },
        warning: { bg: 'var(--status-delivery-bg)', border: 'var(--status-delivery)', icon: '#d97706' },
        info: { bg: 'var(--status-human-bg)', border: 'var(--status-human)', icon: '#7c3aed' },
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[320px] backdrop-blur-sm"
                        style={{
                            background: colors[toast.type].bg,
                            border: `1px solid ${colors[toast.type].border}`,
                        }}
                    >
                        <div style={{ color: colors[toast.type].icon }}>
                            {icons[toast.type]}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                                {toast.title}
                            </p>
                            {toast.message && (
                                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    {toast.message}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 rounded hover:bg-black/5 transition-colors"
                        >
                            <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
