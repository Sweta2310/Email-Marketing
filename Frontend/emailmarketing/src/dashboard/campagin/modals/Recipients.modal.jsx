import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, List, Zap, User, Folder, ChevronDown, ChevronRight, ChevronUp, PlusCircle, Check, Loader2 } from 'lucide-react';
import { marketingAPI } from '../../../services/marketing.services';
import './recipients.model.css';

const RecipientsModal = ({ isOpen, onClose, onSave, initialData, campaignId }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Lists');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    // Data states
    const [contacts, setContacts] = useState([]);
    const [lists, setLists] = useState([]);
    const [segments, setSegments] = useState([]);

    // Selection states
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionType, setSelectionType] = useState('Lists'); // 'Lists' | 'Segments' | 'Individual contacts'

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (initialData) {
                if (initialData.type === 'list') {
                    setSelectedIds([initialData.referenceId]);
                    setSelectionType('Lists');
                    setActiveTab('Lists');
                } else if (initialData.type === 'segment') {
                    setSelectedIds([initialData.referenceId]);
                    setSelectionType('Segments');
                    setActiveTab('Segments');
                } else if (initialData.type === 'individual') {
                    setSelectedIds(initialData.contacts || []);
                    setSelectionType('Individual contacts');
                    setActiveTab('Individual contacts');
                }
            }
        }
    }, [isOpen, initialData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [contactsData, listsData, segmentsData] = await Promise.all([
                marketingAPI.getContacts(),
                marketingAPI.getLists(),
                marketingAPI.getSegments()
            ]);
            setContacts(contactsData);
            setLists(listsData);
            setSegments(Array.isArray(segmentsData) ? segmentsData : (segmentsData.data || []));
        } catch (error) {
            console.error('Error fetching recipient data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(selectedIds, selectionType);
        onClose();
    };

    const toggleSelection = (id, type) => {
        if (type !== selectionType) {
            // If switching types, clear previous selection or handle accordingly
            // For this implementation, we'll allow only one type at a time as per "selecting... via Lists, Segments, OR Individual"
            setSelectedIds([id]);
            setSelectionType(type);
            return;
        }

        if (type === 'Individual contacts') {
            if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
            } else {
                if (selectedIds.length < 10) {
                    setSelectedIds([...selectedIds, id]);
                }
            }
        } else {
            // For lists/segments, usually you select one or multiple? 
            // The prompt says "selecting... via Lists, Segments, or Individual contacts".
            // We'll allow multiple for lists/segments too, but separately.
            if (selectedIds.includes(id)) {
                setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
            } else {
                setSelectedIds([...selectedIds, id]);
            }
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.firstName && c.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.lastName && c.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="animate-spin text-teal-600" size={24} />
                </div>
            );
        }

        switch (activeTab) {
            case 'Lists':
                return lists.length > 0 ? (
                    <div className="list-container">
                        {lists.map(list => (
                            <div
                                key={list._id}
                                className={`folder-item ${selectedIds.includes(list._id) && selectionType === 'Lists' ? 'selected' : ''}`}
                                onClick={() => toggleSelection(list._id, 'Lists')}
                            >
                                <div className="folder-info">
                                    <List size={18} className="folder-icon" />
                                    <span>{list.name}</span>
                                </div>
                                {selectedIds.includes(list._id) && selectionType === 'Lists' && <Check size={18} className="text-teal-600" />}
                            </div>
                        ))}
                        <div
                            className="folder-item create-new-list-item"
                            onClick={() => navigate('/dashboard?tab=contacts&view=list')}
                        >
                            <div className="folder-info">
                                <PlusCircle size={18} className="folder-icon create-icon" />
                                <span className="create-new-text">Create a new list</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state-container">
                        <p className="empty-state-title">No lists found</p>
                        <p className="empty-state-description">Create a list to better manage your contacts.</p>
                        <button className="btn-empty-action" onClick={() => navigate('/dashboard?tab=contacts&view=list')}>
                            <PlusCircle size={18} />
                            <span>Create List</span>
                        </button>
                    </div>
                );



            case 'Segments':
                return segments.length > 0 ? (
                    <div className="list-container">
                        {segments.map(segment => (
                            <div
                                key={segment._id}
                                className={`folder-item ${selectedIds.includes(segment._id) && selectionType === 'Segments' ? 'selected' : ''}`}
                                onClick={() => toggleSelection(segment._id, 'Segments')}
                            >
                                <div className="folder-info">
                                    <Zap size={18} className="folder-icon" />
                                    <span>{segment.name}</span>
                                </div>
                                {selectedIds.includes(segment._id) && selectionType === 'Segments' && <Check size={18} className="text-teal-600" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-container">
                        <p className="empty-state-title">No segments found</p>
                        <p className="empty-state-description">Add a new segment to filter your audience.</p>
                        <button className="btn-empty-action" onClick={() => navigate('/dashboard?tab=contacts&view=segments')}>
                            <PlusCircle size={18} />
                            <span>Add segment</span>
                        </button>
                    </div>
                );

            case 'Individual contacts':
                return filteredContacts.length > 0 ? (
                    <div className="list-container">
                        {filteredContacts.map(contact => (
                            <div
                                key={contact._id}
                                className={`contact-item ${selectedIds.includes(contact._id) && selectionType === 'Individual contacts' ? 'selected' : ''}`}
                                onClick={() => toggleSelection(contact._id, 'Individual contacts')}
                            >
                                <div className="contact-checkbox">
                                    {selectedIds.includes(contact._id) && selectionType === 'Individual contacts' && <Check size={14} color="white" />}
                                </div>
                                <div className="contact-info">
                                    <span className="contact-name">
                                        {contact.firstName || contact.lastName
                                            ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                                            : contact.email.split('@')[0]}
                                    </span>
                                    <span className="contact-email">{contact.email}</span>
                                </div>
                            </div>
                        ))}
                        {selectionType === 'Individual contacts' && selectedIds.length >= 10 && (
                            <p className="selection-limit-warning">Maximum 10 contacts selected</p>
                        )}
                    </div>
                ) : (
                    <div className="empty-state-container">
                        <p className="empty-state-title">No contacts found</p>
                        <p className="empty-state-description">Search for contacts or add them manually.</p>
                        <button className="btn-empty-action" onClick={() => navigate('/dashboard?tab=contacts&view=list')}>
                            <PlusCircle size={18} />
                            <span>Add contact</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="receipts-modal-overlay" onClick={(e) => e.target.className === 'receipts-modal-overlay' && onClose()}>
            <div className="receipts-modal-content">
                <button onClick={onClose} className="close-button">
                    <X size={24} />
                </button>

                <div className="receipts-modal-header">
                    <div className="receipts-header-icon">
                        <div className="receipts-header-dot"></div>
                    </div>
                    <div className="receipts-header-text">
                        <h2>Recipients</h2>
                        <p>The people who receive your campaign</p>
                    </div>
                </div>

                <div className="receipts-modal-body">
                    <div>
                        <label className="input-label">Send to</label>
                        <span>
                            {selectedIds.length > 0
                                ? `${selectedIds.length} ${selectionType} selected`
                                : 'Select list(s), segment(s) or individual contacts'
                            }
                        </span>
                    </div>

                    <div className="search-container">
                        <div style={{ padding: '16px' }}>
                            <div className="search-box-outline">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', background: 'transparent' }}
                                />
                            </div>
                        </div>

                        <div className="receipts-tabs">
                            <div
                                className={`tab-item ${activeTab === 'Lists' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Lists')}
                            >
                                <List size={18} />
                                <span>Lists</span>
                            </div>

                            <div
                                className={`tab-item ${activeTab === 'Segments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Segments')}
                            >
                                <Zap size={18} />
                                <span>Segments</span>
                            </div>

                            <div
                                className={`tab-item ${activeTab === 'Individual contacts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('Individual contacts')}
                            >
                                <User size={18} />
                                <span>Individual contacts</span>
                            </div>
                        </div>

                        <div className="tab-content-area" style={{ minHeight: '200px' }}>
                            {renderTabContent()}
                        </div>
                    </div>
                </div>

                <div className="receipts-modal-footer">
                    <button onClick={onClose} className="cancel-link">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="save-button-pill"
                        disabled={selectedIds.length === 0}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipientsModal;
