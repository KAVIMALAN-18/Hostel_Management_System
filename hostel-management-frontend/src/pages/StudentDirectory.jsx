import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import { UsersIcon, BuildingIcon, DoorIcon, PhoneIcon, MailIcon, UserIcon } from '../components/common/Icons';

const StudentDirectory = () => {
    const { user } = useAuth();
    const [selectedHostel, setSelectedHostel] = useState('All Hostels');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [searchRoom, setSearchRoom] = useState('');
    const [searchName, setSearchName] = useState('');

    const isAdmin = user?.role === 'admin';
    const isWarden = user?.role === 'warden';

    // Hostel data
    const hostels = ['All Hostels', 'Alpha Block', 'Beta Block', 'Gamma Block', 'Delta Block'];

    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state for Add/Edit
    const [formData, setFormData] = useState({
        name: '', id: '', hostel: 'Sapphire', room: '', floor: '',
        mobile: '', email: '', parentName: '', parentMobile: '',
        native: '', bloodGroup: '', gender: 'Male', wardenName: '', wardenMobile: ''
    });

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await studentAPI.getAll();
                if (res.success) {
                    const mapped = res.data.map(s => ({
                        id: s.registrationNumber,
                        _id: s._id,
                        name: s.user?.name || 'Unknown',
                        photo: null,
                        hostel: s.hostel?.name || 'N/A',
                        room: s.room?.roomNumber || 'N/A',
                        floor: s.floor || 'N/A',
                        issues: 'None',
                        mobile: s.user?.phone || 'N/A',
                        email: s.user?.email || 'N/A',
                        parentName: s.guardianName || 'N/A',
                        parentMobile: s.guardianPhone || 'N/A',
                        native: s.nativePlace || 'N/A',
                        bloodGroup: s.bloodGroup || 'N/A',
                        gender: s.user?.gender || 'N/A',
                        wardenName: s.hostel?.warden?.name || 'Unassigned',
                        wardenMobile: s.hostel?.warden?.phone || 'N/A'
                    }));
                    setAllStudents(mapped);
                }
            } catch (error) {
                console.error('Failed to fetch students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleEdit = (student) => {
        setFormData(student);
        setSelectedStudent(student);
        setIsEditMode(true);
    };

    const handleAdd = () => {
        setFormData({
            name: '', id: `TKT-${Math.floor(Math.random() * 900) + 100}`, hostel: 'Sapphire', room: '', floor: '',
            mobile: '', email: '', parentName: '', parentMobile: '',
            native: '', bloodGroup: '', gender: 'Male', wardenName: '', wardenMobile: ''
        });
        setIsAddMode(true);
    };

    const saveStudent = () => {
        if (isAddMode) {
            setAllStudents([...allStudents, { ...formData }]);
        } else {
            setAllStudents(allStudents.map(s => s.id === formData.id ? formData : s));
        }
        setIsAddMode(false);
        setIsEditMode(false);
        setSelectedStudent(null);
    };

    // Filter students
    const filteredStudents = allStudents.filter(student => {
        const hostelMatch = selectedHostel === 'All Hostels' || student.hostel === selectedHostel;
        const roomMatch = searchRoom === '' || student.room.toLowerCase().includes(searchRoom.toLowerCase());
        const nameMatch = searchName === '' || student.name.toLowerCase().includes(searchName.toLowerCase());
        return hostelMatch && roomMatch && nameMatch;
    });

    // Student View - Only their own profile
    if (user?.role === 'student') {
        const studentInfo = allStudents.find(s => s.name === user.name) || allStudents[0];
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Personal Directory</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Viewing your registered residency information</p>
                </div>

                <div className="data-card !p-0 overflow-hidden">
                    <div className="p-8 border-b border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-4xl border border-white/20">
                                {studentInfo.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">{studentInfo.name}</h2>
                                <p className="text-slate-400 font-medium">Student ID: {studentInfo.id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Section title="Personal Info" icon={UserIcon}>
                            <InfoRow label="Gender" value={studentInfo.gender} />
                            <InfoRow label="Blood Group" value={studentInfo.bloodGroup} color="text-red-600" />
                            <InfoRow label="Native" value={studentInfo.native} />
                            <InfoRow label="Mobile" value={studentInfo.mobile} />
                            <InfoRow label="Email" value={studentInfo.email} />
                        </Section>

                        <Section title="Residence Info" icon={BuildingIcon}>
                            <InfoRow label="Hostel" value={studentInfo.hostel} />
                            <InfoRow label="Room & Floor" value={`${studentInfo.room} (${studentInfo.floor})`} />
                            <InfoRow label="Warden" value={studentInfo.wardenName} />
                            <InfoRow label="Warden Contact" value={studentInfo.wardenMobile} />
                        </Section>

                        <Section title="Family Details" icon={PhoneIcon}>
                            <InfoRow label="Parent Name" value={studentInfo.parentName} />
                            <InfoRow label="Parent Contact" value={studentInfo.parentMobile} />
                        </Section>
                    </div>
                </div>
            </div>
        );
    }

    // Warden/Admin View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                        {isAdmin ? 'Manage all student records and system access' : 'View authoritative student records'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right border-r border-slate-200 dark:border-slate-700 pr-4 mr-4">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">Total Students</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{allStudents.length}</p>
                    </div>
                    {isAdmin && (
                        <button onClick={handleAdd} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-soft transition-all">
                            + Add Student
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="data-card !p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase mb-2">Hostel Block</label>
                        <select
                            value={selectedHostel}
                            onChange={(e) => setSelectedHostel(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        >
                            {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase mb-2">Room Search</label>
                        <input
                            type="text" placeholder="e.g. B-304"
                            value={searchRoom} onChange={(e) => setSearchRoom(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase mb-2">Search Student</label>
                        <input
                            type="text" placeholder="Enter name or ID..."
                            value={searchName} onChange={(e) => setSearchName(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="w-full text-left border-collapse">
                    <thead className="table-header">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase">Hostel</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase">Room/Floor</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase">Contact</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800/40">
                        {filteredStudents.map((student, idx) => (
                            <tr key={student._id || student.id || `student-${idx}`} className="table-row-hover">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center font-bold text-sm">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">{student.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold rounded uppercase">
                                        {student.hostel}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                    {student.room} <span className="text-slate-400 dark:text-slate-600 mx-1">•</span> {student.floor}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{student.mobile}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setSelectedStudent(student)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all text-slate-600 dark:text-slate-300">
                                            <UserIcon className="w-4 h-4" />
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => handleEdit(student)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all text-brand-600 dark:text-brand-400 text-xs font-bold">
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit/View Modal */}
            {(selectedStudent || isAddMode) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {isAddMode ? 'Register New Student' : isEditMode ? `Editing ${formData.name}` : 'Student Profile Details'}
                            </h2>
                            <button onClick={() => { setSelectedStudent(null); setIsEditMode(false); setIsAddMode(false); }} className="text-slate-400 hover:text-rose-600 text-2xl transition-colors">✕</button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6 bg-white dark:bg-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Full Name" value={isAddMode || isEditMode ? formData.name : selectedStudent.name} onChange={(v) => setFormData({ ...formData, name: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Student ID" value={isAddMode || isEditMode ? formData.id : selectedStudent.id} onChange={(v) => setFormData({ ...formData, id: v })} disabled={!isAddMode && !isEditMode} />
                                <FormSelect label="Hostel" value={isAddMode || isEditMode ? formData.hostel : selectedStudent.hostel} options={hostels.filter(h => h !== 'All Hostels')} onChange={(v) => setFormData({ ...formData, hostel: v })} disabled={!isAddMode && !isEditMode} />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Room" value={isAddMode || isEditMode ? formData.room : selectedStudent.room} onChange={(v) => setFormData({ ...formData, room: v })} disabled={!isAddMode && !isEditMode} />
                                    <FormInput label="Floor" value={isAddMode || isEditMode ? formData.floor : selectedStudent.floor} onChange={(v) => setFormData({ ...formData, floor: v })} disabled={!isAddMode && !isEditMode} />
                                </div>
                                <FormInput label="Mobile" value={isAddMode || isEditMode ? formData.mobile : selectedStudent.mobile} onChange={(v) => setFormData({ ...formData, mobile: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Email" value={isAddMode || isEditMode ? formData.email : selectedStudent.email} onChange={(v) => setFormData({ ...formData, email: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Parent Name" value={isAddMode || isEditMode ? formData.parentName : selectedStudent.parentName} onChange={(v) => setFormData({ ...formData, parentName: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Parent Mobile" value={isAddMode || isEditMode ? formData.parentMobile : selectedStudent.parentMobile} onChange={(v) => setFormData({ ...formData, parentMobile: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Native Place" value={isAddMode || isEditMode ? formData.native : selectedStudent.native} onChange={(v) => setFormData({ ...formData, native: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Blood Group" value={isAddMode || isEditMode ? formData.bloodGroup : selectedStudent.bloodGroup} onChange={(v) => setFormData({ ...formData, bloodGroup: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Warden Name" value={isAddMode || isEditMode ? formData.wardenName : selectedStudent.wardenName} onChange={(v) => setFormData({ ...formData, wardenName: v })} disabled={!isAddMode && !isEditMode} />
                                <FormInput label="Warden Mobile" value={isAddMode || isEditMode ? formData.wardenMobile : selectedStudent.wardenMobile} onChange={(v) => setFormData({ ...formData, wardenMobile: v })} disabled={!isAddMode && !isEditMode} />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => { setSelectedStudent(null); setIsEditMode(false); setIsAddMode(false); }} className="px-6 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Cancel</button>
                            {(isAddMode || isEditMode) && (
                                <button onClick={saveStudent} className="btn-primary px-8 shadow-lg shadow-brand-500/20">Save Changes</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI Components
const Section = ({ title, icon: Icon, children }) => (
    <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Icon className="w-3 h-3" /> {title}
        </h3>
        <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-colors">{children}</div>
    </div>
);

const InfoRow = ({ label, value, color = "text-slate-900 dark:text-slate-100" }) => (
    <div className="flex justify-between py-2 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-300">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
);

const FormInput = ({ label, value, onChange, disabled }) => (
    <div className="transition-colors">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase mb-1.5 ml-1">{label}</label>
        <input
            type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-500 dark:disabled:text-slate-600 transition-all"
        />
    </div>
);

const FormSelect = ({ label, value, options, onChange, disabled }) => (
    <div className="transition-colors">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase mb-1.5 ml-1">{label}</label>
        <select
            value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-500 dark:disabled:text-slate-600 appearance-none transition-all"
        >
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

export default StudentDirectory;
