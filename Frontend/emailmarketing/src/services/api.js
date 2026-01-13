import axios from 'axios';

// Base URL for API requests
const API_URL = '/api';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Request interceptor - Add token to requests
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

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper function to get auth headers (for cases where fetch must be used)
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Authentication API methods
export const authAPI = {
    // Signup
    signup: async (name, email, password) => {
        const response = await api.post('/auth/signup', { name, email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Logout
    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Forgot Password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    }
};

// Profile API methods
export const profileAPI = {
    // Get user profile
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData) => {
        const response = await api.put('/profile', profileData);
        // Update user in localStorage if successful
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        const response = await api.post('/profile/change-password', {
            currentPassword,
            newPassword,
            confirmPassword
        });
        return response.data;
    }
};

export default api;
