import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import StaticSegmentForm from './StaticSegmentForm'; // Import the new component
import {
    Search,
    Plus,
    ChevronDown,
    Info,
    ChevronLeft,
    ChevronRight,
    Zap,
    Minus,
    Play,
    GitBranch,
    Users,
    MoreHorizontal,
    Copy,
    Edit2,
    Trash2,
    List,
    Layers
} from 'lucide-react';
import './segment.css';
import { createSegment as createSegmentAPI, getSegments, deleteSegment, duplicateSegment, updateSegment, addContactsToSegment } from '../../services/segment.services';

// Custom Dropdown Component that always opens downward
const CustomDropdown = ({ value, onChange, options, placeholder, groups }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDisplayValue = () => {
        if (!value) return placeholder;
        if (groups) {
            for (const group of groups) {
                const found = group.options.find(opt => opt.value === value);
                if (found) return found.label;
            }
        }
        const found = options?.find(opt => opt.value === value);
        return found ? found.label : placeholder;
    };

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <div className="custom-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
                <span>{getDisplayValue()}</span>
                <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
            </div>
            {isOpen && (
                <div className="custom-dropdown-menu">
                    {groups ? (
                        groups.map((group, idx) => (
                            <div key={idx} className="dropdown-group">
                                <div className="dropdown-group-label">{group.label}</div>
                                {group.options.map(opt => (
                                    <div
                                        key={opt.value}
                                        className={`dropdown-option ${value === opt.value ? 'selected' : ''}`}
                                        onClick={() => handleSelect(opt.value)}
                                    >
                                        {opt.label}
                                    </div>
                                ))}
                            </div>
                        ))
                    ) : (
                        options?.map(opt => (
                            <div
                                key={opt.value}
                                className={`dropdown-option ${value === opt.value ? 'selected' : ''}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Multi-Select Dropdown Component with removable tags
const MultiSelectDropdown = ({ values = [], onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (val) => {
        const newValues = values.includes(val)
            ? values.filter(v => v !== val)
            : [...values, val];
        onChange(newValues);
    };

    const handleRemoveTag = (val, e) => {
        e.stopPropagation();
        onChange(values.filter(v => v !== val));
    };

    const getLabel = (val) => {
        const found = options?.find(opt => opt.value === val);
        return found ? found.label : val;
    };

    return (
        <div className="multi-select-dropdown" ref={dropdownRef}>
            <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="multi-select-tags">
                    {values.length === 0 ? (
                        <span className="multi-select-placeholder">{placeholder}</span>
                    ) : (
                        values.map(val => (
                            <span key={val} className="multi-select-tag">
                                {getLabel(val)}
                                <button
                                    className="tag-remove"
                                    onClick={(e) => handleRemoveTag(val, e)}
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
            </div>
            {isOpen && (
                <div className="custom-dropdown-menu">
                    {options?.length === 0 ? (
                        <div className="no-options">No options</div>
                    ) : (
                        options?.map(opt => (
                            <div
                                key={opt.value}
                                className={`dropdown-option ${values.includes(opt.value) ? 'selected' : ''}`}
                                onClick={() => handleToggleOption(opt.value)}
                            >
                                <input
                                    type="checkbox"
                                    checked={values.includes(opt.value)}
                                    readOnly
                                    className="option-checkbox"
                                />
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const Segment = ({ onViewLeads, preSelectedContacts, autoCreate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab] = useState('standard');
    const [segmentName, setSegmentName] = useState('');
    const [leadsMatch, setLeadsMatch] = useState('Any');
    const [conditions, setConditions] = useState([{ id: 1, type: '', action: '', operator: '', value: '', fieldName: '' }]);
    const [segments, setSegments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const [abLeads, setAbLeads] = useState('All');
    const [abSlices, setAbSlices] = useState('2');
    const [selectedSegments, setSelectedSegments] = useState([]);
    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const [viewFilter, setViewFilter] = useState('All');
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const dropdownRef = useRef(null);
    const bulkMenuRef = useRef(null);
    const viewMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveRowDropdown(null);
            }
            if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target)) {
                setShowBulkMenu(false);
            }
            if (viewMenuRef.current && !viewMenuRef.current.contains(event.target)) {
                setShowViewMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDeleteSegment = async (id) => {
        if (window.confirm('Are you sure you want to delete this segment?')) {
            try {
                await deleteSegment(id);
                fetchSegments(); // Refresh list
                setActiveRowDropdown(null);
            } catch (err) {
                console.error('Error deleting segment:', err);
                setError('Failed to delete segment');
            }
        }
    };

    const handleDuplicateSegment = async (id) => {
        try {
            setLoading(true);
            await duplicateSegment(id);
            fetchSegments();
            setActiveRowDropdown(null);
        } catch (err) {
            console.error('Error duplicating segment:', err);
            setError('Failed to duplicate segment');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSegment = (segment) => {
        setEditingId(segment._id);
        setSegmentName(segment.name);
        setActiveTab(segment.type || 'standard');
        setLeadsMatch(segment.leadsMatch || 'Any');
        setConditions(segment.conditions.length > 0 ? segment.conditions : [{ id: 1, type: '', action: '', operator: '', value: '', fieldName: '' }]);

        if (segment.type === 'abtest' && segment.abTestConfig) {
            setAbLeads(segment.abTestConfig.leads || 'All');
            setAbSlices(String(segment.abTestConfig.slices || '2'));
        }

        setShowCreateForm(true);
        setActiveRowDropdown(null);
    };

    const handleViewLeads = (segment) => {
        console.log('Segment.jsx: handleViewLeads called for:', segment._id);
        if (onViewLeads) {
            console.log('Segment.jsx: calling onViewLeads prop');
            onViewLeads(segment._id);
        } else {
            console.error('Segment.jsx: onViewLeads prop is MISSING');
        }
        setActiveRowDropdown(null);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSegments(segments.map(s => s._id));
        } else {
            setSelectedSegments([]);
        }
    };

    const handleSelectSegment = (id) => {
        if (selectedSegments.includes(id)) {
            setSelectedSegments(selectedSegments.filter(sid => sid !== id));
        } else {
            setSelectedSegments([...selectedSegments, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedSegments.length} segments?`)) {
            try {
                setLoading(true);
                // Execute deletes in parallel
                await Promise.all(selectedSegments.map(id => deleteSegment(id)));
                await fetchSegments();
                setSelectedSegments([]);
                setShowBulkMenu(false);
                setError(null);
            } catch (err) {
                console.error('Error deleting segments:', err);
                setError('Failed to delete some segments');
            } finally {
                setLoading(false);
            }
        }
    };

    // Auto-open create form when contacts are pre-selected
    useEffect(() => {
        console.log('Segment useEffect triggered');
        console.log('autoCreate:', autoCreate);
        console.log('preSelectedContacts:', preSelectedContacts);

        // Check sessionStorage for pre-selected contacts
        const storedContacts = sessionStorage.getItem('preSelectedContacts');
        const storedCreateFlag = sessionStorage.getItem('createSegment');

        console.log('storedContacts:', storedContacts);
        console.log('storedCreateFlag:', storedCreateFlag);

        if (storedCreateFlag === 'true' && storedContacts) {
            const contactIds = JSON.parse(storedContacts);
            console.log('Auto-opening create form with contact segment tab');
            console.log('Contact IDs from storage:', contactIds);

            // Auto-open create form with contact segment tab
            setEditingId(null);
            setSegmentName('');
            setActiveTab('contact');
            setShowCreateForm(true);

            // Clear sessionStorage after using
            sessionStorage.removeItem('preSelectedContacts');
            sessionStorage.removeItem('createSegment');
        } else if (autoCreate && preSelectedContacts && preSelectedContacts.length > 0) {
            console.log('Auto-opening create form with contact segment tab from props');
            // Auto-open create form with contact segment tab
            setEditingId(null);
            setSegmentName('');
            setActiveTab('contact');
            setShowCreateForm(true);
        }

        // Listen for custom event
        const handleCreateSegment = (event) => {
            console.log('Custom event received:', event.detail);
            setEditingId(null);
            setSegmentName('');
            setActiveTab('static');
            setShowCreateForm(true);
        };

        window.addEventListener('createSegmentWithContacts', handleCreateSegment);

        return () => {
            window.removeEventListener('createSegmentWithContacts', handleCreateSegment);
        };
    }, [autoCreate, preSelectedContacts]);

    // Fetch segments on component mount
    useEffect(() => {
        fetchSegments();
    }, []);

    const fetchSegments = async () => {
        try {
            setLoading(true);
            const response = await getSegments();
            setSegments(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching segments:', err);
            setError('Failed to load segments');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCondition = () => {
        setConditions([...conditions, { id: Date.now(), type: '', action: '', operator: '', value: '', fieldName: '' }]);
    };

    const handleConditionActionChange = (id, value) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, action: value } : c));
    };

    const handleConditionOperatorChange = (id, value) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, operator: value } : c));
    };

    const handleConditionValueChange = (id, value) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, value: value } : c));
    };

    const handleConditionFieldNameChange = (id, value) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, fieldName: value } : c));
    };

    const handleRemoveCondition = (id) => {
        if (conditions.length > 1) {
            setConditions(conditions.filter(c => c.id !== id));
        }
    };

    const handleConditionTypeChange = (id, value) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, type: value } : c));
    };

    const handleCreateSegment = async () => {
        try {
            setLoading(true);

            // Prepare segment data
            // Prepare segment data
            const segmentData = {
                name: segmentName,
                type: activeTab,
                leadsMatch,
                conditions: activeTab === 'standard' ? conditions.map(({ id, ...rest }) => rest) : [], // Only for standard
                abTestConfig: activeTab === 'abtest' ? { leads: abLeads, slices: Number(abSlices) } : undefined
            };

            // Call API to create or update segment
            if (editingId) {
                await updateSegment(editingId, segmentData);
            } else {
                await createSegmentAPI(segmentData);
            }

            // Reset form and go back to list
            setShowCreateForm(false);
            setEditingId(null);
            setActiveTab('standard');
            setSegmentName('');
            setLeadsMatch('Any');
            setConditions([{ id: 1, type: '', action: '', operator: '', value: '', fieldName: '' }]);
            setAbLeads('All');
            setAbSlices('2');

            // Refresh segments list
            await fetchSegments();
            setError(null);
        } catch (err) {
            console.error('Error creating segment:', err);
            setError(err.message || 'Failed to create segment');
        } finally {
            setLoading(false);
        }
    };

    // Create Segment Form View
    if (showCreateForm) {
        return (
            <div className="create-segment-container">
                <button className="back-btn" onClick={() => setShowCreateForm(false)}>
                    <ChevronLeft size={18} />
                    Back
                </button>

                <div className="create-segment-header">
                    <h1>{editingId ? 'Edit segment' : 'Create segment'}</h1>
                    <a href="#" className="tutorial-link">
                        Tutorial on segmentation
                        <Play size={14} />
                    </a>
                </div>

                {/* Segment Type Tabs */}
                <div className="segment-type-tabs">
                    <button
                        className={`segment-type-tab ${activeTab === 'standard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('standard')}
                    >
                        <GitBranch size={18} />
                        Standard segment
                    </button>
                    <button
                        className={`segment-type-tab ${activeTab === 'abtest' ? 'active' : ''}`}
                        onClick={() => setActiveTab('abtest')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
                        </svg>
                        A/B testing segment
                    </button>
                    <button
                        className={`segment-type-tab ${activeTab === 'static' ? 'active' : ''}`}
                        onClick={() => setActiveTab('static')}
                    >
                        <Users size={18} />
                        Static segment
                    </button>
                    <button
                        className={`segment-type-tab ${activeTab === 'contact' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <Users size={18} />
                        Contact segment
                    </button>
                </div>

                {/* Description */}
                <p className="segment-form-description">
                    {activeTab === 'standard' && "Create segment using multiple conditions such as campaign activity, ecommerce activity, tags, segments etc using standard segment creator tool."}
                    {activeTab === 'abtest' && "Slice your leads into a given number of segments using simple random sampling. You can choose to slice all leads or any number of leads or even the leads that belongs to selected tags/segments."}
                    {activeTab === 'static' && "Create a static segment by manually importing contacts or selecting them from a list."}
                    {activeTab === 'contact' && "Create a segment with pre-selected contacts. Simply name your segment and the selected contacts will be added automatically."}
                </p>

                {error && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

                {/* Form Content */}
                <div className="segment-form-content">
                    {/* Segment Name */}
                    <div className="segment-form-group">
                        <label>Segment name</label>
                        <input
                            type="text"
                            className="segment-form-input"
                            placeholder="Enter segment name"
                            value={segmentName}
                            onChange={(e) => setSegmentName(e.target.value)}
                        />
                    </div>

                    {/* Leads Match */}
                    {/* Leads Match */}
                    {activeTab === 'standard' && (
                        <div className="leads-match-row">
                            <span>Leads match</span>
                            <CustomDropdown
                                value={leadsMatch}
                                onChange={(val) => setLeadsMatch(val)}
                                placeholder="Select"
                                options={[
                                    { value: 'Any', label: 'Any' },
                                    { value: 'All', label: 'All' },
                                    { value: 'None', label: 'None' },
                                ]}
                            />
                            <span>of the following conditions:</span>
                        </div>
                    )}

                    {/* Conditions */}
                    {/* Conditions */}
                    {activeTab === 'standard' && (
                        <div className="conditions-section">
                            {conditions.map((condition) => (
                                <div key={condition.id} className="condition-row">
                                    <button
                                        className="condition-remove-btn"
                                        onClick={() => handleRemoveCondition(condition.id)}
                                        disabled={conditions.length === 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <CustomDropdown
                                        value={condition.type}
                                        onChange={(val) => handleConditionTypeChange(condition.id, val)}
                                        placeholder="Type"
                                        options={[
                                            { value: 'campaign_activity', label: 'Campaign Activity' },
                                            { value: 'date_added', label: 'Date Added' },
                                            { value: 'ecommerce_activity', label: 'Ecommerce Activity' },
                                            { value: 'tags', label: 'Tags' },
                                            { value: 'segment', label: 'Segment' },
                                            { value: 'field', label: 'Field' },
                                            { value: 'double_opt_in', label: 'Double opt-in status' },
                                        ]}
                                    />

                                    {/* Campaign Activity */}
                                    {condition.type === 'campaign_activity' && (
                                        <>
                                            <CustomDropdown
                                                value={condition.action}
                                                onChange={(val) => handleConditionActionChange(condition.id, val)}
                                                placeholder="Action"
                                                options={[
                                                    { value: 'sent', label: 'was sent' },
                                                    { value: 'not_sent', label: 'was not sent' },
                                                    { value: 'delivered', label: 'was delivered' },
                                                    { value: 'not_delivered', label: 'was not delivered' },
                                                    { value: 'failed', label: 'was failed' },
                                                    { value: 'bounced', label: 'was bounced' },
                                                    { value: 'not_bounced', label: 'was not bounced' },
                                                    { value: 'unsubscribed', label: 'was unsubscribed' },
                                                    { value: 'not_unsubscribed', label: 'was not unsubscribed' },
                                                    { value: 'complained', label: 'complained' },
                                                    { value: 'not_complained', label: 'did not complain' },
                                                    { value: 'opened', label: 'opened' },
                                                    { value: 'not_opened', label: 'did not open' },
                                                    { value: 'clicked', label: 'clicked' },
                                                    { value: 'not_clicked', label: 'did not click' },
                                                ]}
                                            />
                                            <CustomDropdown
                                                value={condition.operator}
                                                onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                                placeholder="Operator"
                                                groups={[
                                                    {
                                                        label: "SELECT AN OPERATOR FROM 'ANY'",
                                                        options: [
                                                            { value: 'any_last_5_campaigns', label: 'any of the last 5 campaigns' },
                                                            { value: 'any_last_7_days', label: 'any campaigns in the last 7 days' },
                                                            { value: 'any_last_1_month', label: 'any campaigns in the last 1 months' },
                                                            { value: 'any_last_3_months', label: 'any campaigns in the last 3 months' },
                                                            { value: 'any_selected_campaigns', label: 'any of the selected campaigns' },
                                                        ]
                                                    },
                                                    {
                                                        label: "SELECT AN OPERATOR FROM 'ALL'",
                                                        options: [
                                                            { value: 'all_last_5_campaigns', label: 'all of the last 5 campaigns' },
                                                            { value: 'all_last_7_days', label: 'all campaigns in the last 7 days' },
                                                            { value: 'all campaigns in the last 1 months', label: 'all campaigns in the last 1 months' },
                                                            { value: 'all_last_3_months', label: 'all campaigns in the last 3 months' },
                                                            { value: 'all_selected_campaigns', label: 'all of the selected campaigns' },
                                                        ]
                                                    }
                                                ]}
                                            />
                                        </>
                                    )}

                                    {/* Date Added */}
                                    {condition.type === 'date_added' && (
                                        <CustomDropdown
                                            value={condition.operator}
                                            onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                            placeholder="Operator"
                                            options={[
                                                { value: 'before', label: 'is before' },
                                                { value: 'after', label: 'is after' },
                                                { value: 'between', label: 'is between' },
                                                { value: 'not_between', label: 'is not between' },
                                            ]}
                                        />
                                    )}

                                    {/* Ecommerce Activity */}
                                    {condition.type === 'ecommerce_activity' && (
                                        <>
                                            <CustomDropdown
                                                value={condition.action}
                                                onChange={(val) => handleConditionActionChange(condition.id, val)}
                                                placeholder="Action"
                                                options={[
                                                    { value: 'purchased', label: 'Purchased' },
                                                    { value: 'abandoned', label: 'Abandoned Cart' },
                                                    { value: 'viewed', label: 'Viewed Product' },
                                                    { value: 'added_cart', label: 'Added to Cart' },
                                                ]}
                                            />
                                            <CustomDropdown
                                                value={condition.operator}
                                                onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                                placeholder="Operator"
                                                options={[
                                                    { value: 'any_time', label: 'at any time' },
                                                    { value: 'last_7_days', label: 'in the last 7 days' },
                                                    { value: 'last_30_days', label: 'in the last 30 days' },
                                                    { value: 'more_than_X', label: 'more than X times' },
                                                ]}
                                            />
                                        </>
                                    )}

                                    {/* Tags */}
                                    {condition.type === 'tags' && (
                                        <>
                                            <CustomDropdown
                                                value={condition.operator}
                                                onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                                placeholder="Operator"
                                                options={[
                                                    { value: 'any', label: 'any of the selected tags' },
                                                    { value: 'all', label: 'all of the selected tags' },
                                                    { value: 'none', label: 'none of the selected tags' },
                                                ]}
                                            />
                                            <input
                                                type="text"
                                                className="condition-value-input"
                                                placeholder="Tags"
                                                value={condition.value}
                                                onChange={(e) => handleConditionValueChange(condition.id, e.target.value)}
                                            />
                                        </>
                                    )}

                                    {/* Segment */}
                                    {condition.type === 'segment' && (
                                        <>
                                            <CustomDropdown
                                                value={condition.operator}
                                                onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                                placeholder="Operator"
                                                options={[
                                                    { value: 'any', label: 'any of the selected segments' },
                                                    { value: 'all', label: 'all of the selected segments' },
                                                    { value: 'none', label: 'none of the selected segments' },
                                                ]}
                                            />
                                            <input
                                                type="text"
                                                className="condition-value-input"
                                                placeholder="Segments"
                                                value={condition.value}
                                                onChange={(e) => handleConditionValueChange(condition.id, e.target.value)}
                                            />
                                        </>
                                    )}

                                    {/* Field */}
                                    {condition.type === 'field' && (
                                        <>
                                            <CustomDropdown
                                                value={condition.fieldName}
                                                onChange={(val) => handleConditionFieldNameChange(condition.id, val)}
                                                placeholder="Field name"
                                                options={[
                                                    { value: 'email', label: 'Email' },
                                                    { value: 'first_name', label: 'First Name' },
                                                    { value: 'last_name', label: 'Last Name' },
                                                    { value: 'company', label: 'Company' },
                                                    { value: 'country', label: 'Country' },
                                                ]}
                                            />
                                            <CustomDropdown
                                                value={condition.operator}
                                                onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                                placeholder="Operator"
                                                options={[
                                                    { value: 'equal', label: 'is equal to' },
                                                    { value: 'not_equal', label: 'is not equal to' },
                                                    { value: 'starts', label: 'starts with' },
                                                    { value: 'ends', label: 'ends with' },
                                                    { value: 'blank', label: 'is blank' },
                                                    { value: 'not_blank', label: 'is not blank' },
                                                ]}
                                            />
                                        </>
                                    )}

                                    {/* Double opt-in status */}
                                    {condition.type === 'double_opt_in' && (
                                        <>
                                            <CustomDropdown
                                                value={condition.operator}
                                                onChange={(val) => handleConditionOperatorChange(condition.id, val)}
                                                placeholder="Operator"
                                                options={[
                                                    { value: 'any', label: 'any of the selected options' },
                                                    { value: 'all', label: 'all of the selected options' },
                                                    { value: 'none', label: 'none of the selected options' },
                                                ]}
                                            />
                                            <MultiSelectDropdown
                                                values={Array.isArray(condition.value) ? condition.value : (condition.value ? [condition.value] : [])}
                                                onChange={(vals) => handleConditionValueChange(condition.id, vals)}
                                                placeholder="Options"
                                                options={[
                                                    { value: 'none', label: 'None' },
                                                    { value: 'waiting', label: 'Waiting' },
                                                    { value: 'confirmed', label: 'Confirmed' },
                                                    { value: 'failed', label: 'Failed' },
                                                ]}
                                            />
                                        </>
                                    )}
                                </div>
                            ))}

                            <button className="add-condition-btn" onClick={handleAddCondition}>
                                <Plus size={16} />
                                Add new condition
                            </button>
                        </div>
                    )}

                    {/* A/B Test Form */}
                    {activeTab === 'abtest' && (
                        <>
                            <div className="segment-form-group">
                                <label>Select leads</label>
                                <CustomDropdown
                                    value={abLeads}
                                    onChange={setAbLeads}
                                    options={[
                                        { value: 'All', label: 'All' },
                                        { value: 'number_of_leads', label: 'From number of leads' },
                                        { value: 'selected_tags', label: 'From selected tags' },
                                        { value: 'selected_segments', label: 'From selected segments' }
                                    ]}
                                    placeholder="Select leads"
                                />
                            </div>

                            <div className="segment-form-group">
                                <label>Number of slices</label>
                                <CustomDropdown
                                    value={abSlices}
                                    onChange={setAbSlices}
                                    options={Array.from({ length: 19 }, (_, i) => ({ value: String(i + 2), label: String(i + 2) }))}
                                    placeholder="Select"
                                />
                            </div>
                        </>
                    )}

                    {/* Default Create Button - Only show for standard and abtest */}
                    {activeTab !== 'static' && activeTab !== 'contact' && (
                        <button
                            className="create-segment-btn"
                            onClick={handleCreateSegment}
                            disabled={!segmentName.trim() || loading || (activeTab === 'standard' && conditions.length === 0)}
                        >
                            {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update segment' : 'Create segment')}
                        </button>
                    )}

                    {/* Static Segment Form */}
                    {activeTab === 'static' && (
                        <StaticSegmentForm
                            segmentName={segmentName}
                            preSelectedContactIds={preSelectedContacts}
                            onSuccess={async () => {
                                await fetchSegments();
                                setShowCreateForm(false);
                                setSegmentName('');
                            }}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    )}

                    {/* Contact Segment Form */}
                    {activeTab === 'contact' && (
                        <div className="contact-segment-form">
                            {/* Pre-selected Contacts Display */}
                            {(() => {
                                const storedContacts = sessionStorage.getItem('preSelectedContacts');
                                const contactIds = storedContacts ? JSON.parse(storedContacts) : (preSelectedContacts || []);

                                return contactIds && contactIds.length > 0 && (
                                    <div style={{
                                        marginBottom: '24px',
                                        padding: '16px',
                                        backgroundColor: '#f0fdf4',
                                        border: '1px solid #86efac',
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#059669' }}>
                                                    {contactIds.length} contact(s) selected
                                                </p>
                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
                                                    These contacts will be added to the new segment
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Create Button */}
                            <button
                                className="create-segment-btn"
                                onClick={async () => {
                                    if (!segmentName.trim()) {
                                        setError('Please enter a segment name');
                                        return;
                                    }

                                    try {
                                        setLoading(true);
                                        setError(null);

                                        // Get contact IDs from sessionStorage or props
                                        const storedContacts = sessionStorage.getItem('preSelectedContacts');
                                        const contactIds = storedContacts ? JSON.parse(storedContacts) : (preSelectedContacts || []);

                                        if (!contactIds || contactIds.length === 0) {
                                            setError('No contacts selected');
                                            setLoading(false);
                                            return;
                                        }

                                        // Create segment
                                        const newSegment = await createSegmentAPI({
                                            name: segmentName,
                                            type: 'contact',
                                            conditions: [],
                                            leadsMatch: 'Any'
                                        });

                                        if (!newSegment || !newSegment.data || !newSegment.data._id) {
                                            throw new Error("Failed to create segment.");
                                        }

                                        const segmentId = newSegment.data._id;

                                        // Add contacts to segment
                                        await addContactsToSegment(segmentId, contactIds);

                                        // Clear sessionStorage
                                        sessionStorage.removeItem('preSelectedContacts');
                                        sessionStorage.removeItem('createSegment');

                                        // Success
                                        await fetchSegments();
                                        setShowCreateForm(false);
                                        setSegmentName('');
                                        setLoading(false);

                                    } catch (err) {
                                        console.error("Error creating contact segment:", err);
                                        setError(err.message || "Failed to create segment.");
                                        setLoading(false);
                                    }
                                }}
                                disabled={!segmentName.trim() || loading}
                            >
                                {loading ? 'Creating...' : 'Create segment'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Segments List View
    return (
        <div className="segment-container">
            <header className="segment-header">
                <h1 className="segment-title">Segments</h1>
                <div className="segment-header-actions">
                    <button className="segment-btn-primary" onClick={() => {
                        setEditingId(null);
                        setSegmentName('');
                        setLeadsMatch('Any');
                        setConditions([{ id: 1, type: '', action: '', operator: '', value: '', fieldName: '' }]);
                        setAbLeads('All');
                        setAbSlices('2');
                        setActiveTab('standard');
                        setShowCreateForm(true);
                    }}>
                        <Plus size={18} />
                        Create a segment
                    </button>
                </div>
            </header>

            <div className="segment-filters-bar">
                <div className="filters-left">
                    {selectedSegments.length > 0 && (
                        <div ref={bulkMenuRef} className="bulk-actions-wrapper" style={{ position: 'relative', marginRight: '10px' }}>
                            <button
                                className="bulk-action-btn"
                                onClick={(e) => { e.stopPropagation(); setShowBulkMenu(!showBulkMenu); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '8px 12px', background: 'white', color: '#637381',
                                    border: '1px solid #dfe3e8', borderRadius: '4px', cursor: 'pointer', fontWeight: 500
                                }}
                            >
                                Bulk action <ChevronDown size={14} />
                            </button>
                            {showBulkMenu && (
                                <div className="bulk-menu" style={{
                                    position: 'absolute', top: '100%', left: 0, marginTop: '5px',
                                    background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '200px',
                                    padding: '8px 0'
                                }}>
                                    <div style={{ padding: '8px 16px', color: '#2563EB', fontWeight: 500, fontSize: '13px' }}>
                                        {selectedSegments.length} segments selected
                                    </div>
                                    <button
                                        onClick={handleBulkDelete}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                            padding: '8px 16px', border: 'none', background: 'none',
                                            color: '#DC2626', cursor: 'pointer', fontSize: '14px', textAlign: 'left'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        <Trash2 size={16} />
                                        Delete segments
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={viewMenuRef} className="dropdown-filter"
                        style={{ position: 'relative' }}
                        onClick={() => setShowViewMenu(!showViewMenu)}
                    >
                        <div style={selectedSegments.length > 0 ? {
                            backgroundColor: '#4F5E7B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px'
                        } : { display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>View: {viewFilter}</span>
                            <ChevronDown size={16} />
                        </div>

                        {showViewMenu && (
                            <div className="view-menu" style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: '5px',
                                background: 'white', border: '1px solid #e0e0e0', borderRadius: '6px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '160px',
                                padding: '8px 0'
                            }}>
                                {[
                                    { label: 'All', value: 'All', icon: <List size={16} /> },
                                    { label: 'Standard', value: 'standard', icon: <GitBranch size={16} /> },
                                    { label: 'A/B testing', value: 'abtest', icon: <Edit2 size={16} /> }, // Using Edit2 for A/B as PenTool
                                    { label: 'Static', value: 'static', icon: <Layers size={16} /> },
                                    { label: 'Contacts', value: 'contact', icon: <Users size={16} /> }
                                ].map(option => (
                                    <div
                                        key={option.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewFilter(option.label); // Keeping label as display
                                            setShowViewMenu(false);
                                        }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            padding: '8px 16px', cursor: 'pointer', fontSize: '14px',
                                            color: '#2d3436'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <span style={{ color: '#636e72' }}>{option.icon}</span>
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="segment-content-card">
                <div className="segment-table-header">
                    <div className="segment-count">
                        <span>{segments.length} segments</span>
                        <Info size={14} className="info-icon" />
                    </div>
                    <div className="table-actions">
                        <div className="segment-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search segments"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {segments.length === 0 ? (
                    <div className="empty-segment-state">
                        <div className="empty-icon-circle">
                            <Zap size={32} />
                        </div>
                        <h2>No segments found</h2>
                        <p>Create segments to target specific groups of contacts based on their properties or behavior.</p>
                        <button className="segment-btn-primary" onClick={() => setShowCreateForm(true)}>
                            Create your first segment
                        </button>
                    </div>
                ) : (
                    <div className="segments-table-container">
                        <table className="segments-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={segments.length > 0 && selectedSegments.length === segments.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Lead count <ChevronDown size={12} /></th>
                                    <th>Subscriber count <ChevronDown size={12} /></th>
                                    <th>Created at <ChevronDown size={12} /></th>
                                    <th style={{ width: '40px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {segments
                                    .filter(segment => {
                                        if (viewFilter === 'All') return true;
                                        if (viewFilter === 'Standard') return (!segment.type || segment.type === 'standard');
                                        if (viewFilter === 'A/B testing') return segment.type === 'abtest';
                                        if (viewFilter === 'Static') return segment.type === 'static';
                                        if (viewFilter === 'Contacts') return segment.type === 'contact';
                                        return true;
                                    })
                                    .map(segment => (
                                        <tr key={segment._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSegments.includes(segment._id)}
                                                    onChange={() => handleSelectSegment(segment._id)}
                                                />
                                            </td>
                                            <td>
                                                <span className="segment-name-link">{segment.name}</span>
                                            </td>
                                            <td>
                                                {segment.type === 'abtest' ? 'A/B testing' : ((segment.type === 'static' || segment.type === 'contact') ? 'Contacts' : 'Standard')}
                                            </td>
                                            <td>{segment.leadCount || 0}</td>
                                            <td>{segment.subscriberCount || 0}</td>
                                            <td>
                                                {new Date(segment.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    hour12: true
                                                })}
                                            </td>
                                            <td style={{ position: 'relative' }}>
                                                <button
                                                    className={`row-options-btn ${activeRowDropdown === segment._id ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setDropdownPosition({
                                                            top: rect.bottom + window.scrollY,
                                                            left: rect.right + window.scrollX - 200
                                                        });
                                                        setActiveRowDropdown(activeRowDropdown === segment._id ? null : segment._id);
                                                    }}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                                {activeRowDropdown === segment._id && createPortal(
                                                    <div
                                                        className="segment-dropdown-menu"
                                                        ref={dropdownRef}
                                                        style={{
                                                            position: 'absolute',
                                                            top: dropdownPosition.top,
                                                            left: dropdownPosition.left,
                                                            zIndex: 1000,
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                            width: '200px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #e2e8f0'
                                                        }}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    >
                                                        <button onClick={(e) => { e.stopPropagation(); handleViewLeads(segment); }} className="dropdown-item">
                                                            <Users size={16} /> View leads
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDuplicateSegment(segment._id); }} className="dropdown-item">
                                                            <Copy size={16} /> Duplicate segment
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleEditSegment(segment); }} className="dropdown-item">
                                                            <Edit2 size={16} /> Edit segment
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSegment(segment._id); }} className="dropdown-item delete">
                                                            <Trash2 size={16} /> Delete segment
                                                        </button>
                                                    </div>,
                                                    document.body
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="segment-pagination">
                    <div className="pagination-info">
                        <div className="rows-per-page">
                            <span>20</span>
                            <ChevronDown size={14} />
                            <span>Rows per page</span>
                        </div>
                        <div className="page-range">
                            0-0 of 0
                        </div>
                        <div className="pagination-arrows">
                            <ChevronLeft size={18} className="disabled" />
                            <ChevronRight size={18} className="disabled" />
                        </div>
                    </div>
                </div>
            </div>
            {activeRowDropdown && dropdownPosition && createPortal(
                <div
                    className="row-options-dropdown"
                    ref={dropdownRef}
                    style={{
                        top: `${dropdownPosition.top + 4}px`,
                        left: `${dropdownPosition.left}px`
                    }}
                >
                    <button className="row-option" onClick={() => console.log('View leads')}>
                        <Users size={16} />
                        View leads
                    </button>
                    <button className="row-option" onClick={() => console.log('Duplicate')}>
                        <Copy size={16} />
                        Duplicate segment
                    </button>
                    <button className="row-option" onClick={() => console.log('Edit')}>
                        <Edit2 size={16} />
                        Edit segment
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="row-option delete" onClick={() => handleDeleteSegment(activeRowDropdown)}>
                        <Trash2 size={16} />
                        Delete segment
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Segment;
