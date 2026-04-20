import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { studentAPI, leaveAPI, noticeAPI, attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
    XIcon,
    BuildingIcon
} from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Table, { TableRow, TableCell } from '../../components/common/Table';
import CircularProgress from '../../components/common/CircularProgress';

const StudentDashboard = () => {
    const { user, refreshProfile } = useAuth();
    const { theme } = useTheme();

    // Data States
    const [profile, setProfile] = useState(null);
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWardenModal, setShowWardenModal] = useState(false);

    // Attendance Stats (Placeholders for real biometric API)
    const [attendanceStats, setAttendanceStats] = useState({
        dailyStatus: 'Unknown',
        totalPresent: 0,
        totalAbsent: 0,
        attendanceRate: 0,
        biometricLogs: []
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
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Profile Update States
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        phone: '',
        bloodGroup: '',
        guardianName: '',
        guardianPhone: '',
        guardianRelation: '',
        nativePlace: ''
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Only set loading on initial fetch to avoid flickering on re-sync
            if (!profile) setLoading(true);
            try {
                // Refresh profile for latest jurisdictional data
                if (refreshProfile) await refreshProfile();

                const [profileRes, leavesRes, noticesRes, attendanceRes] = await Promise.all([
                    studentAPI.getProfile(),
                    leaveAPI.getAll(),
                    noticeAPI.getAll({ limit: 5 }),
                    attendanceAPI.getMyAttendance().catch(() => null)
                ]);

                if (profileRes.success && profileRes.data) {
                    setProfile(profileRes.data);
                    const p = profileRes.data.profile || {};
                    setUpdateForm({
                        phone: profileRes.data.phone || user?.phone || '',
                        bloodGroup: p.bloodGroup || '',
                        guardianName: p.guardianName || '',
                        guardianPhone: p.guardianPhone || '',
                        guardianRelation: p.guardianRelation || '',
                        nativePlace: p.nativePlace || ''
                    });
                }

                if (leavesRes.success && leavesRes.data.length > 0) {
                    setLeaveHistory(leavesRes.data);
                } else {
                    setLeaveHistory([]);
                }

                if (noticesRes.success && noticesRes.data.length > 0) {
                    setNotices(noticesRes.data);
                } else {
                    setNotices([]);
                }
                
                if (attendanceRes && attendanceRes.success && attendanceRes.data) {
                    setAttendanceStats(attendanceRes.data);
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        const userId = user?.id || user?._id;
        if (userId) {
            fetchDashboardData();
            
            // Listen for global re-sync events (e.g. from DashboardLayout or visibility changes)
            window.addEventListener('resync-data', fetchDashboardData);
            return () => window.removeEventListener('resync-data', fetchDashboardData);
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        try {
            const res = await leaveAPI.apply(leaveForm);
            if (res.success) {
                // Add the new leave to the top of the list
                setLeaveHistory(prev => [res.data, ...prev]);
                setShowLeaveModal(false);
                setLeaveForm({ fromDate: '', toDate: '', reason: '', leaveType: 'Personal' });
                setSubmitSuccess(true);
                setTimeout(() => setSubmitSuccess(false), 4000);
            } else {
                setSubmitError(res.message || 'Failed to submit leave. Please try again.');
            }
        } catch (error) {
            console.error('Leave submission error:', error);
            setSubmitError(error.message || 'Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setUpdateError('');
        try {
            const userId = user?.id || user?._id;
            const res = await studentAPI.update(userId, updateForm);
            if (res.success) {
                setProfile(prev => ({
                    ...prev,
                    phone: updateForm.phone,
                    profile: { ...prev.profile, ...updateForm }
                }));
                setShowUpdateModal(false);
                setUpdateSuccess(true);
                setTimeout(() => setUpdateSuccess(false), 4000);
            } else {
                setUpdateError(res.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setUpdateError(error.message || 'Network error.');
        } finally {
            setUpdatingProfile(false);
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
        </div>
    );

    const studentProfile = profile?.profile || {};

    return (
        <div className="max-w-[1400px] mx-auto p-6 bg-[#f8fafc] dark:bg-slate-900 min-h-screen space-y-8 transition-colors">

            {/* Success Toast */}
            {(submitSuccess || updateSuccess) && (
                <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-pulse">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">
                        {submitSuccess ? 'Leave submitted successfully!' : 'Profile updated successfully!'}
                    </span>
                </div>
            )}

            {/* 1. Header & Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Institutional Dashboard</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-300 font-bold uppercase tracking-wide mt-1">
                        Academic Residency Management System
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3 transition-colors">
                        <CalendarIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT COLUMN: Student Profile & Personal Info */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* SECTION: Student Personal Information */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-[#f9fafb]/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Personal Profile</h2>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Verification Status: Active</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Button size="sm" variant="outline" className="mb-2 !rounded-xl !text-xs !font-bold uppercase tracking-wider" onClick={() => setShowUpdateModal(true)}>
                                    Update Details
                                </Button>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider leading-none mb-1">Registration ID</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{studentProfile.registrationNumber || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="p-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                {/* Student Info Group */}
                                <div className="space-y-8">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Full Legal Name</p>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile?.name || user?.name}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Phone Contact</p>
                                            <div className="flex items-center gap-2">
                                                <PhoneIcon className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profile?.phone || user?.phone}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Blood Group</p>
                                            <div className="flex items-center gap-2">
                                                <DropIcon className="w-3.5 h-3.5 text-rose-400" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{studentProfile.bloodGroup || 'Not Updated'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Digital Mailing Address</p>
                                        <div className="flex items-center gap-2">
                                            <MailIcon className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent & Native Info Group */}
                                <div className="space-y-8 p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 border-dashed transition-colors">
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-3">Emergency & Origins</h4>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Parent / Guardian Details</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{studentProfile.guardianName || 'Parent/Guardian Name TBD'}</span>
                                                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-tight">
                                                        {studentProfile.guardianRelation || 'Relation'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-300">
                                                    <PhoneIcon className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                                                    {studentProfile.guardianPhone || 'No Phone Registered'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-200/50 dark:bg-slate-700/50 w-2/3"></div>

                                        <div>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Native Place / Domicile</p>
                                            <div className="flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 text-indigo-400" />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{studentProfile.nativePlace || 'Native Location Pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-50 dark:bg-brand-900/20 p-6 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <HomeIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight italic">
                                    Primary Unit: {studentProfile.hostel?.name || 'Awaiting'} • {studentProfile.room?.roomNumber ? `Room #${studentProfile.room.roomNumber}` : 'Room TBD'}
                                </span>
                            </div>
                            <button className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-900 dark:hover:text-brand-200 uppercase tracking-wide transition-colors">Digital ID</button>
                        </div>
                    </div>

                    {/* SECTION: Institutional Residency Assignment (Hostel Details) */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-[#f9fafb]/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100 dark:shadow-none">
                                    <HomeIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Hostel Details</h2>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Residency Allocation Status</p>
                                </div>
                            </div>
                            {studentProfile.hostel ? (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800`}>
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Allocated
                                </div>
                            ) : (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800`}>
                                    <ClockIcon className="w-3 h-3" />
                                    Pending
                                </div>
                            )}
                        </div>

                        {studentProfile.hostel ? (
                            <div className="p-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Institutional Hostel</p>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">{studentProfile.hostel.name}</h4>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mt-1">{studentProfile.hostel.type} Residency</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Block & Floor</p>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                                            {studentProfile.block?.name || ''}{studentProfile.block?.name && studentProfile.room?.floor ? ' - ' : ''}{studentProfile.room?.floor || (!studentProfile.block?.name ? 'Awaiting Allocation' : '')}
                                        </h4>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase mt-1">Institutional Wing</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">Room & Bed Identity</p>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Room {studentProfile.room?.roomNumber}</h4>
                                        <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase mt-1">Bed Assignment: {studentProfile.bed?.bedNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900 dark:bg-slate-900 rounded-3xl p-8 relative overflow-hidden group transition-colors">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <UserIcon className="w-4 h-4 text-emerald-400" />
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Roommate Directory</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            {profile?.profile?.roommates && profile.profile.roommates.length > 0 ? (
                                                profile.profile.roommates.map((mate, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
                                                        <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400">
                                                            {mate.charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-bold text-white tracking-tight">{mate}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs font-bold text-slate-500 italic uppercase tracking-wider">No roommates assigned to this residency unit</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 text-6xl opacity-5 font-bold tracking-tight text-white uppercase">Directory</div>
                                </div>
                                </div>

                                 {/* SECTION: Assigned Warden (NEW) */}
                                {profile.profile?.warden ? (
                                    <div className="mt-8 bg-brand-50 dark:bg-brand-900/10 p-8 rounded-3xl border border-brand-100 dark:border-brand-900/30 flex flex-col md:flex-row items-center justify-between gap-6 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-brand-600 dark:bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20 group-hover:scale-105 transition-transform">
                                                <UserIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mb-1">Assigned Jurisdictional Warden</p>
                                                <h4 
                                                    onClick={() => setShowWardenModal(true)}
                                                    className="text-lg font-bold text-slate-900 dark:text-white tracking-tight cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                                                >
                                                    {profile.profile.warden.name}
                                                </h4>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 tracking-wider">
                                                    Jurisdiction: {profile.profile.warden.hostelName || 'General'} • {profile.profile.warden.assignedFloor || 'All Floors'}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                        <PhoneIcon className="w-3.5 h-3.5" />
                                                        {profile.profile.warden.phone}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 lowercase">
                                                        <MailIcon className="w-3.5 h-3.5" />
                                                        {profile.profile.warden.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="px-6 py-3 bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all active:scale-95 shadow-sm">
                                            Contact Warden
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-3xl border-dashed text-center">
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">No jurisdictional warden assigned to this floor yet</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
                                    <HomeIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Room not assigned yet</h3>
                                <p className="text-sm text-slate-400 dark:text-slate-300 font-bold uppercase tracking-wider mt-2 max-w-xs mx-auto">
                                    Institutional residency allocation is currently in progress. Please check back later.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* SECTION: Attendance Overview & Analytics */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Attendance Tracker Card */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-md border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-full transition-colors">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Attendance Analytics</h3>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${attendanceStats.dailyStatus === 'Present' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
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
                                    color={theme === 'dark' ? '#818cf8' : '#4f46e5'}
                                    label="Overall Rate"
                                />
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 text-right">Total Present</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white text-right">{attendanceStats.totalPresent}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1 text-right">Absent Days</p>
                                        <p className="text-2xl font-bold text-rose-500 dark:text-rose-400 text-right">{attendanceStats.totalAbsent}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Notices & Leave History */}
                <div className="col-span-12 lg:col-span-4 space-y-8">

                    {/* LEAVE MANAGEMENT QUICK ACTIONS */}
                    <div className="bg-indigo-600 dark:bg-indigo-700 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 dark:shadow-none text-white relative overflow-hidden group transition-colors">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold uppercase tracking-tight mb-2">Leave Management</h3>
                            <p className="text-indigo-200 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 leading-relaxed">Institutional Absence Authorization Protocol</p>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowLeaveModal(true)}
                                    className="w-full py-4 bg-white dark:bg-slate-100 text-indigo-600 dark:text-indigo-700 rounded-2xl font-bold text-xs uppercase tracking-wide hover:bg-indigo-50 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Apply For Leave
                                </button>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 font-bold tracking-tight">LEAVE</div>
                    </div>

                    {/* LEAVE HISTORY CARD */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-fit transition-colors">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                            <ClipboardIcon className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Logs</h3>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                            {leaveHistory.length > 0 ? leaveHistory.slice(0, 4).map((leave) => (
                                <div key={leave._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(leave.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(leave.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${leave.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                            leave.status === 'Rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-300 font-bold uppercase tracking-tight line-clamp-1 italic">{leave.reason}</p>
                                </div>
                            )) : (
                                <div className="p-12 text-center text-slate-300 dark:text-slate-600 font-bold uppercase text-xs tracking-wider italic">No leave activity log found</div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-50 dark:border-slate-700 flex justify-center">
                            <button className="text-xs font-bold text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider transition-colors">Full History Directory</button>
                        </div>
                    </div>

                    {/* NOTICES SIDEBAR */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                            <BellIcon className="w-5 h-5 text-slate-400 dark:text-slate-300" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notices</h3>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-700">
                            {notices.length > 0 ? notices.map((notice) => (
                                <div key={notice._id} className="p-6 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{notice.title}</h4>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed font-bold">{notice.content}</p>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-slate-300 dark:text-slate-600 font-bold uppercase text-xs tracking-wider italic">Institutional feed empty</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Application Modal */}
            <Modal isOpen={showLeaveModal} onClose={() => { setShowLeaveModal(false); setSubmitError(''); }} title="Institutional Absence Authorization">
                <form onSubmit={handleLeaveSubmit} className="space-y-6">
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">Request Residency Leave Permit</p>

                    {/* Error Banner */}
                    {submitError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                            <XIcon className="w-4 h-4 flex-shrink-0" />
                            {submitError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Absence Commencement</label>
                            <input type="date" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all" value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Residency Re-entry</label>
                            <input type="date" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all" value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Formal Justification</label>
                        <textarea required rows="4" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all resize-none shadow-inner" placeholder="Provide detailed institutional reason..." value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                    </div>
                    <div className="pt-4">
                        <Button type="submit" variant="primary" loading={submitting} className="w-full h-16 !rounded-3xl !text-sm !font-bold uppercase tracking-wide shadow-xl shadow-indigo-100">Submit Application</Button>
                    </div>
                </form>
            </Modal>

            {/* Update Profile Modal */}
            <Modal isOpen={showUpdateModal} onClose={() => { setShowUpdateModal(false); setUpdateError(''); }} title="Update Personal Information">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">Modify your institutional records</p>
                    {updateError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                            <XIcon className="w-4 h-4 flex-shrink-0" />
                            {updateError}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Phone Number</label>
                            <input type="text" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none transition-all" value={updateForm.phone} onChange={e => setUpdateForm({ ...updateForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Blood Group</label>
                            <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={updateForm.bloodGroup} onChange={e => setUpdateForm({ ...updateForm, bloodGroup: e.target.value })}>
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Parent/Guardian Name</label>
                            <input type="text" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={updateForm.guardianName} onChange={e => setUpdateForm({ ...updateForm, guardianName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Parent/Guardian Phone</label>
                            <input type="text" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={updateForm.guardianPhone} onChange={e => setUpdateForm({ ...updateForm, guardianPhone: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Parent/Guardian Relation</label>
                            <input type="text" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={updateForm.guardianRelation} onChange={e => setUpdateForm({ ...updateForm, guardianRelation: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide ml-1">Native Place</label>
                            <input type="text" required className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={updateForm.nativePlace} onChange={e => setUpdateForm({ ...updateForm, nativePlace: e.target.value })} />
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button type="submit" variant="primary" loading={updatingProfile} className="w-full h-16 !rounded-3xl !text-sm !font-bold uppercase tracking-wide shadow-xl shadow-indigo-100">Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </div>
            {/* SECTION: Warden Details Modal (NEW) */}
            {showWardenModal && profile?.profile?.warden && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowWardenModal(false)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="bg-slate-900 p-8 text-white relative">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
                                        <UserIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">{profile.profile.warden.name}</h3>
                                        <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mt-1">Residence Warden</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowWardenModal(false)}
                                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                                        <MailIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Official Communication</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{profile.profile.warden.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                                        <PhoneIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Contact Terminal</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{profile.profile.warden.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                                        <BuildingIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Jurisdictional Mapping</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                            {profile.profile.warden.hostelName || 'General Management'} • {profile.profile.warden.assignedFloor || 'Multiple Floors'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                <a 
                                    href={`tel:${profile.profile.warden.phone}`}
                                    className="flex-1 px-6 py-4 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 text-center transition-all active:scale-95"
                                >
                                    Call Warden
                                </a>
                                <button 
                                    onClick={() => setShowWardenModal(false)}
                                    className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
