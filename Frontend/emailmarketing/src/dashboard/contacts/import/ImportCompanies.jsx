
import React, { useState, useRef, useEffect } from 'react';
import { CloudUpload, Lock, HelpCircle, X, Loader2, Check, RotateCcw, CheckCircle, ExternalLink, Search, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import QuitImportModal from './QuitImportModal';
import { marketingAPI } from '../../../services/marketing.services';
import './importcompanies.css';

// Available company attributes for mapping
const COMPANY_ATTRIBUTES = [
    { value: 'do_not_import', label: 'Do not import' },
    { value: 'company_name', label: 'COMPANY NAME' },
    { value: 'email', label: 'EMAIL' },
    { value: 'phone', label: 'PHONE' },
    { value: 'website', label: 'WEBSITE' },
    { value: 'industry', label: 'INDUSTRY' },
    { value: 'address', label: 'ADDRESS' },
    { value: 'city', label: 'CITY' },
    { value: 'state', label: 'STATE' },
    { value: 'country', label: 'COUNTRY' },
    { value: 'postal_code', label: 'POSTAL CODE' },
    { value: 'linkedin', label: 'LINKEDIN' },
    { value: 'employee_count', label: 'EMPLOYEE COUNT' },
    { value: 'revenue', label: 'REVENUE' },
    { value: 'notes', label: 'NOTES' },
];

// Country codes for phone fields
const COUNTRY_CODES = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+971', country: 'UAE' },
    { code: '+61', country: 'Australia' },
    { code: '+86', country: 'China' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
];

// 250MB file size limit
const MAX_FILE_SIZE = 250 * 1024 * 1024;

const ImportCompanies = () => {
    const navigate = useNavigate();
    const [showQuitModal, setShowQuitModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [fileUploaded, setFileUploaded] = useState(false);
    const [fileConfirmed, setFileConfirmed] = useState(false);
    const [mappingConfirmed, setMappingConfirmed] = useState(false);
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // Mapping state
    const [columnMappings, setColumnMappings] = useState({});

    // Step 3: Select a list state
    const [listTab, setListTab] = useState('select');
    const [lists, setLists] = useState([]);
    const [selectedLists, setSelectedLists] = useState([]);
    const [listSearchQuery, setListSearchQuery] = useState('');
    const [newListName, setNewListName] = useState('');
    const [newListFolder, setNewListFolder] = useState('Your First Folder');

    useEffect(() => {
        if (mappingConfirmed) {
            fetchLists();
        }
    }, [mappingConfirmed]);

    const fetchLists = async () => {
        try {
            const listsData = await marketingAPI.getLists();
            setLists(listsData || []);
        } catch (error) {
            console.error('Error fetching lists:', error);
        }
    };

    const handleClose = () => {
        setShowQuitModal(true);
    };

    const confirmClose = () => {
        setShowQuitModal(false);
        navigate('/dashboard?tab=contacts&view=list');
    };

    const validateFile = (file) => {
        const allowedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            return { valid: false, error: 'Invalid file type. Please upload a .csv, .xlsx or .txt file.' };
        }

        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size exceeds 250MB limit. Please upload a smaller file.' };
        }

        return { valid: true, error: null };
    };

    // Auto-suggest mapping based on header name
    const suggestMapping = (header) => {
        const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (lowerHeader.includes('company') && lowerHeader.includes('name')) return 'company_name';
        if (lowerHeader.includes('companyname')) return 'company_name';
        if (lowerHeader.includes('name') && !lowerHeader.includes('first') && !lowerHeader.includes('last')) return 'company_name';
        if (lowerHeader.includes('email')) return 'email';
        if (lowerHeader.includes('phone') || lowerHeader.includes('telephone')) return 'phone';
        if (lowerHeader.includes('website') || lowerHeader.includes('url')) return 'website';
        if (lowerHeader.includes('industry') || lowerHeader.includes('sector')) return 'industry';
        if (lowerHeader.includes('address')) return 'address';
        if (lowerHeader.includes('city')) return 'city';
        if (lowerHeader.includes('state') || lowerHeader.includes('province')) return 'state';
        if (lowerHeader.includes('country')) return 'country';
        if (lowerHeader.includes('postal') || lowerHeader.includes('zip')) return 'postal_code';
        if (lowerHeader.includes('linkedin')) return 'linkedin';
        if (lowerHeader.includes('employee') || lowerHeader.includes('size')) return 'employee_count';
        if (lowerHeader.includes('revenue')) return 'revenue';
        if (lowerHeader.includes('note')) return 'notes';
        return 'do_not_import';
    };

    const processFile = async (file) => {
        setIsProcessing(true);
        setUploadError(null);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                setUploadError("File is empty.");
                setIsProcessing(false);
                return;
            }

            const fileHeaders = jsonData[0].map(h => String(h).trim());

            // Validate: Check if file contains at least company name or email
            const requiredIdentifiers = ['company', 'name', 'email', 'phone'];
            const lowerHeaders = fileHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const hasValidIdentifier = requiredIdentifiers.some(id =>
                lowerHeaders.some(header => header.includes(id))
            );

            if (!hasValidIdentifier) {
                setUploadError("There must be a valid company name or email in the file you uploaded.");
                setIsProcessing(false);
                return;
            }

            const rows = jsonData.slice(1).map(row => {
                const rowData = {};
                fileHeaders.forEach((header, index) => {
                    rowData[header] = row[index];
                });
                return rowData;
            });

            if (rows.length === 0) {
                setUploadError("No data rows found.");
                setIsProcessing(false);
                return;
            }

            // Initialize mappings with auto-suggestions
            const initialMappings = {};
            fileHeaders.forEach(header => {
                initialMappings[header] = {
                    attribute: suggestMapping(header),
                    countryCode: '+91'
                };
            });

            setHeaders(fileHeaders);
            setParsedData(rows);
            setColumnMappings(initialMappings);
            setFileUploaded(true);
        } catch (error) {
            console.error("Error parsing file:", error);
            setUploadError("Failed to parse file. Please ensure it is a valid CSV or Excel file.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFile = (file) => {
        const validation = validateFile(file);
        if (validation.valid) {
            setSelectedFile(file);
            processFile(file);
        } else {
            setUploadError(validation.error);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleEdit = () => {
        setFileConfirmed(false);
    };

    const handleDeleteFile = () => {
        setSelectedFile(null);
        setFileUploaded(false);
        setFileConfirmed(false);
        setParsedData([]);
        setHeaders([]);
        setColumnMappings({});
        setUploadError(null);
    };

    const handleConfirmFile = () => {
        setFileConfirmed(true);
    };

    const updateMapping = (header, attribute) => {
        setColumnMappings(prev => ({
            ...prev,
            [header]: { ...prev[header], attribute }
        }));
    };

    const updateCountryCode = (header, countryCode) => {
        setColumnMappings(prev => ({
            ...prev,
            [header]: { ...prev[header], countryCode }
        }));
    };

    const resetMappings = () => {
        const resetMappings = {};
        headers.forEach(header => {
            resetMappings[header] = {
                attribute: suggestMapping(header),
                countryCode: '+91'
            };
        });
        setColumnMappings(resetMappings);
    };

    const getSampleData = (header) => {
        return parsedData.slice(0, 2).map(row => row[header]).filter(Boolean);
    };

    const applyCountryCodeToData = (value, countryCode) => {
        if (!value) return value;
        const strValue = String(value).trim();
        if (strValue.startsWith('+')) return strValue;
        return countryCode + strValue;
    };

    const handleConfirmMapping = () => {
        const mappedCount = getMappedCount();
        if (mappedCount === 0) {
            setUploadError("Please map at least one column.");
            return;
        }
        setMappingConfirmed(true);
    };

    const toggleListSelection = (listId) => {
        setSelectedLists(prev =>
            prev.includes(listId)
                ? prev.filter(id => id !== listId)
                : [...prev, listId]
        );
    };

    const handleCreateList = async () => {
        if (!newListName.trim()) {
            setUploadError("Please enter a list name.");
            return;
        }
        setIsProcessing(true);
        try {
            const newList = await marketingAPI.createList({ name: newListName.trim(), folder: newListFolder });
            if (newList && newList._id) {
                setSelectedLists([newList._id]);
                setLists(prev => [...prev, newList]);
                setListTab('select');
                setNewListName('');
            }
        } catch (error) {
            console.error('Error creating list:', error);
            setUploadError("Failed to create list.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmList = async () => {
        setIsProcessing(true);
        setUploadError(null);
        try {
            const mappedCompanies = parsedData.map(row => {
                const company = {};
                headers.forEach(header => {
                    const mapping = columnMappings[header];
                    if (mapping && mapping.attribute !== 'do_not_import') {
                        let value = row[header];
                        if (mapping.attribute === 'phone' && value) {
                            value = applyCountryCodeToData(value, mapping.countryCode);
                        }
                        company[mapping.attribute] = value;
                    }
                });
                if (selectedLists.length > 0) {
                    company.lists = selectedLists;
                }
                return company;
            }).filter(c => c.company_name || c.email);

            if (mappedCompanies.length === 0) {
                setUploadError("No valid companies found to import.");
                setIsProcessing(false);
                return;
            }

            // Use the same import API as contacts (can be updated later for companies-specific API)
            await marketingAPI.importContacts(mappedCompanies);
            navigate('/dashboard?tab=contacts&view=list');
        } catch (error) {
            console.error("Import error:", error);
            setUploadError("Failed to import companies. Please try again.");
            setIsProcessing(false);
        }
    };

    const filteredLists = lists.filter(list =>
        list.name?.toLowerCase().includes(listSearchQuery.toLowerCase())
    );

    const getMappedCount = () => {
        return Object.values(columnMappings).filter(m => m.attribute !== 'do_not_import').length;
    };

    const getSkippedCount = () => {
        return Object.values(columnMappings).filter(m => m.attribute === 'do_not_import').length;
    };

    const isPhoneField = (attribute) => attribute === 'phone';

    return (
        <div className="import-companies-container" style={{ maxWidth: fileUploaded ? '1000px' : '700px', transition: 'max-width 0.3s' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, marginBottom: '8px', color: '#111827' }}>
                        Import companies
                    </h1>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                        Upload a file containing all your companies and their information. This is particularly useful when you have a large number of companies to import.
                    </p>
                    <a href="#" style={{ color: '#059669', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        Learn more on how to import your companies to Retner
                        <ExternalLink size={12} />
                    </a>
                </div>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Step 1: Upload a file */}
            <div style={{ marginBottom: '32px' }}>
                {!fileUploaded ? (
                    <>
                        {/* Step 1 with upload zone */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '14px', fontWeight: '600' }}>1</div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Upload your file</span>
                        </div>
                        <div style={{ paddingLeft: '36px' }}>
                            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
                                Select a file containing your companies to import.
                            </p>

                            <div className="file-links" style={{ marginBottom: '16px', display: 'flex', gap: '24px' }}>
                                <a href="/CSV_Sample.csv" download="companies_sample.csv" style={{ textDecoration: 'none', color: '#059669', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <HelpCircle size={14} />
                                    Download a sample file
                                </a>
                                <span style={{ color: '#059669', fontSize: '14px', cursor: 'pointer' }}>Read the tutorial</span>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileSelect}
                                style={{ display: 'none' }}
                                accept=".csv,.xlsx,.xls,.txt"
                            />

                            {uploadError && (
                                <div style={{
                                    backgroundColor: '#fee2e2',
                                    border: '1px dashed #f87171',
                                    borderRadius: '4px',
                                    padding: '14px 16px',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    color: '#b91c1c',
                                    fontSize: '14px'
                                }}>
                                    <span>{uploadError}</span>
                                    <button onClick={() => setUploadError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>×</button>
                                </div>
                            )}

                            <div
                                className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                                onClick={triggerFileInput}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                style={{
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '8px',
                                    padding: '48px 24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isDragging ? '#ecfdf5' : '#f9fafb',
                                    transition: 'all 0.2s',
                                    ...(isDragging ? { borderColor: '#059669' } : {})
                                }}
                            >
                                {isProcessing ? (
                                    <Loader2 size={48} className="animate-spin" style={{ color: '#059669', margin: '0 auto' }} />
                                ) : (
                                    <>
                                        <CloudUpload size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                                        <p style={{ margin: 0, fontSize: '16px', color: '#374151', fontWeight: '500' }}>Select your file or drag and drop it here</p>
                                        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#9ca3af' }}>Up to 250 MB</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#9ca3af' }}>.csv, .xlsx or .txt</p>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                                <Lock size={14} />
                                <span>
                                    We don't sell, rent or use your database for any commercial purposes. <Link to="/privacy-policy" style={{ color: '#059669', textDecoration: 'underline' }}>Read our Privacy Policy</Link>
                                </span>
                            </div>
                        </div>

                        {/* Inactive Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', opacity: 0.5 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>2</div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>Mapping data</span>
                        </div>

                        {/* Inactive Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', opacity: 0.5 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>3</div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>Finalize your import</span>
                        </div>
                    </>
                ) : !fileConfirmed ? (
                    /* Step 1: File uploaded - Show preview with Confirm button */
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '14px', fontWeight: '600' }}>1</div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Upload your file</span>
                        </div>
                        <div style={{ paddingLeft: '36px' }}>
                            <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
                                Select a file containing your companies to import.
                            </p>

                            {/* Uploaded file box */}
                            <div style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ color: '#059669', fontWeight: '500', marginBottom: '4px' }}>Uploaded file</div>
                                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedFile?.name}</div>
                                </div>
                                <button
                                    onClick={handleDeleteFile}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Delete file
                                </button>
                            </div>

                            {/* Preview Table */}
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>Preview of your file</h3>
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                                            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f3f4f6', zIndex: 10 }}>
                                                <tr>
                                                    {headers.map((header, idx) => (
                                                        <th key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedData.slice(0, 10).map((row, rIdx) => (
                                                    <tr key={rIdx} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                                                        {headers.map((header, cIdx) => (
                                                            <td key={cIdx} style={{ padding: '12px 16px', color: '#374151', whiteSpace: 'nowrap' }}>
                                                                {row[header] !== undefined ? String(row[header]) : ''}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {parsedData.length > 10 && (
                                        <div style={{ padding: '8px 16px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                                            Showing first 10 rows of {parsedData.length} records
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={handleConfirmFile}
                                    style={{
                                        backgroundColor: '#111827',
                                        color: '#fff',
                                        padding: '10px 24px',
                                        borderRadius: '6px',
                                        fontWeight: '500',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Confirm your file
                                </button>
                            </div>
                        </div>

                        {/* Inactive Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', opacity: 0.5 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>2</div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>Mapping data</span>
                        </div>

                        {/* Inactive Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', opacity: 0.5 }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>3</div>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>Finalize your import</span>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Completed Step 1 - File confirmed */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <CheckCircle size={24} style={{ color: '#059669', marginTop: '2px' }} />
                                <div>
                                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#059669' }}>Upload a file</span>
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                                        {selectedFile?.name}: {parsedData.length} lines and {headers.length} columns
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleEdit}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    textDecoration: 'underline'
                                }}
                            >
                                Edit
                            </button>
                        </div>

                        {/* Step 2: Mapping data */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '14px', fontWeight: '600' }}>2</div>
                                <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Mapping data</span>
                            </div>
                            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px', paddingLeft: '36px' }}>
                                Select the company attribute that corresponds to your data. You can select existing attributes or choose not to import some data.
                            </p>
                        </div>

                        {/* Mapping Table Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 200px 1fr 80px', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px 8px 0 0', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                            <span>File Header</span>
                            <span>Data</span>
                            <span>Company Attribute</span>
                            <span style={{ textAlign: 'center' }}>Mapped</span>
                        </div>

                        {/* Mapping Rows */}
                        <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', marginBottom: '24px' }}>
                            {headers.map((header, idx) => {
                                const mapping = columnMappings[header] || { attribute: 'do_not_import', countryCode: '+91' };
                                const sampleData = getSampleData(header);
                                const isMapped = mapping.attribute !== 'do_not_import';
                                const showCountryCode = isPhoneField(mapping.attribute);

                                return (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '150px 200px 1fr 80px',
                                            padding: '16px',
                                            borderBottom: idx < headers.length - 1 ? '1px solid #e5e7eb' : 'none',
                                            alignItems: 'center',
                                            backgroundColor: isMapped ? '#f0fdf4' : '#fff',
                                            borderLeft: isMapped ? '3px solid #059669' : '3px solid transparent'
                                        }}
                                    >
                                        {/* File Header */}
                                        <div style={{ fontWeight: '600', color: '#059669', fontSize: '13px' }}>
                                            {header}
                                        </div>

                                        {/* Sample Data */}
                                        <div style={{ fontSize: '13px', color: '#059669' }}>
                                            {sampleData.map((val, i) => (
                                                <div key={i}>{String(val)}</div>
                                            ))}
                                        </div>

                                        {/* Company Attribute Dropdown + Country Code */}
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <select
                                                value={mapping.attribute}
                                                onChange={(e) => updateMapping(header, e.target.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #d1d5db',
                                                    fontSize: '14px',
                                                    minWidth: '180px',
                                                    backgroundColor: '#fff',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {COMPANY_ATTRIBUTES.map(attr => (
                                                    <option key={attr.value} value={attr.value}>{attr.label}</option>
                                                ))}
                                            </select>

                                            {showCountryCode && (
                                                <select
                                                    value={mapping.countryCode}
                                                    onChange={(e) => updateCountryCode(header, e.target.value)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #d1d5db',
                                                        fontSize: '14px',
                                                        minWidth: '120px',
                                                        backgroundColor: '#fff',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {COUNTRY_CODES.map(cc => (
                                                        <option key={cc.code} value={cc.code}>{cc.country}: {cc.code}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {/* Mapped Status */}
                                        <div style={{ textAlign: 'center' }}>
                                            {isMapped && (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#059669',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Check size={14} color="#fff" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                To import: <strong style={{ color: '#059669' }}>{getMappedCount()} columns</strong> | Ignored: {getSkippedCount()} columns
                            </div>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {uploadError && !mappingConfirmed && (
                                    <span style={{ color: '#ef4444', fontSize: '14px' }}>{uploadError}</span>
                                )}
                                <button
                                    onClick={resetMappings}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '14px'
                                    }}
                                >
                                    <RotateCcw size={14} />
                                    Reset mapping
                                </button>
                                {!mappingConfirmed && (
                                    <button
                                        onClick={handleConfirmMapping}
                                        style={{
                                            backgroundColor: '#111827',
                                            color: '#fff',
                                            padding: '10px 24px',
                                            borderRadius: '6px',
                                            fontWeight: '500',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Confirm mapping
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Finalize import */}
                        {!mappingConfirmed ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', opacity: 0.5 }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', fontWeight: '600' }}>3</div>
                                <span style={{ fontSize: '16px', fontWeight: '500', color: '#6b7280' }}>Finalize your import</span>
                            </div>
                        ) : (
                            <div style={{ marginTop: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: '14px', fontWeight: '600' }}>3</div>
                                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Finalize your import</span>
                                </div>

                                {/* Tabs */}
                                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb' }}>
                                    <button
                                        onClick={() => setListTab('select')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            paddingBottom: '12px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            color: listTab === 'select' ? '#111827' : '#6b7280',
                                            borderBottom: listTab === 'select' ? '2px solid #059669' : '2px solid transparent',
                                            marginBottom: '-2px'
                                        }}
                                    >
                                        Select a list
                                    </button>
                                    <button
                                        onClick={() => setListTab('create')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            paddingBottom: '12px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            color: listTab === 'create' ? '#111827' : '#6b7280',
                                            borderBottom: listTab === 'create' ? '2px solid #059669' : '2px solid transparent',
                                            marginBottom: '-2px'
                                        }}
                                    >
                                        Create a list
                                    </button>
                                </div>

                                {listTab === 'select' ? (
                                    <>
                                        {/* Search and Filter */}
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                                            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Search a list or folder"
                                                    value={listSearchQuery}
                                                    onChange={(e) => setListSearchQuery(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px 8px 36px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '4px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '14px', color: '#6b7280' }}>All folders</span>
                                                <ChevronDown size={16} style={{ color: '#6b7280' }} />
                                            </div>
                                            <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#059669' }}>
                                                {selectedLists.length} selected list
                                            </div>
                                        </div>

                                        {/* Lists Table */}
                                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                <thead style={{ backgroundColor: '#f9fafb' }}>
                                                    <tr>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', width: '40px' }}></th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>ID</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>List name</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>Folder</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>No. of contacts</th>
                                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600' }}>Created at</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredLists.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                                                No lists found. Create a new list.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredLists.map((list, idx) => (
                                                            <tr
                                                                key={list._id}
                                                                style={{
                                                                    borderTop: '1px solid #e5e7eb',
                                                                    backgroundColor: selectedLists.includes(list._id) ? '#f0fdf4' : '#fff',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => toggleListSelection(list._id)}
                                                            >
                                                                <td style={{ padding: '12px 16px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedLists.includes(list._id)}
                                                                        onChange={() => { }}
                                                                        style={{ cursor: 'pointer' }}
                                                                    />
                                                                </td>
                                                                <td style={{ padding: '12px 16px', color: '#374151' }}>#{idx + 1}</td>
                                                                <td style={{ padding: '12px 16Epx', color: '#374151', fontWeight: '500' }}>{list.name}</td>
                                                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{list.folder || 'Your First Folder'}</td>
                                                                <td style={{ padding: '12px 16px', color: '#374151' }}>{list.contacts?.length || 0}</td>
                                                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                                                                    {list.createdAt ? new Date(list.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Confirm Button */}
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ fontSize: '14px', color: '#059669' }}>{selectedLists.length} list selected</span>
                                            <button
                                                onClick={handleConfirmList}
                                                disabled={isProcessing || selectedLists.length === 0}
                                                style={{
                                                    backgroundColor: selectedLists.length === 0 ? '#9ca3af' : '#111827',
                                                    color: '#fff',
                                                    padding: '10px 24px',
                                                    borderRadius: '6px',
                                                    fontWeight: '500',
                                                    border: 'none',
                                                    cursor: (isProcessing || selectedLists.length === 0) ? 'not-allowed' : 'pointer',
                                                    opacity: isProcessing ? 0.7 : 1
                                                }}
                                            >
                                                {isProcessing ? (
                                                    <><Loader2 size={16} className="animate-spin" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Importing...</>
                                                ) : (
                                                    'Confirm your import'
                                                )}
                                            </button>
                                        </div>
                                        {uploadError && mappingConfirmed && (
                                            <div style={{ textAlign: 'center', marginTop: '12px', color: '#ef4444', fontSize: '14px' }}>{uploadError}</div>
                                        )}
                                    </>
                                ) : (
                                    /* Create a list tab */
                                    <div style={{ maxWidth: '400px' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>List name</label>
                                            <input
                                                type="text"
                                                placeholder="List name"
                                                value={newListName}
                                                onChange={(e) => setNewListName(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '14px' }}>Folder</label>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={newListFolder}
                                                    onChange={(e) => setNewListFolder(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '4px',
                                                        fontSize: '14px',
                                                        appearance: 'none',
                                                        backgroundColor: '#fff',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="Your First Folder">Your First Folder</option>
                                                    <option value="Marketing">Marketing</option>
                                                    <option value="Sales">Sales</option>
                                                </select>
                                                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCreateList}
                                            disabled={isProcessing}
                                            style={{
                                                backgroundColor: '#111827',
                                                color: '#fff',
                                                padding: '10px 24px',
                                                borderRadius: '6px',
                                                fontWeight: '500',
                                                border: 'none',
                                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                opacity: isProcessing ? 0.7 : 1
                                            }}
                                        >
                                            {isProcessing ? 'Creating...' : 'Create list'}
                                        </button>
                                        {uploadError && (
                                            <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px' }}>{uploadError}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <QuitImportModal
                isOpen={showQuitModal}
                onClose={() => setShowQuitModal(false)}
                onConfirm={confirmClose}
            />
        </div>
    );
};

export default ImportCompanies;
