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
    validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
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
    sendForgotPasswordOtp: (identifier) =>
        api.post('/auth/forgot-password/send-otp', { identifier }),
    resetPasswordWithOtp: (payload) =>
        api.post('/auth/forgot-password/reset', payload),
};

/**
 * Staff Management API
 */
export const staffAPI = {
    getStaff: () => api.get('/auth/staff'),
    updateStaff: (id, data) => api.put(`/auth/users/${id}`, data),
    deleteStaff: (id) => api.delete(`/auth/users/${id}`),
};

/**
 * Student Management API
 */
export const studentAPI = {
    getAll: () => api.get('/students'),
    getProfile: () => api.get('/students/profile/me'),
    update: (id, data) => api.put(`/students/${id}`, data),
    deactivate: (id) => api.delete(`/students/${id}`),
    deletePermanent: (id) => api.delete(`/students/${id}/permanent`)
};

/**
 * Hostel & Infrastructure API
 */
export const hostelAPI = {
    getHostels: () => api.get('/hostels/hostels'),
    createHostel: (data) => api.post('/hostels/hostels', data),
    updateHostel: (id, data) => api.put(`/hostels/${id}`, data),
    deleteHostel: (id) => api.delete(`/hostels/${id}`),
    getRooms: (hostelId) => api.get(`/hostels/rooms${hostelId ? `?hostelId=${hostelId}` : ''}`),
    createRoom: (data) => api.post('/hostels/rooms', data),
    updateRoom: (id, data) => api.put(`/hostels/rooms/${id}`, data),
    deleteRoom: (id) => api.delete(`/hostels/rooms/${id}`),
    getStats: () => api.get('/hostels/stats'),
    allocateBed: (data) => api.put('/hostels/allocate', data),
    deallocateBed: (data) => api.put('/hostels/deallocate', data)
};

/**
 * Complaint Management API
 */
export const complaintAPI = {
    getAll: (params) => api.get('/complaints', { params }),
    create: (data) => api.post('/complaints', data),
    updateStatus: (id, statusData) => api.put(`/complaints/${id}/status`, statusData)
};

/**
 * Announcements API
 */
export const noticeAPI = {
    getAll: (params) => api.get('/announcements', { params }),
    create: (data) => api.post('/announcements', data),
    update: (id, data) => api.put(`/announcements/${id}`, data),
    delete: (id) => api.delete(`/announcements/${id}`)
};

/**
 * Mess & Culinary API
 */
export const messAPI = {
    getMenu: () => api.get('/mess/menu'),
    updateMenu: (day, data) => api.put(`/mess/menu/${day}`, data),
    submitFeedback: (data) => api.post('/mess/feedback', data),
    getFeedbacks: (params) => api.get('/mess/feedback', { params })
};

/**
 * Leave Management API
 */
export const leaveAPI = {
    apply: (data) => api.post('/leave', data),
    getAll: () => api.get('/leave'),
    update: (id, status) => api.put(`/leave/${id}`, { status })
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
    getHostelBlockStats: () => api.get('/reports/hostel-block-stats'),
    getStudentDistribution: () => api.get('/reports/student-distribution'),
    getAttendance: () => api.get('/reports/attendance'),
    getLeave: () => api.get('/reports/leave'),
    getMaintenance: () => api.get('/reports/maintenance'),
    getOccupancy: () => api.get('/reports/occupancy'),
    getMessFeedback: () => api.get('/reports/mess-feedback'),
    exportPDF: (month) => api.get('/reports/export', {
        params: { month, format: 'pdf' },
        responseType: 'blob'
    }),

    exportExcel: (month) => api.get('/reports/export', {
        params: { month, format: 'excel' },
        responseType: 'blob'
    })

};

/**
 * Payment & Billing API
 */
export const paymentAPI = {
    create: (data) => api.post('/payments', data)
};

/**
 * Attendance Management API
 */
export const attendanceAPI = {
    getByJurisdiction: (date) => api.get(`/attendance/by-jurisdiction?date=${date}`),
    markBulk: (data) => api.post('/attendance/bulk', data),
    getMyAttendance: () => api.get('/attendance/me')
};

export default api;
