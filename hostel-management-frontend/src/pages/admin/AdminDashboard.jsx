import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../../services/api';
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
    const [blockStats, setBlockStats] = useState([]);
    const [studentDist, setStudentDist] = useState({ distribution: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);


    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const response = await reportsAPI.exportPDF(new Date().toISOString());
            const blob = response instanceof Blob ? response : new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);


            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Hostel_Monthly_Report_${new Date().getMonth() + 1}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to generate PDF report. Please try again later.');
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, blockRes, distRes] = await Promise.all([
                    reportsAPI.getStats(),
                    reportsAPI.getHostelBlockStats(),
                    reportsAPI.getStudentDistribution()
                ]);
                if (statsRes.success) setStats(statsRes.data);
                if (blockRes.success) setBlockStats(blockRes.data);
                if (distRes.success) setStudentDist(distRes.data);
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
                setBlockStats([
                    { block: 'A Block', count: 0, capacity: 0 },
                    { block: 'B Block', count: 0, capacity: 0 },
                    { block: 'C Block', count: 0, capacity: 0 },
                    { block: 'D Block', count: 0, capacity: 0 }
                ]);
                setStudentDist({
                    total: 0,
                    distribution: [
                        { status: 'pending', count: 0 },
                        { status: 'allocated', count: 0 },
                        { status: 'checked-in', count: 0 },
                        { status: 'checked-out', count: 0 }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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

    // ── Student Distribution (real allocationStatus counts) ──────────────
    const DIST_CONFIG = [
        { status: 'allocated',    label: 'Allocated',   color: '#10b981' },
        { status: 'checked-in',  label: 'Checked-In',  color: '#6366f1' },
        { status: 'checked-out', label: 'Checked-Out', color: '#f59e0b' },
        { status: 'pending',     label: 'Pending',     color: '#ef4444' },
    ];
    const distTotal = studentDist?.total || 0;

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
                    <button 
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                    >
                        <CalendarIcon className={`w-4 h-4 ${downloading ? 'animate-spin' : ''}`} /> 
                        {downloading ? 'Generating Audit...' : 'Download PDF Audit'}
                    </button>

                    <button onClick={() => navigate('/admin/records')} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/20 transition-all transform active:scale-95 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" /> View Past Records
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickActionCard onClick={() => navigate('/admin/students')} icon={UserPlusIcon} title="Register Resident" subtitle="Provision new student" color="brand" />
                <QuickActionCard onClick={() => navigate('/attendance')} icon={CalendarIcon} title="Census Logs" subtitle="Attendance & Leave" color="emerald" />
                <QuickActionCard onClick={() => navigate('/maintenance')} icon={AlertCircleIcon} title="Resolved Cases" subtitle="Maintenance History" color="orange" />
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Distribution Pie Chart — real allocationStatus data */}
                <StudentDistributionChart distConfig={DIST_CONFIG} distribution={studentDist?.distribution || []} total={distTotal} />

                {/* Hostel Block (A/B/C/D) Pie Chart */}
                <HostelBlockChart blockStats={blockStats} />
            </div>
        </div>
    );
};

// Internal Helper Components for Pixel-Perfect Layout
const QuickActionCard = (props) => {
    const { title, subtitle, color, onClick, icon: Icon } = props;
    const bgMap = {
        brand: 'bg-brand-50 dark:bg-brand-900/20',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20',
        orange: 'bg-orange-50 dark:bg-orange-900/20'
    };
    
    return (
        <div onClick={onClick} className={`p-4 border rounded-2xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group ${bgMap[color]}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${color === 'brand' ? 'bg-brand-500' : color === 'emerald' ? 'bg-emerald-500' : color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'} text-white`}>
                {Icon && <Icon className="w-5 h-5" />}
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h4>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-1 uppercase tracking-tight">{subtitle}</p>
        </div>
    );
}

// ── Student Distribution Chart (allocationStatus) ─────────────────────────
const StudentDistributionChart = ({ distConfig, distribution, total }) => {
    const denom = total > 0 ? total : 1;

    // Build conic-gradient stops
    let cursor = 0;
    const stops = distConfig.map(({ status, color }) => {
        const item = distribution.find((d) => d.status === status);
        const count = item ? item.count : 0;
        const pct = (count / denom) * 100;
        const stop = `${color} ${cursor.toFixed(2)}% ${(cursor + pct).toFixed(2)}%`;
        cursor += pct;
        return stop;
    });
    const gradient = total > 0
        ? `conic-gradient(${stops.join(', ')})`
        : `conic-gradient(#e2e8f0 0% 100%)`;

    return (
        <div className="data-card border-slate-200 dark:border-slate-700 h-full flex flex-col pt-8 pb-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Student Distribution</h3>
                    <p className="text-xs font-normal text-slate-500 mt-1">Live allocation status of all students</p>
                </div>
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                    <PieChartIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10">
                {/* Donut pie */}
                <div
                    className="relative w-56 h-56 rounded-full transition-all hover:scale-105 flex-shrink-0"
                    style={{ background: gradient }}
                >
                    <div className="absolute inset-0 m-auto w-[150px] h-[150px] bg-white dark:bg-slate-900 rounded-full shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{total}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Students</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 w-full md:w-48">
                    {distConfig.map(({ status, label, color }) => {
                        const item = distribution.find((d) => d.status === status);
                        const count = item ? item.count : 0;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                            <div key={status} className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: color, boxShadow: `0 2px 6px ${color}60` }}
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">{label}</span>
                                        <span className="text-[10px] font-medium text-slate-400">{pct}% of total</span>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-slate-900 dark:text-white">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Dynamic color palette for any number of blocks
const BLOCK_COLORS = [
    '#6366f1', '#f59e0b', '#10b981', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', 
    '#14b8a6', '#84cc16'
];

const HostelBlockChart = ({ blockStats }) => {
    // blockStats is dynamically populated from the database
    const total = blockStats.reduce((sum, b) => sum + b.count, 0);
    const denom = total > 0 ? total : 1;

    // Build conic-gradient stops dynamically mapped to available blocks
    let cursor = 0;
    const stops = blockStats.map((b, i) => {
        const pct = (b.count / denom) * 100;
        const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
        const stop = `${color} ${cursor.toFixed(2)}% ${(cursor + pct).toFixed(2)}%`;
        cursor += pct;
        return stop;
    });
    const gradient = total > 0
        ? `conic-gradient(${stops.join(', ')})`
        : `conic-gradient(#e2e8f0 0% 100%)`;

    return (
        <div className="data-card border-slate-200 dark:border-slate-700 h-full flex flex-col pt-8 pb-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Hostel Block Distribution</h3>
                    <p className="text-xs font-normal text-slate-500 mt-1">Students across active blocks</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BuildingIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10">
                {/* Donut pie chart */}
                <div
                    className="relative w-56 h-56 rounded-full transition-all hover:scale-105 flex-shrink-0"
                    style={{ background: gradient }}
                >
                    <div className="absolute inset-0 m-auto w-[150px] h-[150px] bg-white dark:bg-slate-900 rounded-full shadow-[inset_0_-2px_10px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{total}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Students</span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3 w-full md:w-48 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {blockStats.map((stat, i) => {
                        const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                        const color = BLOCK_COLORS[i % BLOCK_COLORS.length];
                        return (
                            <div key={stat.block || i} className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: color, boxShadow: `0 2px 6px ${color}60` }}
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block truncate max-w-[80px]" title={stat.block}>{stat.block}</span>
                                        <span className="text-[10px] font-medium text-slate-400">{pct}% of total</span>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-slate-900 dark:text-white">{stat.count}</span>
                            </div>
                        );
                    })}
                    {blockStats.length === 0 && (
                        <div className="text-center p-4">
                            <span className="text-xs font-medium text-slate-500">No blocks available</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
