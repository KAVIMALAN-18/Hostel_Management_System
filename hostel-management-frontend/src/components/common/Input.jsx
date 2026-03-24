import React, { useState } from 'react';

const Input = ({ label, error, type = 'text', className = '', ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePassword = () => setShowPassword(!showPassword);

    const labelCls = 'text-slate-700 dark:text-slate-300';
    const inputCls = `bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${error
        ? 'border-red-300 dark:border-red-900 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30'
        : 'focus:border-brand-500 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25'
    }`;

    const eyeCls = 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:ring-brand-500';

    const errCls = 'text-red-600 dark:text-red-400';

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className={`text-sm font-medium ${labelCls}`}>
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-shadow focus:outline-none ${inputCls}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePassword}
                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 ${eyeCls}`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L4.62 4.62" /><path d="M2 2l20 20" /><path d="M10.37 4.54a9 9 0 0 1 11.63 11.63" /><path d="M17.63 17.63a9 9 0 0 1-11.26-11.26" /><path d="M15 15a3 3 0 0 1-4.24-4.24" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                    </button>
                )}
            </div>
            {error && <span className={`text-xs font-medium ${errCls}`} role="status">{error}</span>}
        </div>
    );
};

export default Input;
