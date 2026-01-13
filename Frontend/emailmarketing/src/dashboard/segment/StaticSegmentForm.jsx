import React, { useState, useRef } from 'react';
import { CloudUpload, X, CheckCircle, RotateCcw, ChevronRight, Loader2, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createSegment as createSegmentAPI, addContactsToSegment } from '../../services/segment.services';
import { marketingAPI } from '../../services/marketing.services';
import { useNavigate } from 'react-router-dom';

// Reusing constants from ImportSegmentLeads - ideal to extract to a shared config but defining here for speed
const CONTACT_ATTRIBUTES = [
    { value: 'do_not_import', label: 'Do not import' },
    { value: 'email', label: 'EMAIL' },
    { value: 'firstName', label: 'FIRSTNAME' },
    { value: 'lastName', label: 'LASTNAME' },
    { value: 'whatsapp', label: 'WHATSAPP' },
    { value: 'phone', label: 'PHONE' },
    { value: 'sms', label: 'SMS' },
    { value: 'marketing_consent', label: 'MARKETING_CONSENT' },
    { value: 'ext_id', label: 'EXT_ID' },
    { value: 'companies', label: 'COMPANIES' },
    { value: 'job_title', label: 'JOB_TITLE' },
    { value: 'linkedin', label: 'LINKEDIN' },
    { value: 'timezone', label: 'TIMEZONE' },
];

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

const StaticSegmentForm = ({ segmentName, preSelectedContactIds, onSuccess, onCancel }) => {
    const [step, setStep] = useState('upload'); // 'upload' | 'mapping'
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Data state
    const [parsedData, setParsedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [columnMappings, setColumnMappings] = useState({});

    // Check sessionStorage for pre-selected contacts
    const storedContacts = sessionStorage.getItem('preSelectedContacts');
    const initialContacts = storedContacts ? JSON.parse(storedContacts) : (preSelectedContactIds || []);

    const [usePreSelectedContacts, setUsePreSelectedContacts] = useState(
        initialContacts && initialContacts.length > 0
    );
    const [contactIds, setContactIds] = useState(initialContacts);

    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        const allowedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
        const extension = file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension) && file.size <= 10 * 1024 * 1024; // 10MB limit
    };

    const suggestMapping = (header) => {
        const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (lowerHeader.includes('email')) return 'email';
        if (lowerHeader.includes('first') && lowerHeader.includes('name')) return 'firstName';
        if (lowerHeader.includes('last') && lowerHeader.includes('name')) return 'lastName';
        if (lowerHeader.includes('whatsapp')) return 'whatsapp';
        if (lowerHeader.includes('phone') || lowerHeader.includes('telephone')) return 'phone';
        if (lowerHeader === 'sms') return 'sms';
        if (lowerHeader.includes('marketing') || lowerHeader.includes('consent')) return 'marketing_consent';
        if (lowerHeader.includes('ext') && lowerHeader.includes('id')) return 'ext_id';
        if (lowerHeader.includes('compan')) return 'companies';
        if (lowerHeader.includes('job') || lowerHeader.includes('title')) return 'job_title';
        if (lowerHeader.includes('linkedin')) return 'linkedin';
        if (lowerHeader.includes('timezone')) return 'timezone';
        return 'do_not_import';
    };

    const processFile = async (file) => {
        setProcessing(true);
        setError(null);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                setError("File is empty.");
                setProcessing(false);
                return;
            }

            const fileHeaders = jsonData[0].map(h => String(h).trim());
            const requiredIdentifiers = ['email', 'phone', 'telephone', 'contact_id', 'ext_id', 'external_id', 'whatsapp', 'sms'];
            const lowerHeaders = fileHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const hasValidIdentifier = requiredIdentifiers.some(id =>
                lowerHeaders.some(header => header.includes(id.replace(/_/g, '')))
            );

            if (!hasValidIdentifier) {
                setError("There must be a valid contact id, email, telephone number or external id in the file you uploaded.");
                setProcessing(false);
                return;
            }

            const rows = jsonData.slice(1).map(row => {
                const rowData = {};
                fileHeaders.forEach((header, index) => {
                    rowData[header] = row[index];
                });
                return rowData;
            });

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
        } catch (err) {
            console.error("Error parsing file:", err);
            setError("Failed to parse file. Please ensure it is a valid CSV or Excel file.");
        } finally {
            setProcessing(false);
        }
    };

    const handleFileSelect = (file) => {
        if (validateFile(file)) {
            setSelectedFile(file);
            processFile(file);
        } else {
            setError('Invalid file type or size. Max 10MB, .csv, .xlsx, .xls allowed.');
        }
    };

    const handleContinue = () => {
        if (!segmentName.trim()) {
            alert("Please enter a segment name.");
            return;
        }
        if (!selectedFile || parsedData.length === 0) {
            setError("Please upload a valid file.");
            return;
        }
        setStep('mapping');
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

    const isPhoneField = (attribute) => ['whatsapp', 'phone', 'sms'].includes(attribute);

    const applyCountryCodeToData = (value, countryCode) => {
        if (!value) return value;
        const strValue = String(value).trim();
        if (strValue.startsWith('+')) return strValue;
        return countryCode + strValue;
    };

    const handleCreateSegment = async () => {
        setProcessing(true);
        setError(null);
        try {
            // 1. Create Segment first
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

            // 2. Add contacts to segment
            if (usePreSelectedContacts && contactIds && contactIds.length > 0) {
                // Use pre-selected contacts
                await addContactsToSegment(segmentId, contactIds);
            } else {
                // Import contacts from file
                const mappedContacts = parsedData.map(row => {
                    const contact = {};
                    headers.forEach(header => {
                        const mapping = columnMappings[header];
                        if (mapping && mapping.attribute !== 'do_not_import') {
                            let value = row[header];
                            if (isPhoneField(mapping.attribute) && value) {
                                value = applyCountryCodeToData(value, mapping.countryCode);
                            }
                            contact[mapping.attribute] = value;
                        }
                    });
                    return contact;
                }).filter(c => c.email || c.phone || c.whatsapp || c.sms || c.ext_id);

                if (mappedContacts.length === 0) {
                    setError("No valid contacts found to import.");
                    setProcessing(false);
                    return;
                }

                // Import contacts into segment
                await marketingAPI.importContacts(mappedContacts, segmentId);
            }

            // 3. Success
            onSuccess();

        } catch (err) {
            console.error("Error creating static segment:", err);
            setError(err.message || "Failed to create segment and add contacts.");
        } finally {
            setProcessing(false);
        }
    };

    // Render Upload Step
    if (step === 'upload') {
        return (
            <div className="static-segment-upload">
                {/* Pre-selected Contacts Indicator */}
                {usePreSelectedContacts && contactIds && contactIds.length > 0 && (
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
                            <button
                                onClick={() => setUsePreSelectedContacts(false)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #059669',
                                    color: '#059669',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Import from file instead
                            </button>
                        </div>
                    </div>
                )}

                {!usePreSelectedContacts && (
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                            Select file
                        </label>
                        <div
                            className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFileSelect(file); }}
                            style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: isDragging ? '#ecfdf5' : '#f9fafb', transition: 'all 0.2s', borderColor: isDragging ? '#059669' : '#d1d5db' }}
                        >
                            {processing ? (
                                <Loader2 size={48} className="animate-spin" style={{ color: '#059669', margin: '0 auto' }} />
                            ) : selectedFile ? (
                                <>
                                    <CheckCircle size={48} style={{ color: '#059669', margin: '0 auto 16px' }} />
                                    <p style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: '500' }}>{selectedFile.name}</p>
                                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#6b7280' }}>{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setParsedData([]); }}
                                        style={{ marginTop: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
                                    >
                                        Remove file
                                    </button>
                                </>
                            ) : (
                                <>
                                    <CloudUpload size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                                    <p style={{ margin: 0, fontSize: '16px', color: '#374151', fontWeight: '500' }}>Drop your CSV file here</p>
                                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#9ca3af' }}>Max file size: 10MB</p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => { const file = e.target.files[0]; if (file) handleFileSelect(file); }}
                                style={{ display: 'none' }}
                                accept=".csv,.xlsx,.xls,.txt"
                            />
                        </div>
                        {error && <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px' }}>{error}</div>}
                    </div>
                )}

                <div style={{ marginTop: '32px' }}>
                    <button
                        className="create-segment-btn" // Reusing class from Segment.jsx
                        onClick={usePreSelectedContacts ? handleCreateSegment : handleContinue}
                        disabled={!segmentName.trim() || (!usePreSelectedContacts && (!selectedFile || processing)) || processing}
                        style={{ width: 'fit-content', padding: '10px 24px' }}
                    >
                        {processing ? 'Creating...' : (usePreSelectedContacts ? 'Create Segment' : 'Continue')}
                    </button>
                    {!usePreSelectedContacts && (
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                            * Imported leads won't receive double opt-in confirmation email. Please make sure you have permission to send emails to the list.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Render Mapping Step
    return (
        <div className="static-segment-mapping">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Map Columns</h3>
                <button onClick={() => setStep('upload')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}>Back to upload</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '150px 200px 1fr 80px', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px 8px 0 0', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                <span>File Header</span>
                <span>Data</span>
                <span>Contact Attribute</span>
                <span style={{ textAlign: 'center' }}>Mapped</span>
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', marginBottom: '24px', maxHeight: '400px', overflowY: 'auto' }}>
                {headers.map((header, idx) => {
                    const mapping = columnMappings[header] || { attribute: 'do_not_import', countryCode: '+91' };
                    const sampleData = parsedData.slice(0, 1).map(row => row[header]).filter(Boolean);
                    const isMapped = mapping.attribute !== 'do_not_import';
                    return (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '150px 200px 1fr 80px', padding: '16px', borderBottom: idx < headers.length - 1 ? '1px solid #e5e7eb' : 'none', alignItems: 'center', backgroundColor: isMapped ? '#f0fdf4' : '#fff', borderLeft: isMapped ? '3px solid #059669' : '3px solid transparent' }}>
                            <div style={{ fontWeight: '600', color: '#059669', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{header}</div>
                            <div style={{ fontSize: '13px', color: '#059669', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sampleData[0] || '-'}</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <select value={mapping.attribute} onChange={(e) => updateMapping(header, e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', width: '100%', minWidth: '140px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                    {CONTACT_ATTRIBUTES.map(attr => <option key={attr.value} value={attr.value}>{attr.label}</option>)}
                                </select>
                                {isPhoneField(mapping.attribute) && (
                                    <select value={mapping.countryCode} onChange={(e) => updateCountryCode(header, e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', width: '80px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                        {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.country} {cc.code}</option>)}
                                    </select>
                                )}
                            </div>
                            <div style={{ textAlign: 'center' }}>{isMapped && <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#fff" /></div>}</div>
                        </div>
                    );
                })}
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setStep('upload')} style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>Back</button>
                <button
                    onClick={handleCreateSegment}
                    disabled={processing}
                    style={{ backgroundColor: '#111827', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontWeight: '500', border: 'none', cursor: 'pointer', opacity: processing ? 0.7 : 1 }}
                >
                    {processing ? 'Creating Segment...' : 'Create Segment & Import'}
                </button>
            </div>
        </div>
    );
};

export default StaticSegmentForm;
