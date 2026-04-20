import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { noticeAPI, leaveAPI, complaintAPI, studentAPI } from '../../services/api';
import {
    HomeIcon,
    UsersIcon,
    ToolIcon,
    UserIcon,
    BuildingIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    PlusIcon,
    BellIcon,
    RefreshCwIcon
} from '../../components/common/Icons';
import Table, { TableRow, TableCell } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const WardenDashboard = () => {
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(true);

    // UI States
    const [submitting, setSubmitting] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);

    // Data States
    const [notices, setNotices] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [floorStudents, setFloorStudents] = useState([]);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', priority: 'Normal' });
    const isInitialLoad = useRef(true);

    // Profile Summary
    const wardenProfile = {
        name: user?.name || 'Authorized Warden',
        hostel: user?.assignedHostel || 'Not Assigned',
        floor: user?.assignedFloor || 'Not Assigned',
        email: user?.email || 'N/A',
        phone: user?.phone || 'N/A',
        gender: user?.gender || 'N/A',
        employeeId: user?.employeeId || 'WARDEN-ID-TBD',
        role: user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Warden'
    };

    const fetchDashboardData = useCallback(async () => {
        // Only show full-page loading if it is the very first load
        if (isInitialLoad.current) {
            setLoading(true);
        }
        
        try {
            // Refresh user profile to get latest assignments
            if (refreshProfile) await refreshProfile();

            const [noticesRes, leavesRes, complaintsRes, studentsRes] = await Promise.all([
                noticeAPI.getAll({ limit: 5 }),
                leaveAPI.getAll(),
                complaintAPI.getAll(),
                studentAPI.getMyFloorStudents().catch(() => ({ success: true, data: [] }))
            ]);

            if (noticesRes.success) setNotices(noticesRes.data);
            if (leavesRes.success) {
                setPendingLeaves(leavesRes.data.filter(l => l.status === 'Pending'));
            }
            if (complaintsRes.success) {
                setComplaints(complaintsRes.data.filter(c => c.status === 'Pending').slice(0, 5));
            }
            if (studentsRes.success) {
                setFloorStudents(studentsRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch warden dashboard data:', error);
        } finally {
            setLoading(false);
            isInitialLoad.current = false;
        }
    }, [refreshProfile]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await noticeAPI.create(noticeForm);
            if (res.success) {
                setNotices([res.data, ...notices]);
                setNoticeForm({ title: '', content: '', priority: 'Normal' });
                setShowNoticeModal(false);
                alert('Announcement posted successfully');
            }
        } catch {
            alert('Failed to post announcement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            const res = await leaveAPI.update(id, status);
            if (res.success) {
                setPendingLeaves(prev => prev.filter(l => l._id !== id));
                alert(`Leave request ${status.toLowerCase()}`);
            }
        } catch {
            alert('Action failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400"></div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Initialising Warden Console...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors px-4 md:px-8 pt-8">
            {/* TOP SECTION: Welcome & Warden Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Warden Profile Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all flex flex-col md:flex-row h-full">
                    <div className="bg-slate-900 dark:bg-slate-950 p-8 text-white relative md:w-2/5 flex flex-col justify-center">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
                                <UserIcon className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight lowercase">{wardenProfile.name}</h2>
                            <p className="text-brand-400 text-xs font-bold tracking-wider mt-1 italic">{wardenProfile.role}</p>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Console</span>
                                </div>
                                <button 
                                    onClick={fetchDashboardData}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all group"
                                    title="Refresh Data"
                                >
                                    <RefreshCwIcon className="w-3.5 h-3.5 text-white/60 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
                                </button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                            <BuildingIcon className="w-40 h-40" />
                        </div>
                    </div>
                    <div className="p-8 flex-1 bg-slate-50/30 dark:bg-slate-900/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Primary Assignment</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <BuildingIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                        {wardenProfile.hostel}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Managed Floor</p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <HomeIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                        {wardenProfile.floor}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Employee Identity</p>
                                    <p className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">{wardenProfile.employeeId}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Communication</p>
                                     <p className="text-xs font-bold text-slate-600 dark:text-slate-300 break-all" style={{textTransform: 'lowercase'}}>{(wardenProfile.email || '').toLowerCase()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Contact Terminal</p>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{wardenProfile.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Biological Identity</p>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{wardenProfile.gender}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Announcement Action Box (Dark box with Blue button) */}
                <div className="lg:col-span-2 bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border border-slate-800 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center group transition-all">
                    <div className="mb-6 w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                        <PlusIcon className="w-8 h-8 text-brand-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Broadcast Terminal</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 italic">Ready for institutional updates</p>
                    
                    <Button 
                        onClick={() => setShowNoticeModal(true)}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-12 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-brand-600/30 flex items-center gap-3 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Post Announcement
                    </Button>
                </div>
            </div>

            {/* LOWER SECTION: Operations & Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Leave Requests */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all h-full">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-amber-50/30 dark:bg-amber-900/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                    <ClockIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pending Institutional Leaves</h3>
                            </div>
                            <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-bold uppercase tracking-widest">{pendingLeaves.length} Active Requests</div>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-700">
                            {pendingLeaves.length > 0 ? pendingLeaves.map((leave) => (
                                <div key={leave._id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 text-lg shadow-sm">
                                            {leave.studentName?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{leave.studentName || 'Resident Student'}</p>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    {new Date(leave.fromDate).toLocaleDateString()} — {new Date(leave.toDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 italic">" {leave.reason} "</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => handleLeaveAction(leave._id, 'Approved')}
                                            className="flex-1 md:flex-none px-8 py-3.5 bg-brand-600 dark:bg-brand-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                                        >
                                            Authorize
                                        </button>
                                        <button
                                            onClick={() => handleLeaveAction(leave._id, 'Rejected')}
                                            className="flex-1 md:flex-none px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700 border-dashed">
                                        <CheckIcon className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest italic">All residency leave protocols reconciled</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION: Floor Residents (NEW) */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all h-fit">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-indigo-50/30 dark:bg-indigo-900/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                    <UsersIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Jurisdictional Residents</h3>
                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                                        Mapping: {wardenProfile.hostel} • {wardenProfile.floor}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest">{floorStudents.length} Students Assigned</div>
                            </div>
                        </div>
                        <div className="p-0">
                            {floorStudents.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                            <tr>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Information</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Room Unit</th>
                                                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Terminal Info</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                            {floorStudents.map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center font-bold text-slate-500 text-xs">
                                                                {s.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">{s.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 tracking-tight" style={{textTransform: 'lowercase'}}>{(s.email || '').toLowerCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-bold border border-brand-100 dark:border-brand-900/50">
                                                            R-{s.room}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.phone}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{s.block} Block</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700 border-dashed">
                                        <UsersIcon className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest italic leading-relaxed">No personnel records detected on your assigned floor jurisdiction</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Maintenance & Notices Column */}
                <div className="space-y-8">
                    {/* Maintenance Feed */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white">
                            <div className="flex items-center gap-3">
                                <ToolIcon className="w-4 h-4 text-brand-400" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest">Active Maintenance Ops</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
                            {complaints.length > 0 ? complaints.map((c) => (
                                <div key={c._id} className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-3 hover:border-brand-300 transition-all group">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest leading-none bg-brand-50 dark:bg-brand-900/30 px-2 py-1 rounded-md">{c.category || 'General'}</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-tighter ${c.priority === 'High' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}>
                                            {c.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">{c.description}</p>
                                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight italic">Unit: {c.roomNumber || 'TBD'}</span>
                                        </div>
                                        <button className="text-[10px] font-bold text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-colors">Resolve</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest italic text-center py-10 leading-relaxed px-4">No critical maintenance tickets currently in the institutional pipeline</p>
                            )}
                        </div>
                    </div>

                    {/* Notice History Reel */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-brand-50/50 dark:bg-brand-900/10">
                            <div className="flex items-center gap-3">
                                <BellIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">Recent Notices</h3>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
                            {notices.map((n) => (
                                <div key={n._id} className="p-5 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all rounded-2xl group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{n.title}</h4>
                                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${n.priority === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>{n.priority}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-3 italic">"{n.content}"</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                        <span className="text-[9px] font-bold text-brand-500/50 uppercase tracking-widest">Warden Post</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Announcement Modal */}
            <Modal
                isOpen={showNoticeModal}
                onClose={() => setShowNoticeModal(false)}
                title="Broadcast Institutional Notice"
            >
                <form onSubmit={handleNoticeSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                        <input
                            required
                            type="text"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-brand-500 transition-all"
                            placeholder="Announcement title..."
                            value={noticeForm.title}
                            onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Content Details</label>
                        <textarea
                            required
                            rows="5"
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold dark:text-white outline-none focus:border-brand-500 transition-all resize-none"
                            placeholder="Details of the announcement..."
                            value={noticeForm.content}
                            onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority Selection</label>
                        <select
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-brand-500 transition-all"
                            value={noticeForm.priority}
                            onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                        >
                            <option value="Normal">Normal</option>
                            <option value="High">High Priority</option>
                            <option value="Urgent">Emergency / Urgent</option>
                        </select>
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={submitting}
                        className="w-full h-14 rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                    >
                        Publish Information
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default WardenDashboard;
