import { useState, useEffect } from 'react';
import { hostelAPI, studentAPI } from '../../services/api';
import { 
    BuildingIcon, 
    DoorIcon, 
    UsersIcon, 
    CheckIcon, 
    XIcon, 
    PlusIcon, 
    SearchIcon,
    FilterIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    MapPinIcon
} from '../../components/common/Icons';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const RoomManagement = () => {
    const [hostels, setHostels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [unassignedStudents, setUnassignedStudents] = useState([]);
    const [selectedHostelId, setSelectedHostelId] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [roomData, setRoomData] = useState({
        roomNumber: '',
        roomType: 'single',
        floor: 'Ground Floor',
        totalBeds: 4,
        hostel: ''
    });

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

    useEffect(() => {
        if (!selectedHostelId) return;
        setRoomData(prev => ({ ...prev, hostel: selectedHostelId }));
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

    useEffect(() => {
        if (showAssignModal) {
            const fetchStudents = async () => {
                try {
                    const response = await studentAPI.getAll();
                    if (response.success) {
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
        setSubmitting(true);
        try {
            const payload = {
                studentId: selectedStudentId,
                hostelId: selectedHostelId,
                roomId: selectedBed.roomId,
                bedId: selectedBed.bedId
            };

            const response = await hostelAPI.allocateBed(payload);
            if (response.success) {
                const roomRes = await hostelAPI.getRooms(selectedHostelId);
                if (roomRes.success) {
                    setRooms(roomRes.data);
                    const updatedRoom = roomRes.data.find(r => r._id === selectedBed.roomId);
                    if (updatedRoom) setSelectedRoom(updatedRoom);
                }
                
                setShowAssignModal(false);
                setSelectedStudentId('');
                setSelectedBed(null);
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error occurred while assigning bed');
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
                setRoomData({ roomNumber: '', roomType: 'single', floor: 'Ground Floor', totalBeds: 4, hostel: selectedHostelId });
                const roomRes = await hostelAPI.getRooms(selectedHostelId);
                if (roomRes.success) setRooms(roomRes.data);
            }
        } catch (err) {
            alert(err.message || 'Error creating room');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRooms = rooms.filter(r => 
        (r.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.roomType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getOccupancyStats = (room) => {
        const percentage = (room.occupiedBeds / room.totalBeds) * 100;
        if (percentage === 0) return { label: 'Empty', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200', progress: 'bg-slate-200 dark:bg-slate-600' };
        if (percentage >= 100) return { label: 'Full', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', progress: 'bg-red-500' };
        return { label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', progress: 'bg-blue-500' };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Manage hostel rooms and assignments</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="primary" onClick={() => setShowRoomModal(true)} className="flex items-center gap-2">
                        <PlusIcon className="w-4 h-4" /> Add Room
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <BuildingIcon className="w-5 h-5 text-slate-400" />
                    <select
                        value={selectedHostelId}
                        onChange={(e) => setSelectedHostelId(e.target.value)}
                        className="bg-transparent border-none text-sm font-semibold text-slate-900 dark:text-white focus:outline-none w-full cursor-pointer"
                    >
                        {hostels.map((hostel) => (
                            <option key={hostel._id} value={hostel._id} className="dark:bg-slate-800">{hostel.name} Center • {hostel.type}</option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 transition-colors">
                    <SearchIcon className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by room no. or type..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white focus:outline-none w-full placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-6 px-4 py-2 border-l border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">Total</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none mt-1">{rooms.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">Vacant</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 leading-none mt-1">{rooms.filter(r => r.occupiedBeds < r.totalBeds).length}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <DoorIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">No rooms found in this criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredRooms.map((room) => {
                        const style = getOccupancyStats(room);
                        return (
                            <div
                                key={room._id}
                                onClick={() => setSelectedRoom(room)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        <DoorIcon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${style.color}`}>
                                        {style.label}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Room {room.roomNumber}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">{room.floor}</span>
                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-400">•</span>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{room.roomType}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                        <span className="text-slate-500 dark:text-slate-300">Occupancy</span>
                                        <span className={room.occupiedBeds >= room.totalBeds ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}>
                                            {room.occupiedBeds} / {room.totalBeds} BEDS
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${style.progress}`}
                                            style={{ width: `${(room.occupiedBeds / room.totalBeds) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Room Addition Modal */}
            <Modal
                isOpen={showRoomModal}
                onClose={() => setShowRoomModal(false)}
                title="Initialize New Room"
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setShowRoomModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" form="add-room-form" loading={submitting}>Add Room</Button>
                    </>
                )}
            >
                <form id="add-room-form" onSubmit={handleAddRoom} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Room Number" 
                            placeholder="e.g. 101"
                            required 
                            value={roomData.roomNumber} 
                            onChange={(e) => setRoomData({ ...roomData, roomNumber: e.target.value })} 
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floor</label>
                            <select
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                value={roomData.floor}
                                onChange={(e) => setRoomData({ ...roomData, floor: e.target.value })}
                            >
                                <option value="Ground Floor">Ground Floor</option>
                                <option value="1st Floor">1st Floor</option>
                                <option value="2nd Floor">2nd Floor</option>
                                <option value="3rd Floor">3rd Floor</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room Type</label>
                            <select
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                value={roomData.roomType}
                                onChange={(e) => setRoomData({ ...roomData, roomType: e.target.value })}
                            >
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                                <option value="quad">Quad</option>
                                <option value="dormitory">Dormitory</option>
                            </select>
                        </div>
                        <Input 
                            label="Bed Capacity" 
                            type="number" 
                            min="1"
                            max="10"
                            required
                            value={roomData.totalBeds} 
                            onChange={(e) => setRoomData({ ...roomData, totalBeds: e.target.value })} 
                        />
                    </div>
                </form>
            </Modal>

            {/* Room Details Modal */}
            <Modal
                isOpen={!!selectedRoom}
                onClose={() => setSelectedRoom(null)}
                title={`Room ${selectedRoom?.roomNumber} Details`}
            >
                {selectedRoom && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold mb-1">Status</p>
                                <p className={`text-sm font-bold ${selectedRoom.occupiedBeds >= selectedRoom.totalBeds ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {selectedRoom.occupiedBeds >= selectedRoom.totalBeds ? 'FULL' : 'AVAILABLE'}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold mb-1">Capacity</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedRoom.occupiedBeds}/{selectedRoom.totalBeds}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold mb-1">Type/Floor</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedRoom.roomType} / {selectedRoom.floor}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                <UsersIcon className="w-4 h-4 text-slate-500" /> Allocated Beds
                            </h3>
                            <div className="space-y-3">
                                {selectedRoom.beds && selectedRoom.beds.map((bed) => (
                                    <div key={bed._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                                                bed.status === 'occupied' 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' 
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300'
                                            }`}>
                                                <span className="text-xs font-bold">{bed.bedNumber}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {bed.status === 'occupied' ? (bed.student?.name || 'Resident') : 'Available'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                                                    {bed.status === 'occupied' && bed.student ? `ID: ${bed.student.registrationNumber || bed.student._id.substring(0,8)}` : 'Ready for allocation'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {bed.status === 'available' ? (
                                            <Button 
                                                variant="primary"
                                                onClick={() => {
                                                    setSelectedBed({ roomId: selectedRoom._id, bedId: bed._id });
                                                    setShowAssignModal(true);
                                                }}
                                                className="text-xs py-1.5 px-3"
                                            >
                                                Assign
                                            </Button>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 rounded-md">
                                                <CheckCircleIcon className="w-3.5 h-3.5" /> Allocated
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Assignment Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Assign Bed to Student"
                footer={(
                    <>
                        <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAssignStudent} loading={submitting} disabled={!selectedStudentId}>Confirm Assignment</Button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-3 rounded-lg flex items-start gap-3">
                        <AlertCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">You are about to assign an explicit bed unit to a student. Only authorized students without an active room will appear here.</p>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Student Candidate</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                        >
                            <option value="">-- Select Student --</option>
                            {unassignedStudents.map(student => (
                                <option key={student._id} value={student._id}>
                                    {student.name} • {student.registrationNumber || student.email}
                                </option>
                            ))}
                        </select>
                        {unassignedStudents.length === 0 && (
                            <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-1">No pending students available for assignment.</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RoomManagement;
