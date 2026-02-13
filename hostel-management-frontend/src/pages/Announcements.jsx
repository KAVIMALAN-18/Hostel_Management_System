import { useState, useEffect } from 'react';
import { noticeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Table, { TableRow, TableCell } from '../components/common/Table';
import { ClockIcon, BellIcon, FilterIcon, PlusIcon, TrashIcon, EditIcon, SearchIcon } from '../components/common/Icons';

/**
 * Announcements Module
 * Professional institutional notification system with role-based access.
 */
const Announcements = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const isStaff = user?.role === 'admin' || user?.role === 'warden';

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [filters, setFilters] = useState({
        hostel: 'All',
        floor: 'All',
        priority: 'All',
        status: 'Active'
    });

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'Normal',
        hostel: 'All',
        floor: 'All',
        expiresAt: ''
    });

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const response = await noticeAPI.getAll(filters);
            if (response.success) {
                setNotices(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [filters]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let response;
            if (editingId) {
                response = await noticeAPI.update(editingId, formData);
                setSuccessMessage('Announcement updated successfully!');
            } else {
                response = await noticeAPI.create(formData);
                setSuccessMessage('Announcement created successfully!');
            }

            if (response.success) {
                setShowModal(false);
                setFormData({ title: '', content: '', priority: 'Normal', hostel: 'All', floor: 'All', expiresAt: '' });
                setEditingId(null);

                // Immediately re-fetch to update the list
                await fetchNotices();

                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            alert('Failed to publish: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (notice) => {
        setEditingId(notice._id);
        setFormData({
            title: notice.title,
            content: notice.content,
            priority: notice.priority,
            hostel: notice.hostel,
            floor: notice.floor,
            expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Action: Remove notice from global broadcast. Proceed?')) return;
        try {
            await noticeAPI.delete(id);
            fetchNotices();
        } catch (err) {
            alert('Failed to delete: ' + err.message);
        }
    };

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Urgent': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'Important': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold text-sm">{successMessage}</span>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Announcements</h1>
                    <p className="text-slate-500 font-medium">Hostel Notifications & Updates</p>
                </div>
                {isStaff && (
                    <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" />
                        Create Announcement
                    </Button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.hostel}
                            onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                        >
                            <option>All Hostels</option>
                            <option>Diamond</option>
                            <option>Sapphire</option>
                        </select>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                        >
                            <option>All Priority</option>
                            <option>Normal</option>
                            <option>Important</option>
                            <option>Urgent</option>
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                        >
                            <option>Active</option>
                            <option>Expired</option>
                            <option>All Status</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Bulletins...</p>
                </div>
            ) : filteredNotices.length === 0 ? (
                <div className="py-32 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <BellIcon className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-900">No Announcements Found</h3>
                        <p className="text-sm text-slate-400 font-medium">Try adjusting your filters or search query.</p>
                    </div>
                </div>
            ) : isStaff ? (
                /* STAFF TABLE VIEW */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table headers={['Title & Description', 'Hostel/Floor', 'Priority', 'Posted By', 'Status', 'Actions']}>
                        {filteredNotices.map((notice) => (
                            <TableRow key={notice._id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900">{notice.title}</span>
                                        <span className="text-[11px] text-slate-500 truncate max-w-xs">{notice.content}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        {notice.hostel} {notice.floor !== 'All' ? `/ Floor ${notice.floor}` : ''}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getPriorityColor(notice.priority)}`}>
                                        {notice.priority}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-800">{notice.author?.name}</span>
                                        <span className="text-[10px] text-slate-400 font-mono italic">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`text-[10px] font-black uppercase ${new Date(notice.expiresAt) < new Date() ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {notice.expiresAt && new Date(notice.expiresAt) < new Date() ? 'Expired' : 'Active'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleEdit(notice)}
                                            className="text-slate-400 hover:text-brand-600 transition-colors"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(notice._id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </Table>
                </div>
            ) : (
                /* STUDENT CARD VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredNotices.map((notice) => (
                        <div key={notice._id} className={`bg-white p-6 rounded-3xl border transition-all hover:shadow-lg ${notice.priority === 'Urgent' ? 'border-rose-100 ring-4 ring-rose-50/50' : 'border-slate-200'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(notice.priority)}`}>
                                    {notice.priority}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    {new Date(notice.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{notice.title}</h3>
                            <p className="text-sm text-slate-600 font-medium mb-6 leading-relaxed">
                                {notice.content}
                            </p>
                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                        {notice.author?.role?.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{notice.author?.name}</span>
                                </div>
                                {notice.expiresAt && (
                                    <span className="text-[10px] font-bold text-slate-400 italic">
                                        Expires: {new Date(notice.expiresAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Announcement Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ title: '', content: '', priority: 'Normal', hostel: 'All', floor: 'All', expiresAt: '' });
                }}
                title={editingId ? "Edit Announcement" : "New Institutional Announcement"}
                footer={(
                    <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-50">
                        <Button variant="secondary" onClick={() => {
                            setShowModal(false);
                            setEditingId(null);
                            setFormData({ title: '', content: '', priority: 'Normal', hostel: 'All', floor: 'All', expiresAt: '' });
                        }}>Cancel Action</Button>
                        <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                            {editingId ? 'Update Announcement' : 'Publish Broadcast'}
                        </Button>
                    </div>
                )}
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <Input
                        label="Broadcast Headline"
                        placeholder="e.g., Scheduled Electrical Maintenance"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency / Priority</label>
                            <select
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-500 transition-all"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option>Normal</option>
                                <option>Important</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date (Optional)</label>
                            <input
                                type="date"
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-500 transition-all"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Hostel</label>
                            <select
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-500 transition-all"
                                value={formData.hostel}
                                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                            >
                                <option>All</option>
                                <option>Diamond</option>
                                <option>Sapphire</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Floor</label>
                            <select
                                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-500 transition-all"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                            >
                                <option>All</option>
                                <option>0 (Ground)</option>
                                <option>1 (First)</option>
                                <option>2 (Second)</option>
                                <option>3 (Third)</option>
                                <option>4 (Fourth)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Message Content</label>
                        <textarea
                            required
                            rows="5"
                            placeholder="Type full details of the announcement..."
                            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-brand-500 outline-none transition-all resize-none"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        ></textarea>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Announcements;
