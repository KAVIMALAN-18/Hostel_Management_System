import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenService, userService } from '../services/api';
import { useNavigate } from 'react-router-dom';

/**
 * Authentication Context
 * Manages user authentication state across the application
 */
const AuthContext = createContext(null);

/**
 * Custom hook to use authentication context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/**
 * Authentication Provider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = tokenService.getToken();
            const savedUser = userService.getUser();

            if (token && savedUser) {
                try {
                    // Part 4: Verify token and get fresh user data on app load
                    const response = await authAPI.getProfile();
                    if (response.success) {
                        const freshUser = response.data;
                        setUser(freshUser);
                        userService.setUser(freshUser);
                        setIsAuthenticated(true);
                    } else {
                        // If profile fetch fails, token might be invalid
                        throw new Error('Session invalid');
                    }
                } catch (error) {
                    console.error('Session verification failed:', error.message);
                    tokenService.removeToken();
                    userService.removeUser();
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }

            setLoading(false);
        };

        initAuth();

        // Part 5: Listener for auto-logout (triggered by 401 in api service)
        const handleAutoLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
        };

        window.addEventListener('auth:logout', handleAutoLogout);
        return () => window.removeEventListener('auth:logout', handleAutoLogout);
    }, [navigate]);

    /**
     * Login user
     * @param {object} credentials - Email and password
     * @returns {Promise<object>} Login response
     */
    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);

            if (response.success) {
                const { user, token } = response;

                // Store token and user data
                tokenService.setToken(token);
                userService.setUser(user);

                // Update state
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            }

            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    /**
     * Register new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Registration response
     */
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);

            if (response.success) {
                const { user, token } = response;

                // Store token and user data
                tokenService.setToken(token);
                userService.setUser(user);

                // Update state
                setUser(user);
                setIsAuthenticated(true);

                return { success: true, user };
            }

            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            // Call logout API (optional, since JWT is stateless)
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local storage and state regardless of API call result
            tokenService.removeToken();
            userService.removeUser();
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
        }
    };

    /**
     * Get role-based dashboard route
     * @param {string} role - User role
     * @returns {string} Dashboard route
     */
    const getDashboardRoute = (role) => {
        switch (role) {
            case 'admin':
                return '/admin/dashboard';
            case 'warden':
                return '/warden/dashboard';
            case 'student':
                return '/student/dashboard';
            default:
                return '/login';
        }
    };

    /**
     * Navigate to role-based dashboard
     */
    const navigateToDashboard = () => {
        if (user && user.role) {
            const route = getDashboardRoute(user.role);
            navigate(route);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        navigateToDashboard,
        getDashboardRoute,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
