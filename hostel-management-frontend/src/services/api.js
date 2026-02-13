import axios from 'axios';

/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Axiose Instance Creation
 * Centralized configuration for all API calls
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to every outgoing request
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * Handles common response patterns and unauthorized errors
 */
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || 'Network error occurred';

        // Handle 401 Unauthorized (e.g., token expired)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Notify AuthContext to update UI state
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }

        return Promise.reject(new Error(message));
    }
);

/**
 * Authentication API
 */
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'), // JWT is stateless, but this hits the endpoint if needed
};

/**
 * Student Management API
 */
export const studentAPI = {
    getAll: () => api.get('/students'),
    getProfile: (id) => api.get(`/students/${id}`),
    update: (id, data) => api.patch(`/students/${id}`, data),
    deactivate: (id) => api.delete(`/students/${id}`)
};

/**
 * Hostel & Infrastructure API
 */
export const hostelAPI = {
    getHostels: () => api.get('/hostels/hostels'),
    createHostel: (data) => api.post('/hostels/hostels', data),
    updateHostel: (id, data) => api.patch(`/hostels/hostels/${id}`, data),
    deleteHostel: (id) => api.delete(`/hostels/hostels/${id}`),
    getRooms: (hostelId) => api.get(`/hostels/rooms${hostelId ? `?hostelId=${hostelId}` : ''}`),
    createRoom: (data) => api.post('/hostels/rooms', data),
    updateRoom: (id, data) => api.patch(`/hostels/rooms/${id}`, data),
    deleteRoom: (id) => api.delete(`/hostels/rooms/${id}`),
    getStats: () => api.get('/hostels/stats'),
    allocateBed: (data) => api.patch('/hostels/allocate', data)
};

/**
 * Complaint Management API
 */
export const complaintAPI = {
    getAll: (params) => api.get('/complaints', { params }),
    create: (data) => api.post('/complaints', data),
    updateStatus: (id, statusData) => api.patch(`/complaints/${id}/status`, statusData)
};

/**
 * Announcements API
 */
export const noticeAPI = {
    getAll: (params) => api.get('/announcements', { params }),
    create: (data) => api.post('/announcements', data),
    update: (id, data) => api.patch(`/announcements/${id}`, data),
    delete: (id) => api.delete(`/announcements/${id}`)
};

/**
 * Leave Management API
 */
export const leaveAPI = {
    apply: (data) => api.post('/leave', data),
    getAll: () => api.get('/leave'),
    update: (id, status) => api.patch(`/leave/${id}`, { status })
};

/**
 * Token Management Service
 */
export const tokenService = {
    setToken: (token) => localStorage.setItem('token', token),
    getToken: () => localStorage.getItem('token'),
    removeToken: () => localStorage.removeItem('token'),
    isAuthenticated: () => !!localStorage.getItem('token'),
};

/**
 * User Local Data Service
 */
export const userService = {
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    removeUser: () => localStorage.removeItem('user'),
    getUserRole: () => {
        const user = userService.getUser();
        return user ? user.role : null;
    },
};

/**
 * Reports API
 */
export const reportsAPI = {
    getStats: () => api.get('/reports/stats'),
    getAttendance: () => api.get('/reports/attendance'),
    getLeave: () => api.get('/reports/leave'),
    getMaintenance: () => api.get('/reports/maintenance'),
    getOccupancy: () => api.get('/reports/occupancy'),
    getMessFeedback: () => api.get('/reports/mess-feedback'),
    exportPDF: (month) => axios.get(`${API_BASE_URL}/reports/export`, {
        params: { month, type: 'pdf' },
        responseType: 'blob',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }),
    exportExcel: (month) => axios.get(`${API_BASE_URL}/reports/export`, {
        params: { month, type: 'excel' },
        responseType: 'blob',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
};

export default api;
