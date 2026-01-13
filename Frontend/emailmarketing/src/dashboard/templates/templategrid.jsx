import React, { useState, useEffect } from 'react';
import { Search, ListFilter, Loader2, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { templateAPI } from '../../services/template.services';
import TemplateCard from './templatecard';
import './templates.css';

const TemplateGrid = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [previewTemplate, setPreviewTemplate] = useState(null);
    const navigate = useNavigate();

    const categories = ['All', 'Ready-to-use', 'Saved', 'Basic'];

    useEffect(() => {
        fetchTemplates();
    }, [activeCategory]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            let data;
            if (activeCategory === 'Ready-to-use') {
                data = await templateAPI.getReadyToUseTemplates();
            } else {
                data = await templateAPI.getTemplates(activeCategory);
            }

            // Sort: System templates first
            const sortedData = data.sort((a, b) => {
                if (a.isSystem === b.isSystem) return 0;
                return a.isSystem ? -1 : 1;
            });

            setTemplates(sortedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError('Failed to load templates.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseTemplate = async (template) => {
        try {
            const name = prompt('Enter a name for your campaign:', `Campaign from ${template.name}`);
            if (name === null) return; // Cancelled

            const newCampaign = await templateAPI.cloneTemplate(template._id, name);
            navigate(`/editor/${newCampaign._id}`);
        } catch (err) {
            console.error('Error cloning template:', err);
            alert('Failed to use template.');
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="template-grid-container">
            <header className="template-header">
                <div className="template-header-content">
                    <button className="back-btn" onClick={() => navigate(-1)} title="Go back">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="template-title">Templates</h1>
                        <p className="template-subtitle">Choose a template to start your campaign</p>
                    </div>
                </div>
            </header>

            <div className="template-controls">
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="search-sort-row">
                    <div className="template-search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Loading templates...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchTemplates} className="btn-secondary">Retry</button>
                </div>
            ) : (
                <div className="templates-grid">
                    {filteredTemplates.length > 0 ? (
                        filteredTemplates.map(template => (
                            <TemplateCard
                                key={template._id}
                                template={template}
                                onPreview={setPreviewTemplate}
                                onUse={handleUseTemplate}
                            />
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No templates found matching your criteria.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="preview-modal-overlay" onClick={() => setPreviewTemplate(null)}>
                    <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="preview-header">
                            <h3>{previewTemplate.name}</h3>
                            <button className="close-preview" onClick={() => setPreviewTemplate(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="preview-body">
                            <iframe
                                title="Template Preview"
                                srcDoc={previewTemplate.html}
                                className="preview-iframe"
                            />
                        </div>
                        <div className="preview-footer">
                            <button className="btn-primary" onClick={() => {
                                setPreviewTemplate(null);
                                handleUseTemplate(previewTemplate);
                            }}>
                                Use this template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateGrid;
