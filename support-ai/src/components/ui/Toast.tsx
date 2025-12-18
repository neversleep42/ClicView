'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type ToastType = 'success' | 'warning' | 'error' | 'info' | 'ai';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration (default 5s)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Icon mapping
const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: Info,
    ai: Sparkles,
};

const iconColors = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-cyan-500',
    ai: 'text-violet-500',
};

function ToastContainer({
    toasts,
    removeToast
}: {
    toasts: Toast[];
    removeToast: (id: string) => void;
}) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => {
                    const Icon = icons[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="toast flex items-start gap-3 min-w-[320px] max-w-[420px]"
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
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
                                className="p-1 rounded-md transition-colors hover:bg-[var(--bg-tertiary)]"
                                style={{ color: 'var(--text-tertiary)' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
