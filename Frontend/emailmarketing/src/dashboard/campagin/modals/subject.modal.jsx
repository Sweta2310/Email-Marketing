import React, { useState } from 'react';
import { X, HelpCircle, Smile, Braces, Sparkles } from 'lucide-react';
import './subject.model.css';

const SubjectModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [subject, setSubject] = useState(initialData?.subject || '');
    const [previewText, setPreviewText] = useState(initialData?.previewText || '');
    const [focusedField, setFocusedField] = useState(null);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ subject, previewText });
        onClose();
    };

    return (
        <div className="subject-modal-overlay" onClick={(e) => e.target.className === 'subject-modal-overlay' && onClose()}>
            <div className="subject-modal-content">
                <div className="subject-modal-header">
                    <div className="header-left">
                        <div className="header-icon">
                            <div className="header-dot"></div>
                        </div>
                        <div className="header-text">
                            <h2>Subject</h2>
                            <p>Add a subject line for this campaign.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <div className="subject-modal-body">
                    <div className="form-section">
                        <div className="input-group">
                            <div className="label-wrapper">
                                <label>Subject line</label>
                                <span className="required-star">*</span>
                                <HelpCircle size={16} className="help-icon" />
                            </div>
                            <div className={`textarea-container ${focusedField === 'subject' ? 'focused' : ''}`}>
                                <textarea
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    onFocus={() => setFocusedField('subject')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder=""
                                    rows={2}
                                />
                                <div className="textarea-controls">
                                    <button className="control-btn"><Smile size={18} /></button>
                                    <button className="control-btn"><Braces size={18} /></button>
                                </div>
                            </div>
                            <button className="btn-ai">
                                <Sparkles size={16} />
                                Use AI
                            </button>
                        </div>

                        <div className="input-group">
                            <div className="label-wrapper">
                                <label>Preview text</label>
                                <HelpCircle size={16} className="help-icon" />
                            </div>
                            <div className={`textarea-container ${focusedField === 'preview' ? 'focused' : ''}`}>
                                <textarea
                                    value={previewText}
                                    onChange={(e) => setPreviewText(e.target.value)}
                                    onFocus={() => setFocusedField('preview')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder=""
                                    rows={2}
                                />
                                <div className="textarea-controls">
                                    <button className="control-btn"><Smile size={18} /></button>
                                    <button className="control-btn"><Braces size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="preview-section">
                        <div className="phone-mockup">
                            <div className="phone-header">
                                <div className="phone-notch"></div>
                            </div>
                            <div className="inbox-view">
                                <div className="inbox-title">Inbox</div>
                                <div className="email-item active">
                                    <div className="email-top">
                                        <span className="sender-name">thebotmode</span>
                                        <span className="email-time">17:45</span>
                                    </div>
                                    <div className="subject-text">{subject || 'Message subject...'}</div>
                                    <div className="preview-text-line">{previewText || 'Your preview text'}</div>
                                </div>
                                {/* Dummy items */}
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="email-item dummy-item">
                                        <div className="email-top">
                                            <div className="dummy-line" style={{ width: '80px' }}></div>
                                            <div className="dummy-line" style={{ width: '30px' }}></div>
                                        </div>
                                        <div className="dummy-line" style={{ width: '120px' }}></div>
                                        <div className="dummy-line" style={{ width: '150px' }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="preview-caption">Actual email preview may vary depending on the email client.</p>
                    </div>
                </div>

                <div className="subject-modal-footer">
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`save-button ${subject.length > 0 ? 'active' : ''}`}
                        disabled={subject.length === 0}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectModal;
