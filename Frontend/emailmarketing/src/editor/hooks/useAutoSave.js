import { useEffect, useRef, useCallback, useState } from 'react';
import api from '../../services/api';

/**
 * Custom hook for auto-saving campaign design
 * @param {string} campaignId - Campaign ID
 * @param {*} data - Data to save (blocks, design)
 * @param {number} delay - Debounce delay in milliseconds (default: 2000)
 * @returns {object} - { lastSaved, isSaving, saveNow }
 */
export const useAutoSave = (campaignId, data, delay = 2000, status = 'draft') => {
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const timeoutRef = useRef(null);
    const previousDataRef = useRef(data);

    const saveData = useCallback(async () => {
        if (!campaignId || !data) return;
        if (status && status.toLowerCase() !== 'draft') return; // Prevent save if not draft

        try {
            setIsSaving(true);
            const response = await api.post(
                `/campaigns/${campaignId}/auto-save`,
                data
            );

            setLastSaved(new Date(response.data.lastSaved));
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [campaignId, data]);

    // Auto-save with debounce
    useEffect(() => {
        // Check if data has changed
        if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
            return;
        }

        previousDataRef.current = data;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            saveData();
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data, delay, saveData]);

    // Manual save function
    const saveNow = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        saveData();
    }, [saveData]);

    return {
        lastSaved,
        isSaving,
        saveNow
    };
};

// Helper function to format last saved time
export const formatLastSaved = (lastSaved) => {
    if (!lastSaved) return 'Never';

    const now = new Date();
    const diff = now - lastSaved;

    // Less than 1 minute
    if (diff < 60000) {
        return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Format as time
    return lastSaved.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
