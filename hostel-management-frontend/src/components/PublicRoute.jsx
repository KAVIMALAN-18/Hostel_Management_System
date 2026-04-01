import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * PublicRoute Component
 * Prevents authenticated users from accessing public pages (Login, Register)
 * Redirects them to their respective dashboards
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, user, loading, getDashboardRoute } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-100 dark:border-brand-900 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider animate-pulse">Synchronizing Session...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return <Navigate to={getDashboardRoute(user.role)} replace />;
    }

    return children ? children : <Outlet />;
};

export default PublicRoute;
