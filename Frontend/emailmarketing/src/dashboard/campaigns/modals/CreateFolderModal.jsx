import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { campaignAPI } from '../../../services/campaign.services';
import './CreateFolderModal.css';

const CreateFolderModal = ({ isOpen, onClose, onRefresh, folderToEdit = null }) => {
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (folderToEdit) {
            setFolderName(folderToEdit.name);
        } else {
            setFolderName('');
        }
    }, [folderToEdit, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return;

        try {
            setLoading(true);
            setError('');
            if (folderToEdit) {
                await campaignAPI.updateFolder(folderToEdit._id, { name: folderName });
            } else {
                await campaignAPI.createFolder({ name: folderName });
            }
            onRefresh();
            onClose();
            setFolderName('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process folder');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="create-folder-modal">
                <header className="modal-header">
                    <h2>{folderToEdit ? 'Rename folder' : 'Create folder'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Folder name</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value.slice(0, 50))}
                                placeholder=""
                                autoFocus
                            />
                            <span className="char-count">{folderName.length}/50</span>
                        </div>
                        <p className="helper-text">Keep your folder name short, so you can find it easily.</p>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={!folderName.trim() || loading || (folderToEdit && folderName === folderToEdit.name)}
                        >
                            {loading ? (folderToEdit ? 'Renaming...' : 'Creating...') : (folderToEdit ? 'Save' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
