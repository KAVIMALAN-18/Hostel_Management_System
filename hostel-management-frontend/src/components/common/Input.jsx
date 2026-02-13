import React, { useState } from 'react';

const Input = ({ label, error, type = 'text', className = '', ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    className={`w-full px-3 py-2 bg-white border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } rounded-md focus:outline-none focus:ring-1 placeholder:text-gray-400 text-gray-900 text-sm`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L4.62 4.62" /><path d="M2 2l20 20" /><path d="M10.37 4.54a9 9 0 0 1 11.63 11.63" /><path d="M17.63 17.63a9 9 0 0 1-11.26-11.26" /><path d="M15 15a3 3 0 0 1-4.24-4.24" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                    </button>
                )}
            </div>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
};

export default Input;
