import { useState, useEffect } from 'react';
import { hostelAPI } from '../../services/api';
import { CheckIcon } from '../../components/common/Icons';
import mockData from '../../utils/mockData';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await hostelAPI.getStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (err) {
                // Mock data from centralized mockData utility
                const d = mockData.adminDashboard;
                setStats({
                    totalOccupancy: d.occupancyRate,
                    bedsOccupied: Math.round(d.totalRooms * d.occupancyRate / 100),
                    totalBeds: d.totalRooms,
                    todayPresent: d.attendanceSummary.present,
                    onApprovedLeave: d.attendanceSummary.onLeave,
                    onboardingPending: 15,
                    awaitingRoomAssign: 5,
                    maintenanceOpen: d.maintenanceSummary.pending,
                    maintenanceHighPriority: d.maintenanceSummary.inProgress
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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

    // Maintenance requests data
    const maintenanceRequests = [
        { id: 'TKT-102', location: 'Room B-304', issueType: 'Electrical', reportedBy: 'Student', status: 'In Progress' },
        { id: 'TKT-101', location: 'Common Area A', issueType: 'Plumbing', reportedBy: 'Warden', status: 'Assigned' },
        { id: 'TKT-100', location: 'Room B-303', issueType: 'Plumbings Area', reportedBy: 'Student', status: 'In Progress' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Hostel Operations Dashboard</h1>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Occupancy */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600">Total Occupancy</span>
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-slate-900">{stats?.totalOccupancy}%</span>
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </div>
                    <p className="text-xs text-slate-500">{stats?.bedsOccupied}/{stats?.totalBeds} Beds Filled</p>
                </div>

                {/* Today's Attendance */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600">Today's Attendance</span>
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-emerald-600" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-slate-900">{stats?.todayPresent}</span>
                        <span className="text-sm font-medium text-slate-600">Present</span>
                    </div>
                    <p className="text-xs text-slate-500">{stats?.onApprovedLeave} on Approved Leave</p>
                </div>

                {/* Onboarding Status */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600">Onboarding Status</span>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-slate-900">{stats?.onboardingPending}</span>
                        <span className="text-sm font-medium text-slate-600">Pending</span>
                    </div>
                    <p className="text-xs text-slate-500">{stats?.awaitingRoomAssign} Awaiting Room Assign</p>
                </div>

                {/* Active Maintenance */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-600">Active Maintenance</span>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-slate-900">{stats?.maintenanceOpen}</span>
                        <span className="text-sm font-medium text-slate-600">Open Tickets</span>
                    </div>
                    <p className="text-xs text-red-600 font-semibold">{stats?.maintenanceHighPriority} High Priority</p>
                </div>
            </div>

            {/* Middle Section: Hostel Health + Weekly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hostel Health Overview */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Hostel Health Overview</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div>
                                    <span className="text-sm font-medium text-slate-900">Block A (Boys)</span>
                                    <span className="text-xs text-slate-500 ml-2">- Status:</span>
                                    <span className="text-xs font-semibold text-emerald-600 ml-1">Good</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <div>
                                    <span className="text-sm font-medium text-slate-900">Block B (Girls)</span>
                                    <span className="text-xs text-slate-500 ml-2">- Status:</span>
                                    <span className="text-xs font-semibold text-amber-600 ml-1">⚠ Attention (Plumbing)</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div>
                                    <span className="text-sm font-medium text-slate-900">Block C (Staff)</span>
                                    <span className="text-xs text-slate-500 ml-2">- Status:</span>
                                    <span className="text-xs font-semibold text-emerald-600 ml-1">Good</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Student Onboarding Trend */}
                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Weekly Student Onboarding Trend</h3>
                    <div className="h-48 flex items-end justify-between gap-4 px-2">
                        {weeklyData.map((data) => (
                            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-brand-500 rounded-t-lg transition-all hover:bg-brand-600"
                                    style={{ height: `${(data.count / maxCount) * 100}%`, minHeight: '20px' }}>
                                </div>
                                <span className="text-xs font-medium text-slate-600">{data.day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>0</span>
                        <span>20</span>
                    </div>
                </div>
            </div>

            {/* Recent Maintenance Requests Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="p-5 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900">Recent Maintenance Requests</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Ticket ID</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Location</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Issue Type</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Reported By</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {maintenanceRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{request.id}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{request.location}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{request.issueType}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{request.reportedBy}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${request.status === 'In Progress'
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
