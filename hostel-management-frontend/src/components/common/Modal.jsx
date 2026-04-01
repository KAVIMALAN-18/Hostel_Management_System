import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div
                className="modal-backdrop absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="modal-panel relative z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-300/40 dark:shadow-slate-950/40 ring-1 ring-slate-200/80 dark:ring-slate-700/80 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col transition-colors">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 bg-white dark:bg-slate-800 shrink-0">
                    <div className="min-w-0">
                        {title && (
                            <h3 id="modal-title" className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide truncate">
                                {title}
                            </h3>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shrink-0"
                        aria-label="Close dialog"
                    >
                        <span className="text-xl font-light leading-none" aria-hidden>×</span>
                    </button>
                </div>

                <div className="px-6 py-6 overflow-y-auto min-h-0 text-slate-600 dark:text-slate-300">
                    {children}
                </div>

                {footer && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex justify-end gap-3 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
