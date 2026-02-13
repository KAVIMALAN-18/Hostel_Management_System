import React from 'react';

const Card = ({ children, title, subtitle, className = '', footer }) => {
    return (
        <div className={`bg-white border border-gray-200 rounded-md ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-6">{children}</div>
            {footer && <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">{footer}</div>}
        </div>
    );
};

export default Card;
