import { useState, useEffect } from 'react';
import { hostelAPI } from '../../services/api';
import Card from '../../components/common/Card';

const BlockManagement = () => {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await hostelAPI.getHostels();
                if (response.success) {
                    // Enrich hostels with room counts if needed, but for now just show hostels as "Sectors"
                    setHostels(response.data);
                }
            } catch (err) {
                setError(err.message);
                setHostels([
                    { _id: 'h1', name: 'Alpha Block', type: 'Junior Wing', capacity: 100, occupiedBeds: 40 },
                    { _id: 'h2', name: 'Beta Block', type: 'Senior Wing', capacity: 150, occupiedBeds: 30 }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                    Block <span className="text-indigo-600">Logistics</span>
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                    Managing block allocations and sector capacity
                </p>
            </div>

            {error && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700">
                    <span className="text-lg">ℹ️</span>
                    <p className="text-xs font-bold uppercase tracking-tight italic">Using fallback logistics: {error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((block) => (
                    <Card key={block._id} className="hover:border-indigo-300 transition-all border-none shadow-sm group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xl shadow-lg italic font-black">
                                {block.name.charAt(0)}
                            </div>
                            <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-widest italic">Sector Verified</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic group-hover:text-indigo-600 transition-colors mb-1">{block.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{block.type || 'Standard Wing'}</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">Location</p>
                                <p className="text-xs font-black text-slate-800 tracking-tight uppercase">{block.location || 'Main Zone'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 italic">Capacity</p>
                                <p className="text-xl font-black text-slate-800 tracking-tighter">{block.capacity}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full"
                                    style={{ width: `${(block.occupiedBeds / block.capacity) * 100 || 0}%` }}
                                ></div>
                            </div>
                            <p className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest">Occupancy: {((block.occupiedBeds / block.capacity) * 100).toFixed(0) || 0}%</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BlockManagement;
