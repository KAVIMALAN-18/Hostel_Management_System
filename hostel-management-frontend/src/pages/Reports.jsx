import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import Table, { TableRow, TableCell } from '../components/common/Table';
import {
    ClipboardIcon,
    UsersIcon,
    CalendarIcon,
    ToolIcon,
    ClockIcon,
    BuildingIcon,
    StarIcon
} from '../components/common/Icons';

/**
 * Reports Component
 * enterprise-style Reports page providing aggregated operational analytics.
 */
const Reports = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isWarden = user?.role === 'warden';

    const [activeTab, setActiveTab] = useState('attendance');
    const [stats, setStats] = useState({
        totalStudents: 0,
        occupancyPercentage: 0,
        presentToday: 0,
        activeLeaves: 0,
        openTickets: 0
    });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Get current month in YYYY-MM format
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [filters, setFilters] = useState({
        hostel: 'All',
        floor: 'All',
        dateRange: 'Last 30 Days'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await reportsAPI.getStats();
                if (res.success) setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                let res;
                switch (activeTab) {
                    case 'attendance': res = await reportsAPI.getAttendance(); break;
                    case 'leave': res = await reportsAPI.getLeave(); break;
                    case 'maintenance': res = await reportsAPI.getMaintenance(); break;
                    case 'occupancy': res = await reportsAPI.getOccupancy(); break;
                    case 'mess': res = await reportsAPI.getMessFeedback(); break;
                    default: break;
                }
                if (res?.success) {
                    setReportData(res.data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${activeTab} report:`, error);
                setReportData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [activeTab, filters]);

    // Export handlers
    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const response = await reportsAPI.exportPDF(selectedMonth);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `hostel-report-${selectedMonth}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export PDF: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const response = await reportsAPI.exportExcel(selectedMonth);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `hostel-report-${selectedMonth}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Failed to export Excel: ' + error.message);
        } finally {
            setExporting(false);
        }
    };

    const tabs = [
        { id: 'attendance', label: 'Attendance Report', icon: ClockIcon },
        { id: 'leave', label: 'Leave Report', icon: CalendarIcon },
        { id: 'maintenance', label: 'Maintenance Report', icon: ToolIcon },
        { id: 'occupancy', label: 'Occupancy Report', icon: BuildingIcon },
        { id: 'mess', label: 'Mess Feedback Report', icon: StarIcon },
    ];

    const kpiCards = [
        { label: 'Total Students', value: stats.totalStudents, icon: UsersIcon },
        { label: 'Occupancy %', value: `${stats.occupancyPercentage}%`, icon: BuildingIcon },
        { label: 'Present Today', value: stats.presentToday, icon: ClockIcon },
        { label: 'Active Leaves', value: stats.activeLeaves, icon: CalendarIcon },
        { label: 'Open Tickets', value: stats.openTickets, icon: ToolIcon },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Analytics</h1>
                <p className="text-slate-500 font-medium">Aggregated operational reports and system health metrics.</p>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpiCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-slate-100 bg-slate-50/30 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-white border-brand-500 text-brand-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* FiltersRow */}
                <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-white">
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.hostel}
                            onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                        >
                            <option>All Hostels</option>
                            <option>Diamond</option>
                            <option>Sapphire</option>
                        </select>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                        />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="bg-rose-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {exporting ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            )}
                            Export PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={exporting}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {exporting ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="flex-1 p-4">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregating Records...</span>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'attendance' && (
                                <Table headers={['Date', 'Total Students', 'Present', 'Absent', 'On Leave', 'Not Marked']}>
                                    {reportData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell><span className="font-mono font-bold text-slate-900">{row.date}</span></TableCell>
                                            <TableCell><span className="font-bold">{row.total}</span></TableCell>
                                            <TableCell><span className="text-emerald-600 font-bold">{row.present}</span></TableCell>
                                            <TableCell><span className="text-rose-600 font-bold">{row.absent}</span></TableCell>
                                            <TableCell><span className="text-blue-600 font-bold">{row.onLeave}</span></TableCell>
                                            <TableCell><span className="text-slate-400 font-bold">{row.notMarked}</span></TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            )}

                            {activeTab === 'leave' && (
                                <Table headers={['Student Name', 'Hostel', 'Floor', 'From', 'To', 'Days', 'Status', 'Approved By']}>
                                    {reportData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell><span className="font-bold text-slate-900">{row.studentName}</span></TableCell>
                                            <TableCell><span>{row.hostelName}</span></TableCell>
                                            <TableCell><span>{row.floor}</span></TableCell>
                                            <TableCell><span className="text-[11px] font-mono">{new Date(row.fromDate).toLocaleDateString()}</span></TableCell>
                                            <TableCell><span className="text-[11px] font-mono">{new Date(row.toDate).toLocaleDateString()}</span></TableCell>
                                            <TableCell><span>{row.days}</span></TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border 
                                                    ${row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                    {row.status}
                                                </span>
                                            </TableCell>
                                            <TableCell><span className="text-xs font-semibold text-slate-500">{row.actionBy || '-'}</span></TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            )}

                            {activeTab === 'maintenance' && (
                                <Table headers={['Ticket ID', 'Hostel', 'Room', 'Issue', 'Priority', 'Status', 'Last Updated']}>
                                    {reportData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell><span className="font-bold text-slate-400 text-xs">#{row._id.slice(-6).toUpperCase()}</span></TableCell>
                                            <TableCell><span>{row.hostelName || 'Unknown'}</span></TableCell>
                                            <TableCell><span>{row.roomNumber || 'N/A'}</span></TableCell>
                                            <TableCell><span className="text-slate-600 font-medium">{row.title}</span></TableCell>
                                            <TableCell>
                                                <span className={`text-[10px] font-black uppercase ${row.priority === 'High' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    {row.priority || 'Low'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border 
                                                    ${row.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {row.status}
                                                </span>
                                            </TableCell>
                                            <TableCell><span className="text-[11px] text-slate-400 font-mono">{new Date(row.updatedAt).toLocaleDateString()}</span></TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            )}

                            {activeTab === 'occupancy' && (
                                <Table headers={['Hostel', 'Floor', 'Total Rooms', 'Total Beds', 'Occupied beds', 'Vacant Beds', 'Occupancy %']}>
                                    {reportData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell><span className="font-bold text-slate-900">{row.hostel}</span></TableCell>
                                            <TableCell><span>{row.floor}</span></TableCell>
                                            <TableCell><span>{row.totalRooms}</span></TableCell>
                                            <TableCell><span>{row.totalBeds}</span></TableCell>
                                            <TableCell><span className="text-brand-600 font-bold">{row.occupiedBeds}</span></TableCell>
                                            <TableCell><span className="text-emerald-600 font-bold">{row.vacantBeds}</span></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="bg-brand-500 h-full" style={{ width: `${row.occupancyRate}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black">{row.occupancyRate.toFixed(1)}%</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            )}

                            {activeTab === 'mess' && (
                                <Table headers={['Date', 'Average Rating', 'Total Responses']}>
                                    {reportData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell><span className="font-mono font-bold text-slate-900">{row.date}</span></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-amber-500">
                                                    <StarIcon className="w-3 h-3 fill-current" />
                                                    <span className="font-black">{row.avgRating}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><span className="font-bold text-slate-500">{row.totalResponses}</span></TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
