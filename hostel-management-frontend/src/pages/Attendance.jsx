import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import Button from '../components/common/Button';
import Table, { TableRow, TableCell } from '../components/common/Table';

const Attendance = () => {
    const { user } = useAuth();
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        hostel: 'All Hostels',
        floor: 'All Floors',
        status: 'All Status'
    });

    const hostels = ['All Hostels', 'Alpha Block', 'Beta Block', 'Gamma Block', 'Delta Block'];
    const floors = ['All Floors', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'];
    const statuses = ['All Status', 'Present', 'Absent', 'Leave', 'Not Marked'];

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const res = await reportsAPI.getAttendance();
                if (res.success) {
                    const mappedList = res.data.map(item => ({
                        _id: item._id,
                        studentName: item.student?.user?.name || 'Unknown Student',
                        hostelName: item.student?.hostel?.name || 'N/A',
                        floor: item.student?.floor || 'N/A',
                        roomNumber: item.student?.room?.roomNumber || 'N/A',
                        biometricTime: new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: item.status
                    }));
                    setAttendanceList(mappedList);
                }
            } catch (error) {
                console.error('Failed to fetch attendance:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const filteredList = attendanceList.filter(item => {
        return (filters.hostel === 'All Hostels' || item.hostelName === filters.hostel) &&
            (filters.floor === 'All Floors' || item.floor === filters.floor) &&
            (filters.status === 'All Status' || item.status === filters.status);
    });

    const stats = {
        total: attendanceList.length,
        present: attendanceList.filter(a => a.status === 'Present').length,
        absent: attendanceList.filter(a => a.status === 'Absent').length,
        notMarked: attendanceList.filter(a => a.status === 'Not Marked').length
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Monitoring</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time biometric attendance tracking across all hostels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 self-center border border-green-200 dark:border-green-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                        System Online
                    </span>
                    <Button variant="secondary" size="sm" className="hidden sm:block">Export Report</Button>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Students</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
                    <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">Across all Hostels</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 text-green-600 dark:text-green-400">Present Today</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.present}</span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                            {Math.round((stats.present / stats.total) * 100)}%
                        </span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 text-red-600 dark:text-red-400">Absent Today</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.absent}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col transition-colors">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 text-amber-600 dark:text-amber-400">Not Marked</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.notMarked}</span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end transition-colors">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Hostel</label>
                    <select
                        value={filters.hostel}
                        onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[160px]"
                    >
                        {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Floor</label>
                    <select
                        value={filters.floor}
                        onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[140px]"
                    >
                        {floors.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[140px]"
                    >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setFilters({ hostel: 'All Hostels', floor: 'All Floors', status: 'All Status' })}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <Table headers={['Student Name', 'Hostel', 'Floor', 'Room', 'Biometric Time', 'Status']}>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan="6" className="py-20 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </TableCell>
                        </TableRow>
                    ) : filteredList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan="6" className="py-20 text-center text-slate-400 dark:text-slate-500 font-medium">
                                No records found matching current filters.
                            </TableCell>
                        </TableRow>
                    ) : filteredList.map((record) => (
                        <TableRow key={record._id}>
                            <TableCell>
                                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{record.studentName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{record.hostelName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">{record.floor}</span>
                            </TableCell>
                            <TableCell>
                                <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                                    {record.roomNumber}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">{record.biometricTime}</span>
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${record.status === 'Present' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' :
                                    record.status === 'Absent' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' :
                                        'bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                                    }`}>
                                    {record.status}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            </div>
        </div>
    );
};

export default Attendance;
