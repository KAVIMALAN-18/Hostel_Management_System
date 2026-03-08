import { useState, useEffect } from 'react';
import { studentAPI, leaveAPI, noticeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import mockData from '../../utils/mockData';
import {
    PhoneIcon,
    MailIcon,
    MapPinIcon,
    PlusIcon,
    BellIcon,
    ClockIcon,
    CalendarIcon,
    ClipboardIcon,
    DropIcon,
    UserIcon,
    HomeIcon,
    CheckCircleIcon,
    XIcon
} from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Table, { TableRow, TableCell } from '../../components/common/Table';
import CircularProgress from '../../components/common/CircularProgress';

const StudentDashboard = () => {
    const { user } = useAuth();

    // Data States
    const [profile, setProfile] = useState(null);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Attendance Stats (Using centralized mockData fallback)
    const [attendanceStats, setAttendanceStats] = useState({
        dailyStatus: 'Present',
        totalPresent: 142,
        totalAbsent: 8,
        attendanceRate: 94.6,
        biometricLogs: [
            { id: 1, time: '08:12 AM', location: 'Main Entrance', type: 'In' },
            { id: 2, time: '12:45 PM', location: 'Mess Hall', type: 'In' },
            { id: 3, time: '07:30 PM', location: 'Main Entrance', type: 'In' }
        ]
    });

    // UI States
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        fromDate: '',
        toDate: '',
        reason: '',
        leaveType: 'Personal'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async (userId) => {
            setLoading(true);
            try {
                const [profileRes, leavesRes, noticesRes] = await Promise.all([
                    studentAPI.getProfile(userId),
                    leaveAPI.getAll(),
                    noticeAPI.getAll({ limit: 5 })
                ]);

                if (profileRes.success && profileRes.data) {
                    setProfile(profileRes.data);
                } else {
                    throw new Error('No profile');
                }

                if (leavesRes.success && leavesRes.data.length > 0) {
                    setLeaveHistory(leavesRes.data);
                } else {
                    const mockLeaves = mockData.leaveRequests.map((l, i) => ({
                        _id: `LVE00${i + 1}`,
                        fromDate: l.fromDate,
                        toDate: l.toDate,
                        status: l.status,
                        reason: l.reason
                    }));
                    setLeaveHistory(mockLeaves);
                }

                if (noticesRes.success && noticesRes.data.length > 0) {
                    setNotices(noticesRes.data);
                } else {
                    const mockNotices = mockData.announcements.map((n, i) => ({
                        _id: `NOT00${i + 1}`,
                        title: n.title,
                        content: n.description,
                        createdAt: n.date
                    }));
                    setNotices(mockNotices);
                }

            } catch (error) {
                // Fallback to primary mock student Arjun Venkat
                const mockStudent = mockData.studentDirectory[0];
                setProfile({
                    name: mockStudent.name,
                    phone: mockStudent.contact,
                    profile: {
                        registrationNumber: mockStudent.studentId,
                        bloodGroup: mockStudent.bloodGroup,
                        guardianName: mockStudent.parentName,
                        guardianRelation: 'Father',
                        guardianPhone: '+91 98765 00000',
                        nativePlace: 'Chennai, TN',
                        hostel: { name: mockStudent.hostel },
                        room: { roomNumber: mockStudent.roomNumber }
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        const userId = user?.id || user?._id;
        if (userId) {
            fetchDashboardData(userId);
        } else {
            // If No ID after auth is ready, stop loading
            setLoading(false);
        }
    }, [user]);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await leaveAPI.apply(leaveForm);
            if (res.success) {
                setLeaveHistory(prev => [res.data, ...prev]);
                setShowLeaveModal(false);
                setLeaveForm({ fromDate: '', toDate: '', reason: '', leaveType: 'Personal' });
            }
        } catch (error) {
            console.error('Leave submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    const studentProfile = profile?.profile || {};

    return (
        <div className="max-w-[1400px] mx-auto p-6 bg-[#f8fafc] min-h-screen space-y-8">

            {/* 1. Header & Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Dashboard</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                        Academic Residency Management System
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-black text-slate-700 uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT COLUMN: Student Profile & Personal Info */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* SECTION: Student Personal Information */}
                    <div className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-[#f9fafb]/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Personal Profile</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Status: Active</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registration ID</p>
                                <p className="text-sm font-black text-slate-900 font-mono">{studentProfile.registrationNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                {/* Student Info Group */}
                                <div className="space-y-8">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</p>
                                        <h3 className="text-xl font-black text-slate-800">{profile?.name || user?.name}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Contact</p>
                                            <div className="flex items-center gap-2">
                                                <PhoneIcon className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-sm font-bold text-slate-700">{profile?.phone || user?.phone}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Blood Group</p>
                                            <div className="flex items-center gap-2">
                                                <DropIcon className="w-3.5 h-3.5 text-rose-400" />
                                                <span className="text-sm font-bold text-slate-700">{studentProfile.bloodGroup || 'Not Updated'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Digital Mailing Address</p>
                                        <div className="flex items-center gap-2">
                                            <MailIcon className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-sm font-bold text-slate-700">{user?.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent & Native Info Group */}
                                <div className="space-y-8 p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 border-dashed">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200 pb-3">Emergency & Origins</h4>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Guardian / Parent Details</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600">{studentProfile.guardianName || 'Guardian Name TBD'}</span>
                                                    <span className="bg-slate-200 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                        {studentProfile.guardianRelation || 'Relation'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <PhoneIcon className="w-3 h-3 text-slate-400" />
                                                    {studentProfile.guardianPhone || 'No Phone Registered'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-200/50 w-2/3"></div>

                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Native Place / Domicile</p>
                                            <div className="flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 text-indigo-400" />
                                                <span className="text-xs font-black text-slate-700">{studentProfile.nativePlace || 'Native Location Pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-50 p-6 flex items-center justify-between border-t border-slate-100">
                            <div className="flex items-center gap-4">
                                <HomeIcon className="w-5 h-5 text-brand-600" />
                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight italic">
                                    Allocated Unit: {studentProfile.hostel?.name || 'Awaiting'} • {studentProfile.room?.roomNumber ? `Room #${studentProfile.room.roomNumber}` : 'Room TBD'}
                                </span>
                            </div>
                            <button className="text-[10px] font-black text-brand-600 hover:text-brand-900 uppercase tracking-[0.2em] transition-colors">Verification Certificate</button>
                        </div>
                    </div>

                    {/* SECTION: Attendance Overview & Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Attendance Tracker Card */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-md border border-slate-100 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Attendance Analytics</h3>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${attendanceStats.dailyStatus === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${attendanceStats.dailyStatus === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    Daily: {attendanceStats.dailyStatus}
                                </div>
                            </div>

                            <div className="flex items-center gap-8 py-4">
                                <CircularProgress
                                    percentage={attendanceStats.attendanceRate}
                                    size={140}
                                    strokeWidth={12}
                                    color="#4f46e5"
                                    label="Overall Rate"
                                />
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Total Present</p>
                                        <p className="text-2xl font-black text-slate-900 text-right">{attendanceStats.totalPresent}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Absent Days</p>
                                        <p className="text-2xl font-black text-rose-500 text-right">{attendanceStats.totalAbsent}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Biometric Time Logs */}
                        <div className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-slate-50 bg-[#f9fafb]/30 flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Biometric Activity</h3>
                            </div>
                            <div className="flex-1">
                                <table className="w-full">
                                    <tbody className="divide-y divide-slate-50">
                                        {attendanceStats.biometricLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{log.location}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Security Node Verified</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <p className="text-xs font-black text-slate-700">{log.time}</p>
                                                    <p className={`text-[8px] font-black uppercase tracking-widest ${log.type === 'In' ? 'text-emerald-500' : 'text-slate-400'}`}>SCAN: {log.type}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-slate-50/50 flex justify-center border-t border-slate-50">
                                <button className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors">Full Scanned Statistics</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Notices & Leave History */}
                <div className="col-span-12 lg:col-span-4 space-y-8">

                    {/* LEAVE MANAGEMENT QUICK ACTIONS */}
                    <div className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Leave Management</h3>
                            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">Institutional Absence Authorization Protocol</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowLeaveModal(true)}
                                    className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Apply For Leave
                                </button>
                                <button className="w-full py-4 bg-indigo-500/50 border border-indigo-400/50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all">
                                    Residency Guidelines
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 font-black tracking-tighter">LEAVE</div>
                    </div>

                    {/* LEAVE HISTORY CARD */}
                    <div className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-hidden flex flex-col h-fit">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                            <ClipboardIcon className="w-5 h-5 text-slate-400" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Logs</h3>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                            {leaveHistory.length > 0 ? leaveHistory.slice(0, 4).map((leave) => (
                                <div key={leave._id} className="p-5 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-slate-300" />
                                            <span className="text-[11px] font-black text-slate-700">
                                                {new Date(leave.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(leave.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                            leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight line-clamp-1 italic">{leave.reason}</p>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-slate-300 font-bold uppercase text-[9px] tracking-widest italic">No leave activity log found</div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex justify-center">
                            <button className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Full History Directory</button>
                        </div>
                    </div>

                    {/* NOTICES SIDEBAR */}
                    <div className="bg-white rounded-[2rem] shadow-md border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                            <BellIcon className="w-5 h-5 text-slate-400" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notices</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {notices.length > 0 ? notices.map((notice) => (
                                <div key={notice._id} className="p-6 group cursor-pointer hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{notice.title}</h4>
                                        <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-bold">{notice.content}</p>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-300 font-bold uppercase text-[9px] tracking-widest italic">Institutional feed empty</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Application Modal */}
            <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Institutional Absence Authorization">
                <form onSubmit={handleLeaveSubmit} className="space-y-6">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100 pb-4 mb-6">Request Residency Leave Permit</p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Absence Commencement</label>
                            <input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Residency Re-entry</label>
                            <input type="date" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">Formal Justification</label>
                        <textarea required rows="4" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none shadow-inner" placeholder="Provide detailed institutional reason..." value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" variant="primary" loading={submitting} className="w-full h-16 !rounded-3xl !text-[12px] !font-black uppercase tracking-[0.35em] shadow-xl shadow-indigo-100">Submit Application</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentDashboard;
