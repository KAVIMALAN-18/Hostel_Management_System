import { useAuth } from '../context/AuthContext';

/**
 * DashboardPlaceholder Component
 * A clean, temporary landing page for role-based dashboards to verify routing
 */
const DashboardPlaceholder = ({ title }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-600 mb-6">
                    Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>!
                    You are logged in as <span className="capitalize px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium">{user?.role}</span>.
                </p>

                <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm text-left">
                        <p className="font-semibold mb-1">Authorization Success:</p>
                        <p>Role-based routing is working correctly. This is the protected {user?.role} area.</p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-all focus:ring-4 focus:ring-gray-200"
                    >
                        Logout Securely
                    </button>
                </div>
            </div>

            <p className="mt-8 text-sm text-gray-500">
                © 2026 Hostel Management System • Professional Dashboard
            </p>
        </div>
    );
};

export default DashboardPlaceholder;
