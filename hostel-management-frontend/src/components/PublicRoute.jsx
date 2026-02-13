import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute Component
 * Prevents authenticated users from accessing public pages (Login, Register)
 * Redirects them to their respective dashboards
 */
const PublicRoute = () => {
    const { isAuthenticated, user, loading, getDashboardRoute } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 font-medium">Loading session...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
