import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { 
    UsersIcon, 
    CheckCircleIcon, 
    UserXIcon, 
    ClockIcon, 
    SearchIcon, 
    FilterIcon, 
    ShieldCheckIcon,
    ArrowUpRightIcon,
    ArrowDownRightIcon,
    CalendarIcon,
    BuildingIcon,
    RefreshCwIcon
} from '../components/common/Icons';

const Attendance = () => {
    const { user } = useAuth();
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        hostel: 'All Hostels',
        floor: 'All Floors',
        status: 'All Status'
    });

    const hostels = ['All Hostels', 'Sapphire', 'Emerald', 'Ruby', 'Pearl', 'Diamond'];
    const floors = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
    const statuses = ['All Status', 'Present', 'Absent', 'Leave', 'Not Marked'];

    const fetchAttendance = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        
        try {
            const res = await reportsAPI.getAttendance();
            if (res.success) {
                const mappedList = res.data.map(item => ({
                    _id: item._id,
                    studentName: item.student?.user?.name || 'Unknown Student',
                    studentId: item.student?.registrationNumber || 'TKT-000',
                    hostelName: item.student?.hostel?.name || 'N/A',
                    floor: item.student?.floor || 'N/A',
                    roomNumber: item.student?.room?.roomNumber || 'N/A',
                    biometricTime: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: item.status || 'Present' // Defaulting for visual if empty
                }));
                setAttendanceList(mappedList);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const filteredList = attendanceList.filter(item => {
        return (filters.hostel === 'All Hostels' || item.hostelName === filters.hostel) &&
            (filters.floor === 'All Floors' || item.floor === filters.floor) &&
            (filters.status === 'All Status' || item.status === filters.status);
    });

    const stats = {
        total: attendanceList.length || 1,
        present: attendanceList.filter(a => a.status === 'Present').length,
        absent: attendanceList.filter(a => a.status === 'Absent').length,
        onLeave: attendanceList.filter(a => a.status === 'Leave').length,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Live Presence</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">Real-time biometric monitoring across all residential facilities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fetchAttendance(true)}
                        className={`p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-brand-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCwIcon className="w-5 h-5" />
                    </button>
                    <button className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wide shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all">
                        Generate Daily Audit
                    </button>
                </div>
            </div>

            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatMetric label="Total Registry" value={stats.total} trend="+4" icon={UsersIcon} color="slate" />
                <StatMetric label="Present Today" value={stats.present} percentage={Math.round((stats.present/stats.total)*100)} trend="+2.4%" icon={CheckCircleIcon} color="emerald" />
                <StatMetric label="Absent Alert" value={stats.absent} trend="-0.8%" icon={UserXIcon} color="rose" />
                <StatMetric label="Authorized Leave" value={stats.onLeave} trend="Stable" icon={CalendarIcon} color="blue" />
            </div>

            {/* Advanced Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-2 shadow-soft flex flex-col lg:flex-row gap-2">
                <div className="flex-[2] flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="SEARCH PERSONNEL BY NAME OR ID..." 
                        className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none w-full placeholder:text-slate-400"
                    />
                </div>
                <div className="flex-1 flex gap-2">
                    <FilterDropdown 
                        label="BLOCK" 
                        value={filters.hostel} 
                        options={hostels} 
                        onChange={(v) => setFilters({...filters, hostel: v})} 
                    />
                    <FilterDropdown 
                        label="LEVEL" 
                        value={filters.floor} 
                        options={floors} 
                        onChange={(v) => setFilters({...filters, floor: v})} 
                    />
                    <FilterDropdown 
                        label="STATUS" 
                        value={filters.status} 
                        options={statuses} 
                        onChange={(v) => setFilters({...filters, status: v})} 
                    />
                </div>
            </div>

            {/* Monitoring Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Personnel Identity</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Deployment Context</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Biometric Sync</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Presence Status</th>
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic leading-none">No digital presence detected in this segment</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((record) => (
                                    <tr key={record._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-[1.2rem] flex items-center justify-center font-bold text-slate-300 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors border border-slate-200 dark:border-slate-700">
                                                    {record.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{record.studentName}</p>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{record.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                                        UNIT: {record.roomNumber}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-1">
                                                    <BuildingIcon className="w-3 h-3 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{record.hostelName} • {record.floor}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                                                    <ClockIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tabular-nums">{record.biometricTime}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <StatusBadge status={record.status} />
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700">
                                                Validate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// UI Components
const StatMetric = ({ label, value, trend, percentage, icon: Icon, color }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border-emerald-100',
        rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 border-rose-100',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 border-blue-100',
        slate: 'bg-slate-50 text-slate-600 dark:bg-slate-900/40 border-slate-200'
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-7 rounded-[2.5rem] shadow-soft hover:border-brand-500/30 transition-all group">
            <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    {trend.includes('+') ? <ArrowUpRightIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">{value}</h3>
                {percentage && <span className="text-xs font-bold text-emerald-500">{percentage}%</span>}
            </div>
            {percentage && (
                <div className="mt-4 h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
            )}
        </div>
    );
};

const FilterDropdown = ({ label, value, options, onChange }) => (
    <div className="flex flex-col gap-1 px-4 py-2 h-16 justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl group hover:border-brand-500/30 transition-all">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1 group-hover:text-brand-500 transition-colors">{label}</span>
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider focus:outline-none cursor-pointer w-full"
        >
            {options.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
        </select>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = {
        'Present': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50',
        'Absent': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50',
        'Leave': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900/50',
        'Not Marked': 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config[status] || config['Not Marked']}`}>
             <div className={`w-1.5 h-1.5 rounded-full ${status === 'Present' ? 'bg-emerald-500 animate-pulse' : status === 'Absent' ? 'bg-rose-500' : 'bg-current opacity-50'}`}></div>
             <span className="text-xs font-bold uppercase tracking-wider">{status}</span>
        </div>
    );
};

export default Attendance;
