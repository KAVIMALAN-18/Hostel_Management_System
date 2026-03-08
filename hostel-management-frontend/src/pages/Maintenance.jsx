import { useState, useEffect, useMemo } from 'react';
import { complaintAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Table, { TableRow, TableCell } from '../components/common/Table';
import mockData from '../utils/mockData';
import {
    ToolIcon,
    ClockIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    FilterIcon,
    ChevronDownIcon
} from '../components/common/Icons';

const Maintenance = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    // ... rest of state ...
    const [exporting, setExporting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [updateData, setUpdateData] = useState({
        status: '',
        priority: '',
        resolutionNotes: '',
        staffNotes: ''
    });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        priority: 'Medium'
    });
    const [submitting, setSubmitting] = useState(false);

    // Filters state
    const [filters, setFilters] = useState({
        hostel: 'All',
        priority: 'All',
        status: 'All'
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = {
                hostel: filters.hostel,
                priority: filters.priority,
                status: filters.status
            };
            const response = await complaintAPI.getAll(params);
            if (response.success && response.data.length > 0) {
                setTickets(response.data);
            } else {
                throw new Error('No data');
            }
        } catch (err) {
            // Fallback to centralized mockData
            const list = mockData.maintenance.map((m, i) => ({
                _id: m.ticketId,
                title: m.issueType.split(' - ')[1] || m.issueType,
                description: `Maintenance request for ${m.issueType} in Room ${m.room}.`,
                category: m.issueType.split(' - ')[0],
                priority: m.priority,
                status: m.status,
                hostelName: i % 2 === 0 ? 'Alpha Block' : 'Beta Block',
                floor: 'Floor 2',
                roomNumber: m.room,
                student: { name: m.studentName, phone: '+91 98765 00000' },
                createdAt: new Date().toISOString()
            }));
            setTickets(list);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    const stats = useMemo(() => {
        const open = tickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
        const highPriority = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved' && t.status !== 'Closed').length;
        const inProgress = tickets.filter(t => t.status === 'In Progress').length;

        // This is a simplified "Resolved This Month" stat
        const resolvedThisMonth = tickets.filter(t => t.status === 'Resolved' && new Date(t.updatedAt).getMonth() === new Date().getMonth()).length;

        return { open, highPriority, inProgress, resolvedThisMonth };
    }, [tickets]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await complaintAPI.create(formData);
            if (response.success) {
                setShowForm(false);
                setFormData({ title: '', description: '', category: 'Other', priority: 'Medium' });
                fetchTickets();
            }
        } catch (err) {
            console.error('Submission failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTicket = async () => {
        setSubmitting(true);
        try {
            const response = await complaintAPI.updateStatus(selectedTicket._id, updateData);
            if (response.success) {
                setShowUpdateModal(false);
                fetchTickets();
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setSubmitting(true);
        }
    };

    const openUpdateModal = (ticket) => {
        setSelectedTicket(ticket);
        setUpdateData({
            status: ticket.status,
            priority: ticket.priority,
            resolutionNotes: ticket.resolutionNotes || '',
            staffNotes: ticket.staffNotes || ''
        });
        setShowUpdateModal(true);
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
            'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
            'Resolved': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'Closed': 'bg-slate-50 text-slate-500 border-slate-100'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${styles[status] || styles['Pending']}`}>
                {status}
            </span>
        );
    };

    const PriorityBadge = ({ priority }) => {
        const styles = {
            'High': 'text-rose-600 bg-rose-50 border-rose-100',
            'Medium': 'text-amber-600 bg-amber-50 border-amber-100',
            'Low': 'text-emerald-600 bg-emerald-50 border-emerald-100'
        };
        return (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-tighter ${styles[priority] || styles['Medium']}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance {user?.role === 'student' ? 'Requests' : 'Management'}</h1>
                    <p className="text-slate-500 font-medium">Tracking and resolution of facility maintenance and utility grievances.</p>
                </div>
                {user?.role === 'student' && (
                    <Button variant="primary" onClick={() => setShowForm(true)}>Raise New Request</Button>
                )}
            </div>

            {/* KPI Cards (Hidden for students) */}
            {user?.role !== 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
                            <ClockIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Open Tickets</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{stats.open}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500">
                            <AlertCircleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">High Priority</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{stats.highPriority}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                            <ToolIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">In Progress</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{stats.inProgress}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                            <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Resolved (MTD)</p>
                            <p className="text-xl font-black text-slate-900 leading-none">{stats.resolvedThisMonth}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* FiltersRow (Warden/Admin only) */}
                {user?.role !== 'student' && (
                    <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-4 bg-white">
                        <div className="flex items-center gap-3">
                            <select
                                value={filters.hostel}
                                onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                            >
                                <option>All Hostels</option>
                                <option>Diamond</option>
                                <option>Sapphire</option>
                            </select>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                            >
                                <option>All Priority</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                                <option>Closed</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Tickets Table */}
                <div className="flex-1">
                    <Table headers={user?.role === 'student'
                        ? ['Ticket ID', 'Issue Type', 'Description', 'Priority', 'Status', 'Reported Date']
                        : ['Ticket ID', 'Student', 'Room Info', 'Issue Type', 'Priority', 'Status', 'Actions']
                    }>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={user?.role === 'student' ? 6 : 7} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Tickets...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TableRow key={ticket._id}>
                                    <TableCell>
                                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                                            #{ticket._id.slice(-6)}
                                        </span>
                                    </TableCell>

                                    {user?.role !== 'student' && (
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-900">{ticket.student?.name || 'Unknown'}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{ticket.student?.phone || '-'}</span>
                                            </div>
                                        </TableCell>
                                    )}

                                    {user?.role !== 'student' && (
                                        <TableCell>
                                            <div className="flex flex-col text-[11px] font-medium text-slate-600">
                                                <span>{ticket.hostelName}</span>
                                                <span>Floor {ticket.floor}, Room {ticket.roomNumber}</span>
                                            </div>
                                        </TableCell>
                                    )}

                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800">{ticket.category}</span>
                                            <span className="text-[10px] text-slate-500 font-medium line-clamp-1">{ticket.title}</span>
                                        </div>
                                    </TableCell>

                                    {user?.role === 'student' && (
                                        <TableCell>
                                            <span className="text-[11px] text-slate-500 font-medium max-w-xs line-clamp-1">
                                                {ticket.description}
                                            </span>
                                        </TableCell>
                                    )}

                                    <TableCell>
                                        <PriorityBadge priority={ticket.priority} />
                                    </TableCell>

                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>

                                    {user?.role === 'student' ? (
                                        <TableCell>
                                            <span className="text-[11px] text-slate-400 font-mono">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </TableCell>
                                    ) : (
                                        <TableCell>
                                            <button
                                                onClick={() => openUpdateModal(ticket)}
                                                className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                                            >
                                                Manage
                                            </button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={user?.role === 'student' ? 6 : 7} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                            <ToolIcon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Maintenance Tickets Found</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </Table>
                </div>
            </div>

            {/* Raise New Request Modal (Student Only) */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="Raise Facility Request"
                footer={(
                    <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-50">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Discard Action</Button>
                        <Button variant="primary" onClick={handleSubmit} loading={submitting}>Submit Ticket</Button>
                    </div>
                )}
            >
                <form id="maintenance-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Input
                                label="Issue Headline"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="E.g. Electrical Short Circuit in A-302"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Problem Category</label>
                            <select
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Electrical</option>
                                <option>Plumbing</option>
                                <option>Furniture</option>
                                <option>Cleaning</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Severity Level</label>
                            <select
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Technical Description</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Please provide specific details about the issue..."
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                        <div className="mt-0.5 text-emerald-600">
                            <CheckCircleIcon className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-emerald-700 font-medium">
                            Staff from your assigned hostel/floor will be notified immediately upon submission.
                            Your room details will be automatically attached to this ticket.
                        </p>
                    </div>
                </form>
            </Modal>

            {/* Update Ticket Modal (Staff Only) */}
            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title="Manage Maintenance Ticket"
                footer={(
                    <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-50">
                        <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdateTicket} loading={submitting}>Save Updates</Button>
                    </div>
                )}
            >
                {selectedTicket && (
                    <div className="p-6 space-y-6">
                        {/* Ticket Info Summary */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">#{selectedTicket._id.slice(-6)}</span>
                                <StatusBadge status={updateData.status} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900">{selectedTicket.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2">{selectedTicket.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Workflow Status</label>
                                <select
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                    value={updateData.status}
                                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                >
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Resolved</option>
                                    <option>Closed</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority Override</label>
                                <select
                                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                    value={updateData.priority}
                                    onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Resolution Detail (Visible to Student)</label>
                            <textarea
                                rows="3"
                                placeholder="Explain what fix was applied..."
                                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none resize-none"
                                value={updateData.resolutionNotes}
                                onChange={(e) => setUpdateData({ ...updateData, resolutionNotes: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Staff Notes</label>
                            <textarea
                                rows="2"
                                placeholder="Private notes for administration..."
                                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none resize-none"
                                value={updateData.staffNotes}
                                onChange={(e) => setUpdateData({ ...updateData, staffNotes: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Maintenance;
