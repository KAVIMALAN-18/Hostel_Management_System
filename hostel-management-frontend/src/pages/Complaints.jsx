import { useState, useEffect } from 'react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Table, { TableRow, TableCell } from '../components/common/Table';

const Complaints = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolution, setResolution] = useState('');
    const [formData, setFormData] = useState({ title: '', description: '', category: 'Maintenance' });
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await complaintAPI.getAll();
            if (response.success) {
                setComplaints(response.data);
            }
        } catch (err) {
            console.error(err.message);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await complaintAPI.create(formData);
            if (response.success) {
                setShowForm(false);
                setFormData({ title: '', description: '', category: 'Maintenance' });
                fetchComplaints();
            }
        } catch (err) {
            console.error('Submission failed:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, status, resolutionNote = '') => {
        setUpdatingId(id);
        try {
            const response = await complaintAPI.updateStatus(id, {
                status,
                resolution: resolutionNote
            });
            if (response.success) {
                setShowResolveModal(false);
                setResolution('');
                fetchComplaints();
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        if (activeTab === 'all') return true;
        return c.status === activeTab;
    });

    if (loading && complaints.length === 0) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading Complaints System...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="section-header border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">Complaint Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-2 font-medium">Tracking and resolution of facility maintenance and utility grievances.</p>
                </div>
                {user?.role === 'student' && (
                    <Button variant="primary" onClick={() => setShowForm(true)}>File New Complaint</Button>
                )}
            </div>

            {/* Categorization Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700">
                {['all', 'pending', 'in-progress', 'resolved'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab
                            ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Complaint Records */}
            <div className="table-container">
                <Table headers={['Ticket Details', 'Category', 'Status', 'Logged On', 'Actions']}>
                    {filteredComplaints.length > 0 ? (
                        filteredComplaints.map((complaint) => (
                            <TableRow key={complaint._id}>
                                <TableCell>
                                    <div className="flex flex-col max-w-md">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{complaint.title}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-300 font-medium line-clamp-1">{complaint.description}</span>
                                        {complaint.student?.name && (
                                            <span className="text-xs text-slate-400 dark:text-slate-300 font-bold uppercase mt-1">Reported by: {complaint.student.name}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold border border-slate-200 dark:border-slate-700 uppercase tracking-tight">
                                        {complaint.category}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`status-badge ${complaint.status === 'resolved' ? 'status-badge-active' :
                                            complaint.status === 'in-progress' ? 'status-badge-occupied' : 'status-badge-pending'
                                        }`}>
                                        {complaint.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-slate-400 dark:text-slate-300 font-medium">
                                            {new Date(complaint.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {(user?.role === 'admin' || user?.role === 'warden') && complaint.status !== 'resolved' ? (
                                        <div className="flex items-center gap-2">
                                            {complaint.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(complaint._id, 'in-progress')}
                                                    disabled={updatingId === complaint._id}
                                                    className={`text-sm font-bold text-blue-600 hover:underline ${updatingId === complaint._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {updatingId === complaint._id ? 'Starting...' : 'Start Work'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedComplaint(complaint);
                                                    setShowResolveModal(true);
                                                }}
                                                disabled={updatingId === complaint._id}
                                                className={`text-sm font-bold text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-0.5 rounded ${updatingId === complaint._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Resolve
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                                            {complaint.status === 'resolved' ? 'Resolution recorded' : 'Awaiting Action'}
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan="5" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                                No records found in this category
                            </TableCell>
                        </TableRow>
                    )}
                </Table>
            </div>

            {/* Application Form Modal */}
            <Modal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                title="File Grievance Report"
                footer={(
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setShowForm(false)}>Discard</Button>
                        <Button variant="primary" type="submit" form="complaint-form" loading={submitting}>Submit Ticket</Button>
                    </div>
                )}
            >
                <form id="complaint-form" onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-300 font-bold uppercase tracking-tight mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Technical Detail Submission</p>
                    <Input
                        label="Issue Summary"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Brief title of the problem"
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Service Category</label>
                        <select
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Maintenance</option>
                            <option>Electrical</option>
                            <option>Water</option>
                            <option>Cleanliness</option>
                            <option>Room Issue</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Detailed explanation of the problem..."
                            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>
                </form>
            </Modal>

            {/* Resolution Modal */}
            <Modal
                isOpen={showResolveModal}
                onClose={() => setShowResolveModal(false)}
                title="Log Resolution Details"
                footer={(
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setShowResolveModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => handleUpdateStatus(selectedComplaint._id, 'resolved', resolution)}>Confirm Fixed</Button>
                    </div>
                )}
            >
                <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-300 font-bold uppercase tracking-tight">Provide final resolution notes for the resident.</p>
                    <textarea
                        rows="4"
                        placeholder="Details of the fix applied..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                    ></textarea>
                </div>
            </Modal>
        </div>
    );
};

export default Complaints;
