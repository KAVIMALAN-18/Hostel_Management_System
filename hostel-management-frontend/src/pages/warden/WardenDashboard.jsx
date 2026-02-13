import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    UsersIcon,
    ClipboardIcon,
    ToolIcon,
    UserIcon,
    BuildingIcon,
    CalendarIcon,
    CheckIcon,
    XIcon,
    ClockIcon
} from '../../components/common/Icons';
import Table, { TableRow, TableCell } from '../../components/common/Table';
import Button from '../../components/common/Button';

/**
 * WardenDashboard Component
 * High-visibility operational dashboard for Wardens.
 */
const WardenDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Mock Data for Warden Operations
    const wardenProfile = {
        name: user?.name || 'Mrs. Selvi Mani',
        hostel: user?.hostel || 'Diamond Hostel',
        type: 'Girls Hostel',
        floors: user?.floor || 'Ground, 1st, 2nd Floor',
        totalStudents: 124
    };

    const kpiStats = [
        { label: 'Present Today', value: '112', icon: CheckIcon, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Absent Today', value: '08', icon: XIcon, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        { label: 'On Leave', value: '04', icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Pending Leaves', value: '03', icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Open Complaints', value: '05', icon: ToolIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    ];

    const floorOccupancy = [
        { floor: 'Ground Floor', total: 40, occupied: 38, vacant: 2 },
        { floor: '1st Floor', total: 40, occupied: 35, vacant: 5 },
        { floor: '2nd Floor', total: 40, occupied: 39, vacant: 1 },
        { floor: '3rd Floor', total: 40, occupied: 12, vacant: 28 },
    ];

    const pendingLeaves = [
        { id: 1, name: 'Ananya Iyer', room: '102', from: '2026-02-12', to: '2026-02-14' },
        { id: 2, name: 'Meera Nair', room: '205', from: '2026-02-11', to: '2026-02-15' },
        { id: 3, name: 'Sneha Reddy', room: '004', from: '2026-02-13', to: '2026-02-13' },
    ];

    const recentMaintenance = [
        { room: '102', issue: 'AC Leakage', priority: 'High', status: 'Assigned' },
        { room: '204', issue: 'Fan Noise', priority: 'Medium', status: 'Pending' },
        { room: 'Common Area', issue: 'Light Replacement', priority: 'Low', status: 'Scheduled' },
    ];

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initialising Operational Data...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* 1. Warden Profile Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="bg-slate-900 p-8 text-white flex flex-col justify-center items-center md:items-start md:w-1/3">
                    <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
                        <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">{wardenProfile.name}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Authorized Warden Officer</p>
                </div>
                <div className="flex-1 p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/30">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Assigned Hostel</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <BuildingIcon className="w-3.5 h-3.5 text-brand-500" />
                            {wardenProfile.hostel}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Classification</p>
                        <p className="text-sm font-bold text-slate-800">{wardenProfile.type}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Managed Floors</p>
                        <p className="text-sm font-bold text-slate-800">{wardenProfile.floors}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Supervising</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <UsersIcon className="w-3.5 h-3.5 text-brand-500" />
                            {wardenProfile.totalStudents} Students
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. KPI Summary Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {kpiStats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-5 rounded-2xl border ${stat.border} shadow-sm transition-all hover:shadow-md group`}>
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Floor-wise Occupancy Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Floor-wise Occupancy</h3>
                        <Button variant="secondary" size="sm">Export Data</Button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <Table headers={['Floor Level', 'Total Rooms', 'Occupied', 'Vacant Slots']}>
                            {floorOccupancy.map((f, i) => (
                                <TableRow key={i}>
                                    <TableCell><span className="font-bold text-slate-800">{f.floor}</span></TableCell>
                                    <TableCell><span className="font-bold text-slate-600">{f.total}</span></TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-900">{f.occupied}</span>
                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="bg-brand-500 h-full" style={{ width: `${(f.occupied / f.total) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${f.vacant > 5 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                            {f.vacant} Vacant
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </div>

                    {/* 4. Leave Approval Preview */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Pending Leave Requests</h3>
                            <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">Update Needed</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                            {pendingLeaves.map((leave) => (
                                <div key={leave.id} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                            {leave.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{leave.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Room {leave.room} • {leave.from} to {leave.to}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all">
                                            Approve
                                        </button>
                                        <button className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Alerts & Maintenance */}
                <div className="space-y-8">
                    {/* 5. Maintenance Alert Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Maintenance Alerts</h3>
                        <div className="space-y-3">
                            {recentMaintenance.map((item, i) => (
                                <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-brand-200 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-900 group-hover:text-brand-600 uppercase transition-colors tracking-tight">Room {item.room}</span>
                                            <span className="text-sm font-medium text-slate-600">{item.issue}</span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${item.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>{item.priority}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status: {item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Shift Log Section (Refined) */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Shift Log Access</h3>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed mb-6">
                            Ongoing shift records for Diamond Hostel - Level 1 & 2. Ensure all incidents are logged for hand-off.
                        </p>
                        <textarea
                            placeholder="Type shift note..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-white/40 mb-3 outline-none focus:ring-2 focus:ring-brand-500/50 resize-none h-20"
                        ></textarea>
                        <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/20">
                            Post Shift Entry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WardenDashboard;
