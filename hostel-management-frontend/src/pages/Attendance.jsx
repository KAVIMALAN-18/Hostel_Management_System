import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI, attendanceAPI, hostelAPI } from '../services/api';
import Modal from '../components/common/Modal';
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
    RefreshCwIcon,
    SaveIcon,
    ChevronLeftIcon,
    EditIcon
} from '../components/common/Icons';

const Attendance = () => {
    const { user } = useAuth();
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMarkingMode, setIsMarkingMode] = useState(false);
    const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
    const [markingList, setMarkingList] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [filters, setFilters] = useState({
        hostel: 'All Hostels',
        floor: 'All Floors',
        status: 'All Status'
    });
    const [statusModalRecord, setStatusModalRecord] = useState(null); // { id, name, mode }

    const isPrivileged = user?.role === 'admin' || user?.role === 'warden';

    const [hostelOptions, setHostelOptions] = useState(['All Hostels']);
    const floors = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
    const statuses = ['All Status', 'Present', 'Absent', 'Leave', 'Not Marked'];

    const fetchHostels = async () => {
        try {
            const res = await hostelAPI.getHostels();
            if (res.success) {
                const names = res.data.map(h => h.name);
                setHostelOptions(['All Hostels', ...names]);
            }
        } catch (error) {
            console.error('Failed to fetch hostels:', error);
        }
    };

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
                    hostelName: item.student?.hostel?.name || 'unassigned', // Updated from N/A to unassigned
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

    const fetchMarkingList = async () => {
        setLoading(true);
        try {
            const res = await attendanceAPI.getByJurisdiction(markingDate, filters.hostel);
            if (res.success) {
                setMarkingList(res.data.map(item => ({
                    studentId: item.student._id,
                    name: item.student.user?.name || 'Unknown',
                    regNo: item.student.registrationNumber,
                    hostel: item.student.hostel?.name || 'N/A',
                    room: item.student.room?.roomNumber || 'N/A',
                    status: item.currentStatus || 'Not Marked'
                })));
            }
        } catch (error) {
            console.error('Failed to fetch marking list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostels();
        if (isMarkingMode) {
            fetchMarkingList();
        } else {
            fetchAttendance();
        }
    }, [isMarkingMode, markingDate, filters.hostel]);

    const handleStatusChange = (studentId, newStatus) => {
        setMarkingList(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const handleMarkAllPresent = () => {
        setMarkingList(prev => prev.map(s => ({ ...s, status: 'Present' })));
    };

    const handleSaveAttendance = async () => {
        setSubmitting(true);
        try {
            const records = markingList.map(s => ({
                studentId: s.studentId,
                status: s.status === 'Not Marked' ? 'Present' : s.status
            }));
            const res = await attendanceAPI.markBulk({ records, date: markingDate });
            if (res.success) {
                alert('Attendance saved successfully');
                setIsMarkingMode(false);
                fetchAttendance();
            }
        } catch (error) {
            alert(error.message || 'Failed to save attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSingleValidate = (studentId, name, mode = 'live') => {
        setStatusModalRecord({ id: studentId, name, mode });
    };

    const handleStatusConfirm = async (status) => {
        if (!statusModalRecord) return;
        
        const { id: studentId, mode } = statusModalRecord;
        
        if (mode === 'marking') {
            handleStatusChange(studentId, status);
            setStatusModalRecord(null);
        } else {
            // Live instant commit
            try {
                const res = await attendanceAPI.markBulk({ 
                    records: [{ studentId, status }],
                    date: new Date().toISOString().split('T')[0]
                });
                if (res.success) {
                    // Update local state if it's currently showing
                    setAttendanceList(prev => prev.map(a => 
                        a.studentId === studentId || a._id === studentId ? { ...a, status } : a
                    ));
                    setStatusModalRecord(null);
                }
            } catch (error) {
                alert(error.message || 'Failed to validate student');
            }
        }
    };

    const filteredList = attendanceList.filter(item => {
        // Filter out orphaned records where the student doc was deleted
        if (item.studentName === 'Unknown Student') return false;

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
                    {isMarkingMode ? (
                        <>
                            <button 
                                onClick={() => setIsMarkingMode(false)}
                                className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wide flex items-center gap-2 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeftIcon className="w-4 h-4" /> Cancel
                            </button>
                            <button 
                                onClick={handleSaveAttendance}
                                disabled={submitting}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wide shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <SaveIcon className="w-4 h-4" /> {submitting ? 'Saving...' : 'Sync Attendance'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => fetchAttendance(true)}
                                className={`p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-brand-600 transition-all ${refreshing ? 'animate-spin' : ''}`}
                            >
                                <RefreshCwIcon className="w-5 h-5" />
                            </button>
                            {isPrivileged && (
                                <button 
                                    onClick={() => setIsMarkingMode(true)}
                                    className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wide shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <EditIcon className="w-4 h-4" /> Audit Daily Registry
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Premium KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatMetric label="Total Registry" value={stats.total} trend="+4" icon={UsersIcon} color="slate" />
                <StatMetric label="Present Today" value={stats.present} percentage={Math.round((stats.present/stats.total)*100)} trend="+2.4%" icon={CheckCircleIcon} color="emerald" />
                <StatMetric label="Absent Alert" value={stats.absent} trend="-0.8%" icon={UserXIcon} color="rose" />
                <StatMetric label="Authorized Leave" value={stats.onLeave} trend="Stable" icon={CalendarIcon} color="blue" />
            </div>

            {/* Advanced Filters & Date Picker */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-2 shadow-soft flex flex-col lg:flex-row gap-2">
                {isMarkingMode ? (
                    <>
                        <div className="flex-[2] flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-3xl border border-slate-200 dark:border-slate-700">
                            <CalendarIcon className="w-5 h-5 text-brand-600" />
                            <input 
                                type="date" 
                                value={markingDate}
                                onChange={(e) => setMarkingDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none w-full appearance-none"
                            />
                        </div>
                        {user?.role === 'admin' && (
                            <div className="flex-1">
                                <FilterDropdown 
                                    label="BLOCK" 
                                    value={filters.hostel} 
                                    options={hostelOptions} 
                                    onChange={(v) => setFilters({...filters, hostel: v})} 
                                />
                            </div>
                        )}
                        <button 
                            onClick={handleMarkAllPresent}
                            className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
                        >
                            Mark All Present
                        </button>
                    </>
                ) : (
                    <>
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
                                options={hostelOptions} 
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
                    </>
                )}
            </div>

            {/* Monitoring / Marking Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Personnel Identity</th>
                                {isMarkingMode ? (
                                    <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">Status Assignment</th>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Campus Residence</th>
                                        <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide">Presence Status</th>
                                        <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Verification</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div></td>
                                    </tr>
                                ))
                            ) : isMarkingMode ? (
                                markingList.length === 0 ? (
                                    <tr><td colSpan="3" className="px-8 py-20 text-center text-xs font-bold text-slate-400 uppercase italic">No students found for this jurisdiction</td></tr>
                                ) : (
                                    markingList.map((record) => (
                                        <tr key={record.studentId} className="hover:bg-slate-50/30 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400">
                                                        {record.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{record.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{record.regNo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{record.hostel} • Unit {record.room}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 justify-center">
                                                    <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
                                                        {['Present', 'Absent', 'Leave'].map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleStatusChange(record.studentId, status)}
                                                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                    record.status === status 
                                                                    ? status === 'Present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                                                      : status === 'Absent' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                                                                      : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                                                }`}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleSingleValidate(record.studentId, record.name, 'marking')}
                                                        className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                                                    >
                                                        Validate
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                filteredList.length === 0 ? (
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
                                                <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl w-fit">
                                                    <BuildingIcon className="w-3.5 h-3.5 text-brand-600" />
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{record.hostelName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <StatusBadge status={record.status} />
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => handleSingleValidate(record.studentId, record.studentName, 'live')}
                                                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
                                                >
                                                    Validate
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Selection Modal */}
            <Modal
                isOpen={!!statusModalRecord}
                onClose={() => setStatusModalRecord(null)}
                title="Verify Attendance Status"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticating Personnel</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{statusModalRecord?.name}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => handleStatusConfirm('Present')}
                            className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold">P</div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">PRESENT</p>
                                    <p className="text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase">Manual Identity Match</p>
                                </div>
                            </div>
                            <ChevronLeftIcon className="w-5 h-5 text-emerald-400 rotate-180" />
                        </button>

                        <button 
                            onClick={() => handleStatusConfirm('Absent')}
                            className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center font-bold">A</div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-rose-900 dark:text-rose-100">ABSENT</p>
                                    <p className="text-[10px] font-bold text-rose-600/60 dark:text-rose-400/60 uppercase">Confirmed Non-Presence</p>
                                </div>
                            </div>
                            <ChevronLeftIcon className="w-5 h-5 text-rose-400 rotate-180" />
                        </button>

                        <button 
                            onClick={() => handleStatusConfirm('Leave')}
                            className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">L</div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">ON LEAVE</p>
                                    <p className="text-[10px] font-bold text-blue-600/60 dark:text-blue-400/60 uppercase">Authorized Absence</p>
                                </div>
                            </div>
                            <ChevronLeftIcon className="w-5 h-5 text-blue-400 rotate-180" />
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// UI Components
const StatMetric = (props) => {
    const { label, value, trend, percentage, icon: Icon, color } = props;
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
                    {Icon && <Icon className="w-6 h-6" />}
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
            {options.map(o => <option key={o} value={o} className="bg-white dark:bg-slate-800">{o.toUpperCase()}</option>)}
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
