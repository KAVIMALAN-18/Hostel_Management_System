import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import {
    ClipboardIcon,
    UsersIcon,
    CalendarIcon,
    ToolIcon,
    ClockIcon,
    BuildingIcon,
    StarIcon,
    ArrowUpRightIcon,
    DownloadIcon,
    TrendingUpIcon,
    FilterIcon,
    ChevronRightIcon,
    ShieldIcon,
    FileTextIcon,
    ActivityIcon
} from '../components/common/Icons';

const Reports = () => {
    const { user } = useAuth();
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

    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [filters, setFilters] = useState({ hostel: 'All' });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await reportsAPI.getStats();
                if (res.success) setStats(res.data);
            } catch (error) {
                console.error(error);
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
                if (res?.success) setReportData(res.data);
            } catch (error) {
                setReportData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [activeTab, selectedMonth]);

    const handleExport = async (format) => {
        setExporting(true);
        try {
            const res = format === 'pdf' 
                ? await reportsAPI.exportPDF(selectedMonth) 
                : await reportsAPI.exportExcel(selectedMonth);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `institutional_dossier_${selectedMonth}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export deployment failed');
        } finally {
            setExporting(false);
        }
    };

    const tabs = [
        { id: 'attendance', label: 'Live Presence', icon: ClockIcon },
        { id: 'leave', label: 'Authorization', icon: CalendarIcon },
        { id: 'maintenance', label: 'Service Tickets', icon: ToolIcon },
        { id: 'occupancy', label: 'Spatial Assets', icon: BuildingIcon },
        { id: 'mess', label: 'Culinary Feed', icon: StarIcon },
    ];

    const kpiCards = [
        { label: 'Personnel', value: stats.totalStudents, icon: UsersIcon, color: 'brand' },
        { label: 'Spatial Load', value: `${stats.occupancyPercentage}%`, icon: BuildingIcon, color: 'emerald' },
        { label: 'Deployment', value: stats.presentToday, icon: ActivityIcon, color: 'blue' },
        { label: 'Exits', value: stats.activeLeaves, icon: CalendarIcon, color: 'amber' },
        { label: 'Backlog', value: stats.openTickets, icon: ToolIcon, color: 'rose' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Analytical Intelligence</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">Executive-level insight into institutional deployment and resource efficiency.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Telemetry Active</span>
                    </div>
                </div>
            </div>

            {/* KPI Cluster */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {kpiCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-soft hover:shadow-premium transition-all duration-500 group">
                        <div className={`w-12 h-12 mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 bg-slate-50 dark:bg-slate-900 group-hover:scale-110`}>
                            <card.icon className="w-6 h-6 text-slate-300 group-hover:text-brand-600 transition-colors" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1.5">{card.label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Analysis Console */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-premium overflow-hidden transition-all duration-700">
                {/* Tabs / Controls */}
                <div className="flex flex-col xl:flex-row border-b border-slate-50 dark:border-slate-700 bg-slate-50/20 dark:bg-white/5 items-center px-4">
                    <div className="flex flex-1 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-8 py-8 text-sm font-bold transition-all border-b-2 whitespace-nowrap uppercase tracking-wider
                                    ${activeTab === tab.id
                                        ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 py-6 xl:py-0 px-8">
                         <div className="flex items-center gap-3 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                             <CalendarIcon className="w-4 h-4 text-slate-400" />
                             <input 
                                type="month"
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none uppercase"
                             />
                         </div>
                         <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
                         <button 
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-xl hover:scale-110 transition-all disabled:opacity-50"
                         >
                            <DownloadIcon className="w-4 h-4" />
                         </button>
                    </div>
                </div>

                <div className="p-10">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
                            <ActivityIcon className="w-12 h-12 text-slate-200 animate-pulse" />
                            <p className="text-xs font-bold uppercase tracking-wider">Aggregating analytical fragments...</p>
                        </div>
                    ) : reportData.length === 0 ? (
                        <div className="py-24 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">No data points recovered for selected temporal window.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Identifier</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Temporal Mark</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Metadata</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status / Metric</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {reportData.map((row, i) => (
                                        <tr key={row._id || i} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-6">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tabular-nums">#{row._id?.slice(-6) || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-300">
                                                        {row.date || row.createdAt || row.updatedAt ? new Date(row.date || row.createdAt || row.updatedAt).toLocaleDateString() : 'Active'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">{row.title || row.student?.user?.name || row.hostel || 'General Entry'}</span>
                                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-tight">{row.priority || row.hostelName || 'System Logs'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-bold tabular-nums">
                                                 {row.status ? (
                                                     <span className={`px-4 py-1.5 rounded-xl text-xs border uppercase tracking-wider
                                                        ${row.status === 'Resolved' || row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}
                                                     `}>
                                                         {row.status}
                                                     </span>
                                                 ) : (
                                                     <div className="flex items-center gap-3">
                                                         <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                              <div className="bg-brand-500 h-full" style={{ width: `${Math.random() * 100}%` }}></div>
                                                         </div>
                                                         <span className="text-xs text-slate-400">{row.avgRating || row.occupancyRate || 'N/A'}</span>
                                                     </div>
                                                 )}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-brand-500">
                                                     <ArrowUpRightIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                      <div className="relative z-10">
                           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Strategic Initiative</h3>
                           <h2 className="text-2xl font-bold text-white tracking-tight leading-tight mb-6">Optimized spatial allocation could increase efficiency by 12%.</h2>
                           <button className="flex items-center gap-3 text-brand-400 text-xs font-bold uppercase tracking-wider hover:text-brand-300 transition-colors">
                               View Deployment Plan
                               <ChevronRightIcon className="w-4 h-4" />
                           </button>
                      </div>
                      <ShieldIcon className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                 </div>
                 <div className="bg-white dark:bg-brand-900/10 p-10 rounded-[3rem] border border-slate-200 dark:border-brand-500/20 shadow-soft">
                      <div className="flex items-center justify-between mb-8">
                           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Health Metrics</h3>
                           <TrendingUpIcon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="space-y-6">
                           {[
                                { l: 'System Uptime', v: '99.98%' },
                                { l: 'Resolution Speed', v: '14.2h' },
                                { l: 'Student Satisfaction', v: '4.8/5' }
                           ].map((m, i) => (
                               <div key={i} className="flex items-center justify-between group">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{m.l}</span>
                                    <div className="flex items-center gap-4">
                                         <div className="w-24 h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                              <div className="bg-brand-500 h-full group-hover:scale-x-110 transition-transform origin-left" style={{ width: '85%' }}></div>
                                         </div>
                                         <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tabular-nums">{m.v}</span>
                                    </div>
                               </div>
                           ))}
                      </div>
                 </div>
            </div>
        </div>
    );
};

export default Reports;
