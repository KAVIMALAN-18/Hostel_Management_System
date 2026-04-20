import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    UsersIcon, 
    BuildingIcon, 
    PhoneIcon, 
    MailIcon, 
    XIcon, 
    UserPlusIcon, 
    CalendarIcon,
    EditIcon,
    MoreVerticalIcon,
} from '../../components/common/Icons';
import { authAPI, staffAPI, hostelAPI } from '../../services/api';

const WardenManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [wardens, setWardens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [availableHostels, setAvailableHostels] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', hostel: '', floor: '', gender: 'Male', password: '', employeeId: ''
    });

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
                    employeeId: w.employeeId || 'WARDEN-ID-TBD',
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

    const fetchHostels = async () => {
        try {
            const response = await hostelAPI.getHostels();
            if (response.success) {
                setAvailableHostels(response.data.map(h => h.name));
                // Set default hostel if none selected
                if (response.data.length > 0 && !formData.hostel) {
                    setFormData(prev => ({ ...prev, hostel: response.data[0].name }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch hostels:', err);
        }
    };

    useEffect(() => {
        fetchWardens();
        fetchHostels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEdit = (wrd) => {
        setFormData({
            ...wrd,
            phone: wrd.mobile,
            employeeId: wrd.employeeId,
            gender: wrd.gender,
            id: wrd.id
        });
        setIsEditMode(true);
    };

    const handleAdd = () => {
        setModalError('');
        setFormData({ 
            name: '', 
            email: '', 
            phone: '', 
            hostel: availableHostels[0] || '', 
            floor: '', 
            gender: 'Male', 
            employeeId: `EMP-${Date.now()}`,
            password: '' 
        });
        setIsAddMode(true);
    };

    const saveWarden = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');
        try {
            if (isAddMode) {
                const res = await authAPI.register({ ...formData, role: 'warden' });
                if (!res.success) {
                    setModalError(res.message || 'Failed to provision account. Check credentials.');
                    return;
                }
            } else {
                await staffAPI.updateStaff(formData.id, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    assignedHostel: formData.hostel,
                    assignedFloor: formData.floor,
                    gender: formData.gender,
                    employeeId: formData.employeeId,
                    role: 'warden'
                });
            }
            fetchWardens();
            setIsEditMode(false);
            setIsAddMode(false);
        } catch (err) {
            setModalError(err.message || 'Error processing request');
            console.error(err);
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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-3 ${isEditMode ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
                        >
                            <EditIcon className="w-4 h-4" /> {isEditMode ? 'Exit Edit Mode' : 'Modify Records'}
                        </button>
                        <button
                            onClick={handleAdd}
                            className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wide shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <UserPlusIcon className="w-4 h-4" /> Provision New Staff
                        </button>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 rounded-[2rem] flex items-center gap-4 text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-soft">
                        <ShieldAlertIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-0.5">System Alert</p>
                        <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
                    </div>
                    <button 
                        onClick={() => setError(null)}
                        className="p-3 hover:bg-rose-100 dark:hover:bg-rose-800/40 rounded-2xl transition-all"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

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
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight lowercase">{wrd.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-lg tracking-wider border border-brand-100 dark:border-brand-900/50">
                                                Residence Warden
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleEdit(wrd)}
                                        className={`p-3 rounded-2xl transition-all shadow-sm ${isEditMode ? 'bg-brand-600 text-white animate-pulse' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}
                                    >
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 mb-8">
                                <WardenInfoRow icon={BuildingIcon} label="Jurisdiction" value={`${wrd.hostel || 'N/A'} • ${wrd.floor || 'N/A'}`} />
                                <WardenInfoRow icon={MailIcon} label="Communication" value={wrd.email.toLowerCase()} />
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
                            {modalError && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mb-4 col-span-1 md:col-span-2">
                                    <XIcon className="w-4 h-4 flex-shrink-0" />
                                    {modalError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput 
                                    label="Full Name" 
                                    value={formData.name} 
                                    onChange={(v) => {
                                        const nameClean = v.toLowerCase().replace(/\s+/g, '');
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            name: v,
                                            ...(isAddMode && { 
                                                password: nameClean ? `${nameClean}@123` : '',
                                                email: nameClean ? `${nameClean}@warden.ac.in` : ''
                                            })
                                        }))
                                    }} 
                                    required 
                                />
                                <FormInput label="Official Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v.toLowerCase() })} required />
                                <FormInput label="Direct Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                                <FormSelect 
                                    label="Assigned Block" 
                                    value={formData.hostel} 
                                    options={availableHostels} 
                                    onChange={(v) => setFormData({ ...formData, hostel: v })} 
                                />
                                <FormInput label="Jurisdictional Floor" value={formData.floor} onChange={(v) => setFormData({ ...formData, floor: v })} />
                                <FormSelect 
                                    label="Staff Gender" 
                                    value={formData.gender} 
                                    options={['Male', 'Female', 'Other']} 
                                    onChange={(v) => setFormData({ ...formData, gender: v })} 
                                />
                                <FormInput label="Employee Identity ID" value={formData.employeeId} onChange={(v) => setFormData({ ...formData, employeeId: v })} required />
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
const WardenInfoRow = ({ icon, label, value }) => {
    const IconComponent = icon;
    return (
        <div className="flex items-center gap-4 group/row">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 group-hover/row:text-brand-600 transition-colors">
                <IconComponent className="w-4 h-4" />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
};

const FormInput = ({ label, value, onChange, type = "text", required }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 tracking-tight ${isPassword || type === 'email' ? '' : ''}`}
                />
                {isPassword && (
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

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
