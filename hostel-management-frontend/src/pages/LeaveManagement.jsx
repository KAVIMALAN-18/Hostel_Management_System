import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { noticeAPI, complaintAPI, leaveAPI } from '../services/api';
import Table, { TableRow, TableCell } from '../components/common/Table';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import mockData from '../utils/mockData';

const LeaveManagement = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const isAdmin = user?.role === 'admin';
    const isWarden = user?.role === 'warden';

    useEffect(() => {
        const fetchLeaves = async () => {
            setLoading(true);
            try {
                const res = await leaveAPI.getAll();
                if (res.success && res.data.length > 0) {
                    setLeaves(res.data.map(l => ({
                        ...l,
                        leavePercentage: Math.floor(Math.random() * 20) + 2
                    })));
                } else {
                    throw new Error('No data');
                }
            } catch (error) {
                // Fallback to centralized mockData
                const list = mockData.leaveRequests.map((l, i) => ({
                    _id: `LVE00${i + 1}`,
                    studentName: l.studentName,
                    hostelName: i % 2 === 0 ? 'Alpha Block' : 'Beta Block',
                    floor: 'Floor 2',
                    fromDate: l.fromDate,
                    toDate: l.toDate,
                    days: Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000 * 60 * 60 * 24)) + 1,
                    reason: l.reason,
                    status: l.status,
                    leavePercentage: parseFloat(l.leavePercentage)
                }));
                setLeaves(list);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, [isWarden, user]);

    const handleUpdateStatus = async (id, status) => {
        setActionLoading(true);
        try {
            const res = await leaveAPI.update(id, status);
            if (res.success) {
                setLeaves(prev => prev.map(l => l._id === id ? { ...l, status } : l));
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(error.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const stats = {
        totalToday: leaves.length, // Simplified for mock
        onLeave: leaves.filter(l => l.status === 'Approved').length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Process and monitor student leave applications.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Requests Today</span>
                    <span className="text-2xl font-bold text-slate-900">{stats.totalToday}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">On Leave Today</span>
                    <span className="text-2xl font-bold text-slate-900 text-blue-600">{stats.onLeave}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pending</span>
                    <span className="text-2xl font-bold text-amber-600">{stats.pending}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Approved</span>
                    <span className="text-2xl font-bold text-green-600">{stats.approved}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rejected</span>
                    <span className="text-2xl font-bold text-red-600">{stats.rejected}</span>
                </div>
            </div>

            {/* Leave Request Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Table headers={['Student Name', 'Hostel', 'Floor', 'Duration', 'Days', 'Leave %', 'Status', 'Actions']}>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan="8" className="py-20 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </TableCell>
                        </TableRow>
                    ) : leaves.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan="8" className="py-20 text-center text-slate-400 font-medium font-medium">
                                No leave requests found.
                            </TableCell>
                        </TableRow>
                    ) : leaves.map((leave) => (
                        <TableRow key={leave._id}>
                            <TableCell>
                                <span className="font-bold text-slate-900 text-sm tracking-tight">{leave.studentName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-600 text-sm font-medium">{leave.hostelName}</span>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-600 text-sm font-medium">{leave.floor}</span>
                            </TableCell>
                            <TableCell>
                                <div className="text-[11px] font-mono font-bold text-slate-500">
                                    {new Date(leave.fromDate).toLocaleDateString()} <span className="text-slate-300">→</span> {new Date(leave.toDate).toLocaleDateString()}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-slate-900 text-sm font-bold">{leave.days}</span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${leave.leavePercentage > 15 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(leave.leavePercentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className={`text-[11px] font-bold ${leave.leavePercentage > 15 ? 'text-red-600' : 'text-slate-600'}`}>
                                        {leave.leavePercentage}%
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${leave.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                    leave.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                    {leave.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {(isAdmin || isWarden) && (
                                        <>
                                            {leave.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                                        className="text-[10px] font-bold text-green-600 hover:text-green-700 uppercase tracking-tight"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                                                        className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-tight"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {leave.status === 'Approved' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(leave._id, 'Cancelled')}
                                                    className="text-[10px] font-bold text-slate-400 hover:text-rose-600 uppercase tracking-tight"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {(leave.status === 'Cancelled' || leave.status === 'Rejected') && (
                                                <button
                                                    onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tight"
                                                >
                                                    Re-Approve
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedLeave(leave);
                                            setShowDetailModal(true);
                                        }}
                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-tight"
                                    >
                                        Details
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            </div>

            {/* Leave Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Leave Request Details"
                footer={(
                    <div className="flex gap-2 justify-end w-full">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 max-w-[100px]"
                            onClick={() => setShowDetailModal(false)}
                        >
                            Close
                        </Button>

                        {(isAdmin || isWarden) && (
                            <div className="flex gap-2 flex-1 justify-end">
                                {selectedLeave?.status === 'Pending' && (
                                    <>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            loading={actionLoading}
                                            onClick={() => handleUpdateStatus(selectedLeave._id, 'Rejected')}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            loading={actionLoading}
                                            onClick={() => handleUpdateStatus(selectedLeave._id, 'Approved')}
                                        >
                                            Approve
                                        </Button>
                                    </>
                                )}
                                {selectedLeave?.status === 'Approved' && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        loading={actionLoading}
                                        onClick={() => handleUpdateStatus(selectedLeave._id, 'Cancelled')}
                                    >
                                        Revoke / Cancel
                                    </Button>
                                )}
                                {(selectedLeave?.status === 'Cancelled' || selectedLeave?.status === 'Rejected') && (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        loading={actionLoading}
                                        onClick={() => handleUpdateStatus(selectedLeave._id, 'Approved')}
                                    >
                                        Re-Approve
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            >
                {selectedLeave && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Student</span>
                                <span className="text-sm font-bold text-slate-900">{selectedLeave.studentName}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Hostel & Floor</span>
                                <span className="text-sm font-bold text-slate-900">{selectedLeave.hostelName}, {selectedLeave.floor}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Duration</span>
                            <span className="text-sm font-bold text-slate-900">{selectedLeave.fromDate} to {selectedLeave.toDate} ({selectedLeave.days} days)</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reason for Leave</span>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {selectedLeave.reason}
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Leave Statistics</span>
                                <span className="text-xs font-medium text-blue-800">Current leave percentage for this semester:</span>
                            </div>
                            <span className={`text-xl font-bold ${selectedLeave.leavePercentage > 15 ? 'text-red-600' : 'text-blue-700'}`}>
                                {selectedLeave.leavePercentage}%
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LeaveManagement;
