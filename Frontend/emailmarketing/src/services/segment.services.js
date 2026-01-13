import axios from 'axios';

const API_URL = 'http://localhost:8000/api/segments';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create axios instance with auth header
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Create a new segment
export const createSegment = async (segmentData) => {
    try {
        const response = await axiosInstance.post('/', segmentData);
        return response.data;
    } catch (error) {
        console.error('Error creating segment:', error);
        throw error.response?.data || error;
    }
};

// Get all segments
export const getSegments = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching segments:', error);
        throw error.response?.data || error;
    }
};

// Get a single segment by ID
export const getSegmentById = async (id) => {
    try {
        const response = await axiosInstance.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching segment:', error);
        throw error.response?.data || error;
    }
};

// Get contacts for a segment
export const getSegmentContacts = async (id) => {
    try {
        const response = await axiosInstance.get(`/${id}/contacts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching segment contacts:', error);
        throw error.response?.data || error;
    }
};

// Update a segment
export const updateSegment = async (id, segmentData) => {
    try {
        const response = await axiosInstance.put(`/${id}`, segmentData);
        return response.data;
    } catch (error) {
        console.error('Error updating segment:', error);
        throw error.response?.data || error;
    }
};

// Delete a segment
export const deleteSegment = async (id) => {
    try {
        const response = await axiosInstance.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting segment:', error);
        throw error.response?.data || error;
    }
};

// Duplicate a segment
export const duplicateSegment = async (id) => {
    try {
        const response = await axiosInstance.post(`/${id}/duplicate`);
        return response.data;
    } catch (error) {
        console.error('Error duplicating segment:', error);
        throw error.response?.data || error;
    }
};

// Add contacts to a segment
export const addContactsToSegment = async (segmentId, contactIds) => {
    try {
        const response = await axiosInstance.post(`/${segmentId}/contacts`, { contactIds });
        return response.data;
    } catch (error) {
        console.error('Error adding contacts to segment:', error);
        throw error.response?.data || error;
    }
};
