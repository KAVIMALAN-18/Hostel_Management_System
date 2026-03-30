import { useState, useEffect, useMemo } from 'react';
import { noticeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    ClockIcon,
    BellIcon,
    FilterIcon,
    PlusIcon,
    TrashIcon,
    EditIcon,
    SearchIcon,
    MegaphoneIcon,
    ChevronRightIcon,
    XIcon,
    ArrowUpRightIcon,
    ShieldIcon,
    AlertCircleIcon,
    CalendarIcon
} from '../components/common/Icons';

const Announcements = () => {
    const { user } = useAuth();
    const isStaff = user?.role === 'admin' || user?.role === 'warden';
    const isStudent = user?.role === 'student';

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [filters, setFilters] = useState({ hostel: 'All', priority: 'All', status: 'Active' });
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
            console.error('Failed to fetch notices:', err);
            setNotices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, [filters]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await noticeAPI.create(formData);
            if (res.success) {
                setShowForm(false);
                setFormData({ title: '', content: '', priority: 'Normal', hostel: 'All', floor: 'All', expiresAt: '' });
                fetchNotices();
            }
        } catch (err) {
            alert('Broadcast failure');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Action: Terminate broadcast. Proceed?')) return;
        try {
            await noticeAPI.delete(id);
            setNotices(prev => prev.filter(n => n._id !== id));
        } catch (err) {
            alert('Deletion failed');
        }
    };

    const filteredNotices = useMemo(() => {
        return notices.filter(n => 
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notices, searchQuery]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Global Broadcast</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">Executive communications and institutional bulletins for the resident directory.</p>
                </div>
                <div className="flex items-center gap-4">
                    {isStaff && (
                        <button 
                            onClick={() => setShowForm(true)}
                            className="bg-brand-600 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center gap-2 border border-brand-500"
                        >
                            <PlusIcon className="w-3.5 h-3.5" />
                            Incept Broadcast
                        </button>
                    )}
                </div>
            </div>

            {/* Diagnostic Row / Search */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Scan bulletins by keyword or identifier..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] pl-14 pr-6 py-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500 shadow-soft transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        value={filters.priority}
                        onChange={e => setFilters({...filters, priority: e.target.value})}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider outline-none shadow-soft"
                    >
                        <option value="All">All Severity</option>
                        <option value="Normal">Normal</option>
                        <option value="Important">Important</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Bulletin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)
                ) : filteredNotices.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem]">
                        <BellIcon className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aether Clear. No active broadcast signals detected.</p>
                    </div>
                ) : (
                    filteredNotices.map((notice) => (
                        <div 
                            key={notice._id} 
                            onClick={() => setSelectedNotice(notice)}
                            className={`group relative bg-white dark:bg-slate-900 border p-8 rounded-[2.5rem] shadow-soft hover:shadow-premium transition-all duration-500 cursor-pointer overflow-hidden
                                ${notice.priority === 'Urgent' ? 'border-rose-100 dark:border-rose-900/30 bg-rose-50/10' : 'border-slate-200 dark:border-slate-700'}
                            `}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <PriorityBadge priority={notice.priority} />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(notice.createdAt).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 tracking-tight group-hover:text-brand-600 transition-colors">{notice.title}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-300 line-clamp-3 leading-relaxed mb-8">{notice.content}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                        {notice.author?.name?.charAt(0) || 'A'}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">{notice.author?.name || 'Administrator'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     {isStaff && (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(notice._id); }}
                                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                                         >
                                             <TrashIcon className="w-4 h-4" />
                                         </button>
                                     )}
                                     <ArrowUpRightIcon className="w-4 h-4 text-slate-200 group-hover:text-brand-600 transition-colors" />
                                </div>
                            </div>

                            {notice.priority === 'Urgent' && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Detail View Overlay */}
            {selectedNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedNotice(null)}>
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium modal-panel overflow-hidden border border-white/5" onClick={e => e.stopPropagation()}>
                        <div className="h-2 w-full bg-brand-600"></div>
                        <div className="p-12 space-y-10">
                            <div className="flex items-center justify-between">
                                <PriorityBadge priority={selectedNotice.priority} />
                                <button onClick={() => setSelectedNotice(null)} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl flex items-center justify-center transition-all">
                                    <XIcon className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{selectedNotice.title}</h2>
                                <div className="flex items-center gap-6">
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                         <ClockIcon className="w-3.5 h-3.5" />
                                         {new Date(selectedNotice.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
                                     </div>
                                     <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                                         <ShieldIcon className="w-3.5 h-3.5" />
                                         Institutional Dispatch
                                     </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
                                <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedNotice.content}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                 <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 text-sm font-bold">
                                          {selectedNotice.author?.name?.charAt(0) || 'A'}
                                      </div>
                                      <div>
                                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Authorizing Agent</p>
                                           <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedNotice.author?.name || 'Administrative Staff'}</p>
                                      </div>
                                 </div>
                                 {selectedNotice.expiresAt && (
                                     <div className="text-right">
                                         <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-0.5">Termination Date</p>
                                         <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">{new Date(selectedNotice.expiresAt).toLocaleDateString()}</p>
                                     </div>
                                 )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Creation Overlay */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium modal-panel overflow-hidden border border-white/5" onClick={e => e.stopPropagation()}>
                        <div className="p-10 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <MegaphoneIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold uppercase tracking-wider">Aether Broadcast</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institutional Direct Message Layer</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all text-white">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Headline</label>
                                    <input 
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all"
                                        placeholder="e.g. INFRASTRUCTURE_MAINTENANCE_LOG_SR7"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="flex flex-col gap-1.5">
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Severity</label>
                                         <select 
                                            value={formData.priority}
                                            onChange={e => setFormData({...formData, priority: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                                         >
                                             <option value="Normal">Normal</option>
                                             <option value="Important">Important</option>
                                             <option value="Urgent">Urgent</option>
                                         </select>
                                     </div>
                                     <div className="flex flex-col gap-1.5">
                                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Hostel Scope</label>
                                         <select 
                                            value={formData.hostel}
                                            onChange={e => setFormData({...formData, hostel: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none"
                                         >
                                             <option value="All">Global</option>
                                             <option value="Diamond">Diamond</option>
                                             <option value="Sapphire">Sapphire</option>
                                         </select>
                                     </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Dossier Content</label>
                                    <textarea 
                                        required
                                        value={formData.content}
                                        onChange={e => setFormData({...formData, content: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all min-h-[140px] resize-none"
                                        placeholder="Type disclosure content..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button 
                                    disabled={submitting}
                                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-sm font-bold uppercase tracking-wide shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    {submitting ? 'DISPATCHING...' : 'INITIALIZE BROADCAST'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const PriorityBadge = ({ priority }) => {
    const config = {
        'Urgent': 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
        'Important': 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
        'Normal': 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
    };
    return (
        <span className={`px-4 py-1 rounded-xl text-xs font-bold border uppercase tracking-wide ${config[priority] || config['Normal']}`}>
            {priority}
        </span>
    );
};

export default Announcements;
