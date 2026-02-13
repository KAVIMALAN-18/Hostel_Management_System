import React from 'react';

const Table = ({ headers, children, className = '' }) => {
    return (
        <div className={`overflow-x-auto bg-white rounded border border-slate-200 ${className}`}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8fafc] border-b border-slate-200">
                    <tr>
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {children}
                </tbody>
            </table>
        </div>
    );
};

export const TableRow = ({ children, className = '' }) => (
    <tr className={`hover:bg-slate-50/80 transition-colors ${className}`}>
        {children}
    </tr>
);

export const TableCell = ({ children, className = '' }) => (
    <td className={`px-5 py-3 text-sm text-slate-600 ${className}`}>
        {children}
    </td>
);

export default Table;
