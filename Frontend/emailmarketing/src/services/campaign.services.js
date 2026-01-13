import api from './api';

export const campaignAPI = {
    // Templates
    createTemplate: async (data) => {
        const response = await api.post('/templates', data);
        return response.data;
    },
    getTemplates: async () => {
        const response = await api.get('/templates');
        return response.data;
    },
    deleteTemplate: async (id) => {
        const response = await api.delete(`/templates/${id}`);
        return response.data;                    
    },

    // Campaigns
    createCampaign: async (data) => {
        // data: { name, templateId }
        const response = await api.post('/campaigns', data);
        return response.data;
    },
    getCampaigns: async () => {
        const response = await api.get('/campaigns');
        return response.data;
    },
    getCampaignById: async (id) => {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    },
    updateCampaign: async (id, data) => {
        const response = await api.put(`/campaigns/${id}`, data);
        return response.data;
    },
    sendCampaign: async (id) => {
        const response = await api.post(`/campaigns/${id}/send`);
        return response.data;
    },
    saveCampaignRecipients: async (id, data) => {
        // data: { type, referenceId, onModel, contacts }
        const response = await api.post(`/campaigns/${id}/recipients`, data);
        return response.data;
    },
    getCampaignsList: async (params) => {
        const response = await api.get('/campaigns-list', { params });
        return response.data;
    },
    deleteCampaignFromList: async (id) => {
        const response = await api.delete(`/campaigns-list/${id}`);
        return response.data;
    },
    duplicateCampaignFromList: async (id) => {
        const response = await api.post(`/campaigns-list/${id}/duplicate`);
        return response.data;
    },
    // Folders
    createFolder: async (data) => {
        const response = await api.post('/campaigns-list/folders', data);
        return response.data;
    },
    getFolders: async () => {
        const response = await api.get('/campaigns-list/folders');
        return response.data;
    },
    updateFolder: async (id, data) => {
        const response = await api.put(`/campaigns-list/folders/${id}`, data);
        return response.data;
    },
    deleteFolder: async (id) => {
        const response = await api.delete(`/campaigns-list/folders/${id}`);
        return response.data;
    }
};
