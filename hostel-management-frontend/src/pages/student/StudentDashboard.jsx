import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeAPI, complaintAPI, leaveAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HomeIcon, ClipboardIcon, CalendarIcon, BellIcon, ToolIcon, UserIcon, BuildingIcon, DoorIcon } from '../../components/common/Icons';
import CircularProgress from '../../components/common/CircularProgress';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Table, { TableRow, TableCell } from '../../components/common/Table';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State Management
    const [stats, setStats] = useState([
        { label: 'Assigned Room', value: 'A-102', unit: 'Room', trend: 'Occupied' },
        { label: 'Bed Position', value: 'B1', unit: 'Bed', trend: 'Allocated' },
        { label: 'Attendance', value: '96%', unit: 'Rate', trend: 'Good' },
        { label: 'Active Complaints', value: '0', unit: 'Tickets', trend: 'None' },
    ]);
    const [latestNotices, setLatestNotices] = useState([]);
    const [myComplaints, setMyComplaints] = useState([]);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        fromDate: '',
        toDate: '',
        reason: '',
        leaveType: 'Personal'
    });
    const [submitting, setSubmitting] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const [notices, complaints, leaves] = await Promise.all([
                    noticeAPI.getAll(),
                    complaintAPI.getAll(),
                    leaveAPI.getAll()
                ]);

                if (notices.success && complaints.success) {
                    setLatestNotices(notices.data.slice(0, 3));
                    const studentComplaints = complaints.data.filter(c => c.status !== 'resolved');
                    setMyComplaints(studentComplaints);

                    if (leaves.success) {
                        setLeaveHistory(leaves.data);
                    }

                    setStats([
                        { label: 'Assigned Room', value: 'A-102', unit: 'Room', trend: 'Occupied' },
                        { label: 'Bed Position', value: 'B1', unit: 'Bed', trend: 'Allocated' },
                        { label: 'Attendance', value: '96%', unit: 'Rate', trend: 'Good' },
                        { label: 'Active Complaints', value: studentComplaints.length, unit: 'Tickets', trend: studentComplaints.length > 0 ? 'Pending' : 'Stable' },
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch student data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, []);

    // Handlers
    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
            alert('Please fill all fields');
            return;
        }

        setSubmitting(true);
        try {
            const res = await leaveAPI.apply(leaveForm);
            if (res.success) {
                setLeaveHistory(prev => [res.data, ...prev]);
                setShowLeaveModal(false);
                setLeaveForm({ fromDate: '', toDate: '', reason: '', leaveType: 'Personal' });
                alert('Leave application submitted successfully!');
            }
        } catch (error) {
            console.error('Failed to submit leave:', error);
            alert(error.message || 'Failed to submit leave');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelLeave = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) return;

        try {
            const res = await leaveAPI.cancel(id);
            if (res.success) {
                setLeaveHistory(prev => prev.map(l => l._id === id ? { ...l, status: 'Cancelled' } : l));
                alert('Leave request cancelled');
            }
        } catch (error) {
            console.error('Failed to cancel leave:', error);
            alert(error.message || 'Failed to cancel leave');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Resident Profile...</span>
            </div>
        </div>
    );

    const usedDays = leaveHistory
        .filter(l => l.status === 'Approved')
        .reduce((acc, curr) => acc + (curr.days || 0), 0);
    const totalQuota = 15;
    const quotaPercentage = Math.min(Math.round((usedDays / totalQuota) * 100), 100);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="page-header">
                <div className="icon-badge icon-badge-primary">
                    <HomeIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="page-title">My Dashboard</h1>
                    <p className="page-subtitle">Your personal residency status and updates</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resident ID</span>
                        <span className="text-sm font-mono text-brand-600 font-bold">{user?._id?.slice(-8).toUpperCase() || 'ST-88294'}</span>
                    </div>
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                </div>
            </div>

            {/* Student Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Academic Attendance', value: '96%', icon: ClipboardIcon, color: 'icon-badge-primary', trend: 'Good' },
                    { label: 'Hostel Attendance', value: '98%', icon: HomeIcon, color: 'icon-badge-success', trend: 'Excellent' },
                    { label: 'Leave Quota Used', value: `${quotaPercentage}%`, icon: CalendarIcon, color: 'icon-badge-warning', trend: quotaPercentage > 50 ? 'Moderate' : 'Low' },
                    { label: 'Active Complaints', value: myComplaints.length || '0', icon: ToolIcon, color: 'icon-badge-danger', trend: myComplaints.length > 0 ? 'Pending' : 'None' },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="card-stat card-hover">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`icon-badge ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 uppercase">{stat.trend}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Core Section: Leave & Room Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="data-card">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-brand-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Leave Analytics</h3>
                    </div>
                    <div className="flex flex-col items-center py-4">
                        <CircularProgress
                            percentage={quotaPercentage}
                            size={140}
                            label="Quota Used"
                        />
                        <div className="mt-6 w-full space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Total Quota:</span>
                                <span className="font-semibold text-slate-900">{totalQuota} days</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Used:</span>
                                <span className="font-semibold text-emerald-600">{usedDays} days</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Remaining:</span>
                                <span className="font-semibold text-brand-600">{totalQuota - usedDays} days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 data-card">
                    <div className="flex items-center gap-2 mb-4">
                        <BuildingIcon className="w-5 h-5 text-brand-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">My Room Details</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: 'Hostel', value: 'Alpha Block', icon: BuildingIcon },
                            { label: 'Floor', value: 'Floor 3', icon: DoorIcon },
                            { label: 'Room', value: 'A-302', icon: DoorIcon },
                            { label: 'Bed', value: 'B1', icon: UserIcon },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <Icon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Roommates</h4>
                        <div className="space-y-2">
                            {[
                                { name: 'Rajesh Kumar', id: 'ST-7821', status: 'Present' },
                                { name: 'Amit Sharma', id: 'ST-7822', status: 'On Leave' },
                            ].map((roommate) => (
                                <div key={roommate.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-brand-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            {roommate.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{roommate.name}</p>
                                            <p className="text-xs text-slate-500">{roommate.id}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${roommate.status === 'Present'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                        {roommate.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lateral Sidebar with Residency Info & Actions */}
                <div className="space-y-6">
                    <div className="data-card border-l-4 border-l-blue-600">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Official Record Info</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Register No</span>
                                    <span className="text-sm font-bold text-slate-900">{user?.regNo || '2026BCS1024'}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Warden</span>
                                    <span className="text-sm font-bold text-slate-900 leading-none">Mrs. Selvi</span>
                                </div>
                            </div>
                            <div className="flex flex-col pt-2 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Assigned Block</span>
                                <span className="text-sm font-bold text-slate-900 uppercase">Alpha Block • Level 3</span>
                            </div>
                        </div>
                    </div>

                    <div className="data-card bg-slate-900 text-white">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Navigation</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => navigate('/mess-menu')}
                                className="py-2 text-[10px] font-bold uppercase tracking-widest border border-slate-700 rounded hover:bg-white hover:text-slate-900 transition-all font-black tracking-[0.15em]"
                            >
                                View Mess Menu
                            </button>
                            <button
                                onClick={() => setShowLeaveModal(true)}
                                className="py-2 text-[10px] font-bold uppercase tracking-widest bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-all font-black tracking-[0.15em]"
                            >
                                Apply for Leave
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Leave Logs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="data-card border-l-4 border-brand-600">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Recent Leave Logs</h3>
                            <button
                                onClick={() => setShowLeaveModal(true)}
                                className="px-3 py-1 bg-brand-50 text-brand-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-100 hover:bg-brand-600 hover:text-white transition-all"
                            >
                                + New Request
                            </button>
                        </div>

                        <div className="overflow-hidden">
                            <Table headers={['Duration', 'Type', 'Days', 'Status', 'Action']}>
                                {leaveHistory.length > 0 ? (
                                    leaveHistory.map((leave) => (
                                        <TableRow key={leave._id}>
                                            <TableCell>
                                                <div className="text-[11px] font-mono font-bold text-slate-600">
                                                    {new Date(leave.fromDate).toLocaleDateString()} <span className="text-slate-300">→</span> {new Date(leave.toDate).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-bold text-slate-500 uppercase">{leave.leaveType}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-bold text-slate-900">{leave.days}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${leave.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    leave.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        leave.status === 'Cancelled' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {(leave.status === 'Pending' || (leave.status === 'Approved' && new Date(leave.fromDate) > new Date())) && (
                                                    <button
                                                        onClick={() => handleCancelLeave(leave._id)}
                                                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-tighter"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="5" className="py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                                            No recent leave requests
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Summary Footer */}
            <div className="space-y-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-brand-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">My Profile Summary</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4 pb-2 border-b border-slate-50">Personal Information</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Full Name</span>
                                <span className="text-sm font-bold text-slate-900">{user?.name || 'Kavimalan K'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Student ID</span>
                                <span className="text-sm font-bold text-slate-900">{user?.regNo || '2026BCS1024'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Blood Group</span>
                                <span className="text-sm font-bold text-rose-600">O+ Positive</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-4 pb-2 border-b border-slate-50">Contact Information</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Mobile</span>
                                <span className="text-sm font-bold text-slate-900">+91 98765 43210</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Email</span>
                                <span className="text-sm font-bold text-slate-900">{user?.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Address</span>
                                <span className="text-sm font-bold text-slate-900 text-right max-w-[200px] truncate">123, Street Name, City, TN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            <Modal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                title="Leave Application"
                footer={(
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowLeaveModal(false)}
                        >
                            Back
                        </Button>
                        <Button
                            form="leave-form"
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            loading={submitting}
                        >
                            Submit Application
                        </Button>
                    </div>
                )}
            >
                <form id="leave-form" onSubmit={handleLeaveSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                value={leaveForm.fromDate}
                                onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                value={leaveForm.toDate}
                                onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Type</label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                            value={leaveForm.leaveType}
                            onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                        >
                            <option value="Personal">Personal Visit / Home</option>
                            <option value="Medical">Medical Treatment</option>
                            <option value="Emergency">Urgent Family Matter</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Description</label>
                        <textarea
                            rows="3"
                            required
                            placeholder="State the detailed reason for your leave request..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none"
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        ></textarea>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentDashboard;
