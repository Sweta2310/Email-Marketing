import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, GripVertical, ExternalLink, Search, CirclePlus } from 'lucide-react';
import './customizecolumns.modal.css';

const ALL_AVAILABLE_ATTRIBUTES = [
    { id: 'contact', name: 'CONTACT', default: true },
    { id: 'marketing_consent', name: 'SUBSCRIBED', default: true },
    { id: 'is_bounced', name: 'BLOCKLISTED', default: true },
    { id: 'email', name: 'EMAIL', default: true },
    { id: 'whatsapp', name: 'WHATSAPP', default: true },
    { id: 'updatedAt', name: 'LAST CHANGED', default: true },
    { id: 'createdAt', name: 'CREATION DATE', default: true },
    { id: 'phone', name: 'PHONE', default: false },
    { id: 'firstName', name: 'FIRST NAME', default: false },
    { id: 'lastName', name: 'LAST NAME', default: false },
    { id: 'sms', name: 'SMS', default: false },
    { id: 'companies', name: 'COMPANIES', default: false },
    { id: 'linkedin', name: 'LINKEDIN', default: false },
    { id: 'job_title', name: 'JOB TITLE', default: false },
    { id: 'timezone', name: 'CONTACT TIMEZONE', default: false },
    { id: 'ext_id', name: 'EXT ID', default: false },
];

const CustomizeColumnsModal = ({ isOpen, onClose, currentColumns, onSave }) => {
    const [selectedAttributes, setSelectedAttributes] = useState(currentColumns || ALL_AVAILABLE_ATTRIBUTES.filter(a => a.default).map(a => a.id));
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleRemoveAttribute = (id) => {
        if (id === 'contact') return;
        setSelectedAttributes(selectedAttributes.filter(attrId => attrId !== id));
    };

    const handleAddAttribute = (id) => {
        if (!selectedAttributes.includes(id)) {
            setSelectedAttributes([...selectedAttributes, id]);
        }
        setShowDropdown(false);
    };

    const handleSave = () => {
        onSave(selectedAttributes);
        onClose();
    };

    const activeAttributes = ALL_AVAILABLE_ATTRIBUTES.filter(a => selectedAttributes.includes(a.id));

    const filteredDropdownAttributes = ALL_AVAILABLE_ATTRIBUTES.filter(attr =>
        attr.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        // Sort: not added first, then added
        const aAdded = selectedAttributes.includes(a.id);
        const bAdded = selectedAttributes.includes(b.id);
        if (aAdded && !bAdded) return 1;
        if (!aAdded && bAdded) return -1;
        return 0;
    });

    return (
        <div className="customize-columns-modal-overlay" onClick={onClose}>
            <div className="customize-columns-modal" onClick={e => e.stopPropagation()}>
                <header className="customize-modal-header">
                    <h2>Attributes visible as columns</h2>
                    <button className="close-modal-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className="customize-modal-body">
                    <p className="customize-modal-description">
                        Customize the Contact page, and choose the attributes you want to see as columns.
                    </p>

                    <div className="select-attributes-container" ref={dropdownRef}>
                        <button
                            className="btn-select-attributes"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <CirclePlus size={16} />
                            <span>Select attributes</span>
                        </button>

                        {showDropdown && (
                            <div className="attributes-dropdown">
                                <div className="dropdown-search-container">
                                    <div className="search-input-wrapper">
                                        <Search size={16} className="dropdown-search-icon" />
                                        <input
                                            type="text"
                                            className="dropdown-search-input"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="dropdown-list">
                                    {filteredDropdownAttributes.map(attr => {
                                        const isAdded = selectedAttributes.includes(attr.id);
                                        return (
                                            <div
                                                key={attr.id}
                                                className={`dropdown-item ${isAdded ? 'disabled' : ''}`}
                                                onClick={() => !isAdded && handleAddAttribute(attr.id)}
                                            >
                                                <div className="dropdown-item-left">
                                                    {!isAdded && <Plus size={16} className="add-icon" />}
                                                    <span className="dropdown-item-name">{attr.name}</span>
                                                </div>
                                                {isAdded && <span className="already-added-badge">Already added</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="attributes-list">
                        {activeAttributes.map((attr) => (
                            <div key={attr.id} className="attribute-item">
                                <span className="drag-handle">
                                    <GripVertical size={16} />
                                </span>
                                <span className="attribute-name">{attr.name}</span>
                                <button
                                    className="remove-attribute-btn"
                                    onClick={() => handleRemoveAttribute(attr.id)}
                                    disabled={attr.id === 'contact'}
                                    style={{ opacity: attr.id === 'contact' ? 0.3 : 1 }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="customize-modal-footer">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-save" onClick={handleSave}>Save</button>
                </footer>
            </div>
        </div>
    );
};

export default CustomizeColumnsModal;
