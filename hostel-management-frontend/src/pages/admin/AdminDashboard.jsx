import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hostelAPI, reportsAPI } from '../../services/api';
import { 
    CheckIcon, 
    UsersIcon, 
    BuildingIcon, 
    WrenchIcon, 
    CalendarIcon, 
    PieChartIcon, 
    TrendingUpIcon,
    AlertCircleIcon,
    ArrowUpRightIcon,
    ArrowDownRightIcon,
    UserPlusIcon,
    MegaphoneIcon
} from '../../components/common/Icons';

const AdminDashboard = () => {
    const navigate = useNavigate();
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
                    maintenanceHighPriority: 0,
                    messStats: [{ avgRating: 0, total: 0 }]
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
                        status: item.status,
                        priority: item.priority || 'Medium'
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
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-brand-100 dark:border-brand-900 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-brand-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wide animate-pulse">Synchronizing Data...</span>
            </div>
        </div>
    );

    const onboardingTrend = stats?.trend || [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 }
    ];
    const maxTrend = Math.max(...onboardingTrend.map(d => d.count), 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-soft">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs tracking-wide uppercase">
                        <TrendingUpIcon className="w-3 h-3" /> System Analytics
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Integrated Command Center • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                        <CalendarIcon className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/20 transition-all transform active:scale-95 flex items-center gap-2">
                        <MegaphoneIcon className="w-4 h-4" /> Broadcast Notice
                    </button>
                </div>
            </div>

            {/* Top Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Occupancy */}
                <div className="data-card group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50 border-white/5 shadow-2x-soft">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-all duration-500"></div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                            <BuildingIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                            <ArrowUpRightIcon className="w-3 h-3" /> 2.4%
                        </span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1">Hostel Occupancy</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.totalOccupancy}%</h2>
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-300">/ 100%</span>
                        </div>
                        <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${stats?.totalOccupancy}%` }}></div>
                        </div>
                        <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-300">{stats?.bedsOccupied} of {stats?.totalBeds} Units Occupied</p>
                    </div>
                </div>

                {/* Live Attendance */}
                <div className="data-card group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg">Live</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1">Morning Census</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.todayPresent}</h2>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider ml-1">Present</span>
                        </div>
                        <p className="mt-5 text-xs font-bold text-slate-500 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                            {stats?.onApprovedLeave} Authorized Absences (Leave)
                        </p>
                    </div>
                </div>

                {/* Academic Profile */}
                <div className="data-card group relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <UsersIcon className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1">Awaiting Allocation</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.onboardingPending}</h2>
                            <span className="text-sm font-bold text-slate-400 dark:text-slate-300">Students</span>
                        </div>
                        <div className="mt-5 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-tight italic flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-bold text-blue-500">i</div>
                            Requires Room Mapping
                        </div>
                    </div>
                </div>

                {/* Maintenance Priority */}
                <div className="data-card group relative overflow-hidden border-orange-100 dark:border-orange-500/10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                            <WrenchIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg animate-pulse uppercase tracking-tight">Urgent</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1">Open Tickets</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.maintenanceOpen}</h2>
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{stats?.activeComplaints} Pending</span>
                        </div>
                        <p className="mt-5 text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            {stats?.maintenanceHighPriority} Critical Priority <ArrowUpRightIcon className="w-3 h-3" />
                        </p>
                    </div>
                </div>
            </div>

            {/* Productivity Quick Access */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard onClick={() => navigate('/admin/students')} icon={UserPlusIcon} title="Register Resident" subtitle="Provision new student" color="brand" />
                <QuickActionCard onClick={() => navigate('/attendance')} icon={CalendarIcon} title="Census Logs" subtitle="Attendance & Leave" color="emerald" />
                <QuickActionCard onClick={() => navigate('/admin/hostels')} icon={PieChartIcon} title="Inventory Manager" subtitle="Hostels & Units" color="purple" />
                <QuickActionCard onClick={() => navigate('/maintenance')} icon={AlertCircleIcon} title="Resolved Cases" subtitle="Maintenance History" color="orange" />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Onboarding Trend (2/3 width) */}
                <div className="lg:col-span-2 data-card !p-0 overflow-hidden border-slate-200 dark:border-slate-700">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide uppercase">Onboarding Trend <span className="text-xs font-normal text-slate-400 block tracking-normal normal-case">Last 7 days registration volume</span></h3>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Real-time</span>
                             </div>
                        </div>
                    </div>
                    <div className="p-8 h-64 flex items-end gap-3 lg:gap-6">
                        {onboardingTrend.map(d => (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="w-full relative">
                                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-t-xl absolute inset-0"></div>
                                    <div 
                                        className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-xl transition-all duration-700 ease-out relative group-hover:from-brand-500 group-hover:to-brand-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                        style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: '8px' }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                            {d.count} Users
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-300 group-hover:text-brand-500 transition-colors uppercase tracking-wider">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mess Analysis & Quick Health */}
                <div className="space-y-6">
                    <div className="data-card bg-slate-900 dark:bg-slate-900 border-slate-800 shadow-2xl">
                        <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Dietary Quality Feed</h3>
                        <div className="space-y-6 text-center">
                            <div className="relative inline-flex items-center justify-center p-8 border-4 border-slate-800 rounded-full">
                                <div className="absolute inset-0 rotate-12 border-4 border-brand-500 rounded-full border-t-transparent border-r-transparent"></div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-white tracking-tight">{(stats?.messStats?.[0]?.avgRating || 0).toFixed(1)}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rating</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                                    <p className="text-xl font-bold text-white">{stats?.messStats?.[0]?.total || 0}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Reviews</p>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
                                    <p className="text-xl font-bold text-emerald-500">92%</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Hygiene</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700">Audit Detailed Data</button>
                        </div>
                    </div>

                    <div className="data-card !p-0 overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Server Health</span>
                        </div>
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">API Core Status</span>
                                <span className="text-xs text-slate-500">Responding in 42ms</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 font-bold text-xs rounded uppercase">Stable</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance Command Table */}
            <div className="table-container shadow-2x-soft border-slate-200/60 dark:border-slate-700 overflow-visible">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white shadow-soft">
                            <WrenchIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Active Maintenance Queue</h3>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Monitoring last 5 mission-critical items</p>
                        </div>
                    </div>
                    <button className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 px-4 py-2 rounded-xl transition-all">View Full Command Queue</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Identifier</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Deployment Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Issue Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Reported Via</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Current Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                            {maintenanceRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">#{request.id}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{request.location}</span>
                                            <span className="text-xs text-slate-500 font-medium tracking-tight uppercase">Hostel Alpha • G-Wing</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{request.issueType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{request.reportedBy}</span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-block ${
                                            request.status === 'In Progress' 
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50' 
                                            : request.status === 'Pending'
                                            ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'
                                            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
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

// Internal Helper Components for Pixel-Perfect Layout
const QuickActionCard = ({ icon: Icon, title, subtitle, color, onClick }) => {
    const colorMap = {
        brand: 'bg-brand-500 group-hover:bg-brand-600 border-brand-100 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20',
        emerald: 'bg-emerald-500 group-hover:bg-emerald-600 border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
        purple: 'bg-purple-500 group-hover:bg-purple-600 border-purple-100 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20',
        orange: 'bg-orange-500 group-hover:bg-orange-600 border-orange-100 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
    };

    const bgMap = {
        brand: 'bg-brand-50 dark:bg-brand-900/20',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20',
        orange: 'bg-orange-50 dark:bg-orange-900/20'
    };
    
    return (
        <div onClick={onClick} className={`p-4 border rounded-2xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group ${bgMap[color]}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${color === 'brand' ? 'bg-brand-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'} text-white`}>
                <Icon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h4>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-1 uppercase tracking-tight">{subtitle}</p>
        </div>
    );
}

export default AdminDashboard;
