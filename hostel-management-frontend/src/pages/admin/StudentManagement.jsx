import { useState, useEffect } from 'react';
import { studentAPI, authAPI, hostelAPI } from '../../services/api';
import { 
    UsersIcon, 
    UserPlusIcon, 
    SearchIcon, 
    FilterIcon, 
    MoreHorizontalIcon, 
    MailIcon, 
    PhoneIcon, 
    MapPinIcon,
    ShieldCheckIcon,
    AlertCircleIcon,
    XIcon,
    CheckCircleIcon,
    TrashIcon,
    EditIcon,
    ExternalLinkIcon,
    BuildingIcon,
    DoorIcon
} from '../../components/common/Icons';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostel, setSelectedHostel] = useState('ALL BLOCKS');
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentRes, hostelRes] = await Promise.all([
                studentAPI.getAll(),
                hostelAPI.getHostels()
            ]);
            
            if (studentRes.success) setStudents(studentRes.data);
            if (hostelRes.success) setHostels(hostelRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');
        try {
            const response = await authAPI.register(formData);
            if (response.success) {
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', phone: '', role: 'student' });
                fetchData();
            } else {
                setModalError(response.message || 'Failed to provision account. Check credentials.');
            }
        } catch (err) {
            setModalError(err.message || 'Network error occurred');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            if (currentStatus) {
                await studentAPI.deactivate(id);
            } else {
                await studentAPI.update(id, { isActive: true });
            }
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePermanentDelete = async (id, name) => {
        if (window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY DELETE student "${name}"? This will also free up their assigned bed and cannot be undone.`)) {
            try {
                const response = await studentAPI.deletePermanent(id);
                if (response.success) {
                    setIsViewModalOpen(false);
                    fetchData();
                }
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.phone && s.phone.includes(searchTerm));
        const matchesHostel = selectedHostel === 'ALL BLOCKS' || s.profile?.hostel?._id === selectedHostel;
        return matchesSearch && matchesHostel;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Personnel Index</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-1">Authorized Resident Directory & Identity Management</p>
                </div>
                <div className="flex items-center gap-3">

                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 flex items-center gap-2"
                    >
                        <UserPlusIcon className="w-4 h-4" /> Provision Personnel
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Residents" value={students.length} sub="Active in System" icon={UsersIcon} color="text-brand-600" bg="bg-brand-50 dark:bg-brand-900/20" />
                <StatCard label="Allocated" value={students.filter(s => s.profile?.allocationStatus === 'allocated').length} sub="Housing Secured" icon={ShieldCheckIcon} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                <StatCard label="Pending Approval" value={students.filter(s => !s.isActive).length} sub="Awaiting Vetting" icon={AlertCircleIcon} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />
                <StatCard label="Growth Rate" value="+12%" sub="Last 30 Days" icon={CheckCircleIcon} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-2 shadow-soft flex flex-col md:flex-row items-center gap-2">
                <div className="flex-[2] w-full flex items-center gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="SEARCH BY NAME, EMAIL, OR REGISTRATION NO..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-full tracking-wider placeholder:text-slate-400"
                    />
                </div>
                
                <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <FilterIcon className="w-4 h-4 text-slate-400" />
                    <select 
                        value={selectedHostel}
                        onChange={(e) => setSelectedHostel(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none w-full uppercase tracking-wider cursor-pointer"
                    >
                        <option value="ALL BLOCKS" className="bg-white dark:bg-slate-800">ALL BLOCKS</option>
                        {hostels.map(h => <option key={h._id} value={h._id} className="bg-white dark:bg-slate-800">{h.name.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="px-4 py-2 flex items-center gap-2 border-l border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{filteredStudents.length} RECORDS</span>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wide">Personnel Information</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wide">Assignment Context</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wide">Vetting Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wide">Last Sync</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Querying Registry...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">No matching personnel records found in system</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-950/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950 group-hover:text-brand-600 transition-all border border-transparent group-hover:border-brand-100 dark:group-hover:border-brand-900/50">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{student.name}</p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500 tracking-tight">
                                                        <span className="flex items-center gap-1"><MailIcon className="w-3 h-3" /> {student.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                                        UNIT: {student.profile?.room?.roomNumber || 'PENDING'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 tracking-wider flex items-center gap-1.5 ml-1">
                                                    <BuildingIcon className="w-3 h-3" /> {student.profile?.hostel?.name || 'Block Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${student.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${student.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {student.isActive ? 'AUTHORIZED' : 'REVOKED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                                                    {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                                                    {student.updatedAt ? new Date(student.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOT RECORDED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:border-brand-200"
                                                >
                                                    <ExternalLinkIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(student._id, student.isActive)}
                                                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                                                        student.isActive 
                                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100 dark:border-emerald-900 border'
                                                    }`}
                                                >
                                                    {student.isActive ? 'DEACTIVATE' : 'AUTHORIZE'}
                                                </button>
                                                <button 
                                                    onClick={() => handlePermanentDelete(student._id, student.name)}
                                                    className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100 dark:border-rose-900/50"
                                                    title="Permanent Delete"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Profile Modal - High Fidelity */}
            {isViewModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/80 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}>
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium overflow-hidden modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="relative h-32 bg-gradient-to-r from-brand-600 to-indigo-600">
                             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                             <button onClick={() => setIsViewModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/40 transition-all">
                                <XIcon className="w-5 h-5" />
                             </button>
                        </div>
                        <div className="px-8 -mt-12 pb-8">
                             <div className="flex items-end justify-between mb-8">
                                <div className="relative">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-2xl">
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-bold text-4xl text-slate-300">
                                            {selectedStudent.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${selectedStudent.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <div className="flex gap-3 pb-2">
                                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-brand-600 transition-all border border-slate-200 dark:border-slate-700">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handlePermanentDelete(selectedStudent._id, selectedStudent.name)}
                                        className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-900/50 rounded-2xl"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                             </div>

                             <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedStudent.name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">IDENTIFIER: {selectedStudent._id.toUpperCase()}</p>
                             </div>

                             <div className="grid grid-cols-2 gap-8 mt-10 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-700">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Residential Context</p>
                                        <div className="space-y-3">
                                            <ProfileField icon={BuildingIcon} label="Facility" value={selectedStudent.profile?.hostel?.name || 'Unassigned'} />
                                            <ProfileField icon={DoorIcon} label="Unit & Bed" value={selectedStudent.profile?.room ? `${selectedStudent.profile.room.roomNumber} - Bed ${selectedStudent.profile.bedId || 'N/A'}` : 'Not Allocated'} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Communication</p>
                                        <div className="space-y-3">
                                            <ProfileField icon={MailIcon} label="Email Address" value={selectedStudent.email} />
                                            <ProfileField icon={PhoneIcon} label="Primary Contact" value={selectedStudent.phone || 'Not Provided'} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Compliance & Metrics</p>
                                        <div className="space-y-3">
                                            <ProfileField icon={ShieldCheckIcon} label="Authorization" value={selectedStudent.isActive ? 'Active' : 'Revoked'} status={selectedStudent.isActive ? 'success' : 'neutral'} />
                                            <ProfileField icon={MapPinIcon} label="Origin" value={selectedStudent.profile?.nativePlace || 'Unknown'} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Family Information</p>
                                        <div className="space-y-3">
                                            <ProfileField icon={UsersIcon} label="Guardian" value={selectedStudent.profile?.guardianName || 'N/A'} />
                                            <ProfileField icon={PhoneIcon} label="Emergency Contact" value={selectedStudent.profile?.guardianPhone || 'N/A'} />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Modal - Premium Design */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-premium modal-panel" onClick={e => e.stopPropagation()}>
                        <div className="p-8 bg-slate-900 text-white rounded-t-[2.5rem] relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl"></div>
                            <h2 className="text-xl font-bold uppercase tracking-wider mb-1 relative z-10">Personnel Provisioning</h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider opacity-80 relative z-10">System Identity Creation Engine</p>
                        </div>
                        
                        <form onSubmit={handleAddStudent} className="p-8 space-y-6">
                            {modalError && (
                                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
                                    {modalError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-6">
                                <FormInput 
                                    label="Full Name" 
                                    value={formData.name} 
                                    onChange={(v) => {
                                        const nameClean = v.toLowerCase().replace(/\s+/g, '');
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            name: v,
                                            email: nameClean ? `${nameClean}@student.ac.in` : '',
                                            password: nameClean ? `${nameClean}@123` : '' 
                                        }));
                                    }} 
                                    required 
                                />
                                <FormInput label="Official Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v.toLowerCase() })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="System Password" type="password" value={formData.password} onChange={(v) => setFormData({ ...formData, password: v })} required />
                                    <FormInput label="Contact Phone" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-900 transition-colors">Terminate</button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wide text-white shadow-xl transition-all active:scale-95 ${
                                        submitting ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                                    }`}
                                >
                                    {submitting ? 'PROVISIONING...' : 'AUTHORIZE ACCOUNT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI Sub-components
const StatCard = (props) => {
    const { label, value, sub, icon: Icon, color, bg } = props;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-soft flex items-start gap-5 hover:border-brand-500/30 transition-all">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center ${color}`}>
                {Icon && <Icon className="w-7 h-7" />}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mt-1">{sub}</p>
            </div>
        </div>
    );
};

const ProfileField = (props) => {
    const { icon: Icon, label, value, status } = props;
    return (
        <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                {Icon && <Icon className="w-4 h-4" />}
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
                <p className={`text-sm font-bold tracking-tight uppercase ${status === 'success' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                    {value}
                </p>
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
                    className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl px-5 py-3.5 text-xs font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 tracking-tight ${type === 'email' ? '' : ''}`}
                />
                {isPassword && (
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                        {showPassword ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;
