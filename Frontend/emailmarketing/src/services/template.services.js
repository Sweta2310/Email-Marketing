import api from './api';

export const templateAPI = {
    getTemplates: async (category) => {
        if (category === 'saved') {
            const response = await api.get('/templates/saved');
            return response.data;
        }
        const url = category && category !== 'All' ? `/templates?category=${category.toLowerCase().replace(/ /g, '-')}` : '/templates';
        const response = await api.get(url);
        return response.data;
    },
    getReadyToUseTemplates: async () => {
        const response = await api.get('/templates/ready-to-use');
        return response.data;
    },
    cloneTemplate: async (id, name) => {
        const response = await api.post(`/templates/${id}/clone`, { name });
        return response.data;
    },
    createTemplate: async (payload) => {
        const response = await api.post('/templates', payload);
        return response.data;
    }
};
