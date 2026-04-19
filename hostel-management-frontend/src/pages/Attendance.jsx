import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, hostelAPI } from '../services/api';
import { 
    UsersIcon, 
    CheckCircleIcon, 
    UserXIcon, 
    CalendarIcon,
    SaveIcon,
    RefreshCwIcon,
    SearchIcon
} from '../components/common/Icons';

const Attendance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [studentsList, setStudentsList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [hostelFilter, setHostelFilter] = useState('All Hostels');
    const [hostelOptions, setHostelOptions] = useState(['All Hostels']);

    const isPrivileged = user?.role === 'admin' || user?.role === 'warden';

    const fetchHostels = useCallback(async () => {
        try {
            const res = await hostelAPI.getHostels();
            if (res.success) {
                const names = res.data.map(h => h.name);
                setHostelOptions(['All Hostels', ...names]);
            }
        } catch (error) {
            console.error('Failed to fetch hostels:', error);
        }
    }, []);

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            const res = await attendanceAPI.getByJurisdiction(date, hostelFilter);
            if (res.success) {
                // Backend returns { student, currentStatus }
                setStudentsList(res.data.map(item => ({
                    studentId: item.student._id,
                    name: item.student.user?.name || 'Unknown',
                    regNo: item.student.registrationNumber,
                    hostel: item.student.hostel?.name || 'N/A',
                    room: item.student.room?.roomNumber || 'N/A',
                    status: item.currentStatus || 'Not Marked'
                })));
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    }, [date, hostelFilter]);

    useEffect(() => {
        fetchHostels();
    }, [fetchHostels]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleStatusChange = (studentId, newStatus) => {
        setStudentsList(prev => prev.map(s => 
            s.studentId === studentId ? { ...s, status: newStatus } : s
        ));
    };

    const handleMarkAllPresent = () => {
        setStudentsList(prev => prev.map(s => 
            s.status === 'Not Marked' ? { ...s, status: 'Present' } : s
        ));
    };

    const handleSaveAttendance = async () => {
        if (!isPrivileged) return;
        setSubmitting(true);
        try {
            // Only send records that have been explicitly marked or changed
            const records = studentsList
                .filter(s => s.status !== 'Not Marked')
                .map(s => ({
                    studentId: s.studentId,
                    status: s.status
                }));

            if (records.length === 0) {
                alert('No attendance records to save.');
                setSubmitting(false);
                return;
            }

            const res = await attendanceAPI.markBulk({ records, date });
            if (res.success) {
                alert('Attendance saved successfully!');
                fetchAttendance();
            }
        } catch (error) {
            alert(error.message || 'Failed to save attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = useMemo(() => {
        return studentsList.filter(s => 
            (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             s.regNo.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [studentsList, searchQuery]);

    const stats = useMemo(() => {
        return {
            total: studentsList.length,
            present: studentsList.filter(s => s.status === 'Present').length,
            absent: studentsList.filter(s => s.status === 'Absent').length,
            leave: studentsList.filter(s => s.status === 'Leave').length,
            notMarked: studentsList.filter(s => s.status === 'Not Marked').length
        };
    }, [studentsList]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-soft">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs tracking-wide uppercase">
                        <CheckCircleIcon className="w-3 h-3" /> Attendance Management
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Registry</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Mark, view, and update attendance for any date.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchAttendance}
                        className={`p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-brand-600 transition-all ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCwIcon className="w-5 h-5" />
                    </button>
                    {isPrivileged && (
                        <button 
                            onClick={handleSaveAttendance}
                            disabled={submitting || loading}
                            className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <SaveIcon className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Attendance'}
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-2 shadow-sm flex flex-col md:flex-row gap-2">
                <div className="flex-1 flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-5 py-4 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <CalendarIcon className="w-5 h-5 text-brand-600" />
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none w-full appearance-none cursor-pointer"
                    />
                </div>
                
                <div className="flex-[2] flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-5 py-4 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="SEARCH BY NAME OR ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none w-full placeholder:text-slate-400"
                    />
                </div>

                {user?.role === 'admin' && (
                    <div className="flex-1">
                        <select 
                            value={hostelFilter}
                            onChange={(e) => setHostelFilter(e.target.value)}
                            className="w-full h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider px-5 py-4 rounded-3xl focus:outline-none cursor-pointer"
                        >
                            {hostelOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Students</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Present</p>
                    <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{stats.present}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">Absent</p>
                    <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{stats.absent}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Leave</p>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{stats.leave}</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center flex flex-col justify-center">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Unmarked: {stats.notMarked}</p>
                    {isPrivileged && stats.notMarked > 0 && (
                        <button 
                            onClick={handleMarkAllPresent}
                            className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase border border-brand-200 dark:border-brand-800 rounded-lg py-1 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all"
                        >
                            Mark Rest as Present
                        </button>
                    )}
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Details</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCwIcon className="w-6 h-6 animate-spin text-brand-500" />
                                            <p className="text-sm font-medium">Loading attendance records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <UsersIcon className="w-8 h-8 text-slate-300" />
                                            <p className="text-sm font-medium">No students found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((record) => (
                                    <tr key={record.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                                    {record.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{record.name}</p>
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{record.regNo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                                {record.hostel} <span className="text-slate-400 mx-1">•</span> {record.room}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {isPrivileged ? (
                                                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                                    {['Present', 'Absent', 'Leave'].map((status) => {
                                                        const isSelected = record.status === status;
                                                        const baseColor = status === 'Present' ? 'emerald' : status === 'Absent' ? 'rose' : 'blue';
                                                        
                                                        return (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleStatusChange(record.studentId, status)}
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                                    isSelected 
                                                                    ? `bg-${baseColor}-500 text-white shadow-md` 
                                                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                }`}
                                                            >
                                                                {status}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                                                    record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                                    record.status === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
                                                    record.status === 'Leave' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                    'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            )}
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

export default Attendance;
