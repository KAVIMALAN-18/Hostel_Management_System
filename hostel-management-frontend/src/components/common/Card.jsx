import React from 'react';

const Card = ({ children, title, subtitle, className = '', footer }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-card shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:border-slate-300 dark:hover:border-slate-600 ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-6">{children}</div>
            {footer && <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-700">{footer}</div>}
        </div>
    );
};

export default Card;
