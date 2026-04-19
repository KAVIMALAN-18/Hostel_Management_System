import React, { useState, useEffect, useMemo } from 'react';
import api, { studentAPI, attendanceAPI, leaveAPI } from '../../services/api';
import { 
    CalendarIcon, 
    SearchIcon, 
    DownloadIcon,
    UserIcon,
    AlertCircleIcon,
    ChevronRightIcon
} from '../../components/common/Icons';

const PastRecords = () => {
    const [students, setStudents] = useState([]);
    const [searchStudent, setSearchStudent] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [filters, setFilters] = useState({
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
            const res = await studentAPI.getAll();
            if (res.success) {
                // Ensure consistency in data format
                const mapped = res.data.map(s => ({
                    id: s._id,
                    name: s.user?.name || 'Unknown',
                    registrationNumber: s.registrationNumber
                }));
                setStudents(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    const fetchRecords = async (studentId, currentFilters = filters, currentTab = activeTab) => {
        if (!studentId) return;
        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            const queryParams = {};
            
            if (currentTab === 'attendance') {
                if (currentFilters.dateType === 'specific' && currentFilters.date) {
                    queryParams.date = currentFilters.date;
                } else if (currentFilters.dateType === 'range' && currentFilters.from && currentFilters.to) {
                    queryParams.from = currentFilters.from;
                    queryParams.to = currentFilters.to;
                }
                
                const res = await attendanceAPI.getStudentHistory(studentId, queryParams);
                if (res.success) {
                    setAttendanceData(res.data);
                }
            } else {
                // Keep leave history if it was there, but use leaveAPI
                const res = await api.get(`/records/leave?student_id=${studentId}`);
                if (res.success) {
                    setLeaveData(res.data);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (selectedStudent) {
            fetchRecords(selectedStudent.id);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student);
        // Auto fetch when clicked
        fetchRecords(student.id, filters, activeTab);
    };

    const filteredStudents = useMemo(() => {
        if (!searchStudent) return students;
        const lower = searchStudent.toLowerCase();
        return students.filter(s => 
            s.name.toLowerCase().includes(lower) || 
            s.registrationNumber.toLowerCase().includes(lower)
        );
    }, [students, searchStudent]);

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
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Click a student to view their attendance and leave history</p>
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
                {selectedStudent && (
                    <p className="text-lg text-gray-700 mt-2">Student: {selectedStudent.name} ({selectedStudent.registrationNumber})</p>
                )}
                <p className="text-sm text-gray-500 mt-1">Generated on: {new Date().toLocaleString()}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel: Student List */}
                <div className="lg:w-1/3 xl:w-1/4 flex flex-col bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm print:hidden overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Present Students</h2>
                        <div className="relative">
                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2 space-y-1 flex-1">
                        {filteredStudents.length === 0 ? (
                            <p className="text-center text-sm text-slate-500 py-6">No students found.</p>
                        ) : (
                            filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleStudentClick(student)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                                        selectedStudent?.id === student.id 
                                        ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800' 
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            selectedStudent?.id === student.id 
                                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-300'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        }`}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${selectedStudent?.id === student.id ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{student.registrationNumber}</p>
                                        </div>
                                    </div>
                                    {selectedStudent?.id === student.id && (
                                        <ChevronRightIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Data */}
                <div className="lg:w-2/3 xl:w-3/4 space-y-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm print:hidden">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {activeTab === 'attendance' ? (
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
                                        <div className="space-y-2 md:col-span-1 grid grid-cols-2 gap-4">
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
                                    <div className="md:col-span-1 flex justify-end">
                                        <button 
                                            type="submit"
                                            disabled={loading || !selectedStudent}
                                            className="w-full px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? <span className="animate-spin text-xl">⟳</span> : <SearchIcon className="w-4 h-4" />}
                                            {loading ? 'Searching...' : 'Apply Filter'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="md:col-span-3 text-sm text-slate-500 p-2">
                                    Leave history automatically displays all records for the selected student. No date filtering is needed.
                                </div>
                            )}
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
                                    if (selectedStudent) fetchRecords(selectedStudent.id, filters, 'attendance');
                                }}
                                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'attendance' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                Attendance History
                            </button>
                            <button 
                                onClick={() => { 
                                    setActiveTab('leave'); 
                                    if (selectedStudent) fetchRecords(selectedStudent.id, filters, 'leave');
                                }}
                                className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'leave' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                            >
                                Leave History
                            </button>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            {!selectedStudent ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <UserIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Student</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-sm">Please select a student from the list on the left to view their detailed attendance and leave records.</p>
                                </div>
                            ) : activeTab === 'attendance' ? (
                                <>
                                    {attendanceData.length > 0 && (
                                        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 text-sm font-bold print:hidden">
                                            <div className="text-brand-600 dark:text-brand-400 border-r border-slate-200 dark:border-slate-700 pr-6">
                                                Latest Status: 
                                                <span className={`inline-flex ml-2 px-2 py-0.5 rounded-md text-white uppercase text-xs tracking-wider ${
                                                    attendanceData[0]?.status === 'Present' ? 'bg-emerald-500' : 
                                                    attendanceData[0]?.status === 'Absent' ? 'bg-red-500' : 'bg-amber-500'
                                                }`}>
                                                    {attendanceData[0]?.status}
                                                </span>
                                            </div>
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
                                                    <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">Please select filters and click Apply.</td>
                                                </tr>
                                            ) : attendanceData.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="p-8 text-center text-slate-500 text-sm">No attendance records found for the selected dates.</td>
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
                                        ) : leaveData.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No leave records found for this student.</td>
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
            </div>
        </div>
    );
};

export default PastRecords;
