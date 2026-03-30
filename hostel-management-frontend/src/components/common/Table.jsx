import React from 'react';

const Table = ({ headers, children, className = '' }) => {
    return (
        <div className={`overflow-x-auto bg-white dark:bg-slate-800 rounded-card border border-slate-200/90 dark:border-slate-700 shadow-soft ${className}`}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/90 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-[1] backdrop-blur-sm">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-5 py-3 text-sm font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export const TableRow = ({ children, className = '' }) => (
    <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors ${className}`}>
        {children}
    </tr>
);

export const TableCell = ({ children, className = '' }) => (
    <td className={`px-5 py-3 text-sm text-slate-600 dark:text-slate-300 align-middle ${className}`}>
        {children}
    </td>
);

export default Table;
