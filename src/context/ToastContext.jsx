import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container - fixed top-right */}
            <div style={{
                position: 'fixed',
                top: '6rem',
                right: '1.5rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        style={{
                            pointerEvents: 'all',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '1rem 1.25rem',
                            borderRadius: '10px',
                            minWidth: '280px',
                            maxWidth: '420px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.35)' : toast.type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
                            background: toast.type === 'success'
                                ? 'rgba(16,185,129,0.12)'
                                : toast.type === 'error'
                                    ? 'rgba(239,68,68,0.12)'
                                    : 'rgba(245,158,11,0.12)',
                            animation: 'toastSlideIn 0.25s ease',
                            color: toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--warning)',
                            fontSize: '0.9rem',
                            lineHeight: '1.4',
                            fontWeight: 500,
                        }}
                    >
                        <span style={{ flex: 1 }}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'inherit',
                                opacity: 0.6,
                                fontSize: '1rem',
                                lineHeight: 1,
                                padding: '0 0 0 0.25rem',
                                flexShrink: 0
                            }}
                        >✕</button>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
