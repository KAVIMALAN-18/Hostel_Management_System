import { useState } from 'react';
import { BuildingIcon, DoorIcon, UsersIcon, CheckIcon, XIcon } from '../../components/common/Icons';

const RoomManagement = () => {
    const [selectedHostel, setSelectedHostel] = useState('Block A (Boys)');
    const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    // Mock data for hostels and floors
    const hostels = ['Block A (Boys)', 'Block B (Girls)', 'Block C (Staff)'];
    const floors = ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

    // Mock room data (migrated to local state for assignment demonstration)
    const [rooms, setRooms] = useState([
        {
            id: 'A-G-101',
            number: '101',
            type: 'Single',
            capacity: 1,
            occupied: 1,
            occupants: [
                { name: 'Rajesh Kumar', id: 'ST-7821', bed: 'B1' }
            ]
        },
        {
            id: 'A-G-102',
            number: '102',
            type: '2-Cart',
            capacity: 2,
            occupied: 2,
            occupants: [
                { name: 'Amit Sharma', id: 'ST-7822', bed: 'B1' },
                { name: 'Vijay Singh', id: 'ST-7823', bed: 'B2' }
            ]
        },
        {
            id: 'A-G-103',
            number: '103',
            type: '2-Cart',
            capacity: 2,
            occupied: 1,
            occupants: [
                { name: 'Priya Patel', id: 'ST-7824', bed: 'B1' }
            ]
        },
        {
            id: 'A-G-104',
            number: '104',
            type: '4-Cart',
            capacity: 4,
            occupied: 3,
            occupants: [
                { name: 'Karthik Reddy', id: 'ST-7825', bed: 'B1' },
                { name: 'Suresh Babu', id: 'ST-7826', bed: 'B2' },
                { name: 'Arun Kumar', id: 'ST-7827', bed: 'B3' }
            ]
        },
        {
            id: 'A-G-105',
            number: '105',
            type: '4-Cart',
            capacity: 4,
            occupied: 4,
            occupants: [
                { name: 'Deepak Rao', id: 'ST-7828', bed: 'B1' },
                { name: 'Manoj Verma', id: 'ST-7829', bed: 'B2' },
                { name: 'Ravi Shankar', id: 'ST-7830', bed: 'B3' },
                { name: 'Sanjay Gupta', id: 'ST-7831', bed: 'B4' }
            ]
        },
        {
            id: 'A-G-106',
            number: '106',
            type: '2-Cart',
            capacity: 2,
            occupied: 0,
            occupants: []
        },
        {
            id: 'A-G-107',
            number: '107',
            type: '4-Cart',
            capacity: 4,
            occupied: 2,
            occupants: [
                { name: 'Naveen Kumar', id: 'ST-7832', bed: 'B1' },
                { name: 'Prakash Jain', id: 'ST-7833', bed: 'B2' }
            ]
        },
        {
            id: 'A-G-108',
            number: '108',
            type: 'Single',
            capacity: 1,
            occupied: 0,
            occupants: []
        },
    ]);

    // Mock unassigned students for the assignment flow
    const [unassignedStudents, setUnassignedStudents] = useState([
        { id: 'ST-9901', name: 'Kabir Singh', course: 'B.Tech CS' },
        { id: 'ST-9902', name: 'Pooja Hegde', course: 'B.Com' },
        { id: 'ST-9903', name: 'Varun Dhawan', course: 'B.Sc Physics' },
    ]);

    const handleAssignStudent = () => {
        if (!selectedStudentId || !selectedBed) return;

        const student = unassignedStudents.find(s => s.id === selectedStudentId);
        if (!student) return;

        // Perform local state update to simulate backend assignment
        setRooms(prevRooms => prevRooms.map(room => {
            if (room.id === selectedBed.roomId) {
                return {
                    ...room,
                    occupied: room.occupied + 1,
                    occupants: [
                        ...room.occupants,
                        { name: student.name, id: student.id, bed: `B${room.occupied + 1}` }
                    ]
                };
            }
            return room;
        }));

        // Remove assigned student from unassigned list
        setUnassignedStudents(prev => prev.filter(s => s.id !== selectedStudentId));

        // Update the currently viewed room details modal
        setSelectedRoom(prev => {
            if (!prev) return null;
            return {
                ...prev,
                occupied: prev.occupied + 1,
                occupants: [
                    ...prev.occupants,
                    { name: student.name, id: student.id, bed: `B${prev.occupied + 1}` }
                ]
            };
        });

        // Close assignment modal and reset selection
        setShowAssignModal(false);
        setSelectedStudentId('');
        setSelectedBed(null);
        alert('Student successfully assigned to room!');
    };

    const getOccupancyColor = (room) => {
        if (room.occupied === 0) return 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700';
        if (room.occupied === room.capacity) return 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800';
        return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-800';
    };

    const getOccupancyStatus = (room) => {
        if (room.occupied === 0) return 'Vacant';
        if (room.occupied === room.capacity) return 'Full';
        return 'Partially Occupied';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Room Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage hostel rooms, occupancy, and student assignments</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary text-xs py-2">Add New Room</button>
                    <button className="btn-primary text-xs py-2">Batch Allocate</button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hostel Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Select Hostel</label>
                        <select
                            value={selectedHostel}
                            onChange={(e) => setSelectedHostel(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        >
                            {hostels.map((hostel) => (
                                <option key={hostel} value={hostel}>{hostel}</option>
                            ))}
                        </select>
                    </div>

                    {/* Floor Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Select Floor</label>
                        <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        >
                            {floors.map((floor) => (
                                <option key={floor} value={floor}>{floor}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Rooms</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{rooms.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Occupied</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{rooms.filter(r => r.occupied > 0).length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Vacant</p>
                        <p className="text-2xl font-bold text-slate-400 dark:text-slate-500">{rooms.filter(r => r.occupied === 0).length}</p>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`${getOccupancyColor(room)} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md dark:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <DoorIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                <span className="text-lg font-bold text-slate-900 dark:text-white">Room {room.number}</span>
                            </div>
                            {room.occupied === room.capacity ? (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">Full</span>
                            ) : room.occupied === 0 ? (
                                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded">Vacant</span>
                            ) : (
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded">Available</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Type:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{room.type}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Occupancy:</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{room.occupied}/{room.capacity}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden mt-2">
                                <div
                                    className={`h-full ${room.occupied === room.capacity ? 'bg-red-500' : room.occupied === 0 ? 'bg-slate-400 dark:bg-slate-600' : 'bg-emerald-500'}`}
                                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Room Details Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-[0_0_30px_rgba(59,130,246,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/5" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900 rounded-lg flex items-center justify-center">
                                    <DoorIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Room {selectedRoom.number}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedHostel} - {selectedFloor}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <XIcon className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Room Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Room Type</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedRoom.type}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Capacity</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedRoom.capacity} Beds</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 text-center">
                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                    <p className={`text-lg font-bold ${selectedRoom.occupied === selectedRoom.capacity ? 'text-red-600' :
                                            selectedRoom.occupied === 0 ? 'text-slate-400' : 'text-emerald-600'
                                        }`}>
                                        {getOccupancyStatus(selectedRoom)}
                                    </p>
                                </div>
                            </div>

                            {/* Vacancy Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">Available Beds</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            {selectedRoom.capacity - selectedRoom.occupied} out of {selectedRoom.capacity} beds vacant
                                        </p>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {selectedRoom.capacity - selectedRoom.occupied}
                                    </div>
                                </div>
                            </div>

                            {/* Occupants List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4" />
                                    Room Members ({selectedRoom.occupied}/{selectedRoom.capacity})
                                </h3>

                                {selectedRoom.occupants.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedRoom.occupants.map((occupant, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-brand-300 dark:hover:border-brand-500 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">
                                                        {occupant.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{occupant.name}</p>
                                                        <p className="text-xs text-slate-500">ID: {occupant.id}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                                                        Bed {occupant.bed}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty beds */}
                                        {Array.from({ length: selectedRoom.capacity - selectedRoom.occupied }).map((_, index) => (
                                            <div key={`empty-${index}`} className="flex items-center justify-between p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                                        <UsersIcon className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-400">Vacant Bed</p>
                                                        <p className="text-xs text-slate-400">Available for assignment</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-right">
                                                    <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs font-semibold rounded">
                                                        Bed B{selectedRoom.occupied + index + 1}
                                                    </span>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedBed({ roomId: selectedRoom.id, bedIndex: selectedRoom.occupied + index + 1 });
                                                            setShowAssignModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-bold rounded shadow-sm transition-colors border border-brand-200"
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                        <DoorIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-500">No occupants in this room</p>
                                        <p className="text-xs text-slate-400 mt-1">All {selectedRoom.capacity} beds are vacant</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                            >
                                Close Room Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Student Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-[0_0_20px_rgba(59,130,246,0.1)] max-w-md w-full border border-white/5" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Student to Room</h2>
                            <button onClick={() => setShowAssignModal(false)} className="hover:bg-slate-100 dark:hover:bg-slate-700 p-1 rounded transition-colors text-slate-500 dark:text-slate-400">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Unassigned Student</label>
                            <select 
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:ring-brand-500 focus:border-brand-500"
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">-- Choose a student --</option>
                                {unassignedStudents.map(student => (
                                    <option key={student.id} value={student.id}>{student.name} ({student.id})</option>
                                ))}
                            </select>
                            {unassignedStudents.length === 0 && (
                                <p className="text-xs text-amber-600 mt-2">No unassigned students currently available.</p>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-lg">
                            <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                            <button 
                                onClick={handleAssignStudent} 
                                disabled={!selectedStudentId}
                                className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${!selectedStudentId ? 'bg-brand-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
