import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Download,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    Mail,
    Phone,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Info,
    LayoutGrid,
    Settings2,
    Loader2,
    List,
    Ban,
    Pencil,
    Copy,
    Trash2,
    Zap,
    Folder
} from 'lucide-react';
import { marketingAPI } from '../../services/marketing.services';
import { addContactsToSegment } from '../../services/segment.services';
import AddContactModal from './modals/AddContact.modal';
import ImportDataModal from './modals/ImportData.modal';
import CustomizeColumnsModal from './modals/CustomizeColumns.modal';
import './contactlist.css';

const ContactList = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lists, setLists] = useState([]);
    const [segments, setSegments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState({ type: 'all', id: null, name: 'All contacts' });
    const [showDropdown, setShowDropdown] = useState(false);

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState(['contact', 'marketing_consent', 'is_bounced', 'email', 'whatsapp', 'updatedAt', 'createdAt']);

    // Bulk Selection State
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [showBulkActionsDropdown, setShowBulkActionsDropdown] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [showRowsDropdown, setShowRowsDropdown] = useState(false);
    const [showPagesDropdown, setShowPagesDropdown] = useState(false);

    // Add to List dropdown state
    const [showAddToListDropdown, setShowAddToListDropdown] = useState(false);
    const [addToListTab, setAddToListTab] = useState('Lists');
    const [addToListSearch, setAddToListSearch] = useState('');

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedContacts(contacts.map(c => c._id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedContacts.includes(id)) {
            setSelectedContacts(selectedContacts.filter(cId => cId !== id));
        } else {
            setSelectedContacts([...selectedContacts, id]);
        }
    };

    const isAllSelected = contacts.length > 0 && selectedContacts.length === contacts.length;

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to permanently delete ${selectedContacts.length} selected contacts? This action cannot be undone.`)) {
            try {
                setLoading(true);
                await Promise.all(selectedContacts.map(id => marketingAPI.deleteContact(id)));
                setSelectedContacts([]);
                await fetchInitialData();
            } catch (err) {
                console.error('Error deleting contacts:', err);
                setError('Failed to delete some contacts.');
                setLoading(false);
            }
        }
        setShowBulkActionsDropdown(false);
    };

    const handleCopySmsToWhatsapp = async () => {
        try {
            setLoading(true);
            await Promise.all(selectedContacts.map(id => {
                const contact = contacts.find(c => c._id === id);
                // Assuming phone or sms field exists and copying to whatsapp
                const numberToCopy = contact.sms || contact.phone; // Adjust based on actual data structure
                if (numberToCopy) {
                    return marketingAPI.updateContact(id, { whatsapp: numberToCopy });
                }
                return Promise.resolve();
            }));
            await fetchInitialData();
            // Optional: Show success toast
        } catch (err) {
            console.error('Error copying numbers:', err);
            setError('Failed to copy numbers for some contacts.');
            setLoading(false);
        }
        setShowBulkActionsDropdown(false);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [contactsData, listsData, segmentsData] = await Promise.all([
                marketingAPI.getContacts(),
                marketingAPI.getLists(),
                marketingAPI.getSegments()
            ]);
            setContacts(contactsData);
            setLists(listsData);
            setSegments(segmentsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load contacts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            try {
                const results = await marketingAPI.searchContacts(query);
                setContacts(results);
            } catch (err) {
                console.error('Search error:', err);
            }
        } else if (query.length === 0) {
            fetchInitialData();
        }
    };

    const handleFilterSelect = (type, item) => {
        if (type === 'all') {
            setActiveFilter({ type: 'all', id: null, name: 'All contacts' });
            fetchInitialData();
        } else {
            setActiveFilter({ type, id: item._id, name: item.name });
            // For now, just filter the existing list or fetch specific (if endpoint exists)
            // marketingAPI.getContactsByList(item._id) // if needed
            if (type === 'list') {
                const filtered = contacts.filter(c => item.contacts?.some(ic => ic._id === c._id));
                // setContacts(filtered); // This is local only, better to fetch from backend usually
            }
        }
        setShowDropdown(false);
    };

    const handleEmailClick = (contactId, e) => {
        e.preventDefault();
        // Select the contact
        setSelectedContacts([contactId]);
        // Open the dropdown
        setShowAddToListDropdown(true);
        // Switch to Segments tab
        setAddToListTab('Segments');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="contact-list-container">
            <header className="contact-header">
                {selectedContacts.length > 0 ? (
                    <div className="bulk-actions-header">
                        <div className="bulk-actions-left">
                            <div className="bulk-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={handleSelectAll} // Deselect all
                                    className="header-checkbox"
                                />
                            </div>

                            <div className="add-to-list-container">
                                <button
                                    className="btn-bulk-action"
                                    onClick={() => setShowAddToListDropdown(!showAddToListDropdown)}
                                >
                                    <List size={16} />
                                    <span>Add to a list(s)</span>
                                    {showAddToListDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {showAddToListDropdown && (
                                    <div className="add-to-list-dropdown">
                                        <div className="add-to-list-search">
                                            <Search size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search"
                                                value={addToListSearch}
                                                onChange={(e) => setAddToListSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="add-to-list-tabs">
                                            <div
                                                className={`add-to-list-tab ${addToListTab === 'Lists' ? 'active' : ''}`}
                                                onClick={() => setAddToListTab('Lists')}
                                            >
                                                <List size={16} />
                                                <span>Lists</span>
                                            </div>
                                            <div
                                                className={`add-to-list-tab ${addToListTab === 'Segments' ? 'active' : ''}`}
                                                onClick={() => setAddToListTab('Segments')}
                                            >
                                                <Zap size={16} />
                                                <span>Segments</span>
                                            </div>
                                        </div>

                                        <div className="add-to-list-items">
                                            {addToListTab === 'Lists' ? (
                                                lists.filter(l => l.name.toLowerCase().includes(addToListSearch.toLowerCase())).length > 0 ? (
                                                    lists.filter(l => l.name.toLowerCase().includes(addToListSearch.toLowerCase())).map(list => (
                                                        <div
                                                            key={list._id}
                                                            className="add-to-list-item"
                                                            onClick={async () => {
                                                                try {
                                                                    await marketingAPI.addContactsToList(list._id, selectedContacts);
                                                                    setShowAddToListDropdown(false);
                                                                    fetchInitialData();
                                                                } catch (err) {
                                                                    console.error('Error adding to list:', err);
                                                                }
                                                            }}
                                                        >
                                                            <Folder size={16} />
                                                            <span>{list.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="add-to-list-empty">No lists found</div>
                                                )
                                            ) : (
                                                segments.filter(s => s.name.toLowerCase().includes(addToListSearch.toLowerCase())).length > 0 ? (
                                                    segments.filter(s => s.name.toLowerCase().includes(addToListSearch.toLowerCase())).map(segment => (
                                                        <div
                                                            key={segment._id}
                                                            className="add-to-list-item"
                                                            onClick={async () => {
                                                                if (selectedContacts.length === 0) {
                                                                    alert("Please select at least one contact.");
                                                                    return;
                                                                }
                                                                try {
                                                                    await addContactsToSegment(segment._id, selectedContacts);
                                                                    setShowAddToListDropdown(false);
                                                                    setSelectedContacts([]);
                                                                    alert("Contacts added to segment successfully!");
                                                                    fetchInitialData();
                                                                } catch (err) {
                                                                    console.error('Error adding to segment:', err);
                                                                    alert("Failed to add contacts to segment.");
                                                                }
                                                            }}
                                                        >
                                                            <Folder size={16} />
                                                            <span>{segment.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="add-to-list-empty-state">
                                                        <div>No segments found</div>
                                                        <button
                                                            className="add-to-list-create-btn"
                                                            onClick={() => {
                                                                setShowAddToListDropdown(false);
                                                                navigate('/dashboard?tab=contacts&view=segments');
                                                            }}
                                                        >
                                                            <Plus size={14} />
                                                            <span>Create a new segment</span>
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="btn-bulk-action">
                                <Ban size={16} />
                                <span>Blocklist</span>
                            </button>

                            <div className="bulk-dropdown-container">
                                <button
                                    className="btn-bulk-action active-dropdown"
                                    onClick={() => setShowBulkActionsDropdown(!showBulkActionsDropdown)}
                                >
                                    <span>More actions</span>
                                    <ChevronDown size={16} />
                                </button>

                                {showBulkActionsDropdown && (
                                    <div className="bulk-dropdown-menu">
                                        <div className="dropdown-item">
                                            <Pencil size={14} />
                                            <span>Edit</span>
                                        </div>
                                        <div className="dropdown-item" onClick={handleCopySmsToWhatsapp}>
                                            <Copy size={14} />
                                            <span>Copy SMS number to WhatsApp</span>
                                        </div>
                                        <div className="dropdown-item">
                                            <Download size={14} />
                                            <span>Export</span>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item text-red" onClick={handleBulkDelete}>
                                            <Trash2 size={14} />
                                            <span>Delete permanently</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Create segment button clicked!');
                                    console.log('Selected contacts:', selectedContacts);

                                    // Store selected contacts in sessionStorage
                                    sessionStorage.setItem('preSelectedContacts', JSON.stringify(selectedContacts));
                                    sessionStorage.setItem('createSegment', 'true');

                                    // Verify sessionStorage was set
                                    console.log('SessionStorage set:');
                                    console.log('- preSelectedContacts:', sessionStorage.getItem('preSelectedContacts'));
                                    console.log('- createSegment:', sessionStorage.getItem('createSegment'));

                                    // Dispatch custom event to trigger segment creation
                                    window.dispatchEvent(new CustomEvent('createSegmentWithContacts', {
                                        detail: { contactIds: selectedContacts }
                                    }));

                                    // Navigate to create segment page (unique route)
                                    navigate('/dashboard?tab=contacts&view=create-segment', {
                                        state: {
                                            selectedContactIds: selectedContacts,
                                            createSegment: true
                                        }
                                    });
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#22a6a8',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                <Plus size={16} />
                                <span>Create segment</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="contact-title">Contacts</h1>
                        <div className="contact-header-actions">
                            <button className="btn-secondary" onClick={() => setShowAddModal(true)}>Create a contact</button>
                            <button className="btn-primary" onClick={() => setShowImportModal(true)}>Import contacts</button>
                        </div>
                    </>
                )}
            </header>

            {/* <div className="contact-filters-bar">
                <div className="filters-left">
                    <div className="dropdown-filter-container">
                        <div className="dropdown-filter" onClick={() => setShowDropdown(!showDropdown)}>
                            <span>{activeFilter.name}</span>
                            <ChevronDown size={16} />
                        </div>
                        {showDropdown && (
                            <div className="filter-dropdown-menu">
                                <div className="dropdown-item" onClick={() => handleFilterSelect('all')}>All contacts</div>
                                {lists.length > 0 && <div className="dropdown-header">Lists</div>}
                                {lists.map(list => (
                                    <div key={list._id} className="dropdown-item" onClick={() => handleFilterSelect('list', list)}>
                                        {list.name}
                                    </div>
                                ))}
                                {segments.length > 0 && <div className="dropdown-header">Segments</div>}
                                {segments.map(segment => (
                                    <div key={segment._id} className="dropdown-item" onClick={() => handleFilterSelect('segment', segment)}>
                                        {segment.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="dropdown-filter">
                        <span>Add filter</span>
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div> */}

            <div className="contact-content-card">
                <div className="contact-table-header">
                    <div className="contact-count">
                        <span>{contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}</span>
                        <Info size={14} className="info-icon" />
                    </div>
                    <div className="table-actions">
                        <button className="btn-text" onClick={() => setShowCustomizeModal(true)}>
                            <Settings2 size={16} />
                            <span>Customize columns</span>
                        </button>
                        <div className="contact-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" size={32} />
                            <p>Loading contacts...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button onClick={fetchInitialData} className="btn-secondary">Retry</button>
                        </div>
                    ) : (
                        <table className="contact-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-col sticky-left">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="sticky-left name-col">CONTACT</th>
                                    {visibleColumns.includes('marketing_consent') && <th className="subscribed-col">SUBSCRIBED</th>}
                                    {visibleColumns.includes('is_bounced') && <th className="blocklisted-col">BLOCKLISTED</th>}
                                    {visibleColumns.includes('email') && <th className="email-col">EMAIL</th>}
                                    {visibleColumns.includes('whatsapp') && <th className="whatsapp-col">WHATSAPP</th>}
                                    {visibleColumns.includes('updatedAt') && <th className="last-channel-col">LAST CHAN...</th>}
                                    {visibleColumns.includes('createdAt') && <th className="creation-col">CREATION ...</th>}
                                    {visibleColumns.includes('phone') && <th className="phone-col">PHONE</th>}
                                    {visibleColumns.includes('firstName') && <th className="name-col">FIRST NAME</th>}
                                    {visibleColumns.includes('lastName') && <th className="name-col">LAST NAME</th>}
                                    {visibleColumns.includes('sms') && <th className="sms-col">SMS</th>}
                                    {visibleColumns.includes('companies') && <th className="name-col">COMPANIES</th>}
                                    {visibleColumns.includes('linkedin') && <th className="name-col">LINKEDIN</th>}
                                    {visibleColumns.includes('job_title') && <th className="name-col">JOB TITLE</th>}
                                    {visibleColumns.includes('timezone') && <th className="name-col">TIMEZONE</th>}
                                    {visibleColumns.includes('ext_id') && <th className="name-col">EXT ID</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const paginatedContacts = contacts.slice(
                                        (currentPage - 1) * rowsPerPage,
                                        currentPage * rowsPerPage
                                    );
                                    return paginatedContacts.length > 0 ? (
                                        paginatedContacts.map((contact) => (
                                            <tr key={contact._id} className={selectedContacts.includes(contact._id) ? 'selected-row' : ''}>
                                                <td className="sticky-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.includes(contact._id)}
                                                        onChange={() => handleSelectOne(contact._id)}
                                                    />
                                                </td>
                                                <td className="sticky-left name-col">
                                                    <div className="contact-name-cell">
                                                        <a href="#" className="contact-name-link">
                                                            {contact.firstName || contact.lastName
                                                                ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
                                                                : contact.email.split('@')[0]}
                                                        </a>
                                                    </div>
                                                </td>
                                                {visibleColumns.includes('marketing_consent') && (
                                                    <td className="subscribed-col">
                                                        <div className="subscription-badges">
                                                            {contact.marketing_consent && (
                                                                <span className="badge-sub">
                                                                    <Mail size={12} />
                                                                    Email
                                                                </span>
                                                            )}
                                                            {/* {contact.whatsapp && (
                                                                <span className="badge-sub">
                                                                    <MessageSquare size={12} />
                                                                    WhatsApp
                                                                </span>
                                                            )} */}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('is_bounced') && <td className="blocklisted-col">{contact.is_bounced ? 'Yes' : '-'}</td>}
                                                {visibleColumns.includes('email') && (
                                                    <td className="email-col">
                                                        <a
                                                            href="#"
                                                            onClick={(e) => handleEmailClick(contact._id, e)}
                                                            style={{ color: '#2563eb', textDecoration: 'none', cursor: 'pointer' }}
                                                        >
                                                            {contact.email}
                                                        </a>
                                                    </td>
                                                )}
                                                {visibleColumns.includes('whatsapp') && <td className="whatsapp-col">{contact.whatsapp || '-'}</td>}
                                                {visibleColumns.includes('updatedAt') && <td className="last-channel-col">{formatDate(contact.updatedAt)}</td>}
                                                {visibleColumns.includes('createdAt') && <td className="creation-col">{formatDate(contact.createdAt)}</td>}
                                                {visibleColumns.includes('phone') && <td className="phone-col">{contact.phone || '-'}</td>}
                                                {visibleColumns.includes('firstName') && <td className="name-col">{contact.firstName || '-'}</td>}
                                                {visibleColumns.includes('lastName') && <td className="name-col">{contact.lastName || '-'}</td>}
                                                {visibleColumns.includes('sms') && <td className="sms-col">{contact.sms || '-'}</td>}
                                                {visibleColumns.includes('companies') && <td className="name-col">{contact.companies || '-'}</td>}
                                                {visibleColumns.includes('linkedin') && <td className="name-col">{contact.linkedin || '-'}</td>}
                                                {visibleColumns.includes('job_title') && <td className="name-col">{contact.jobTitle || '-'}</td>}
                                                {visibleColumns.includes('timezone') && <td className="name-col">{contact.timezone || '-'}</td>}
                                                {visibleColumns.includes('ext_id') && <td className="name-col">{contact.ext_id || '-'}</td>}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="empty-table">
                                                No contacts found
                                            </td>
                                        </tr>
                                    );
                                })()}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="contact-pagination">
                    <div className="pagination-info">
                        {/* Rows per page dropdown */}
                        <div className="rows-per-page" style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowRowsDropdown(!showRowsDropdown)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            >
                                <span>{rowsPerPage}</span>
                                <ChevronDown size={14} />
                            </div>
                            {showRowsDropdown && (
                                <div className="pagination-dropdown" style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    minWidth: '80px',
                                    marginBottom: '4px'
                                }}>
                                    {[10, 20, 50, 100].map(num => (
                                        <div
                                            key={num}
                                            onClick={() => { setRowsPerPage(num); setShowRowsDropdown(false); setCurrentPage(1); }}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                backgroundColor: rowsPerPage === num ? '#f3f4f6' : '#fff',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = rowsPerPage === num ? '#f3f4f6' : '#fff'}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <span>Rows per page</span>
                        </div>

                        {/* Page range display */}
                        <div className="page-range">
                            {Math.min((currentPage - 1) * rowsPerPage + 1, contacts.length)}-{Math.min(currentPage * rowsPerPage, contacts.length)} of {contacts.length}
                        </div>

                        {/* Pages dropdown */}
                        <div className="page-selector" style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowPagesDropdown(!showPagesDropdown)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            >
                                <span>{currentPage}</span>
                                <ChevronDown size={14} />
                            </div>
                            {showPagesDropdown && (
                                <div className="pagination-dropdown" style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    minWidth: '60px',
                                    marginBottom: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {Array.from({ length: Math.ceil(contacts.length / rowsPerPage) || 1 }, (_, i) => i + 1).map(pageNum => (
                                        <div
                                            key={pageNum}
                                            onClick={() => { setCurrentPage(pageNum); setShowPagesDropdown(false); }}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                backgroundColor: currentPage === pageNum ? '#f3f4f6' : '#fff',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = currentPage === pageNum ? '#f3f4f6' : '#fff'}
                                        >
                                            {pageNum}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <span>of {Math.ceil(contacts.length / rowsPerPage) || 1} pages</span>
                        </div>

                        {/* Navigation arrows */}
                        <div className="pagination-arrows">
                            <ChevronLeft
                                size={18}
                                className={currentPage === 1 ? 'disabled' : ''}
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            />
                            <ChevronRight
                                size={18}
                                className={currentPage >= Math.ceil(contacts.length / rowsPerPage) ? 'disabled' : ''}
                                onClick={() => currentPage < Math.ceil(contacts.length / rowsPerPage) && setCurrentPage(currentPage + 1)}
                                style={{ cursor: currentPage >= Math.ceil(contacts.length / rowsPerPage) ? 'not-allowed' : 'pointer' }}
                            />
                        </div>
                    </div>
                </div>

            </div>

            <AddContactModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchInitialData}
            />

            <ImportDataModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onContinue={(option) => {
                    setShowImportModal(false);
                    if (option === 'contacts') {
                        navigate('/dashboard?tab=contacts&view=import');
                    } else if (option === 'companies') {
                        navigate('/dashboard?tab=contacts&view=import-companies');
                    }
                }}
            />

            <CustomizeColumnsModal
                isOpen={showCustomizeModal}
                onClose={() => setShowCustomizeModal(false)}
                currentColumns={visibleColumns}
                onSave={setVisibleColumns}
            />
        </div>
    );
};

export default ContactList;

