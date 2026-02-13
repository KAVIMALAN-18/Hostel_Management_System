import { useState, useEffect } from 'react';
import { hostelAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const HostelView = () => {
    const [hostels, setHostels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHostelModal, setShowHostelModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    const [hostelData, setHostelData] = useState({
        name: '',
        type: 'Boys',
        location: '',
        capacity: 100,
        description: ''
    });

    const [roomData, setRoomData] = useState({
        roomNumber: '',
        type: 'Standard',
        capacity: 4,
        hostel: ''
    });

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const hostelRes = await hostelAPI.getHostels();
            if (hostelRes.success && hostelRes.data.length > 0) {
                setHostels(hostelRes.data);
                if (!selectedHostel) {
                    setSelectedHostel(hostelRes.data[0]);
                }
            } else {
                setHostels([]);
            }
        } catch (err) {
            setError(err.message);
            const mockHostels = [
                { _id: 'h1', name: 'Main Block Alpha', type: 'Boys', location: 'Section A' },
                { _id: 'h2', name: 'Annex Block Beta', type: 'Girls', location: 'Section B' },
            ];
            setHostels(mockHostels);
            if (!selectedHostel) setSelectedHostel(mockHostels[0]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        if (!selectedHostel) return;
        setLoading(true);
        try {
            const roomRes = await hostelAPI.getRooms(selectedHostel._id);
            if (roomRes.success) {
                setRooms(roomRes.data);
            }
        } catch (err) {
            const mockRooms = Array.from({ length: 18 }, (_, i) => ({
                _id: `r${i}`,
                roomNumber: 101 + i,
                status: i % 5 === 0 ? 'full' : 'available',
                occupied: i % 5 === 0 ? 4 : (i % 3 === 0 ? 2 : 1),
                capacity: 4,
                type: 'Standard'
            }));
            setRooms(mockRooms);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedHostel) {
            fetchRooms();
            setRoomData(prev => ({ ...prev, hostel: selectedHostel._id }));
        }
    }, [selectedHostel]);

    const handleAddHostel = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await hostelAPI.createHostel(hostelData);
            if (response.success) {
                setShowHostelModal(false);
                setHostelData({ name: '', type: 'Boys', location: '', capacity: 100, description: '' });
                fetchInitialData();
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await hostelAPI.createRoom(roomData);
            if (response.success) {
                setShowRoomModal(false);
                setRoomData({ roomNumber: '', type: 'Standard', capacity: 4, hostel: selectedHostel?._id || '' });
                fetchRooms();
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRooms = rooms.filter(r => {
        if (filterStatus === 'all') return true;
        return r.status === filterStatus;
    });

    if (loading && hostels.length === 0) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mapping Facilities...</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="section-header flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-none">Facility Infrastructure</h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">Monitoring occupancy status and room distribution across blocks.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowHostelModal(true)}>Add Block</Button>
                    <Button variant="primary" onClick={() => setShowRoomModal(true)}>Add Room</Button>
                </div>
            </div>

            {/* Hostel Selection (Operational Style) */}
            <div className="flex flex-wrap gap-2">
                {hostels.map((h) => (
                    <button
                        key={h._id}
                        onClick={() => setSelectedHostel(h)}
                        className={`px-4 py-2 border rounded text-xs font-bold uppercase tracking-tight transition-all ${selectedHostel?._id === h._id
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {h.name} ({h.type})
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
                {/* Status Filter Bar */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filters:</span>
                        <div className="flex gap-2">
                            {['all', 'available', 'full'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border transition-all ${filterStatus === status
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Available
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Full
                        </div>
                        <div className="w-px h-3 bg-slate-300 mx-1"></div>
                        <span>Total Units: {rooms.length}</span>
                    </div>
                </div>

                {/* Room Grid */}
                <div className="p-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Units...</span>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No units match the selected criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
                            {filteredRooms.map((room) => {
                                const isFull = room.status === 'full';
                                return (
                                    <div
                                        key={room._id}
                                        className={`p-3 rounded border text-center relative group cursor-pointer transition-all ${isFull
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-white border-slate-200 hover:border-blue-400'}`}
                                    >
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">R-{room.roomNumber}</div>
                                        <div className={`text-sm font-bold ${isFull ? 'text-red-700' : 'text-slate-700'}`}>
                                            {room.occupied}/{room.capacity}
                                        </div>
                                        <div className="mt-1 flex justify-center gap-0.5">
                                            {Array.from({ length: room.capacity }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${i < room.occupied ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                ></div>
                                            ))}
                                        </div>
                                        {/* Hover Tooltip/Label */}
                                        <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block z-20">
                                            <div className="bg-slate-900 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap opacity-90 shadow-lg mx-auto w-max">
                                                {isFull ? 'CAPACITY REACHED' : 'VACANCY AVAILABLE'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showHostelModal}
                onClose={() => setShowHostelModal(false)}
                title="Register New Infrastructure Block"
                footer={(
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setShowHostelModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" form="add-hostel-form" loading={submitting}>Establish Block</Button>
                    </div>
                )}
            >
                <form id="add-hostel-form" onSubmit={handleAddHostel} className="space-y-4">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight mb-4 border-b border-slate-100 pb-2">Building Specifications</p>
                    <Input label="Block Name / ID" required value={hostelData.name} onChange={(e) => setHostelData({ ...hostelData, name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Wing/Type</label>
                            <select
                                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                                value={hostelData.type}
                                onChange={(e) => setHostelData({ ...hostelData, type: e.target.value })}
                            >
                                <option>Boys</option>
                                <option>Girls</option>
                            </select>
                        </div>
                        <Input label="Max Occupancy" type="number" value={hostelData.capacity} onChange={(e) => setHostelData({ ...hostelData, capacity: e.target.value })} />
                    </div>
                    <Input label="Site Location" value={hostelData.location} onChange={(e) => setHostelData({ ...hostelData, location: e.target.value })} />
                </form>
            </Modal>

            <Modal
                isOpen={showRoomModal}
                onClose={() => setShowRoomModal(false)}
                title="Initialize New Residential Unit"
                footer={(
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setShowRoomModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" form="add-room-form" loading={submitting}>Provision Unit</Button>
                    </div>
                )}
            >
                <form id="add-room-form" onSubmit={handleAddRoom} className="space-y-4">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight mb-4 border-b border-slate-100 pb-2">Unit Configuration</p>
                    <Input label="Room Inventory Number" required value={roomData.roomNumber} onChange={(e) => setRoomData({ ...roomData, roomNumber: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-slate-700 ml-1">Room Class</label>
                            <select
                                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                                value={roomData.type}
                                onChange={(e) => setRoomData({ ...roomData, type: e.target.value })}
                            >
                                <option>Standard</option>
                                <option>Premium</option>
                                <option>Suite</option>
                            </select>
                        </div>
                        <Input label="Bed Count" type="number" value={roomData.capacity} onChange={(e) => setRoomData({ ...roomData, capacity: e.target.value })} />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HostelView;
