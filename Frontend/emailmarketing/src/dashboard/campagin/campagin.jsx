import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Folder, Crown } from 'lucide-react';
import { campaignAPI } from '../../services/campaign.services';
import '../dashboard.css';

const CampaignModal = ({ isOpen, onClose, folderId }) => {
    const [activeTab, setActiveTab] = useState('regular');
    const [campaignName, setCampaignName] = useState('');

    const navigate = useNavigate();

    // A/B Test state
    const [abTestType, setAbTestType] = useState('subject'); // 'subject' or 'content'

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!campaignName.trim()) return;

        try {
            setLoading(true);
            setError('');
            console.log('Creating campaign:', {
                type: activeTab,
                name: campaignName,
                abTestType: activeTab === 'abtest' ? abTestType : null
            });

            const newCampaign = await campaignAPI.createCampaign({
                name: campaignName,
                folderId
            });

            if (newCampaign && newCampaign._id) {
                onClose();
                navigate(`/campaign/${newCampaign._id}`);
            }
        } catch (err) {
            console.error('Failed to create campaign:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to create campaign. Please try again.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="campaign-modal">
                <div className="modal-header">
                    <h2>Create an email campaign</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="campaign-tabs">
                    <div
                        className={`campaign-tab ${activeTab === 'regular' ? 'active' : ''}`}
                        onClick={() => setActiveTab('regular')}
                    >
                        Regular
                    </div>
                    <div
                        className={`campaign-tab ${activeTab === 'abtest' ? 'active' : ''}`}
                        onClick={() => setActiveTab('abtest')}
                    >
                        Pro  <Crown size={14} className="crown-icon" />
                    </div>
                </div>

                {activeTab === 'regular' ? (
                    <>
                        <p className="modal-description">
                            Keep subscribers engaged by sharing your latest news, promoting your bestselling products, or announcing an upcoming event.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="upgrade-card">
                            <h4>Compare performances and pick the best campaign</h4>
                            <p>Test multiple versions of your campaign and find the most effective content for your audience.</p>
                            <button className="btn-upgrade">
                                <Crown size={14} /> Upgrade
                            </button>
                        </div>

                        <p className="ab-info-text">
                            Choose an element to A/B test. Recipients in your test group will receive either version A or B.
                            The version with the best engagement will be sent to your remaining recipients.
                            <strong>Works best with 5000+ recipients.</strong>
                        </p>

                        <div className="ab-options-grid">
                            <div
                                className={`ab-option-card ${abTestType === 'subject' ? 'selected' : ''}`}
                                onClick={() => setAbTestType('subject')}
                            >
                                <h4>Subject lines</h4>
                                <p>Test two different subject lines to improve your email open rates.</p>
                            </div>
                            <div
                                className={`ab-option-card ${abTestType === 'content' ? 'selected' : ''}`}
                                onClick={() => setAbTestType('content')}
                            >
                                <h4>Email content</h4>
                                <p>Test two different designs to improve your click rates.</p>
                            </div>
                        </div>
                    </>
                )}

                <div className="input-group">
                    <label>Campaign name</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            className="campaign-input"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            maxLength={128}
                            placeholder=""
                        />
                        <span className="char-count">{campaignName.length}/128</span>
                    </div>
                </div>

                <div className="folder-section">
                    <h3>Folder</h3>
                    <button className="add-folder-btn">
                        Add to folder
                    </button>
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    {activeTab === 'regular' ? (
                        <button
                            className={`btn-create ${campaignName.length > 0 && !loading ? 'active' : ''}`}
                            onClick={handleCreate}
                            disabled={campaignName.length === 0 || loading}
                        >
                            {loading ? 'Creating...' : 'Create campaign'}
                        </button>
                    ) : (
                        <button
                            className="btn-create-ab"
                            onClick={handleCreate}
                            disabled={campaignName.length === 0 || loading}
                        >
                            <Crown size={16} /> {loading ? 'Creating...' : 'Create Pro campaign'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignModal;
