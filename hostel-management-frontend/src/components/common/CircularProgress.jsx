import React from 'react';

/**
 * CircularProgress Component
 * Displays a circular progress indicator with percentage
 * Used for leave quota, attendance rates, etc.
 */
const CircularProgress = ({
    percentage = 0,
    size = 120,
    strokeWidth = 8,
    color = '#3b82f6',
    backgroundColor = '#e5e7eb',
    label = '',
    showPercentage = true,
    className = ''
}) => {
    // Ensure percentage is between 0 and 100
    const validPercentage = Math.min(100, Math.max(0, percentage));

    // Calculate circle properties
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (validPercentage / 100) * circumference;

    // Determine color based on percentage thresholds
    const getColor = () => {
        if (color !== '#3b82f6') return color; // Use custom color if provided
        if (validPercentage < 5) return '#10b981'; // Green
        if (validPercentage < 10) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const progressColor = getColor();

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={backgroundColor}
                        strokeWidth={strokeWidth}
                    />

                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={progressColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Center text */}
                {showPercentage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">
                            {validPercentage.toFixed(0)}%
                        </span>
                        {label && (
                            <span className="text-xs text-slate-500 font-medium mt-1">
                                {label}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CircularProgress;
