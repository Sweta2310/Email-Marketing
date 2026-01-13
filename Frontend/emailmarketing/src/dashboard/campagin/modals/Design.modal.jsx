import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, ChevronUp, ListFilter, Save, Send, Layout, AppWindow, Eye, MousePointer2, FileText, Code2, Loader2 } from 'lucide-react';
import { templateAPI } from '../../../services/template.services';
import './design.model.css';

const DesignModal = ({ isOpen, onClose, onSave }) => {
    const [activeCategory, setActiveCategory] = useState('Ready-to-use');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScratchOpen, setIsScratchOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen, activeCategory]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            let data;
            if (activeCategory === 'Ready-to-use') {
                data = await templateAPI.getReadyToUseTemplates();
            } else if (activeCategory === 'Saved templates') {
                data = await templateAPI.getTemplates('saved');
            } else if (activeCategory === 'Basic templates') {
                data = await templateAPI.getTemplates('basic');
            } else {
                data = await templateAPI.getTemplates();
            }
            setTemplates(data);
        } catch (err) {
            console.error('Error fetching templates:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handlePreview = (e, template) => {
        e.stopPropagation();
        setPreviewTemplate(template);
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <div
            className={`sidebar-item ${activeCategory === id ? 'active' : ''}`}
            onClick={() => setActiveCategory(id)}
        >
            <Icon size={18} />
            <span>{label}</span>
        </div>
    );

    const TemplateCard = ({ template }) => {
        const iframeRef = useRef(null);
        // Prioritize HTML preview for consistency (Brevo-style)
        // Only use thumbnail if HTML is missing
        const showHtmlPreview = !!template.html;
        const thumbnailSrc = !showHtmlPreview ? template.thumbnail : null;

        return (
            <div className="template-card">
                <div className="template-preview">
                    {showHtmlPreview ? (
                        <div className="template-html-preview">
                            <iframe
                                ref={iframeRef}
                                srcDoc={template.html ? `
                                    <style>
                                        ::-webkit-scrollbar { display: none; }
                                        body { overflow: hidden !important; width: 600px !important; margin: 0 auto !important; }
                                    </style>
                                    ${template.html}
                                ` : ''}
                                scrolling="no"
                                title={`Preview ${template.name}`}
                                style={{
                                    width: '600px',
                                    height: '1200px',
                                    border: 'none',
                                    transform: 'scale(0.8)',
                                    transformOrigin: 'top center',
                                    pointerEvents: 'none',
                                    backgroundColor: 'white'
                                }}
                            />
                        </div>
                    ) : thumbnailSrc ? (
                        <img src={thumbnailSrc} alt={template.name} className="template-thumbnail" />
                    ) : (
                        <div className="template-thumbnail-placeholder">
                            <Layout size={24} color="#94a3b8" />
                        </div>
                    )}
                    <button className="eye-icon-btn" onClick={(e) => handlePreview(e, template)}>
                        <Eye size={16} />
                    </button>
                </div>
                <div className="template-info">
                    <div className="name-label">{template.name}</div>
                    <div className="card-actions">
                        <button className="use-template-btn" onClick={() => onSave({ ...template, type: 'template' })}>
                            Use template
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="design-modal-overlay" onClick={(e) => e.target.className === 'design-modal-overlay' && onClose()}>
            <div className="design-modal-content">
                <div className="design-modal-header">
                    <h2>Create an email</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <div className="design-modal-body">
                    <aside className="design-modal-sidebar">
                        <div className="scratch-container">
                            <button
                                className={`create-scratch-btn ${isScratchOpen ? 'open' : ''}`}
                                onClick={() => setIsScratchOpen(!isScratchOpen)}
                            >
                                Create from scratch
                                {isScratchOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {isScratchOpen && (
                                <div className="scratch-dropdown">
                                    <div className="scratch-option" onClick={() => onSave({ type: 'drag-drop' })}>
                                        <div className="option-icon bg-blue-50 text-blue-600">
                                            <MousePointer2 size={16} />
                                        </div>
                                        <div className="option-text">
                                            <div className="option-title">Drag and drop editor</div>
                                            <div className="option-desc">Create an on-brand email with reusable elements.</div>
                                        </div>
                                    </div>
                                    <div className="scratch-option" onClick={() => onSave({ type: 'simple' })}>
                                        <div className="option-icon bg-orange-50 text-orange-600">
                                            <FileText size={16} />
                                        </div>
                                        <div className="option-text">
                                            <div className="option-title">Simple editor</div>
                                            <div className="option-desc">Create a text-based email with images and attachments.</div>
                                        </div>
                                    </div>
                                    <div className="scratch-option" onClick={() => onSave({ type: 'html' })}>
                                        <div className="option-icon bg-gray-50 text-gray-600">
                                            <Code2 size={16} />
                                        </div>
                                        <div className="option-text">
                                            <div className="option-title">HTML custom code</div>
                                            <div className="option-desc">Create a fully custom email with HTML.</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-section">
                            <div className="sidebar-label">Your emails</div>
                            <SidebarItem id="Saved templates" icon={Save} label="Saved templates" />
                            <SidebarItem id="Campaign emails" icon={Send} label="Campaign emails" />
                        </div>

                        <div className="sidebar-section">
                            <div className="sidebar-label">Pre-built templates</div>
                            <SidebarItem id="Basic templates" icon={Layout} label="Basic templates" />
                            <SidebarItem id="Ready-to-use" icon={AppWindow} label="Ready-to-use" />
                        </div>
                    </aside>

                    <main className="design-modal-main">
                        <div className="controls-row">
                            <div className="search-field">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Template's name or ID"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="sort-dropdown">
                                <ListFilter size={16} />
                                Sort by
                                <ChevronDown size={16} />
                            </button>
                        </div>

                        <div className="templates-grid">
                            {loading ? (
                                <div className="loading-templates">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p>Loading templates...</p>
                                </div>
                            ) : templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                templates
                                    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(template => (
                                        <TemplateCard key={template._id} template={template} />
                                    ))
                            ) : (
                                <div className="empty-templates">
                                    <p>No templates found in this category.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Preview Modal Overlay (Nested for simplicity in modal) */}
            {previewTemplate && (
                <div className="preview-modal-overlay" style={{ zIndex: 3000 }} onClick={() => setPreviewTemplate(null)}>
                    <div className="preview-modal-content" style={{ maxWidth: '800px', height: '80vh' }} onClick={e => e.stopPropagation()}>
                        <div className="preview-header" style={{ padding: '16px 24px', borderBottom: '1px solid #edf2f7', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 style={{ margin: 0 }}>{previewTemplate.name}</h3>
                            <button onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', padding: '20px', background: '#f8fafc' }}>
                            <iframe
                                title="Template Preview"
                                srcDoc={previewTemplate.html}
                                style={{ width: '100%', height: '100%', border: 'none', background: 'white', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                            />
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #edf2f7', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-primary"
                                style={{ background: '#5a57d9', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '999px', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => {
                                    setPreviewTemplate(null);
                                    onSave({ ...previewTemplate, type: 'template' });
                                }}
                            >
                                Use this template
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default DesignModal;
