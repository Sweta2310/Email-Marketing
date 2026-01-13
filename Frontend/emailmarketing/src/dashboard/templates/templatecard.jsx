import React from 'react';
import { Eye, Play } from 'lucide-react';
import './templates.css';

const TemplateCard = ({ template, onPreview, onUse }) => {
    // Prioritize HTML preview for consistency (Brevo-style)
    const showHtmlPreview = !!template.html;

    return (
        <div className="template-card">
            <div className="template-preview-wrapper">
                {showHtmlPreview ? (
                    <div className="template-html-preview">
                        <iframe
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
                                height: '1200px', // Restoring height
                                border: 'none',
                                transform: 'scale(0.5)',
                                transformOrigin: 'top center',
                                pointerEvents: 'none',
                                backgroundColor: 'white'
                            }}
                        />
                    </div>
                ) : template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} className="template-thumbnail" />
                ) : (
                    <div className="template-thumbnail-placeholder">
                        <span>{template.name.charAt(0)}</span>
                    </div>
                )}
                <div className="template-card-overlay">
                    <button className="preview-btn" onClick={() => onPreview(template)} title="Preview">
                        <Eye size={20} />
                        <span>Preview</span>
                    </button>
                </div>
            </div>
            <div className="template-info">
                <div className="template-name-row">
                    <h3 className="template-name">{template.name}</h3>
                </div>
                <p className="template-category">{template.category}</p>
                <div className="template-actions">
                    <button className="use-template-btn" onClick={() => onUse(template)}>
                        Use template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;
