import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Card from '../../components/common/Card';

const MyRoom = () => {
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await authAPI.getMe();
                if (response.success) {
                    setStudentData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch student data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    // Extract room data if available
    const roomData = studentData?.bed || null;
    const hasRoomAllocation = !!roomData;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                    My <span className="text-indigo-600">Habitation</span>
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                    Encrypted unit allocation details for {user?.name}
                </p>
            </div>

            {!hasRoomAllocation ? (
                <Card className="text-center py-20 border-dashed border-slate-200 bg-slate-50/50">
                    <div className="text-4xl mb-4 grayscale opacity-30">🏠</div>
                    <h3 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-widest italic">No Allocation Found</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Contact warden for room assignment</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card title="Unit Specifications" subtitle="Allocation analysis" className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {[
                                    { label: 'Sector / Block', value: roomData.hostel?.name || 'Alpha Wing (Sector-01)', icon: '🏢' },
                                    { label: 'Unit Number', value: `Room #${roomData.room?.roomNumber || '302'}`, icon: '🔢' },
                                    { label: 'Sharing Policy', value: roomData.room?.type || 'Double Occupancy', icon: '👥' }
                                ].map((spec) => (
                                    <div key={spec.label} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl grayscale opacity-40 italic">
                                            {spec.icon}
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{spec.label}</p>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight italic">{spec.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-6">
                                {[
                                    { label: 'Check-in Date', value: studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : 'Oct 15, 2025', icon: '📅' },
                                    { label: 'Student ID', value: studentData?._id?.slice(-8).toUpperCase() || 'HMS-7729', icon: '🔑' },
                                    { label: 'Facility Access', value: studentData?.isActive ? 'Verified' : 'Pending', icon: '✅' }
                                ].map((spec) => (
                                    <div key={spec.label} className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl grayscale opacity-40 italic">
                                            {spec.icon}
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">{spec.label}</p>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight italic">{spec.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 italic">Unit Policy</h3>
                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-6">Resident Responsibilities</p>
                                <ul className="space-y-4">
                                    {[
                                        'Maintain visual hygiene',
                                        'No unverified hardware',
                                        'Silence protocol: 10PM'
                                    ].map((policy) => (
                                        <li key={policy} className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">{policy}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="absolute -bottom-10 -right-10 text-8xl opacity-5 italic font-black group-hover:scale-110 transition-transform">RULE</div>
                        </div>

                        <Card className="text-center border-dashed border-slate-200 bg-slate-50/50">
                            <div className="text-3xl mb-3 grayscale opacity-30 italic">🛡️</div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1 italic">Inventory Check</h4>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scheduled: Monthly 1st</p>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRoom;

