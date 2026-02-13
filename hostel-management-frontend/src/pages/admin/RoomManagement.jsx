import { useState } from 'react';
import { BuildingIcon, DoorIcon, UsersIcon, CheckIcon, XIcon } from '../../components/common/Icons';

const RoomManagement = () => {
    const [selectedHostel, setSelectedHostel] = useState('Block A (Boys)');
    const [selectedFloor, setSelectedFloor] = useState('Ground Floor');
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Mock data for hostels and floors
    const hostels = ['Block A (Boys)', 'Block B (Girls)', 'Block C (Staff)'];
    const floors = ['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];

    // Mock room data
    const rooms = [
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
    ];

    const getOccupancyColor = (room) => {
        if (room.occupied === 0) return 'bg-slate-100 border-slate-300';
        if (room.occupied === room.capacity) return 'bg-red-50 border-red-300';
        return 'bg-emerald-50 border-emerald-300';
    };

    const getOccupancyStatus = (room) => {
        if (room.occupied === 0) return 'Vacant';
        if (room.occupied === room.capacity) return 'Full';
        return 'Partially Occupied';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage hostel rooms, occupancy, and student assignments</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hostel Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Select Hostel</label>
                        <select
                            value={selectedHostel}
                            onChange={(e) => setSelectedHostel(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                            {hostels.map((hostel) => (
                                <option key={hostel} value={hostel}>{hostel}</option>
                            ))}
                        </select>
                    </div>

                    {/* Floor Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Select Floor</label>
                        <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        >
                            {floors.map((floor) => (
                                <option key={floor} value={floor}>{floor}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                        <p className="text-xs text-slate-500">Total Rooms</p>
                        <p className="text-2xl font-bold text-slate-900">{rooms.length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500">Occupied</p>
                        <p className="text-2xl font-bold text-emerald-600">{rooms.filter(r => r.occupied > 0).length}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500">Vacant</p>
                        <p className="text-2xl font-bold text-slate-400">{rooms.filter(r => r.occupied === 0).length}</p>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`${getOccupancyColor(room)} border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <DoorIcon className="w-5 h-5 text-slate-600" />
                                <span className="text-lg font-bold text-slate-900">Room {room.number}</span>
                            </div>
                            {room.occupied === room.capacity ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Full</span>
                            ) : room.occupied === 0 ? (
                                <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-semibold rounded">Vacant</span>
                            ) : (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Available</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Type:</span>
                                <span className="font-semibold text-slate-900">{room.type}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Occupancy:</span>
                                <span className="font-semibold text-slate-900">{room.occupied}/{room.capacity}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                                <div
                                    className={`h-full ${room.occupied === room.capacity ? 'bg-red-500' : room.occupied === 0 ? 'bg-slate-400' : 'bg-emerald-500'}`}
                                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Room Details Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                                    <DoorIcon className="w-6 h-6 text-brand-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Room {selectedRoom.number}</h2>
                                    <p className="text-sm text-slate-500">{selectedHostel} - {selectedFloor}</p>
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
                                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-300 transition-colors">
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
                                                <div className="text-right">
                                                    <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs font-semibold rounded">
                                                        Bed B{selectedRoom.occupied + index + 1}
                                                    </span>
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
                                Close
                            </button>
                            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium">
                                Assign Student
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
