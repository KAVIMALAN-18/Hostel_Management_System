import Card from '../../components/common/Card';
import Table, { TableRow, TableCell } from '../../components/common/Table';

const Payments = () => {
    const transactions = [
        { id: 'PAY-8821', unit: 'Hostel Rent - Nov', amount: '₹4,500', date: 'Nov 01, 2025', status: 'Completed' },
        { id: 'PAY-7712', unit: 'Mess Charges - Nov', amount: '₹3,200', date: 'Nov 02, 2025', status: 'Completed' },
        { id: 'PAY-6651', unit: 'Hostel Rent - Oct', amount: '₹4,500', date: 'Oct 01, 2025', status: 'Completed' },
        { id: 'PAY-5520', unit: 'Electricity Dues', amount: '₹420', date: 'Oct 15, 2025', status: 'Completed' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                    Financial <span className="text-indigo-600">History</span>
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                    Audited transaction ledger for habitation services
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Dues', value: '₹0.00', icon: '💳', color: 'text-indigo-600' },
                    { label: 'Last Payment', value: '₹4,500', icon: '✅', color: 'text-emerald-600' },
                    { label: 'Wallet Balance', value: '₹120', icon: '👛', color: 'text-slate-800' }
                ].map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl grayscale opacity-40">
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{stat.label}</p>
                                <p className={`text-xl font-black ${stat.color} tracking-tighter italic`}>{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Table headers={['Transaction ID', 'Service Unit', 'Amount', 'Stamp', 'Status']}>
                {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                        <TableCell>
                            <span className="text-[10px] font-black text-slate-400 tracking-widest">{tx.id}</span>
                        </TableCell>
                        <TableCell>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight italic">{tx.unit}</span>
                        </TableCell>
                        <TableCell>
                            <span className="text-xs font-black text-slate-900 italic">{tx.amount}</span>
                        </TableCell>
                        <TableCell>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{tx.date}</span>
                        </TableCell>
                        <TableCell>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100 italic">
                                {tx.status}
                            </span>
                        </TableCell>
                    </TableRow>
                ))}
            </Table>
        </div>
    );
};

export default Payments;
