import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Table, { TableRow, TableCell } from '../components/common/Table';
import mockData from '../utils/mockData';

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
                // Use centralized mockData for attendance
                const list = mockData.attendance.list.map((item, i) => ({
                    _id: `ATT00${i + 1}`,
                    studentName: item.name,
                    hostelName: i % 2 === 0 ? 'Alpha Block' : 'Beta Block',
                    floor: `${(i % 5)}th Floor`,
                    roomNumber: item.room,
                    biometricTime: item.biometricTime,
                    status: item.status
                }));
                setAttendanceList(list);
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Monitoring</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Real-time biometric attendance tracking across all hostels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 self-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                        System Online
                    </span>
                    <Button variant="secondary" size="sm" className="hidden sm:block">Export Report</Button>
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
                    <div className="mt-2 text-[10px] text-slate-500 font-medium">Across all 4 Hostels</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-green-600">Present Today</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{stats.present}</span>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            {Math.round((stats.present / stats.total) * 100)}%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-red-600">Absent Today</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.absent}</span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 text-amber-600">Not Marked</span>
                    <span className="text-3xl font-bold text-slate-900">{stats.notMarked}</span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Hostel</label>
                    <select
                        value={filters.hostel}
                        onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[160px]"
                    >
                        {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Floor</label>
                    <select
                        value={filters.floor}
                        onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[140px]"
                    >
                        {floors.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-w-[140px]"
                    >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => setFilters({ hostel: 'All Hostels', floor: 'All Floors', status: 'All Status' })}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 p-2"
                >
                    Reset Filters
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Table headers={['Student Name', 'Hostel', 'Floor', 'Room', 'Biometric Time', 'Status']}>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan="6" className="py-20 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </TableCell>
                        </TableRow>
                    ) : filteredList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan="6" className="py-20 text-center text-slate-400 font-medium">
                                No records found matching current filters.
                            </TableCell>
                        </TableRow>
                    ) : filteredList.map((record) => (
                        <TableRow key={record._id}>
                            <TableCell>
                                <span className="font-bold text-slate-900 text-sm tracking-tight">{record.studentName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-600 text-sm font-medium">{record.hostelName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-600 text-sm font-medium">{record.floor}</span>
                            </TableCell>
                            <TableCell>
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200">
                                    {record.roomNumber}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-xs font-mono text-slate-500 font-bold">{record.biometricTime}</span>
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${record.status === 'Present' ? 'bg-green-50 text-green-700 border-green-100' :
                                    record.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-slate-50 text-slate-500 border-slate-100'
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
