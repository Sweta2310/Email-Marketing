import api from './api';

export const marketingAPI = {
    getContacts: async () => {
        const response = await api.get('/marketing/contacts');
        return response.data;
    },
    getLists: async () => {
        const response = await api.get('/marketing/lists');
        return response.data;
    },
    getSegments: async () => {
        const response = await api.get('/marketing/segments');
        return response.data;
    },

    searchContacts: async (query) => {
        const response = await api.get(`/marketing/contacts/search?q=${query}`);
        return response.data;
    },
    importContacts: async (contactsData, segmentId = null) => { // Added segmentId
        const response = await api.post('/marketing/contacts/bulk', { contacts: contactsData, segmentId });
        return response.data;
    },

    addContact: async (contactData) => {
        const response = await api.post('/marketing/contacts', contactData);
        return response.data;
    },
    getContactById: async (id) => {
        const response = await api.get(`/marketing/contacts/${id}`);
        return response.data;
    },
    updateContact: async (id, contactData) => {
        const response = await api.put(`/marketing/contacts/${id}`, contactData);
        return response.data;
    },
    deleteContact: async (id) => {
        const response = await api.delete(`/marketing/contacts/${id}`);
        return response.data;
    },
    updateConsent: async (id, marketing_consent) => {
        const response = await api.patch(`/marketing/contacts/${id}/consent`, { marketing_consent });
        return response.data;
    },
    createList: async (listData) => {
        const response = await api.post('/marketing/lists', listData);
        return response.data;
    },
    createSegment: async (segmentData) => {
        const response = await api.post('/marketing/segments', segmentData);
        return response.data;
    },
    updateSegment: async (id, segmentData) => {
        const response = await api.put(`/marketing/segments/${id}`, segmentData);
        return response.data;
    },

    // Sender Management
    getSenders: async () => {
        const response = await api.get('/marketing/senders');
        return response.data;
    },
    getSenderById: async (id) => {
        const response = await api.get(`/marketing/senders/${id}`);
        return response.data;
    },
    createSender: async (senderData) => {
        const response = await api.post('/marketing/senders', senderData);
        return response.data;
    },
    updateSender: async (id, senderData) => {
        const response = await api.put(`/marketing/senders/${id}`, senderData);
        return response.data;
    },
    deleteSender: async (id) => {
        const response = await api.delete(`/marketing/senders/${id}`);
        return response.data;
    },

    // Add contacts to list
    addContactsToList: async (listId, contactIds) => {
        const response = await api.post(`/marketing/lists/${listId}/contacts`, { contactIds });
        return response.data;
    }
};
