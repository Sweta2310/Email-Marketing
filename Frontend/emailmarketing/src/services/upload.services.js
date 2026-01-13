import api from './api';

export const uploadAPI = {
    getMedia: async () => {
        const response = await api.get('/upload');
        return response.data;
    },
    uploadMedia: async (formData) => {
        const response = await api.post('/upload/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteMedia: async (id) => {
        const response = await api.delete(`/upload/${id}`);
        return response.data;
    }
};
