import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    className = '',
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    ...props
}) => {
    const baseStyles = 'px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg';

    const variants = {
        primary: 'bg-brand-500 text-white hover:bg-brand-600 border-0',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 border-0',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-0',
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </button>
    );
};

export default Button;
