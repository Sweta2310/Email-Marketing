import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Download,
    Settings,
    ChevronDown,
    Plus,
    ArrowLeft,
    Trash2,
    Users,
    UserCheck,
    UserX,
    Check,
    ChevronLeft,
    ChevronRight,
    List,
    Zap,
    Folder
} from 'lucide-react';
import { getSegmentContacts, getSegmentById, getSegments, addContactsToSegment } from '../../services/segment.services';
import { marketingAPI } from '../../services/marketing.services';
import './segment.css';

const SegmentLeads = ({ segmentId, onBack, onImport, onDataLoaded }) => {
    const [leads, setLeads] = useState([]);
    const [segment, setSegment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [lists, setLists] = useState([]);
    const [allSegments, setAllSegments] = useState([]);

    // Dropdown States
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showAddToListDropdown, setShowAddToListDropdown] = useState(false);
    const [addToListTab, setAddToListTab] = useState('Lists');
    const [addToListSearch, setAddToListSearch] = useState('');
    const [showViewFilter, setShowViewFilter] = useState(false);
    const [showColumns, setShowColumns] = useState(false);

    // Filter State
    const [viewFilter, setViewFilter] = useState('all'); // all, subscribed, unsubscribed

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        email: true,
        fullName: true,
        status: true,
        addedAt: true,
        doubleOptIn: false,
        timezone: false,
        ip: false,
        lastUpdated: false
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // Refs for clicking outside to close dropdowns
    const bulkActionRef = useRef(null);
    const viewFilterRef = useRef(null);
    const columnsRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [segmentData, leadsData, listsData, segmentsData] = await Promise.all([
                    getSegmentById(segmentId),
                    getSegmentContacts(segmentId),
                    marketingAPI.getLists(),
                    getSegments()
                ]);
                setSegment(segmentData.data);
                setLists(listsData);
                setAllSegments(segmentsData.data || []);
                if (onDataLoaded) onDataLoaded(segmentData.data);
                setLeads(leadsData.data || []);
            } catch (err) {
                console.error('Error fetching segment leads:', err);
                setError('Failed to load segment leads');
            } finally {
                setLoading(false);
            }
        };

        if (segmentId) fetchData();
    }, [segmentId, onDataLoaded]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target)) setShowBulkActions(false);
            if (viewFilterRef.current && !viewFilterRef.current.contains(event.target)) setShowViewFilter(false);
            if (columnsRef.current && !columnsRef.current.contains(event.target)) setShowColumns(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectAll = (e) => {
        // Filter leads based on current view before selecting
        const currentLeads = getFilteredLeads();
        if (e.target.checked) {
            setSelectedLeads(currentLeads.map(l => l._id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSelectLead = (id) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(selectedLeads.filter(l => l !== id));
        } else {
            setSelectedLeads([...selectedLeads, id]);
        }
    };

    const toggleColumn = (columnKey) => {
        setVisibleColumns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const getFilteredLeads = () => {
        let filtered = leads;

        // Apply View Filter
        if (viewFilter === 'subscribed') {
            filtered = filtered.filter(l => l.status === 'subscribed');
        } else if (viewFilter === 'unsubscribed') {
            filtered = filtered.filter(l => l.status !== 'subscribed'); // Assuming anything not subscribed is unsubscribed/unknown
        }

        // Apply Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(l =>
                l.email.toLowerCase().includes(query) ||
                (l.firstName && l.firstName.toLowerCase().includes(query)) ||
                (l.lastName && l.lastName.toLowerCase().includes(query))
            );
        }

        return filtered;
    };

    const filteredLeads = getFilteredLeads();
    const allSelected = filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length;

    const handleDelete = () => {
        // Placeholder for delete functionality
        console.log('Deleting leads:', selectedLeads);
        alert(`Deleting ${selectedLeads.length} leads (Implemented in future)`);
        setShowBulkActions(false);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="segment-leads-container" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                        <ArrowLeft size={24} color="#1e293b" />
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                        Leads of segment
                    </h1>
                    <button
                        className="btn-outline"
                        onClick={() => onImport && onImport(segment)}
                        style={{ padding: '4px 8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Plus size={14} /> Import
                    </button>
                </div>
                <div style={{ color: '#64748b', fontSize: '14px', marginLeft: '34px' }}>
                    Segment: {segment?.name || 'Unknown'}
                </div>
            </div>

            <div className="segment-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Bulk Action Dropdown */}
                    <div ref={bulkActionRef} style={{ position: 'relative' }}>
                        <button
                            className="btn-white"
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', background: 'white', color: '#64748b', cursor: 'pointer' }}
                        >
                            Bulk action <ChevronDown size={14} />
                        </button>
                        {showBulkActions && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, width: '150px'
                            }}>
                                <button
                                    onClick={handleDelete}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', border: 'none', background: 'white', cursor: 'pointer', color: '#ef4444', fontSize: '14px', textAlign: 'left' }}
                                    className="dropdown-item-hover"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Add to List Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn-white"
                            onClick={() => setShowAddToListDropdown(!showAddToListDropdown)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', background: 'white', color: '#64748b', cursor: 'pointer' }}
                        >
                            <List size={14} /> Add to a list(s) {showAddToListDropdown ? <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={14} />}
                        </button>

                        {showAddToListDropdown && (
                            <div className="add-to-list-dropdown" style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, width: '300px', display: 'flex', flexDirection: 'column'
                            }}>
                                <div className="add-to-list-search" style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Search size={16} color="#94a3b8" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={addToListSearch}
                                        onChange={(e) => setAddToListSearch(e.target.value)}
                                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                                    />
                                </div>

                                <div className="add-to-list-tabs" style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                                    <div
                                        onClick={() => setAddToListTab('Lists')}
                                        style={{
                                            flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '14px',
                                            fontWeight: addToListTab === 'Lists' ? '600' : '400',
                                            color: addToListTab === 'Lists' ? '#2563eb' : '#64748b',
                                            borderBottom: addToListTab === 'Lists' ? '2px solid #2563eb' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        <List size={14} /> Lists
                                    </div>
                                    <div
                                        onClick={() => setAddToListTab('Segments')}
                                        style={{
                                            flex: 1, padding: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '14px',
                                            fontWeight: addToListTab === 'Segments' ? '600' : '400',
                                            color: addToListTab === 'Segments' ? '#2563eb' : '#64748b',
                                            borderBottom: addToListTab === 'Segments' ? '2px solid #2563eb' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        <Zap size={14} /> Segments
                                    </div>
                                </div>

                                <div className="add-to-list-items" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {addToListTab === 'Lists' ? (
                                        lists.filter(l => l.name.toLowerCase().includes(addToListSearch.toLowerCase())).length > 0 ? (
                                            lists.filter(l => l.name.toLowerCase().includes(addToListSearch.toLowerCase())).map(list => (
                                                <div
                                                    key={list._id}
                                                    onClick={async () => {
                                                        if (selectedLeads.length === 0) {
                                                            alert("Please select at least one contact.");
                                                            return;
                                                        }
                                                        try {
                                                            await marketingAPI.addContactsToList(list._id, selectedLeads);
                                                            setShowAddToListDropdown(false);
                                                            alert("Contacts added to list successfully!");
                                                        } catch (err) {
                                                            console.error('Error adding to list:', err);
                                                            alert("Failed to add contacts to list.");
                                                        }
                                                    }}
                                                    style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b' }}
                                                    className="dropdown-item-hover"
                                                >
                                                    <Folder size={16} color="#94a3b8" />
                                                    <span>{list.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No lists found</div>
                                        )
                                    ) : (
                                        allSegments.filter(s => s.name.toLowerCase().includes(addToListSearch.toLowerCase())).length > 0 ? (
                                            allSegments.filter(s => s.name.toLowerCase().includes(addToListSearch.toLowerCase())).map(seg => (
                                                <div
                                                    key={seg._id}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        alert(`Clicked segment: ${seg.name}`);
                                                        console.log('Adding contacts to segment:', seg._id, selectedLeads);
                                                        if (selectedLeads.length === 0) {
                                                            alert("Please select at least one contact.");
                                                            return;
                                                        }
                                                        try {
                                                            const response = await addContactsToSegment(seg._id, selectedLeads);
                                                            console.log('Add to segment response:', response);
                                                            setShowAddToListDropdown(false);
                                                            alert("Contacts added to segment successfully!");
                                                        } catch (err) {
                                                            console.error('Error adding to segment:', err);
                                                            alert("Failed to add contacts to segment.");
                                                        }
                                                    }}
                                                    style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b' }}
                                                    className="dropdown-item-hover"
                                                >
                                                    <Folder size={16} color="#94a3b8" />
                                                    <span>{seg.name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                                                <div>No segments found</div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* View Filter Dropdown */}
                    <div ref={viewFilterRef} style={{ position: 'relative' }}>
                        <button
                            className="btn-white"
                            onClick={() => setShowViewFilter(!showViewFilter)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', background: viewFilter !== 'all' ? '#e6f6f6' : 'white', color: viewFilter !== 'all' ? '#22a6a8' : '#64748b', cursor: 'pointer', borderColor: viewFilter !== 'all' ? '#22a6a8' : '#e2e8f0' }}
                        >
                            View: {viewFilter === 'all' ? 'All' : viewFilter.charAt(0).toUpperCase() + viewFilter.slice(1)} <ChevronDown size={14} />
                        </button>
                        {showViewFilter && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, width: '180px'
                            }}>
                                <div onClick={() => { setViewFilter('all'); setShowViewFilter(false); }} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: viewFilter === 'all' ? '#f1f5f9' : 'white' }}>
                                    <Users size={16} color="#64748b" /> All
                                </div>
                                <div onClick={() => { setViewFilter('subscribed'); setShowViewFilter(false); }} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: viewFilter === 'subscribed' ? '#f1f5f9' : 'white' }}>
                                    <UserCheck size={16} color="#64748b" /> Subscribed
                                </div>
                                <div onClick={() => { setViewFilter('unsubscribed'); setShowViewFilter(false); }} style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', background: viewFilter === 'unsubscribed' ? '#f1f5f9' : 'white' }}>
                                    <UserX size={16} color="#64748b" /> Unsubscribed
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="search-box" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Type & hit enter"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '8px 32px 8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '250px' }}
                        />
                        <Search size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    </div>
                    <button className="btn-white" style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', background: 'white', color: '#64748b' }}>
                        <Download size={14} /> Export all
                    </button>

                    {/* Columns Dropdown */}
                    <div ref={columnsRef} style={{ position: 'relative' }}>
                        <button
                            className="btn-white"
                            onClick={() => setShowColumns(!showColumns)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', background: 'white', color: '#64748b', cursor: 'pointer' }}
                        >
                            <Settings size={14} /> Columns <ChevronDown size={14} />
                        </button>
                        {showColumns && (
                            <div style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, width: '220px', padding: '8px 0'
                            }}>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {[
                                        { key: 'fullName', label: 'Full name' },
                                        { key: 'status', label: 'Subscription status' },
                                        { key: 'doubleOptIn', label: 'Double opt-in status' },
                                        { key: 'timezone', label: 'Timezone' },
                                        { key: 'ip', label: 'IP address' },
                                        { key: 'addedAt', label: 'Added at' },
                                        { key: 'lastUpdated', label: 'Last updated at' },
                                    ].map((col) => (
                                        <div
                                            key={col.key}
                                            onClick={() => toggleColumn(col.key)}
                                            style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b' }}
                                        >
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '4px', border: visibleColumns[col.key] ? 'none' : '1px solid #cbd5e1',
                                                background: visibleColumns[col.key] ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {visibleColumns[col.key] && <Check size={12} color="white" />}
                                            </div>
                                            {col.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="segment-table-container" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', width: '40px' }}>
                                <input type="checkbox" onChange={handleSelectAll} checked={allSelected} />
                            </th>
                            {visibleColumns.email && (
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                                    Email address <ChevronDown size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                                </th>
                            )}
                            {visibleColumns.fullName && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Full name</th>}
                            {visibleColumns.status && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Subscription status</th>}
                            {visibleColumns.doubleOptIn && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Double opt-in</th>}
                            {visibleColumns.timezone && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Timezone</th>}
                            {visibleColumns.ip && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>IP</th>}
                            {visibleColumns.addedAt && (
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                                    Added at <ChevronDown size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                                </th>
                            )}
                            {visibleColumns.lastUpdated && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Last updated</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.length > 0 ? (
                            filteredLeads
                                .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
                                .map((lead) => (
                                    <tr key={lead._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(lead._id)}
                                                onChange={() => handleSelectLead(lead._id)}
                                            />
                                        </td>
                                        {visibleColumns.email && <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1e293b' }}>{lead.email}</td>}
                                        {visibleColumns.fullName && <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>{lead.firstName} {lead.lastName}</td>}
                                        {visibleColumns.status && (
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500',
                                                    background: lead.status === 'subscribed' ? '#dcfce7' : '#fee2e2',
                                                    color: lead.status === 'subscribed' ? '#166534' : '#991b1b'
                                                }}>
                                                    {lead.status || 'Unknown'}
                                                </span>
                                            </td>
                                        )}
                                        {visibleColumns.doubleOptIn && <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>-</td>}
                                        {visibleColumns.timezone && <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>-</td>}
                                        {visibleColumns.ip && <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>-</td>}
                                        {visibleColumns.addedAt && (
                                            <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                        )}
                                        {visibleColumns.lastUpdated && <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>-</td>}
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="10" style={{ padding: '60px 0', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b' }}>
                                        <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '50%', marginBottom: '16px' }}>
                                            <Search size={32} color="#cbd5e0" />
                                        </div>
                                        <p style={{ fontSize: '16px', fontWeight: '500' }}>No lead found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="table-footer" style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
                    <div className="segment-pagination" style={{ borderTop: 'none', padding: 0 }}>
                        <div className="pagination-info">
                            <div className="rows-per-page">
                                <span>{rowsPerPage}</span>
                                <ChevronDown size={14} />
                                <span>Rows per page</span>
                            </div>
                            <div className="page-range">
                                {filteredLeads.length > 0 ? `${currentPage * rowsPerPage + 1}-${Math.min((currentPage + 1) * rowsPerPage, filteredLeads.length)} of ${filteredLeads.length}` : '0-0 of 0'}
                            </div>
                            <div className="pagination-arrows">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                    style={{ background: 'none', border: 'none', cursor: currentPage === 0 ? 'default' : 'pointer', padding: 0, display: 'flex' }}
                                >
                                    <ChevronLeft size={18} className={currentPage === 0 ? "disabled" : ""} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => (currentPage + 1) * rowsPerPage < filteredLeads.length ? p + 1 : p)}
                                    disabled={(currentPage + 1) * rowsPerPage >= filteredLeads.length}
                                    style={{ background: 'none', border: 'none', cursor: (currentPage + 1) * rowsPerPage >= filteredLeads.length ? 'default' : 'pointer', padding: 0, display: 'flex' }}
                                >
                                    <ChevronRight size={18} className={(currentPage + 1) * rowsPerPage >= filteredLeads.length ? "disabled" : ""} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SegmentLeads;
