import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    isClosing?: boolean;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isClosing: true } : t))
        );

        // Wait for animation to finish before removing from state
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Start closing animation after 5s
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastComponent
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

function ToastComponent({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    const icons = {
        success: <CheckCircle2 className="text-green-500" size={18} />,
        error: <XCircle className="text-red-500" size={18} />,
        info: <Info className="text-blue-500" size={18} />,
    };

    const bgs = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 
                ${toast.isClosing
                    ? 'animate-out slide-out-to-right-full fade-out opacity-0'
                    : 'animate-in slide-in-from-right-full'
                } ${bgs[toast.type]}`}
            style={{ minWidth: '240px', maxWidth: '360px' }}
        >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
