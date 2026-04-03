import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
    ChevronRightIcon,
    MenuIcon,
    XIcon,
} from '../common/Icons';

/**
 * DashboardLayout — application shell with responsive sidebar and accessible navigation.
 */
const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [now, setNow] = useState(() => new Date());
    const [isMdUp, setIsMdUp] = useState(
        typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
    );
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const onChange = () => setIsMdUp(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    // --- Data Synchronization Logic ---
    // Emit a 'resync-data' event when the window is focused to ensure real-time consistency
    useEffect(() => {
        const handleFocus = () => {
            if (document.visibilityState === 'visible') {
                window.dispatchEvent(new CustomEvent('resync-data'));
            }
        };
        window.addEventListener('visibilitychange', handleFocus);
        return () => window.removeEventListener('visibilitychange', handleFocus);
    }, []);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isMdUp && mobileNavOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [isMdUp, mobileNavOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const showNavLabels = isMdUp ? isSidebarOpen : true;
    const sidebarWidthClass =
        isMdUp && isSidebarOpen
            ? 'w-[min(18rem,88vw)] md:w-64'
            : isMdUp
                ? 'w-[min(18rem,88vw)] md:w-20'
                : 'w-[min(18rem,88vw)]';

    const getNavIcon = (name) => {
        const iconMap = {
            'Dashboard': HomeIcon,
            'Room Management': DoorIcon,
            'Hostels': BuildingIcon,
            'Rooms & Beds': DoorIcon,
            'Students': UsersIcon,
            'Warden Directory': UsersIcon,
            'Attendance': ClipboardIcon,
            'Leave Requests': CalendarIcon,
            'Leave Approvals': CalendarIcon,
            'Leave Request': CalendarIcon,
            'Maintenance & Queries': ToolIcon,
            'Announcements': BellIcon,
            'Mess Management': CakeIcon,
            'Mess Menu': CakeIcon,
            'Profile': UserIcon,
            'My Hostel Details': DoorIcon,
            'Reports': ClipboardIcon,
        };
        return iconMap[name] || HomeIcon;
    };

    const getNavItems = () => {
        const commonItems = [
            { name: 'Dashboard', path: `/${user?.role}/dashboard` },
        ];

        const roleSpecificItems = {
            admin: [
                { name: 'Room Management', path: '/admin/rooms' },
                { name: 'Warden Directory', path: '/staff-management' },
                { name: 'Students', path: '/admin/students' },
                { name: 'Attendance', path: '/attendance' },
                { name: 'Leave Requests', path: '/admin/leave-requests' },
                { name: 'Maintenance & Queries', path: '/maintenance' },
                { name: 'Mess Management', path: '/admin/mess' },
                { name: 'Announcements', path: '/notices' },
                { name: 'Reports', path: '/reports' },
            ],
            warden: [
                { name: 'Attendance', path: '/attendance' },
                { name: 'Leave Requests', path: '/warden/leave-requests' },
                { name: 'Maintenance & Queries', path: '/maintenance' },
                { name: 'Announcements', path: '/notices' },
                { name: 'Mess Menu', path: '/mess-menu' }
            ],
            student: [
                { name: 'My Hostel Details', path: '/student/room' },
                { name: 'Mess Menu', path: '/mess-menu' },
                { name: 'Announcements', path: '/notices' },
                { name: 'Maintenance & Queries', path: '/maintenance' },
            ]
        };

        const items = [...commonItems, ...(roleSpecificItems[user?.role] || [])];
        items.push({ name: 'Profile', path: '/profile' });
        return items;
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-slate-900 dark:focus:text-slate-100 focus:shadow-soft-lg focus:ring-2 focus:ring-brand-500"
            >
                Skip to main content
            </a>

            {!isMdUp && mobileNavOpen && (
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    className="modal-backdrop fixed inset-0 z-40 bg-slate-900/45 dark:bg-slate-900/80 backdrop-blur-[2px] md:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            <aside
                id="app-sidebar"
                className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm transition-all duration-300 ease-out z-50
                    fixed inset-y-0 left-0 h-full ${sidebarWidthClass}
                    ${!isMdUp ? (mobileNavOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0 md:relative'}
                `}
                aria-label="Main navigation"
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-r from-brand-600 to-brand-700 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg shadow-soft shrink-0">
                            H
                        </div>
                        {showNavLabels && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold leading-none text-white truncate">HOSTEL-MS</span>
                                <span className="text-xs text-brand-100 dark:text-brand-200 font-medium tracking-tight mt-0.5 truncate">Management Hub</span>
                            </div>
                        )}
                    </div>
                    {!isMdUp && (
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(false)}
                            className="btn-icon text-white/90 hover:bg-white/10 hover:text-white rounded-lg"
                            aria-label="Close menu"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <nav id="app-sidebar-nav" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    <div className={`px-3 mb-3 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider ${showNavLabels ? '' : 'text-center'}`}>
                        {showNavLabels ? 'Navigation' : '•'}
                    </div>
                    {navItems.map((item) => {
                        const Icon = getNavIcon(item.name);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.99] ${isActive
                                        ? 'bg-brand-500 text-white shadow-soft'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden />
                                {showNavLabels && <span className="truncate">{item.name}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {showNavLabels && (
                    <div className="p-3 mx-3 mb-3 bg-emerald-50/90 dark:bg-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">System status</span>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                        <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">All systems operational</div>
                    </div>
                )}

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 mt-auto shrink-0 hidden md:block">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center gap-2 h-9 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg shadow-soft hover:shadow-soft-lg hover:border-brand-200 dark:hover:border-brand-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                        aria-expanded={isSidebarOpen}
                        aria-controls="app-sidebar"
                    >
                        {isSidebarOpen ? (
                            <>
                                <ChevronLeftIcon className="w-4 h-4" aria-hidden />
                                <span className="text-xs font-medium">Collapse</span>
                            </>
                        ) : (
                            <ChevronRightIcon className="w-4 h-4" aria-hidden />
                        )}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden md:pl-0">
                <header className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 min-h-16 flex flex-wrap items-center justify-between gap-4 px-4 sm:px-8 py-3 shadow-soft z-10 transition-colors duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            className="md:hidden btn-icon border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-soft text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200"
                            onClick={() => setMobileNavOpen(true)}
                            aria-expanded={mobileNavOpen}
                            aria-controls="app-sidebar"
                            aria-label="Open navigation menu"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300 font-medium flex-wrap">
                                <span>Hostel Management</span>
                                <span className="text-slate-300 dark:text-slate-600" aria-hidden>•</span>
                                <span className="capitalize text-brand-600 dark:text-brand-400 font-semibold">{user?.role}</span>
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight mt-0.5 truncate">
                                Control dashboard
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 ml-auto">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 tabular-nums">
                            <ClockIconInline />
                            <time
                                dateTime={now.toISOString()}
                                className="text-xs font-mono text-slate-600 dark:text-slate-300 font-medium"
                            >
                                {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </time>
                        </div>

                        <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end min-w-0">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none truncate max-w-[10rem] sm:max-w-xs">{user?.name}</span>
                                <span className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-tight mt-0.5">{user?.role}</span>
                            </div>
                            <div
                                className="w-9 h-9 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-800 dark:to-brand-900 text-brand-700 dark:text-brand-300 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-slate-800 shadow-soft shrink-0"
                                aria-hidden
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="h-9 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-colors shadow-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </header>

                <main id="main-content" className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-200" tabIndex={-1}>
                    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 page-content">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

function ClockIconInline() {
    return (
        <span className="text-brand-500" aria-hidden>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </span>
    );
}

export default DashboardLayout;
