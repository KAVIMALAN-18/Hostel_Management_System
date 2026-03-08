import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UsersIcon, BuildingIcon, DoorIcon, PhoneIcon, MailIcon, UserIcon, XIcon } from '../../components/common/Icons';

// Reusable Section Component
const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Icon className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

// Reusable Info Row Component
const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 group">
        <div className="mt-1 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
            {Icon && <Icon className="w-4 h-4" />}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-700">{value || 'Not Assigned'}</p>
        </div>
    </div>
);

// Form Input Component
const FormInput = ({ label, value, onChange, disabled, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100"
        />
    </div>
);

// Form Select Component
const FormSelect = ({ label, value, options, onChange, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100 appearance-none"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const WardenManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // Mock Database from centralized utility
    const [wardens, setWardens] = useState(mockData.wardenDirectory.map(w => ({
        id: w.wardenId,
        name: w.name,
        email: w.email,
        mobile: w.contact,
        hostel: w.assignedHostel,
        floor: w.assignedFloor,
        gender: 'Male',
        joiningDate: '2023-06-15'
    })));

    const [selectedWarden, setSelectedWarden] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', mobile: '', hostel: 'Sapphire', floor: '', gender: 'Male'
    });

    const hostels = ['Sapphire', 'Emerald', 'Ruby', 'Pearl', 'Diamond'];

    const handleEdit = (wrd) => {
        setFormData(wrd);
        setSelectedWarden(wrd);
        setIsEditMode(true);
    };

    const handleAdd = () => {
        setFormData({ name: '', email: '', mobile: '', hostel: 'Sapphire', floor: '', gender: 'Male' });
        setIsAddMode(true);
    };

    const saveWarden = () => {
        if (isAddMode) {
            const newWrd = { ...formData, id: `WRD00${wardens.length + 1}`, joiningDate: new Date().toISOString().split('T')[0] };
            setWardens([...wardens, newWrd]);
        } else {
            setWardens(wardens.map(w => w.id === formData.id ? formData : w));
        }
        setIsEditMode(false);
        setIsAddMode(false);
        setSelectedWarden(null);
    };

    // If warden, filter to show only self
    const displayWardens = isAdmin ? wardens : wardens.filter(w => w.email === user?.email || w.name === user?.name);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isAdmin ? 'Warden Management' : 'My Assignment Details'}
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        {isAdmin ? 'Administer staff assignments and contact registry.' : 'View your current hostel duties and profile info.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAdd}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-soft hover:shadow-soft-lg transform active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span>+</span> Add New Warden
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Warden List / Profile Grid */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayWardens.map(wrd => (
                            <div key={wrd.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="text-[10px] font-black text-slate-300 group-hover:text-brand-100 transition-colors uppercase tracking-widest">{wrd.id}</span>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-xl group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                                        {wrd.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">{wrd.name}</h3>
                                        <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mt-1">{wrd.hostel} • {wrd.floor}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <MailIcon className="w-4 h-4 text-slate-400" />
                                        <span className="truncate">{wrd.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <PhoneIcon className="w-4 h-4 text-slate-400" />
                                        <span>{wrd.mobile}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined: {wrd.joiningDate}</span>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleEdit(wrd)}
                                            className="text-xs font-bold text-brand-600 hover:text-brand-800 uppercase tracking-tight"
                                        >
                                            Edit Assignment
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {(isEditMode || isAddMode) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-900">
                                {isAddMode ? 'Register New Warden' : `Editing ${formData.name}`}
                            </h2>
                            <button
                                onClick={() => { setIsEditMode(false); setIsAddMode(false); }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <FormInput
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(v) => setFormData({ ...formData, name: v })}
                                />
                                <FormInput
                                    label="Official Email"
                                    value={formData.email}
                                    onChange={(v) => setFormData({ ...formData, email: v })}
                                />
                                <FormInput
                                    label="Mobile Number"
                                    value={formData.mobile}
                                    onChange={(v) => setFormData({ ...formData, mobile: v })}
                                />
                                <FormSelect
                                    label="Gender"
                                    value={formData.gender}
                                    options={['Male', 'Female', 'Other']}
                                    onChange={(v) => setFormData({ ...formData, gender: v })}
                                />
                                <FormSelect
                                    label="Assigned Hostel"
                                    value={formData.hostel}
                                    options={hostels}
                                    onChange={(v) => setFormData({ ...formData, hostel: v })}
                                />
                                <FormInput
                                    label="Floor Jurisdiction"
                                    value={formData.floor}
                                    onChange={(v) => setFormData({ ...formData, floor: v })}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => { setIsEditMode(false); setIsAddMode(false); }}
                                className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveWarden}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-2 rounded-xl font-bold text-sm shadow-soft transition-all"
                            >
                                Save Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenManagement;
