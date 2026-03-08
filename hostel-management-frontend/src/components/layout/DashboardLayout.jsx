import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HomeIcon,
    BuildingIcon,
    UsersIcon,
    ClipboardIcon,
    CalendarIcon,
    ToolIcon,
    BellIcon,
    UserIcon,
    CakeIcon,
    DoorIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '../common/Icons';

/**
 * DashboardLayout Component
 * Modern, clean admin panel layout with icons
 */
const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Icon mapping for navigation items
    const getNavIcon = (name) => {
        const iconMap = {
            'Dashboard': HomeIcon,
            'Room Management': DoorIcon,
            'Hostels': BuildingIcon,
            'Rooms & Beds': DoorIcon,
            'Students': UsersIcon,
            'Student Directory': UsersIcon,
            'Warden Directory': UsersIcon,
            'Attendance': ClipboardIcon,
            'Leave Requests': CalendarIcon,
            'Leave Approvals': CalendarIcon,
            'Leave Request': CalendarIcon,
            'Maintenance': ToolIcon,
            'Announcements': BellIcon,
            'Mess Management': CakeIcon,
            'Mess Menu': CakeIcon,
            'Profile': UserIcon,
            'My Hostel Details': DoorIcon,
            'Reports': ClipboardIcon,
        };
        return iconMap[name] || HomeIcon;
    };

    // Navigation items based on user role
    const getNavItems = () => {
        const commonItems = [
            { name: 'Dashboard', path: `/${user?.role}/dashboard` },
        ];

        const roleSpecificItems = {
            admin: [
                { name: 'Room Management', path: '/admin/rooms' },
                { name: 'Student Directory', path: '/student-directory' },
                { name: 'Warden Directory', path: '/staff-management' },
                { name: 'Students', path: '/admin/students' },
                { name: 'Attendance', path: '/attendance' },
                { name: 'Leave Requests', path: '/admin/leave-requests' },
                { name: 'Maintenance', path: '/maintenance' },
                { name: 'Mess Management', path: '/admin/mess' },
                { name: 'Announcements', path: '/notices' },
                { name: 'Reports', path: '/reports' },
            ],
            warden: [
                { name: 'Student Directory', path: '/student-directory' },
                { name: 'Attendance', path: '/attendance' },
                { name: 'Leave Requests', path: '/warden/leave-requests' },
                { name: 'Maintenance', path: '/maintenance' },
                { name: 'Announcements', path: '/notices' },
                { name: 'Mess Menu', path: '/mess-menu' }
            ],
            student: [
                { name: 'My Hostel Details', path: '/student/room' },
                { name: 'Mess Menu', path: '/mess-menu' },
                { name: 'Announcements', path: '/notices' },
                { name: 'Maintenance', path: '/maintenance' },
            ]
        };

        const items = [...commonItems, ...(roleSpecificItems[user?.role] || [])];
        items.push({ name: 'Profile', path: '/profile' });
        return items;
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-sm`}>
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-gradient-to-r from-brand-500 to-brand-600">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-brand-600 font-bold text-lg shadow-soft">
                            H
                        </div>
                        {isSidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-sm font-bold leading-none text-white">HOSTEL-MS</span>
                                <span className="text-[10px] text-brand-100 font-medium tracking-tight mt-0.5">Management Hub</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    <div className="px-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isSidebarOpen ? 'Navigation' : '•'}
                    </div>
                    {navItems.map((item) => {
                        const Icon = getNavIcon(item.name);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                                        ? 'bg-brand-500 text-white shadow-soft'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {isSidebarOpen && <span className="truncate">{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* System Status in Sidebar */}
                {isSidebarOpen && (
                    <div className="p-3 mx-3 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">System Status</span>
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium">All systems operational</div>
                    </div>
                )}

                {/* Collapse Button */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center gap-2 h-9 text-slate-600 hover:text-brand-600 border border-slate-200 bg-white rounded-lg shadow-soft hover:shadow-soft-lg hover:border-brand-200 transition-all"
                    >
                        {isSidebarOpen ? (
                            <>
                                <ChevronLeftIcon className="w-4 h-4" />
                                <span className="text-xs font-medium">Collapse</span>
                            </>
                        ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-soft z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span>Hostel Management</span>
                                <span>•</span>
                                <span className="capitalize text-brand-600 font-semibold">{user?.role}</span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 leading-none mt-0.5">
                                Control Dashboard
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Live Timestamp */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-mono text-slate-600 font-medium">{new Date().toLocaleTimeString()}</span>
                        </div>

                        <div className="h-8 w-px bg-slate-200"></div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
                                <span className="text-[10px] text-brand-600 font-bold uppercase tracking-tight mt-0.5">{user?.role}</span>
                            </div>
                            <div className="w-9 h-9 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="h-9 px-4 text-xs font-semibold text-slate-600 hover:text-red-600 border border-slate-200 rounded-lg bg-white hover:bg-red-50 hover:border-red-300 transition-all shadow-soft"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 overflow-auto bg-slate-50">
                    <div className="max-w-7xl mx-auto p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
