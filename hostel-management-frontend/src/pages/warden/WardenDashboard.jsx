import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { noticeAPI, leaveAPI, complaintAPI, studentAPI } from '../../services/api';
import {
    HomeIcon,
    UsersIcon,
    ClipboardIcon,
    ToolIcon,
    UserIcon,
    BuildingIcon,
    CalendarIcon,
    CheckIcon,
    XIcon,
    ClockIcon,
    PlusIcon,
    BellIcon,
    BoltIcon
} from '../../components/common/Icons';
import Table, { TableRow, TableCell } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const WardenDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // UI States
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [showLeaveHistoryModal, setShowLeaveHistoryModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Data States
    const [notices, setNotices] = useState([]);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '', priority: 'Normal' });

    // Mock Profile (To be replaced by real data if available)
    const wardenProfile = {
        name: user?.name || 'Authorized Warden',
        hostel: user?.hostel || 'Main Hostel',
        floors: user?.floor || 'All Floors',
        totalStudents: 124
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [noticesRes, leavesRes, complaintsRes] = await Promise.all([
                    noticeAPI.getAll({ limit: 5 }),
                    leaveAPI.getAll(),
                    complaintAPI.getAll()
                ]);

                if (noticesRes.success) setNotices(noticesRes.data);
                if (leavesRes.success) {
                    setPendingLeaves(leavesRes.data.filter(l => l.status === 'Pending'));
                }
                if (complaintsRes.success) {
                    setComplaints(complaintsRes.data.filter(c => c.status !== 'Resolved').slice(0, 5));
                }

                // Mock Biometric Data for demonstration
                setAttendanceList([
                    { id: '101', name: 'Arun Kumar', room: '102', time: '07:15 AM', status: 'Present' },
                    { id: '102', name: 'Bala Chandar', room: '104', time: '07:22 AM', status: 'Present' },
                    { id: '103', name: 'Deepak Raj', room: '201', time: '--:--', status: 'Absent' },
                    { id: '104', name: 'Eswaran M', room: '205', time: '07:05 AM', status: 'Present' },
                ]);

            } catch (error) {
                console.error('Failed to fetch warden dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await noticeAPI.create(noticeForm);
            if (res.success) {
                setNotices([res.data, ...notices]);
                setShowNoticeModal(false);
                setNoticeForm({ title: '', content: '', priority: 'Normal' });
                alert('Announcement posted successfully');
            }
        } catch (error) {
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
        } catch (error) {
            alert('Action failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Initialising Warden Console...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header & Profile Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
                    <div className="bg-slate-900 p-8 text-white flex flex-col justify-center items-center md:items-start md:w-1/3 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
                                <UserIcon className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight">{wardenProfile.name}</h2>
                            <p className="text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Authorized Officer</p>
                        </div>
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10">
                            <BuildingIcon className="w-48 h-48" />
                        </div>
                    </div>
                    <div className="flex-1 p-8 grid grid-cols-2 gap-6 bg-slate-50/30">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Assigned Hostel</p>
                            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <BuildingIcon className="w-4 h-4 text-brand-600" />
                                {wardenProfile.hostel}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Managed Floors</p>
                            <p className="text-sm font-black text-slate-800">{wardenProfile.floors}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Student Census</p>
                            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-brand-600" />
                                {wardenProfile.totalStudents} Global Residents
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Console Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs font-black text-emerald-600 uppercase">System Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-brand-600 rounded-[2rem] p-6 text-white flex flex-col justify-between shadow-xl shadow-brand-600/30 group">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Quick Command</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowNoticeModal(true)}
                                className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-brand-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20 flex items-center justify-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Post Announcement
                            </button>
                            <button className="w-full py-4 bg-black/20 hover:bg-black/40 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2">
                                <BoltIcon className="w-4 h-4" />
                                Start Roll Call
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Primary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left & Middle: Operational Tables */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Attendance Monitoring */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                                    <ClipboardIcon className="w-5 h-5 text-brand-600" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Biometric Attendance Log</h3>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Filter by ID/Room..."
                                    className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest w-48 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-4 md:p-8">
                            <div className="overflow-hidden border border-slate-100 rounded-3xl overflow-x-auto">
                                <Table headers={['Student ID', 'Full Name', 'Room No', 'Timestamp', 'Status']}>
                                    {attendanceList.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell><span className="text-[11px] font-mono font-black text-brand-600">{entry.id}</span></TableCell>
                                            <TableCell><span className="text-xs font-black text-slate-900">{entry.name}</span></TableCell>
                                            <TableCell><span className="text-xs font-bold text-slate-600">Room {entry.room}</span></TableCell>
                                            <TableCell><span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{entry.time}</span></TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${entry.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                    {entry.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Pending Leaves */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center">
                                    <ClockIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Pending Leave Requests</h3>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {pendingLeaves.length > 0 ? pendingLeaves.map((leave) => (
                                <div key={leave._id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm">
                                            {leave.studentName?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{leave.studentName || 'Resident Student'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(leave.fromDate).toLocaleDateString()} to {new Date(leave.toDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleLeaveAction(leave._id, 'Approved')}
                                            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleLeaveAction(leave._id, 'Rejected')}
                                            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] italic">No pending requests</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Maintenance & Announcements */}
                <div className="space-y-8">

                    {/* Active Maintenance Tickets */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                            <div className="flex items-center gap-3">
                                <ToolIcon className="w-4 h-4 text-brand-400" />
                                <h3 className="text-xs font-black uppercase tracking-widest">Maintenance Feed</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {complaints.map((c) => (
                                <div key={c._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 hover:border-brand-200 transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category: {c.type}</span>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${c.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {c.priority} Priority
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 line-clamp-2">{c.description}</p>
                                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/50">
                                        <span className="text-[11px] font-mono text-brand-600 font-bold uppercase">Rm: {c.roomNo}</span>
                                        <button className="text-[9px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-colors">Update Status</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Announcement Reel */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-brand-50/50">
                            <div className="flex items-center gap-3">
                                <BellIcon className="w-5 h-5 text-brand-600" />
                                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Recent Notices</h3>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {notices.map((n) => (
                                <div key={n._id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all rounded-xl">
                                    <h4 className="text-xs font-black text-slate-900 mb-1">{n.title}</h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">{n.content}</p>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showNoticeModal}
                onClose={() => setShowNoticeModal(false)}
                title="Post Official Announcement"
            >
                <form onSubmit={handleNoticeSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                        <input
                            required
                            type="text"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-brand-500 transition-all"
                            placeholder="Urgent Maintenance Notice..."
                            value={noticeForm.title}
                            onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                        <textarea
                            required
                            rows="5"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold outline-none focus:border-brand-500 transition-all resize-none"
                            placeholder="Details of the announcement..."
                            value={noticeForm.content}
                            onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                        <select
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-brand-500 transition-all"
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
                        className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em]"
                    >
                        Publish Information
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default WardenDashboard;
