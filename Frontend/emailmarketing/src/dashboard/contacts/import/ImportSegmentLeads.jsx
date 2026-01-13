import React, { useState, useRef, useEffect } from 'react';
import { CloudUpload, Lock, HelpCircle, X, Loader2, Check, RotateCcw, CheckCircle, ExternalLink, Search, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import QuitImportModal from './QuitImportModal';
import { marketingAPI } from '../../../services/marketing.services';
import './importcompanies.css';

// Available contact attributes for mapping
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

const ImportSegmentLeads = ({ segment, onBack }) => {
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

    const handleClose = () => {
        setShowQuitModal(true);
    };

    const confirmClose = () => {
        setShowQuitModal(false);
        onBack();
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const onFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const validateFile = (file) => {
        const allowedExtensions = ['csv', 'xlsx', 'xls', 'txt'];
        const extension = file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(extension);
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
            const requiredIdentifiers = ['email', 'phone', 'telephone', 'contact_id', 'ext_id', 'external_id', 'whatsapp', 'sms'];
            const lowerHeaders = fileHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const hasValidIdentifier = requiredIdentifiers.some(id =>
                lowerHeaders.some(header => header.includes(id.replace(/_/g, '')))
            );

            if (!hasValidIdentifier) {
                setUploadError("There must be a valid contact id, email, telephone number or external id in the file you uploaded.");
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
        if (validateFile(file)) {
            setSelectedFile(file);
            processFile(file);
        } else {
            alert('Invalid file type. Please upload a .csv, .xlsx or .txt file.');
        }
    };

    const handleConfirmFile = () => setFileConfirmed(true);
    const handleEdit = () => setFileConfirmed(false);
    const handleDeleteFile = () => {
        setSelectedFile(null);
        setFileUploaded(false);
        setFileConfirmed(false);
        setParsedData([]);
        setHeaders([]);
        setColumnMappings({});
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

    const getSampleData = (header) => parsedData.slice(0, 2).map(row => row[header]).filter(Boolean);

    const applyCountryCodeToData = (value, countryCode) => {
        if (!value) return value;
        const strValue = String(value).trim();
        if (strValue.startsWith('+')) return strValue;
        return countryCode + strValue;
    };

    const handleConfirmMapping = async () => {
        setIsProcessing(true);
        setUploadError(null);
        try {
            const mappedContacts = parsedData.map(row => {
                const contact = {};
                headers.forEach(header => {
                    const mapping = columnMappings[header];
                    if (mapping && mapping.attribute !== 'do_not_import') {
                        let value = row[header];
                        if (['whatsapp', 'phone', 'sms'].includes(mapping.attribute) && value) {
                            value = applyCountryCodeToData(value, mapping.countryCode);
                        }
                        contact[mapping.attribute] = value;
                    }
                });
                return contact;
            }).filter(c => c.email || c.phone || c.whatsapp || c.sms || c.ext_id);

            if (mappedContacts.length === 0) {
                setUploadError("No valid contacts found to import.");
                setIsProcessing(false);
                return;
            }

            // Since we're in a segment context, we might want to special handle this.
            // For now, using the general import.
            if (segment && segment._id) {
                await marketingAPI.importContacts(mappedContacts, segment._id);
            } else {
                await marketingAPI.importContacts(mappedContacts);
            }

            // Optionally, add logic here to associate with the segment if it's a fixed segment.
            // If it's a dynamic segment based on criteria, the contacts will automatically be in it if they match.

            onBack();
        } catch (error) {
            console.error("Import error:", error);
            setUploadError("Failed to import leads. Please try again.");
            setIsProcessing(false);
        }
    };

    const getMappedCount = () => Object.values(columnMappings).filter(m => m.attribute !== 'do_not_import').length;
    const getSkippedCount = () => Object.values(columnMappings).filter(m => m.attribute === 'do_not_import').length;
    const isPhoneField = (attribute) => ['whatsapp', 'phone', 'sms'].includes(attribute);

    return (
        <div className="import-companies-container" style={{ maxWidth: fileUploaded ? '1000px' : '700px', transition: 'max-width 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0, marginBottom: '8px', color: '#111827' }}>
                        Import leads
                    </h1>
                </div>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Segment Name Field */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Segment name
                </label>
                <input
                    type="text"
                    value={segment?.name || ''}
                    readOnly
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: '#f9fafb',
                        color: '#6b7280',
                        fontSize: '14px'
                    }}
                />
            </div>

            {/* Step 1: Upload a file */}
            <div style={{ marginBottom: '32px' }}>
                {!fileUploaded ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>Select file</span>
                        </div>
                        <div style={{ paddingLeft: '0px' }}>
                            <div className="file-links" style={{ float: 'right', marginBottom: '12px' }}>
                                {/* <a href="#" style={{ textDecoration: 'none', color: '#059669', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <HelpCircle size={14} />
                                    CSV format & import instructions
                                </a> */}
                            </div>
                            <div style={{ clear: 'both' }}></div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileSelect}
                                style={{ display: 'none' }}
                                accept=".csv,.xlsx,.xls,.txt"
                            />

                            {uploadError && (
                                <div style={{ backgroundColor: '#fee2e2', border: '1px dashed #f87171', borderRadius: '4px', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b91c1c', fontSize: '14px' }}>
                                    <span>{uploadError}</span>
                                    <button onClick={() => setUploadError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px', fontWeight: 'bold' }}>×</button>
                                </div>
                            )}

                            <div
                                className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
                                onClick={triggerFileInput}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file); }}
                                style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: isDragging ? '#ecfdf5' : '#f9fafb', transition: 'all 0.2s', borderColor: isDragging ? '#059669' : '#d1d5db' }}
                            >
                                {isProcessing ? (
                                    <Loader2 size={48} className="animate-spin" style={{ color: '#059669', margin: '0 auto' }} />
                                ) : (
                                    <>
                                        <CloudUpload size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
                                        <p style={{ margin: 0, fontSize: '16px', color: '#374151', fontWeight: '500' }}>Select your file or drag and drop it here</p>
                                        <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#9ca3af' }}>.csv, .xlsx or .txt</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : !fileConfirmed ? (
                    <>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#059669', fontWeight: '500', marginBottom: '4px' }}>Uploaded file</div>
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedFile?.name}</div>
                            </div>
                            <button onClick={handleDeleteFile} style={{ background: 'transparent', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Delete file</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={handleConfirmFile} style={{ backgroundColor: '#111827', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontWeight: '500', border: 'none', cursor: 'pointer' }}>Confirm your file</button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Summary */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <CheckCircle size={24} style={{ color: '#059669', marginTop: '2px' }} />
                                <div>
                                    <span style={{ fontSize: '16px', fontWeight: '500', color: '#059669' }}>File confirmed</span>
                                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{selectedFile?.name}: {parsedData.length} lines</div>
                                </div>
                            </div>
                            <button onClick={handleEdit} style={{ background: 'transparent', border: 'none', color: '#374151', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Edit</button>
                        </div>

                        {/* Mapping Component */}
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 200px 1fr 80px', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '8px 8px 0 0', border: '1px solid #e5e7eb', fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>
                            <span>File Header</span>
                            <span>Data</span>
                            <span>Contact Attribute</span>
                            <span style={{ textAlign: 'center' }}>Mapped</span>
                        </div>
                        <div style={{ border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', marginBottom: '24px' }}>
                            {headers.map((header, idx) => {
                                const mapping = columnMappings[header] || { attribute: 'do_not_import', countryCode: '+91' };
                                const sampleData = getSampleData(header);
                                const isMapped = mapping.attribute !== 'do_not_import';
                                return (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '150px 200px 1fr 80px', padding: '16px', borderBottom: idx < headers.length - 1 ? '1px solid #e5e7eb' : 'none', alignItems: 'center', backgroundColor: isMapped ? '#f0fdf4' : '#fff', borderLeft: isMapped ? '3px solid #059669' : '3px solid transparent' }}>
                                        <div style={{ fontWeight: '600', color: '#059669', fontSize: '13px' }}>{header}</div>
                                        <div style={{ fontSize: '13px', color: '#059669' }}>{sampleData.map((val, i) => <div key={i}>{String(val)}</div>)}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <select value={mapping.attribute} onChange={(e) => updateMapping(header, e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '180px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                                {CONTACT_ATTRIBUTES.map(attr => <option key={attr.value} value={attr.value}>{attr.label}</option>)}
                                            </select>
                                            {isPhoneField(mapping.attribute) && (
                                                <select value={mapping.countryCode} onChange={(e) => updateCountryCode(header, e.target.value)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px', minWidth: '120px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                                    {COUNTRY_CODES.map(cc => <option key={cc.code} value={cc.code}>{cc.country}: {cc.code}</option>)}
                                                </select>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>{isMapped && <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="#fff" /></div>}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Final Action */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                To import: <strong style={{ color: '#059669' }}>{getMappedCount()} columns</strong> | Ignored: {getSkippedCount()} columns
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button onClick={resetMappings} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}><RotateCcw size={14} /> Reset mapping</button>
                                <button
                                    onClick={handleConfirmMapping}
                                    disabled={isProcessing}
                                    style={{ backgroundColor: '#111827', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontWeight: '500', border: 'none', cursor: 'pointer', opacity: isProcessing ? 0.7 : 1 }}
                                >
                                    {isProcessing ? 'Processing...' : 'Confirm import'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showQuitModal && <QuitImportModal isOpen={showQuitModal} onClose={() => setShowQuitModal(false)} onConfirm={confirmClose} />}
        </div>
    );
};

export default ImportSegmentLeads;
