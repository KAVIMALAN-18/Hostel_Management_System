import { useState, useEffect, useMemo } from 'react';
import { complaintAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    WrenchIcon,
    ClockIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    FilterIcon,
    ChevronRightIcon,
    ArrowUpRightIcon,
    XIcon,
    PlusIcon,
    ZapIcon,
    DropletIcon,
    LightbulbIcon,
    HomeIcon
} from '../components/common/Icons';

const Maintenance = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filters, setFilters] = useState({ hostel: 'All', priority: 'All', status: 'All' });

    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        category: 'Electrical',
        priority: 'Medium'
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await complaintAPI.getAll(filters);
            if (response.success) {
                setTickets(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, [filters]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await complaintAPI.create(newTicket);
            if (res.success) {
                setTickets([res.data, ...tickets]);
                setIsCreateModalOpen(false);
                setNewTicket({
                    title: '',
                    description: '',
                    category: 'Electrical',
                    priority: 'Medium'
                });
            }
        } catch (err) {
            alert('Failed to submit query: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setSubmitting(true);
        try {
            const response = await complaintAPI.updateStatus(id, { status });
            if (response.success) {
                setTickets(prev => prev.map(t => t._id === id ? { ...t, status } : t));
                setSelectedTicket(null);
            }
        } catch (err) {
            alert('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = useMemo(() => ({
        pending: tickets.filter(t => t.status === 'Pending').length,
        solved: tickets.filter(t => t.status === 'Solved' || t.status === 'Fixed').length,
        invalid: tickets.filter(t => t.status === 'Invalid').length,
        critical: tickets.filter(t => t.priority === 'High' && t.status === 'Pending').length
    }), [tickets]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Maintenance & Queries</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">Centralized diagnostic and resolution queue for facility infrastructure.</p>
                </div>
                <div className="flex items-center gap-4">
                    {user?.role === 'student' ? (
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all"
                        >
                            <PlusIcon className="w-4 h-4" /> Raise Query
                        </button>
                    ) : (
                        <select 
                            value={filters.status} 
                            onChange={e => setFilters({...filters, status: e.target.value})}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none shadow-soft"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Solved">Solved</option>
                            <option value="Fixed">Fixed</option>
                            <option value="Invalid">Invalid</option>
                        </select>
                    )}
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Pending Action" value={stats.pending} icon={<ClockIcon className="w-4 h-4" />} color="amber" />
                <StatCard label="Resolved Issues" value={stats.solved} icon={<CheckCircleIcon className="w-4 h-4" />} color="emerald" />
                <StatCard label="Critical Risk" value={stats.critical} icon={<AlertCircleIcon className="w-4 h-4" />} color="rose" />
                <StatCard label="Invalid / Closed" value={stats.invalid} icon={<XIcon className="w-4 h-4" />} color="slate" />
            </div>

            {/* Ticket Stream */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    [1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div>)
                ) : tickets.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                        <WrenchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Operational. No active service tickets.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket._id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 pr-8 shadow-soft hover:shadow-premium transition-all duration-500 flex items-center gap-6 overflow-hidden">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                <CategoryIcon category={ticket.category} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded-md">#{ticket._id.slice(-6)}</span>
                                    <PriorityBadge priority={ticket.priority} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{ticket.title}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <HomeIcon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{ticket.hostelName} • {ticket.roomNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <StatusTag status={ticket.status} />
                                <button 
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="w-12 h-12 bg-slate-50 dark:bg-slate-800 hover:bg-brand-600 hover:text-white border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium modal-panel overflow-hidden border border-white/5" onClick={e => e.stopPropagation()}>
                        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-wider mb-1">New Maintenance Query</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider opacity-80">Official Diagnostic Protocol</p>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-10 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Problem Headline</label>
                                    <input 
                                        required
                                        type="text"
                                        placeholder="Briefly state the issue..."
                                        value={newTicket.title}
                                        onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Category</label>
                                        <select 
                                            value={newTicket.category}
                                            onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider outline-none"
                                        >
                                            <option>Electrical</option>
                                            <option>Plumbing</option>
                                            <option>Furniture</option>
                                            <option>Cleaning</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Risk Level</label>
                                        <select 
                                            value={newTicket.priority}
                                            onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-xs font-bold uppercase tracking-wider outline-none"
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Critical</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-1">Detailed Description</label>
                                    <textarea 
                                        required
                                        rows="4"
                                        placeholder="Provide comprehensive details about the fault..."
                                        value={newTicket.description}
                                        onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-slate-900 dark:text-white"
                                    ></textarea>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 bg-brand-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all border border-brand-500 disabled:opacity-50"
                            >
                                {submitting ? 'PROCESSING...' : 'SUBMIT QUERY'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Resolution/Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium modal-panel overflow-hidden border border-white/5" onClick={e => e.stopPropagation()}>
                        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold uppercase tracking-wider mb-1">Ticket Intelligence</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider opacity-80">Reference ID: {selectedTicket._id}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Headline</span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTicket.title}</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Student Disclosure</span>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        "{selectedTicket.description}"
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Origin Details</span>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase leading-tight">
                                        {selectedTicket.student?.name}<br/>
                                        Room {selectedTicket.roomNumber}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">System Priority</span>
                                    <PriorityBadge priority={selectedTicket.priority} />
                                </div>
                            </div>

                            {user?.role !== 'student' && (
                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                                    {selectedTicket.status === 'Pending' && (
                                        <>
                                            <button 
                                                disabled={submitting}
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'Solved')}
                                                className="py-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all border border-emerald-500"
                                            >
                                                SOLVED
                                            </button>
                                            <button 
                                                disabled={submitting}
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'Fixed')}
                                                className="py-4 bg-brand-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all border border-brand-500"
                                            >
                                                FIXED
                                            </button>
                                            <button 
                                                disabled={submitting}
                                                onClick={() => handleUpdateStatus(selectedTicket._id, 'Invalid')}
                                                className="col-span-2 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
                                            >
                                                MARK AS INVALID
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-[2rem] shadow-soft">
        <div className="flex items-center justify-between mb-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-${color}-600 bg-${color}-50 dark:bg-${color}-900/20`}>
                {icon}
            </div>
            <ArrowUpRightIcon className="w-3 h-3 text-slate-300" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
    </div>
);

const CategoryIcon = ({ category }) => {
    switch(category) {
        case 'Electrical': return <ZapIcon className="w-7 h-7" />;
        case 'Plumbing': return <DropletIcon className="w-7 h-7" />;
        case 'Furniture': return <HomeIcon className="w-7 h-7" />;
        case 'Lighting': return <LightbulbIcon className="w-7 h-7" />;
        default: return <WrenchIcon className="w-7 h-7" />;
    }
};

const PriorityBadge = ({ priority }) => {
    const config = {
        'Critical': 'text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-900/40 dark:border-rose-700',
        'High': 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
        'Medium': 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
        'Low': 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wide ${config[priority] || config['Medium']}`}>
            {priority} RISK
        </span>
    );
};

const StatusTag = ({ status }) => {
    const config = {
        'Pending': 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
        'Solved': 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
        'Fixed': 'bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]',
        'Invalid': 'bg-slate-400'
    };
    return (
        <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${config[status] || config['Pending']}`}></div>
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{status}</span>
        </div>
    );
};

export default Maintenance;
