import { useState, useEffect } from 'react';
import { hostelAPI, reportsAPI } from '../../services/api';
import { CheckIcon } from '../../components/common/Icons';
import mockData from '../../utils/mockData';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await reportsAPI.getStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setStats({
                    totalOccupancy: 0,
                    bedsOccupied: 0,
                    totalBeds: 0,
                    todayPresent: 0,
                    onApprovedLeave: 0,
                    onboardingPending: 0,
                    awaitingRoomAssign: 0,
                    maintenanceOpen: 0,
                    maintenanceHighPriority: 0
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const res = await reportsAPI.getMaintenance();
                if (res.success) {
                    setMaintenanceRequests(res.data.slice(0, 5).map(item => ({
                        id: item._id.toString().slice(-7).toUpperCase(),
                        location: `Room ${item.roomNumber || 'N/A'}`,
                        issueType: item.category,
                        reportedBy: item.student?.name || 'Resident',
                        status: item.status
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch maintenance data:', error);
            }
        };
        fetchMaintenance();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    );

    // Weekly onboarding data
    const weeklyData = [
        { day: 'Mon', count: 6 },
        { day: 'Tue', count: 12 },
        { day: 'Wed', count: 18 },
        { day: 'Thu', count: 14 },
        { day: 'Fri', count: 17 }
    ];
    const maxCount = Math.max(...weeklyData.map(d => d.count));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Real-time overview of hostel operations and students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary text-xs py-2">Download Report</button>
                    <button className="btn-primary text-xs py-2">+ New Announcement</button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Occupancy */}
                <div className="data-card">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Total Occupancy</span>
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.totalOccupancy}%</span>
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{stats?.bedsOccupied} / {stats?.totalBeds} BEDS FILLED</p>
                </div>

                {/* Today's Attendance */}
                <div className="data-card border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Today's Attendance</span>
                        <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.todayPresent}</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Present</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{stats?.onApprovedLeave} ON APPROVED LEAVE</p>
                </div>

                {/* Onboarding Status */}
                <div className="data-card">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Onboarding Status</span>
                        <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.onboardingPending}</span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Pending</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{stats?.awaitingRoomAssign} AWAITING ROOM ASSIGN</p>
                </div>

                {/* Active Maintenance */}
                <div className="data-card border-amber-100 dark:border-amber-500/20">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Maintenance</span>
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stats?.maintenanceOpen}</span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Open</span>
                    </div>
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest leading-none">{stats?.maintenanceHighPriority} HIGH PRIORITY TICKETS</p>
                </div>
            </div>

            {/* Quick Actions - Productivity Boost */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all group">
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">Add Student</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">New registration</span>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all group">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">Attendance</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Mark daily logs</span>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all group">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">Leave Requests</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{stats?.pendingLeaves || 0} Pending</span>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all group">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">Rooms</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Manage blocks</span>
                </div>
            </div>

            {/* Middle Section: Hostel Health + Weekly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hostel Health Overview */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-colors">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Hostel Health Overview</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Block A (Boys)</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">- Status:</span>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">Good</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Block B (Girls)</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">- Status:</span>
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 ml-1">⚠ Attention (Plumbing)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Block C (Staff)</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">- Status:</span>
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">Good</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Student Onboarding Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-colors">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Weekly Student Onboarding Trend</h3>
                    <div className="h-48 flex items-end justify-between gap-4 px-2">
                        {weeklyData.map((data) => (
                            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-brand-500 dark:bg-brand-600 rounded-t-lg transition-all hover:bg-brand-600 dark:hover:bg-brand-500"
                                    style={{ height: `${(data.count / maxCount) * 100}%`, minHeight: '20px' }}>
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{data.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>0</span>
                        <span>20</span>
                    </div>
                </div>
            </div>

            {/* Recent Maintenance Requests Table */}
            <div className="table-container shadow-premium">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Recent Maintenance Requests</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-header">
                            <tr>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ticket ID</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Issue Type</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reported By</th>
                                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/40">
                            {maintenanceRequests.map((request) => (
                                <tr key={request.id} className="table-row-hover">
                                    <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">{request.id}</td>
                                    <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{request.location}</td>
                                    <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{request.issueType}</td>
                                    <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{request.reportedBy}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tight ${request.status === 'In Progress'
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                            }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
