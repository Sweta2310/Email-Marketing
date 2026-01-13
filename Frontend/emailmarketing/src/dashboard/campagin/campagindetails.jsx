import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar';
import '../dashboard.css';
import './campagindetails.css'; // New CSS
import { campaignAPI } from '../../services/campaign.services';
import { assignBlockIds } from '../../utils/blockHelpers';
import { ArrowLeft, Check, Edit2, Loader2, MoreHorizontal } from 'lucide-react';
import SenderModal from './modals/sender.model';
import RecipientsModal from './modals/Recipients.modal';
import SubjectModal from './modals/subject.modal';
import SettingsModal from './modals/settings.modal';
import DesignModal from './modals/Design.modal';

const CampaignDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Sanitize ID to remove underscore prefix if present
    const campaignId = id?.startsWith('_') ? id.substring(1) : id;

    const [activeTab, setActiveTab] = useState('Campaigns');
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Editing States
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isRecipientsModalOpen, setIsRecipientsModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

    // Sender State
    const [isSenderModalOpen, setIsSenderModalOpen] = useState(false);
    const [senderInfo, setSenderInfo] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false); // For 3-dot menu
    const menuRef = useRef(null); // Ref for closing menu on outside click

    // Close menu on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchCampaign = async () => {
        try {
            const data = await campaignAPI.getCampaignById(campaignId);
            if (data) {
                setCampaign(data);
                if (data.sender) {
                    setSenderInfo(data.sender);
                }
            }
        } catch (error) {
            console.error('Error fetching campaign:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    const handleUpdate = async (updates) => {
        // if (campaign?.status && campaign.status.toLowerCase() !== 'draft') {
        //     alert('This campaign has been sent and cannot be edited.');
        //     return;
        // }

        try {
            const updatedCampaign = await campaignAPI.updateCampaign(campaignId, updates);
            setCampaign(updatedCampaign);
        } catch (error) {
            console.error('Update failed:', error);
            console.error('Update error details:', error.response?.data);
            alert('Failed to update campaign: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    const saveSubject = async (subjectData) => {
        await handleUpdate({
            content: {
                ...campaign.content,
                subject: subjectData.subject
            }
        });
        setIsSubjectModalOpen(false);
    };

    const saveRecipients = async (selectedIds, selectionType) => {
        try {
            // Check if token exists
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication token missing. Please login again.');
                return;
            }

            let type = 'individual';
            if (selectionType === 'Lists') type = 'list';
            else if (selectionType === 'Segments') type = 'segment';

            const payload = {
                type,
                referenceId: type !== 'individual' ? selectedIds[0] : null,
                contacts: type === 'individual' ? selectedIds : []
            };

            console.log('Saving recipients with payload:', payload);
            console.log('Campaign ID:', campaignId);
            console.log('Campaign status:', campaign?.status);
            console.log('Token exists:', !!token);

            await campaignAPI.saveCampaignRecipients(campaignId, payload);
            fetchCampaign();
            setIsRecipientsModalOpen(false);
        } catch (error) {
            // console.error('Failed to save recipients:', error);
            // console.error('Error response:', error.response?.data);
            console.error('Error:', error.response?.data?.message || error.message);
            alert(`Failed to save recipients: ${error.response?.data?.message || error.message}`);
        }
    };

    const saveSender = async (newSenderInfo) => {
        try {
            setSenderInfo(newSenderInfo);
            await handleUpdate({ sender: newSenderInfo });
            await fetchCampaign(); // Refresh campaign data to ensure sender is persisted
            setIsSenderModalOpen(false);
        } catch (error) {
            console.error('Failed to save sender:', error);
            alert('Failed to save sender information');
        }
    };

    const handleSend = async () => {
        if (!window.confirm('Are you sure you want to schedule/send this campaign?')) return;

        try {
            setSending(true);
            console.log('Sending campaign with ID:', campaignId);
            console.log('Full campaign object:', campaign);
            await campaignAPI.sendCampaign(campaignId);
            alert('Campaign Sent Successfully!');
            fetchCampaign(); // Refresh status
        } catch (error) {
            console.error('Send failed:', error);
            console.error('Error response:', error.response?.data);
            alert(`Failed to send campaign: ${error.response?.data?.error || error.message}`);
        } finally {
            setSending(false);
        }
    };

    const saveSettings = (data) => {
        console.log('Saving settings:', data);
        setIsSettingsModalOpen(false);
    };

    if (loading) return (
        <div className="dashboard-container">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content flex justify-center items-center">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </main>
        </div>
    );

    if (!campaign) return (
        <div className="dashboard-container">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content">
                <div style={{ padding: '2rem' }}>Campaign not found.</div>
            </main>
        </div>
    );

    const isRecipientsComplete = !!campaign.recipientSelection;
    const isSubjectComplete = !!campaign.content?.subject;
    const isDesignComplete = !!(campaign.content?.html || campaign.content?.text || campaign.design?.thumbnail);
    const isSenderComplete = !!(senderInfo?.name && senderInfo?.email);

    // Helper for icons
    const StatusIcon = ({ checked }) => (
        <div className="status-icon-wrapper">
            <div className={`status-icon-circle ${checked ? 'complete' : 'incomplete'}`}>
                {checked ? <Check size={18} strokeWidth={4} /> : <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="main-content">
                <header className="header" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/dashboard', { state: { activeTab: 'Campaigns' } })}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <ArrowLeft size={20} color="#6366f1" />
                        </button>
                        <div>
                            <div className="campaign-header-title">
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{campaign.name}</h1>
                                <Edit2 size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                                <span className="campaign-status-badge">
                                    {campaign.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            Preview & Test
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleSend}
                            disabled={sending}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1a202c', opacity: sending ? 0.7 : 1 }}
                        >
                            {sending ? <Loader2 className="animate-spin" size={16} /> : (campaign.status.toLowerCase() === 'sent' ? 'Resend' : 'Schedule')}
                        </button>
                    </div>
                </header>

                <div className="campaign-details-container">
                    <div className="details-card">

                        {/* Sender Section */}
                        <div className="details-section">
                            <StatusIcon checked={isSenderComplete} />
                            <div className="section-content">
                                <div className="section-header">
                                    <h3 className="section-title">Sender</h3>
                                    <button onClick={() => setIsSenderModalOpen(true)} className="btn-pill">
                                        Manage sender
                                    </button>
                                </div>
                                <div className="section-meta">
                                    {senderInfo ? (
                                        <><strong>{senderInfo.name}</strong> • {senderInfo.email}</>
                                    ) : (
                                        <span style={{ color: '#9ca3af' }}>No sender configured</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recipients Section */}
                        <div className="details-section">
                            <StatusIcon checked={isRecipientsComplete} />
                            <div className="section-content">
                                <div className="section-header">
                                    <h3 className="section-title">Recipients</h3>
                                    <button
                                        onClick={() => setIsRecipientsModalOpen(true)}
                                        className="btn-pill"
                                    >
                                        {isRecipientsComplete ? 'Edit recipients' : 'Add recipients'}
                                    </button>
                                </div>
                                <p className="section-description">
                                    {isRecipientsComplete ?
                                        (campaign.recipientSelection.type === 'individual' ?
                                            `${campaign.recipientSelection.contacts?.length || 0} individual contacts` :
                                            `Selected via ${campaign.recipientSelection.type}`)
                                        : 'The people who receive your campaign'}
                                </p>
                            </div>
                        </div>

                        {/* Subject Section */}
                        <div className="details-section">
                            <StatusIcon checked={isSubjectComplete} />
                            <div className="section-content">
                                <div className="section-header">
                                    <h3 className="section-title">Subject</h3>
                                    <button
                                        onClick={() => setIsSubjectModalOpen(true)}
                                        className="btn-pill"
                                    >
                                        {isSubjectComplete ? 'Edit subject' : 'Add subject'}
                                    </button>
                                </div>
                                <p className="section-description">
                                    {isSubjectComplete ? campaign.content.subject : 'Add a subject line for this campaign.'}
                                </p>
                            </div>
                        </div>

                        {/* Design Section */}
                        <div className="details-section">
                            <StatusIcon checked={isDesignComplete} />
                            <div className="section-content">
                                <div className="section-header">
                                    <h3 className="section-title">Design</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }} ref={menuRef}>
                                        {isDesignComplete && (
                                            <>
                                                <button
                                                    className="icon-btn-ghost"
                                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                >
                                                    <MoreHorizontal size={20} color="#64748b" />
                                                </button>

                                                {isMenuOpen && (
                                                    <div className="menu-dropdown">
                                                        <button
                                                            className="menu-item danger"
                                                            onClick={() => {
                                                                if (window.confirm('Are you sure you want to reset the design? This cannot be undone.')) {
                                                                    handleUpdate({
                                                                        content: { ...campaign.content, html: '', text: '' },
                                                                        blocks: [],
                                                                        design: { blocks: [], thumbnail: '' },
                                                                        status: 'Draft' // Reset to draft so it can be sent again
                                                                    });
                                                                    setIsMenuOpen(false);
                                                                }
                                                            }}
                                                        >
                                                            Reset design
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (isDesignComplete) {
                                                    navigate(`/editor/${campaignId}`);
                                                } else {
                                                    setIsDesignModalOpen(true);
                                                }
                                            }}
                                            className="btn-pill"
                                        >
                                            {isDesignComplete ? 'Edit design' : 'Start designing'}
                                        </button>
                                    </div>
                                </div>
                                {isDesignComplete ? (
                                    <div className="design-preview-container" style={{ display: 'flex', justifyContent: 'center' }}>
                                        {campaign.design?.thumbnail ? (
                                            <div className="preview-image-wrapper">
                                                <img
                                                    src={campaign.design.thumbnail}
                                                    alt="Email Design Preview"
                                                    className="design-thumbnail"
                                                />
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded border border-green-100">
                                                Content Ready
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="section-description">Create your email content.</p>
                                )}
                            </div>
                        </div>

                        {/* Additional Settings Section */}
                        <div className="details-section">
                            <div className="status-icon-wrapper">
                                <div className="w-[28px]"></div> {/* Spacer instead of icon to match "Additional settings" in image */}
                            </div>
                            <div className="section-content">
                                <div className="section-header">
                                    <h3 className="section-title">Additional settings</h3>
                                    <button onClick={() => setIsSettingsModalOpen(true)} className="btn-pill">
                                        Edit settings
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <SenderModal
                isOpen={isSenderModalOpen}
                onClose={() => setIsSenderModalOpen(false)}
                onSave={saveSender}
                initialData={senderInfo}
            />

            <RecipientsModal
                isOpen={isRecipientsModalOpen}
                onClose={() => setIsRecipientsModalOpen(false)}
                onSave={saveRecipients}
                campaignId={campaignId}
                initialData={campaign?.recipientSelection}
            />

            <SubjectModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSave={saveSubject}
                initialData={{ subject: campaign?.content?.subject }}
            />

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={saveSettings}
            />

            <DesignModal
                isOpen={isDesignModalOpen}
                onClose={() => setIsDesignModalOpen(false)}
                onSave={async (selection) => {
                    // console.log('Selection from DesignModal:', selection);
                    setIsDesignModalOpen(false);

                    if (selection.type === 'template') {
                        try {
                            setLoading(true);

                            // Get blocks from template (could be in design.blocks or blocks)
                            const templateBlocks = selection.design?.blocks || selection.blocks || [];

                            // Assign unique IDs to all blocks (including nested column blocks)
                            const blocksWithIds = assignBlockIds(templateBlocks);

                            // console.log('Template blocks with IDs:', blocksWithIds);

                            const updateData = {
                                content: {
                                    subject: selection.subject || campaign.content?.subject || '',
                                    text: selection.text || '',
                                    html: selection.html || ''
                                },
                                blocks: blocksWithIds,
                                template: selection._id
                            };

                            console.log('[APPLY TEMPLATE] Campaign ID:', campaignId);
                            console.log('[APPLY TEMPLATE] Payload:', JSON.stringify(updateData, null, 2));

                            // Apply template to existing campaign
                            await campaignAPI.updateCampaign(campaignId, updateData);

                            // After applying, always go to EmailEditor for templates
                            navigate(`/editor/${campaignId}`);
                        } catch (err) {
                            console.error('[APPLY TEMPLATE] Failed:', err);
                            console.error('[APPLY TEMPLATE] Response Status:', err.response?.status);
                            console.error('[APPLY TEMPLATE] Response Data:', JSON.stringify(err.response?.data, null, 2));

                            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
                            alert(`Failed to apply template: ${errorMessage}`);
                        } finally {
                            setLoading(false);
                            fetchCampaign();
                        }
                    } else if (selection.type === 'drag-drop') {
                        navigate(`/editor/${campaignId}`);
                    } else if (selection.type === 'simple') {
                        navigate(`/simple-editor/${id}`);
                    } else if (selection.type === 'html') {
                        navigate(`/html-editor/${id}`);
                    }
                }}
            />
        </div>
    );
};

export default CampaignDetails;

