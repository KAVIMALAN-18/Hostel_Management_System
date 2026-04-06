import { createContext, useContext } from 'react';

/**
 * Authentication Context
 * Manages user authentication state across the application
 */
export const AuthContext = createContext(null);

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
