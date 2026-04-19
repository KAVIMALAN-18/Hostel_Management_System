import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    CalendarIcon, 
    SearchIcon, 
    DownloadIcon,
    UserIcon,
    AlertCircleIcon
} from '../../components/common/Icons';

const PastRecords = () => {
    const [students, setStudents] = useState([]);
    const [filters, setFilters] = useState({
        student_id: '',
        dateType: 'specific', // 'specific' or 'range'
        date: '',
        from: '',
        to: ''
    });
    
    const [activeTab, setActiveTab] = useState('attendance');
    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/records/students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    const fetchRecords = async (currentFilters = filters, currentTab = activeTab) => {
        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const params = new URLSearchParams();
            if (currentFilters.student_id) params.append('student_id', currentFilters.student_id);
            
            if (currentTab === 'attendance') {
                if (currentFilters.dateType === 'specific' && currentFilters.date) {
                    params.append('date', currentFilters.date);
                } else if (currentFilters.dateType === 'range' && currentFilters.from && currentFilters.to) {
                    params.append('from', currentFilters.from);
                    params.append('to', currentFilters.to);
                }
                
                const res = await api.get(`/records/attendance?${params.toString()}`);
                console.log('Attendance API Response:', res.data);
                if (res.data.success) {
                    setAttendanceData(res.data.data);
                }
            } else {
                const res = await api.get(`/records/leave?${params.toString()}`);
                console.log('Leave API Response:', res.data);
                if (res.data.success) {
                    setLeaveData(res.data.data);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchRecords();
    };

    // Auto-fetch when student is selected
    const handleStudentChange = (e) => {
        const newStudentId = e.target.value;
        setFilters({ ...filters, student_id: newStudentId });
        
        // If they selected a student, automatically fetch
        if (newStudentId) {
            fetchRecords({ ...filters, student_id: newStudentId }, activeTab);
        }
    };

    const handleExport = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-soft print:hidden">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs tracking-wide uppercase">
                        <CalendarIcon className="w-3 h-3" /> Historical Data
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Past Records</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Query past attendance and leave history</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExport}
                        className="px-5 py-2.5 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border border-brand-200 dark:border-brand-800"
                    >
                        <DownloadIcon className="w-4 h-4" /> Export to PDF
                    </button>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold">Past Records Report</h1>
                <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm print:hidden">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2 md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Student</label>
                        <select 
                            value={filters.student_id}
                            onChange={handleStudentChange}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                        >
                            <option value="">All Students</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.registrationNumber})</option>
                            ))}
                        </select>
                    </div>

                    {activeTab === 'attendance' && (
                        <>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date Filter Type</label>
                                <select 
                                    value={filters.dateType}
                                    onChange={(e) => setFilters({...filters, dateType: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                >
                                    <option value="specific">Specific Date</option>
                                    <option value="range">Date Range</option>
                                </select>
                            </div>

                            {filters.dateType === 'specific' ? (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                                    <input 
                                        type="date" 
                                        value={filters.date}
                                        onChange={(e) => setFilters({...filters, date: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 md:col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">From</label>
                                        <input 
                                            type="date" 
                                            value={filters.from}
                                            onChange={(e) => setFilters({...filters, from: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">To</label>
                                        <input 
                                            type="date" 
                                            value={filters.to}
                                            onChange={(e) => setFilters({...filters, to: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="md:col-span-1 flex justify-end">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <span className="animate-spin text-xl">⟳</span> : <SearchIcon className="w-4 h-4" />}
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                        <AlertCircleIcon className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>

            {/* Tabs & Data */}
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200 dark:border-slate-700 print:hidden">
                    <button 
                        onClick={() => { 
                            setActiveTab('attendance'); 
                            if (filters.student_id) fetchRecords(filters, 'attendance');
                        }}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'attendance' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        Attendance History
                    </button>
                    <button 
                        onClick={() => { 
                            setActiveTab('leave'); 
                            if (filters.student_id) fetchRecords(filters, 'leave');
                        }}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'leave' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        Leave History
                    </button>
                </div>

                <div className="p-0 overflow-x-auto">
                    {activeTab === 'attendance' ? (
                        <>
                            {attendanceData.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700 flex gap-6 text-sm font-bold print:hidden">
                                    <div className="text-slate-600 dark:text-slate-300">Total Records: <span className="text-slate-900 dark:text-white">{attendanceData.length}</span></div>
                                    <div className="text-emerald-600 dark:text-emerald-400">Present: <span className="text-emerald-700 dark:text-emerald-300">{attendanceData.filter(r => r.status === 'Present').length}</span></div>
                                    <div className="text-red-600 dark:text-red-400">Absent: <span className="text-red-700 dark:text-red-300">{attendanceData.filter(r => r.status === 'Absent').length}</span></div>
                                </div>
                            )}
                            <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">Loading attendance records...</td>
                                    </tr>
                                ) : !hasSearched ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">Please select filters and click Search.</td>
                                    </tr>
                                ) : attendanceData.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">No attendance records found for the selected filters.</td>
                                    </tr>
                                ) : (
                                    attendanceData.map((record) => (
                                        <tr key={record._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                                        {record.student?.user?.name?.charAt(0) || <UserIcon className="w-3 h-3" />}
                                                    </div>
                                                    {record.student?.user?.name || 'Unknown Student'}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                                    record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        </>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type / Reason</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">Loading leave records...</td>
                                    </tr>
                                ) : !hasSearched ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">Please select filters and click Search.</td>
                                    </tr>
                                ) : leaveData.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No leave records found for the selected filters.</td>
                                    </tr>
                                ) : (
                                    leaveData.map((record) => (
                                        <tr key={record._id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">
                                                {new Date(record.fromDate).toLocaleDateString('en-GB')} - {new Date(record.toDate).toLocaleDateString('en-GB')}
                                                <span className="block text-xs text-slate-500 mt-0.5">{record.days} Days</span>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {record.studentName || 'Unknown Student'}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                                <span className="font-bold">{record.leaveType}</span>
                                                <p className="text-xs mt-0.5 truncate max-w-xs">{record.reason}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                                    record.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    record.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    record.status === 'Cancelled' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' :
                                                    'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PastRecords;
