import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    Edit2,
    Eye,
    Copy,
    FolderPlus,
    Folder,
    Plus,
    ArrowLeft,
    Share2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CornerUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from './hooks/useCampaigns';
import CreateFolderModal from './modals/CreateFolderModal';
import './CampaignList.css';

const CampaignList = ({ onCreateCampaign, onBack }) => {
    const navigate = useNavigate();
    const [activeFolder, setActiveFolder] = useState(null);

    const {
        campaigns,
        folders,
        loading,
        pagination,
        filters,
        updateFilters,
        deleteCampaign,
        duplicateCampaign,
        deleteFolder,
        renameFolder,
        refresh
    } = useCampaigns(activeFolder?._id);

    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showPageMenu, setShowPageMenu] = useState(false);
    const [activeMoreMenuId, setActiveMoreMenuId] = useState(null);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [activeFolderMoreId, setActiveFolderMoreId] = useState(null);
    const [folderToEdit, setFolderToEdit] = useState(null);
    const [isFoldersOpen, setIsFoldersOpen] = useState(true);

    React.useEffect(() => {
        const handleClickOutside = () => {
            setActiveMoreMenuId(null);
            setShowStatusMenu(false);
            setShowPageMenu(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const statuses = [
        { label: 'All statuses', value: 'All statuses', color: 'all' },
        { label: 'Draft', value: 'Draft', color: 'draft' },
        { label: 'Sent', value: 'Sent', color: 'sent' },
        { label: 'Scheduled', value: 'Scheduled', color: 'scheduled' },
        { label: 'Running', value: 'Running', color: 'running' },
        { label: 'Suspended', value: 'Suspended', color: 'suspended' },
        { label: 'Archived', value: 'Archived', color: 'archived' },
        { label: 'Rejected', value: 'Rejected', color: 'rejected' }
    ];

    const handleSearchChange = (e) => {
        updateFilters({ search: e.target.value });
    };

    const handleStatusChange = (status) => {
        updateFilters({ status });
        setShowStatusMenu(false);
    };

    const handlePageChange = (page) => {
        updateFilters({ page });
        setShowPageMenu(false);
    };

    const toggleSelectAll = () => {
        if (selectedCampaigns.length === campaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(campaigns.map(c => c._id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedCampaigns.includes(id)) {
            setSelectedCampaigns(selectedCampaigns.filter(i => i !== id));
        } else {
            setSelectedCampaigns([...selectedCampaigns, id]);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="campaigns-list-container">
            <header className="campaigns-header">
                {activeFolder ? (
                    <div className="folder-detail-header">
                        <div className="breadcrumb">
                            <span className="breadcrumb-item" onClick={() => setActiveFolder(null)}>Campaigns</span>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-item active">{activeFolder.name}</span>
                        </div>
                        <div className="folder-title-row">
                            <div className="folder-title-left">
                                <ArrowLeft className="back-arrow" onClick={() => setActiveFolder(null)} />
                                <h1>{activeFolder.name}</h1>
                                <MoreVertical size={20} className="folder-more-icon" />
                            </div>
                            <div className="header-actions-right">
                                <button className="create-folder-btn" onClick={() => setIsCreateFolderOpen(true)}>Create folder</button>
                                <button className="create-campaign-btn" onClick={() => onCreateCampaign(activeFolder._id)}>Create campaign</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => onBack ? onBack() : navigate('/dashboard')}
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
                            <h1>Campaigns</h1>
                        </div>
                        <div className="header-actions-right">
                            <button className="create-folder-btn" onClick={() => setIsCreateFolderOpen(true)}>Create folder</button>
                            <button className="create-campaign-btn" onClick={() => onCreateCampaign(null)}>Create campaign</button>
                        </div>
                    </>
                )}
            </header>

            <div className="campaign-tabs">
                <div className="tab-item active">Email</div>
            </div>

            {!activeFolder && (
                <div className="folders-section">
                    <div className="folders-header" onClick={() => setIsFoldersOpen(!isFoldersOpen)}>
                        <div className="folders-title">
                            <Folder size={20} />
                            <span>Folders</span>
                        </div>
                        {isFoldersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>

                    {isFoldersOpen && (
                        <div className="folders-grid">
                            <div className="folder-card create-card" onClick={() => setIsCreateFolderOpen(true)}>
                                <Plus size={20} color="#6366f1" />
                                <span>Create folder</span>
                            </div>
                            {folders.map(folder => (
                                <div key={folder._id} className="folder-card" onClick={() => setActiveFolder(folder)}>
                                    <div className="folder-info">
                                        <Folder size={20} color="#374151" />
                                        <span>{folder.name}</span>
                                    </div>
                                    <div className="folder-more-container" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical
                                            size={16}
                                            color="#9ca3af"
                                            className="folder-more"
                                            onClick={() => setActiveFolderMoreId(activeFolderMoreId === folder._id ? null : folder._id)}
                                        />
                                        {activeFolderMoreId === folder._id && (
                                            <div className="folder-more-menu">
                                                <div className="folder-menu-item" onClick={() => { setFolderToEdit(folder); setIsCreateFolderOpen(true); setActiveFolderMoreId(null); }}>
                                                    <Edit2 size={16} />
                                                    <span>Rename</span>
                                                </div>
                                                <div className="folder-menu-item" onClick={() => { console.log('Move to folder', folder._id); setActiveFolderMoreId(null); }}>
                                                    <CornerUpRight size={16} />
                                                    <span>Move to a folder</span>
                                                </div>
                                                <div className="folder-menu-item delete" onClick={() => {
                                                    if (window.confirm(`Are you sure you want to delete "${folder.name}"?`)) {
                                                        deleteFolder(folder._id);
                                                    }
                                                    setActiveFolderMoreId(null);
                                                }}>
                                                    <Trash2 size={16} />
                                                    <span>Delete</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="list-toolbar">
                <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={campaigns.length > 0 && selectedCampaigns.length === campaigns.length}
                />

                <div className="search-wrapper">
                    <Search size={18} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Search for a campaign"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="status-dropdown" onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}>
                    <span>{filters.status}</span>
                    <ChevronDown size={18} />
                    {showStatusMenu && (
                        <div className="status-menu">
                            {statuses.map(s => (
                                <div
                                    key={s.value}
                                    className={`status-option ${filters.status === s.value ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(s.value); }}
                                >
                                    <div className={`dot ${s.color}`}></div>
                                    <span>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pagination-controls">
                    <span>
                        {pagination.total > 0 ? (
                            `${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
                        ) : '0-0 of 0'}
                    </span>

                    <div className="page-select-wrapper" onClick={(e) => { e.stopPropagation(); setShowPageMenu(!showPageMenu); }}>
                        <div className="page-select">
                            <span>{pagination.page}</span>
                            <ChevronDown size={14} />
                        </div>
                        {showPageMenu && (
                            <div className="page-menu">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                    <div
                                        key={p}
                                        className="page-option"
                                        onClick={(e) => { e.stopPropagation(); handlePageChange(p); }}
                                    >
                                        {p}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <span>of {pagination.pages} pages</span>

                    <div className="nav-arrows">
                        <ChevronLeft
                            className={`nav-arrow ${pagination.page > 1 ? 'active' : ''}`}
                            onClick={() => pagination.page > 1 && updateFilters({ page: pagination.page - 1 })}
                        />
                        <ChevronRight
                            className={`nav-arrow ${pagination.page < pagination.pages ? 'active' : ''}`}
                            onClick={() => pagination.page < pagination.pages && updateFilters({ page: pagination.page + 1 })}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <Loader2 className="animate-spin" size={32} color="#6366f1" />
                </div>
            ) : (campaigns.length === 0 && activeFolder) ? (
                <div className="empty-folder-state">
                    <div className="empty-folder-illustration">
                        <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-folder-6453183-5374463.png" alt="Empty folder" />
                    </div>
                    <h2>There are no campaigns in this folder</h2>
                    <p>Create a new campaign to get started.</p>
                    <button className="create-campaign-btn" onClick={() => onCreateCampaign(activeFolder._id)}>
                        Create campaign
                    </button>
                </div>
            ) : campaigns.length === 0 ? (
                <div className="empty-state">
                    <p>No campaigns found.</p>
                </div>
            ) : (
                <div className="campaign-items-list">
                    {campaigns.map((campaign, index) => (
                        <div key={campaign._id} className="campaign-card">
                            <input
                                type="checkbox"
                                className="card-checkbox"
                                checked={selectedCampaigns.includes(campaign._id)}
                                onChange={() => toggleSelect(campaign._id)}
                            />

                            <div className="campaign-info">
                                <h3
                                    className="campaign-title"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/campaign/${campaign._id}`)}
                                >
                                    {campaign.name}
                                </h3>
                                <div className="campaign-meta">
                                    <div className="status-indicator">
                                        <div className={`status-dot ${campaign.status.toLowerCase()}`}></div>
                                        <span>{campaign.status}</span>
                                    </div>
                                    <span>Last edited {formatDate(campaign.createdAt)}</span>
                                    <span>#{campaigns.length - index}</span>
                                </div>
                            </div>

                            <div className="campaign-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Recipients</span>
                                    <span className="stat-value">{campaign.status === 'Draft' ? '-' : (campaign.stats?.total || 0)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Opens</span>
                                    <span className="stat-value">{campaign.status === 'Draft' ? '-' : (campaign.stats?.opens || 0)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Clicks</span>
                                    <span className="stat-value">{campaign.status === 'Draft' ? '-' : (campaign.stats?.clicks || 0)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Unsubscribed</span>
                                    <span className="stat-value">{campaign.status === 'Draft' ? '-' : (campaign.stats?.unsubscribed || 0)}</span>
                                </div>
                            </div>

                            <div className="campaign-actions">
                                <Edit2
                                    size={18}
                                    className="action-btn"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/campaign/${campaign._id}`); }}
                                />
                                <div className="more-menu-container" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical
                                        size={18}
                                        className="action-btn more"
                                        onClick={() => setActiveMoreMenuId(activeMoreMenuId === campaign._id ? null : campaign._id)}
                                    />
                                    {activeMoreMenuId === campaign._id && (
                                        <div className="more-menu">
                                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); navigate(`/campaign/${campaign._id}`); setActiveMoreMenuId(null); }}>
                                                <Edit2 size={16} />
                                                <span>Edit</span>
                                            </div>
                                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); console.log('Preview & test', campaign._id); setActiveMoreMenuId(null); }}>
                                                <Eye size={16} />
                                                <span>Preview & test</span>
                                            </div>
                                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); duplicateCampaign(campaign._id); setActiveMoreMenuId(null); }}>
                                                <Copy size={16} />
                                                <span>Duplicate</span>
                                            </div>
                                            <div className="more-menu-divider"></div>
                                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); console.log('Add to folder', campaign._id); setActiveMoreMenuId(null); }}>
                                                <FolderPlus size={16} />
                                                <span>Add to folder</span>
                                            </div>
                                            <div className="more-menu-item" onClick={(e) => { e.stopPropagation(); console.log('Share template', campaign._id); setActiveMoreMenuId(null); }}>
                                                <Share2 size={16} />
                                                <span>Share template</span>
                                            </div>
                                            <div className="more-menu-divider"></div>
                                            <div className="more-menu-item delete" onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure you want to delete this campaign?')) {
                                                    deleteCampaign(campaign._id);
                                                }
                                                setActiveMoreMenuId(null);
                                            }}>
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateFolderModal
                isOpen={isCreateFolderOpen || !!folderToEdit}
                onClose={() => {
                    setIsCreateFolderOpen(false);
                    setFolderToEdit(null);
                }}
                onRefresh={refresh}
                folderToEdit={folderToEdit}
            />
        </div>
    );
};

export default CampaignList;
