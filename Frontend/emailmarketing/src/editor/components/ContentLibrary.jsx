import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Search, Grid, List as ListIcon, ChevronLeft, ChevronRight, Wand2, Trash2 } from 'lucide-react';
import { uploadAPI } from '../../services/upload.services';
import '../styles/content-library.css';

const ContentLibrary = ({ isOpen, onClose, onSelectImage }) => {
    const [activeTab, setActiveTab] = useState('My files');
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const data = await uploadAPI.getMedia();
            if (data.success) {
                setMedia(data.media);
            }
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('[FRONTEND] Starting upload for:', file.name, file.type, file.size);

        const formData = new FormData();
        formData.append('file', file); // Changed from 'image' to 'file'

        try {
            setUploading(true);
            console.log('[FRONTEND] Sending POST to uploadAPI.uploadMedia');

            const data = await uploadAPI.uploadMedia(formData);

            console.log('[FRONTEND] Response received:', data);

            if (data.success) {
                setMedia([data.media, ...media]);
                alert('File uploaded successfully!');
            } else {
                alert('Upload failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('[FRONTEND] Upload Error:', error);
            console.error('[FRONTEND] Error response:', error.response?.data);
            console.error('[FRONTEND] Error status:', error.response?.status);
            alert('Upload failed: ' + (error.response?.data?.message || error.message || 'Network error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            const data = await uploadAPI.deleteMedia(id);
            if (data.success) {
                setMedia(media.filter(m => m._id !== id));
            }
        } catch (error) {
            console.error('Delete Error:', error);
        }
    };

    if (!isOpen) return null;

    const filteredMedia = media.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="content-library-overlay" onClick={onClose}>
            <div className="content-library-modal" onClick={e => e.stopPropagation()}>
                <div className="library-header">
                    <h2>Content library</h2>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="library-tabs">
                    {['My files', 'Stock images', 'GIF Images'].map(tab => (
                        <button
                            key={tab}
                            className={`library-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="library-actions">
                    <div className="actions-left">
                        <label className="upload-btn">
                            <Upload size={18} />
                            <span>Upload</span>
                            <input type="file" hidden onChange={handleUpload} disabled={uploading} accept="image/*,video/*" />
                        </label>
                        <button className="create-btn">
                            <Plus size={18} />
                            <span>Create image</span>
                        </button>
                        <button className="folders-btn">
                            <span>Folders</span>
                        </button>
                    </div>

                    <div className="actions-right">
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search files"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="sort-by">
                            <span>Sort by</span>
                        </div>
                        <div className="view-toggle">
                            <button className="active"><Grid size={18} /></button>
                            <button><ListIcon size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className="library-content">
                    {activeTab === 'My files' ? (
                        loading ? (
                            <div className="loading-state">Loading your files...</div>
                        ) : filteredMedia.length > 0 ? (
                            <div className="media-grid">
                                {filteredMedia.map(item => (
                                    <div
                                        key={item._id}
                                        className="media-item"
                                        onClick={() => onSelectImage(item.url)}
                                    >
                                        <div className="media-preview">
                                            {item.type === 'video' ? (
                                                <div className="video-thumb-placeholder">
                                                    <div className="play-icon">▶</div>
                                                    <span>VIDEO</span>
                                                </div>
                                            ) : (
                                                <img src={item.url} alt={item.name} />
                                            )}

                                            <button
                                                className="delete-media-btn"
                                                onClick={(e) => handleDelete(e, item._id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <span className="media-name" title={item.name}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No files found. Upload your first image!</p>
                            </div>
                        )
                    ) : (
                        <div className="empty-state">
                            <p>{activeTab} are coming soon!</p>
                        </div>
                    )}
                </div>

                <div className="library-footer">
                    <div className="items-per-page">
                        <span>40</span>
                        <span>Items per page</span>
                    </div>
                    <div className="pagination">
                        <span>1-1 of 1</span>
                        <div className="page-select">
                            <span>1</span>
                        </div>
                        <span>of 1 pages</span>
                        <button disabled><ChevronLeft size={18} /></button>
                        <button disabled><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentLibrary;
