import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group"
                    >
                        <span className="text-xl font-light group-hover:rotate-90 transition-transform">×</span>
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-8 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
