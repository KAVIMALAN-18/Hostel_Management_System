import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services/api';
import Card from '../../components/common/Card';

const MyRoom = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await studentAPI.getProfile();
                if (response.success) {
                    setProfileData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch student profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentProfile();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    const studentProfile = profileData?.profile || null;
    const hasRoomAllocation = !!studentProfile?.room;
    const warden = studentProfile?.warden || null;
    const roommates = studentProfile?.roommates || [];

    return (
        <div className="space-y-10 animate-fade-in max-w-7xl mx-auto px-4 py-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase mb-2">
                        Residency <span className="text-indigo-600">Overview</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium max-w-lg">
                        Detailed allocation analytics and support directory for your assigned habitation unit.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active Allocation</span>
                </div>
            </header>

            {!hasRoomAllocation ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-50">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-5xl mb-6 grayscale opacity-40">
                        🏰
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight mb-2">No Allocation Found</h2>
                    <p className="text-slate-400 font-medium mb-8">Your room assignment is currently being processed by the administration.</p>
                    <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 uppercase tracking-wider text-xs hover:bg-black transition-all">
                        Contact Administration
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Details Column */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Unit Specification Card */}
                        <section className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-100 text-white">
                                        🏘️
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-none mb-1">Unit Specifications</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide italic">Technical allocation data</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 group hover:bg-white hover:border-indigo-100 transition-all">
                                        <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hostel House</p>
                                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tight italic">{studentProfile.hostel?.name || 'Ruby House'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 group hover:bg-white hover:border-indigo-100 transition-all">
                                        <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">📍</div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wing / Block</p>
                                        <p className="text-lg font-bold text-slate-800 uppercase tracking-tight italic">{studentProfile.block?.name || 'Alpha Block'}</p>
                                    </div>
                                    <div className="p-6 bg-indigo-600 rounded-3xl border border-indigo-500 shadow-xl shadow-indigo-100 group transform md:scale-105">
                                        <div className="text-2xl mb-4 text-white">🗝️</div>
                                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Assigned Unit</p>
                                        <p className="text-2xl font-bold text-white uppercase tracking-tight italic">
                                            {studentProfile.room?.roomNumber || 'R-101'} / {studentProfile.bed?.bedNumber || 'B1'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Policy', value: studentProfile.room?.roomType || 'Double Occupancy' },
                                        { label: 'Status', value: studentProfile.allocationStatus || 'Verified' },
                                        { label: 'ID Identity', value: user?.id?.slice(-8).toUpperCase() || 'HMS-001' },
                                        { label: 'Facility', value: 'Prime Access' }
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">{item.label}</p>
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-tight italic">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-12 text-9xl font-bold text-slate-50 -z-0 opacity-50 select-none pointer-events-none italic">UNIT</div>
                        </section>

                        {/* Roommates Section */}
                        <section className="bg-slate-900 p-10 rounded-[40px] shadow-2xl shadow-slate-300 relative overflow-hidden text-white">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl text-white backdrop-blur-md">
                                        👥
                                    </div>
                                    <h3 className="text-lg font-bold uppercase tracking-tight italic">Roommate Directory</h3>
                                </div>
                                
                                {roommates.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {roommates.map((name, i) => (
                                            <div key={i} className="px-6 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm flex items-center gap-4 group hover:bg-white/10 transition-all cursor-default">
                                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform">
                                                    {name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-tight text-slate-400 leading-none mb-1">Resident</p>
                                                    <p className="text-sm font-bold italic">{name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 border border-dashed border-white/20 rounded-3xl text-center">
                                        <p className="text-xs font-medium text-slate-500 italic uppercase tracking-wider">No verified roommates found for this unit.</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-10 -right-10 text-9xl font-bold text-white/5 italic select-none pointer-events-none">SHARES</div>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Warden Support Card */}
                        <section className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden h-full">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="text-4xl mb-6">🧑‍✈️</div>
                                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2 italic leading-none">Warden Support</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-10">Direct communication channel</p>

                                {warden ? (
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="mb-8">
                                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2 leading-none">Administrative Head</p>
                                            <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none italic">{warden.name}</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-indigo-200 transition-all">
                                                <div className="text-xl group-hover:scale-110 transition-transform">📞</div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Secure Line</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate italic">{warden.phone || 'Not available'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-indigo-200 transition-all">
                                                <div className="text-xl group-hover:scale-110 transition-transform">📧</div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Official Mail</p>
                                                    <p className="text-sm font-bold text-slate-800 truncate italic">{warden.email || 'Not available'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 border border-dashed border-slate-200 rounded-3xl text-center flex-1 flex flex-col justify-center bg-slate-50/50">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight italic leading-relaxed">
                                            No warden assigned to {studentProfile.hostel?.name || 'this house'} yet.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-12 pt-8 border-t border-slate-50">
                                    <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-black hover:scale-[1.02] transition-all shadow-xl shadow-slate-100">
                                        Raise Urgent Request
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 text-8xl font-bold text-slate-50 -z-0 opacity-40 italic select-none pointer-events-none">BOSS</div>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRoom;

