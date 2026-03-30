import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    UsersIcon, 
    BuildingIcon, 
    ShieldCheckIcon, 
    PhoneIcon, 
    MailIcon, 
    XIcon, 
    UserPlusIcon, 
    ShieldAlertIcon,
    CalendarIcon,
    MapPinIcon,
    EditIcon,
    MoreVerticalIcon,
    CheckCircleIcon
} from '../../components/common/Icons';
import { authAPI, staffAPI } from '../../services/api';

const WardenManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [wardens, setWardens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedWarden, setSelectedWarden] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', hostel: 'Sapphire', floor: '', gender: 'Male', password: 'password123'
    });

    const hostels = ['Sapphire', 'Emerald', 'Ruby', 'Pearl', 'Diamond'];

    const fetchWardens = async () => {
        setIsLoading(true);
        try {
            const response = await staffAPI.getStaff();
            if (response.success) {
                setWardens(response.data.map(w => ({
                    id: w._id,
                    name: w.name,
                    email: w.email,
                    mobile: w.phone,
                    hostel: w.assignedHostel,
                    floor: w.assignedFloor,
                    gender: w.gender || 'Male',
                    joiningDate: new Date(w.createdAt).toLocaleDateString()
                })));
            }
        } catch (err) {
            setError('Failed to fetch warden records');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWardens();
    }, []);

    const handleEdit = (wrd) => {
        setFormData({
            ...wrd,
            phone: wrd.mobile,
            id: wrd.id
        });
        setSelectedWarden(wrd);
        setIsEditMode(true);
    };

    const handleAdd = () => {
        setFormData({ name: '', email: '', phone: '', hostel: 'Sapphire', floor: '', gender: 'Male', password: 'password123' });
        setIsAddMode(true);
    };

    const saveWarden = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (isAddMode) {
                await authAPI.register({
                    ...formData,
                    role: 'warden'
                });
            } else {
                await staffAPI.updateStaff(formData.id, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    assignedHostel: formData.hostel,
                    assignedFloor: formData.floor,
                    role: 'warden'
                });
            }
            fetchWardens();
            setIsEditMode(false);
            setIsAddMode(false);
            setSelectedWarden(null);
        } catch (err) {
            alert(err.message || 'Error saving warden details');
        } finally {
            setSubmitting(false);
        }
    };

    const displayWardens = isAdmin ? wardens : wardens.filter(w => w.email === user?.email || w.name === user?.name);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                        {isAdmin ? 'Staff Oversight' : 'Assignment Profile'}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">
                        {isAdmin ? 'Administrative control for residence supervisors and facility wardens.' : 'Official jurisdictional data and contact registry.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAdd}
                        className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wide shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <UserPlusIcon className="w-4 h-4" /> Provision New Staff
                    </button>
                )}
            </div>

            {/* Warden Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)
                ) : displayWardens.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                         <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No staff records detected in system</p>
                    </div>
                ) : (
                    displayWardens.map(wrd => (
                        <div key={wrd.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-soft hover:shadow-premium transition-all duration-500 overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors"></div>
                            
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] flex items-center justify-center font-bold text-2xl text-slate-400 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-500 transition-all duration-500 shadow-inner">
                                        {wrd.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{wrd.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-lg uppercase tracking-wider border border-brand-100 dark:border-brand-900/50">
                                                RESIDENCE WARDEN
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleEdit(wrd)}
                                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                <WardenInfoRow icon={BuildingIcon} label="Jurisdiction" value={`${String(wrd.hostel || 'N/A').toUpperCase()} • ${String(wrd.floor || 'N/A').toUpperCase()}`} />
                                <WardenInfoRow icon={MailIcon} label="Communcation" value={wrd.email} />
                                <WardenInfoRow icon={PhoneIcon} label="Direct Contact" value={wrd.mobile || 'N/A'} />
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Enrolled: {wrd.joiningDate}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">System Online</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {(isEditMode || isAddMode) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsEditMode(false); setIsAddMode(false); }}>
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium modal-panel overflow-hidden border border-white/5" onClick={e => e.stopPropagation()}>
                        <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold uppercase tracking-wider mb-1">
                                        {isAddMode ? 'Provisioning Staff' : 'Resource Modification'}
                                    </h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide opacity-80">
                                        {isAddMode ? 'Establishing new staff credentials' : `Modifying identity for ${formData.name}`}
                                    </p>
                                </div>
                                <button onClick={() => { setIsEditMode(false); setIsAddMode(false); }} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={saveWarden} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput label="Full Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
                                <FormInput label="Official Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} required />
                                <FormInput label="Direct Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                                <FormSelect 
                                    label="Assigned Block" 
                                    value={formData.hostel} 
                                    options={hostels} 
                                    onChange={(v) => setFormData({ ...formData, hostel: v })} 
                                />
                                <FormInput label="Jurisdictional Floor" value={formData.floor} onChange={(v) => setFormData({ ...formData, floor: v })} />
                                <FormSelect 
                                    label="Staff Gender" 
                                    value={formData.gender} 
                                    options={['Male', 'Female', 'Other']} 
                                    onChange={(v) => setFormData({ ...formData, gender: v })} 
                                />
                                {isAddMode && (
                                    <div className="md:col-span-2">
                                        <FormInput label="Initial Auth Password" type="password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} required />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => { setIsEditMode(false); setIsAddMode(false); }} className="px-8 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-900 transition-colors">Terminate</button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="px-10 py-3.5 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wide shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'PROCESSING...' : isAddMode ? 'COMMENCE PROVISIONING' : 'UPDATE CREDENTIALS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI Components
const WardenInfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 group/row">
        <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover/row:text-brand-600 transition-colors">
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{value}</p>
        </div>
    </div>
);

const FormInput = ({ label, value, onChange, type = "text", required }) => (
    <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 uppercase tracking-tight"
        />
    </div>
);

const FormSelect = ({ label, value, options, onChange }) => (
    <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all appearance-none uppercase tracking-tight cursor-pointer"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <MoreVerticalIcon className="w-4 h-4 rotate-90" />
            </div>
        </div>
    </div>
);

export default WardenManagement;
