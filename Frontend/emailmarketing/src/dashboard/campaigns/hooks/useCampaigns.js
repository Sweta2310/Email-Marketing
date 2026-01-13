import { useState, useEffect, useCallback } from 'react';
import { campaignAPI } from '../../../services/campaign.services';

export const useCampaigns = (folderId = null) => {
    const [campaigns, setCampaigns] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
    const [filters, setFilters] = useState({ search: '', status: 'All statuses', page: 1 });

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [campaignData, folderData] = await Promise.all([
                campaignAPI.getCampaignsList({ ...filters, folderId }),
                campaignAPI.getFolders()
            ]);
            setCampaigns(campaignData.campaigns || []);
            setPagination(campaignData.pagination || { total: 0, page: 1, limit: 10, pages: 1 });
            setFolders(folderData || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch campaigns data:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [filters, folderId]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
    };

    const deleteCampaign = async (campaignId) => {
        try {
            await campaignAPI.deleteCampaignFromList(campaignId);
            await fetchAllData();
            return true;
        } catch (err) {
            console.error('Failed to delete campaign:', err);
            setError(err.message || 'Failed to delete campaign');
            return false;
        }
    };

    const duplicateCampaign = async (campaignId) => {
        try {
            await campaignAPI.duplicateCampaignFromList(campaignId);
            await fetchAllData();
            return true;
        } catch (err) {
            console.error('Failed to duplicate campaign:', err);
            setError(err.message || 'Failed to duplicate campaign');
            return false;
        }
    };

    const deleteFolder = async (folderId) => {
        try {
            await campaignAPI.deleteFolder(folderId);
            await fetchAllData();
            return true;
        } catch (err) {
            console.error('Failed to delete folder:', err);
            setError(err.message || 'Failed to delete folder');
            return false;
        }
    };

    const renameFolder = async (folderId, newName) => {
        try {
            await campaignAPI.updateFolder(folderId, { name: newName });
            await fetchAllData();
            return true;
        } catch (err) {
            console.error('Failed to rename folder:', err);
            setError(err.message || 'Failed to rename folder');
            return false;
        }
    };

    return {
        campaigns,
        folders,
        loading,
        error,
        pagination,
        filters,
        updateFilters,
        deleteCampaign,
        duplicateCampaign,
        deleteFolder,
        renameFolder,
        refresh: fetchAllData
    };
};
