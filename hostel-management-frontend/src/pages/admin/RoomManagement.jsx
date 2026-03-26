import { useState, useEffect } from 'react';
import { hostelAPI, studentAPI } from '../../services/api';
import { BuildingIcon, DoorIcon, UsersIcon, CheckIcon, XIcon } from '../../components/common/Icons';

const RoomManagement = () => {
    const [hostels, setHostels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [unassignedStudents, setUnassignedStudents] = useState([]);
    const [selectedHostelId, setSelectedHostelId] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Hostels on Mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await hostelAPI.getHostels();
                if (response.success && response.data.length > 0) {
                    setHostels(response.data);
                    setSelectedHostelId(response.data[0]._id);
                }
            } catch (err) {
                setError('Failed to fetch hostels');
                console.error(err);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch Rooms when Hostel changes
    useEffect(() => {
        if (!selectedHostelId) return;
        
        const fetchRooms = async () => {
            setLoading(true);
            try {
                const response = await hostelAPI.getRooms(selectedHostelId);
                if (response.success) {
                    setRooms(response.data);
                }
            } catch (err) {
                console.error('Failed to fetch rooms:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [selectedHostelId]);

    // Fetch Unassigned Students when modal opens
    useEffect(() => {
        if (showAssignModal) {
            const fetchStudents = async () => {
                try {
                    const response = await studentAPI.getAll();
                    if (response.success) {
                        // Filter for students without rooms
                        const unassigned = response.data.filter(s => 
                            !s.profile || s.profile.allocationStatus !== 'allocated'
                        );
                        setUnassignedStudents(unassigned);
                    }
                } catch (err) {
                    console.error('Failed to fetch students:', err);
                }
            };
            fetchStudents();
        }
    }, [showAssignModal]);

    const handleAssignStudent = async () => {
        if (!selectedStudentId || !selectedBed) return;

        try {
            const payload = {
                studentId: selectedStudentId,
                hostelId: selectedHostelId,
                roomId: selectedBed.roomId,
                bedId: selectedBed.bedId
            };

            const response = await hostelAPI.allocateBed(payload);
            if (response.success) {
                // Refresh data
                const roomRes = await hostelAPI.getRooms(selectedHostelId);
                if (roomRes.success) {
                    setRooms(roomRes.data);
                    // Update current selected room modal if open
                    const updatedRoom = roomRes.data.find(r => r._id === selectedBed.roomId);
                    if (updatedRoom) setSelectedRoom(updatedRoom);
                }
                
                setShowAssignModal(false);
                setSelectedStudentId('');
                setSelectedBed(null);
                alert('Student successfully assigned to room!');
            }
        } catch (err) {
            alert(err.message || 'Error assigning student');
        }
    };

    const getOccupancyColor = (room) => {
        if (room.occupiedBeds === 0) return 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700';
        if (room.occupiedBeds >= room.totalBeds) return 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800';
        return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Global Unit Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium italic">Authorized residential inventory and occupancy monitoring.</p>
                </div>
            </div>

            {/* Selection Bar */}
            <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-4 shadow-sm transition-colors">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Facilities Block</label>
                        <select
                            value={selectedHostelId}
                            onChange={(e) => setSelectedHostelId(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                        >
                            <option value="">Select a Hostel</option>
                            {hostels.map((hostel) => (
                                <option key={hostel._id} value={hostel._id}>{hostel.name} ({hostel.type})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 px-6 border-l border-slate-100 dark:border-slate-800">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Total Units</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{rooms.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Available</p>
                            <p className="text-xl font-black text-blue-600">{rooms.filter(r => r.occupiedBeds < r.totalBeds).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Inventory...</p>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No units found for this facility</p>
                    </div>
                ) : (
                    rooms.map((room) => (
                        <div
                            key={room._id}
                            onClick={() => setSelectedRoom(room)}
                            className={`${getOccupancyColor(room)} border rounded p-4 cursor-pointer hover:border-blue-400 transition-all`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <DoorIcon className="w-4 h-4 text-slate-600" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Room {room.roomNumber}</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                                    room.occupiedBeds >= room.totalBeds ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {room.occupiedBeds >= room.totalBeds ? 'FULL' : 'VACANCY'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-400 uppercase">Class:</span>
                                    <span className="text-slate-700 dark:text-slate-300 uppercase">{room.roomType}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-400 uppercase">Load:</span>
                                    <span className="text-slate-700 dark:text-slate-300">{room.occupiedBeds}/{room.totalBeds}</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full ${room.occupiedBeds >= room.totalBeds ? 'bg-red-500' : 'bg-blue-600'}`}
                                        style={{ width: `${(room.occupiedBeds / room.totalBeds) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Room Details Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded flex items-center justify-center">
                                    <DoorIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase">ROOM {selectedRoom.roomNumber}</h2>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{selectedRoom.hostel?.name} Block</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-slate-900"><XIcon className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded text-center border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Type</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedRoom.roomType}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded text-center border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Capacity</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedRoom.totalBeds} Units</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded text-center border border-slate-100 dark:border-slate-800">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</p>
                                    <p className={`text-xs font-bold ${selectedRoom.occupiedBeds >= selectedRoom.totalBeds ? 'text-red-600' : 'text-blue-600'}`}>
                                        {selectedRoom.occupiedBeds >= selectedRoom.totalBeds ? 'FULL' : 'VACANCY'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <UsersIcon className="w-3 h-3" />
                                    Authorized Occupants ({selectedRoom.occupiedBeds}/{selectedRoom.totalBeds})
                                </h3>

                                <div className="space-y-2">
                                    {selectedRoom.beds && selectedRoom.beds.map((bed, index) => (
                                        <div key={bed._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black ${
                                                    bed.status === 'occupied' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                    {bed.bedNumber}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                                                        {bed.status === 'occupied' ? (bed.student?.name || 'Assigned Student') : 'Vacant Bed'}
                                                    </p>
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                                                        {bed.status === 'occupied' ? `ID: ${bed.student?._id?.substring(0,8)}` : 'Available for Provisioning'}
                                                    </p>
                                                </div>
                                            </div>
                                            {bed.status === 'available' && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedBed({ roomId: selectedRoom._id, bedId: bed._id });
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-sm hover:bg-blue-700 transition-all"
                                                >
                                                    Provision
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedRoom.beds || selectedRoom.beds.length === 0) && (
                                        <p className="text-center py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No bed infrastructure initialization found</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
                            <button onClick={() => setSelectedRoom(null)} className="px-4 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">Dismiss</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Student Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase">Unit Provisioning</h2>
                        </div>
                        <div className="p-6">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Candidate Selection</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded px-4 py-2 text-sm font-bold focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">-- AUTHORIZE CANDIDATE --</option>
                                {unassignedStudents.map(student => (
                                    <option key={student._id} value={student._id}>{student.name} ({student.email.split('@')[0]})</option>
                                ))}
                            </select>
                            {unassignedStudents.length === 0 && (
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-tight mt-3 italic">No eligible candidates awaiting allocation.</p>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950/50">
                            <button onClick={() => setShowAssignModal(false)} className="px-4 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cancel</button>
                            <button 
                                onClick={handleAssignStudent} 
                                disabled={!selectedStudentId}
                                className={`px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest text-white transition-all ${
                                    !selectedStudentId ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                                }`}
                            >
                                Finalize Provisioning
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
