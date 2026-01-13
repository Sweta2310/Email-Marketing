import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Info, CheckCircle2, ChevronDown, HelpCircle, User, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { marketingAPI } from '../../../services/marketing.services';
import './sender.model.css';

const SenderModal = ({ isOpen, onClose, onSave, initialData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [emailOptions, setEmailOptions] = useState([]);
    const [email, setEmail] = useState(initialData?.email || '');
    const [name, setName] = useState(initialData?.name || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchSenders = async () => {
        try {
            const data = await marketingAPI.getSenders();
            setEmailOptions(data);
            if (data.length > 0 && !initialData) {
                setEmail(data[0].email);
                setName(data[0].name);
            }
        } catch (error) {
            console.error('Fetch senders error:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSenders();
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [initialData, isOpen]);

    const handleDeleteSender = async (e, id) => {
        e.stopPropagation(); // Don't select the sender when deleting
        if (!window.confirm('Are you sure you want to delete this sender?')) return;

        try {
            await marketingAPI.deleteSender(id);
            // Refresh list
            fetchSenders();
            // Reset selection if deleted sender was selected
            const deletedSender = emailOptions.find(o => o._id === id);
            if (deletedSender && email === deletedSender.email) {
                setEmail('');
                setName('');
            }
        } catch (error) {
            console.error('Delete sender error:', error);
            alert('Failed to delete sender');
        }
    };

    if (!isOpen) return null;

    const handleSave = () => {
        onSave({ email, name });
        onClose();
    };

    return (
        <div className="sender-modal-overlay" onClick={(e) => e.target.className === 'sender-modal-overlay' && onClose()}>
            <div className="sender-modal-content">

                {/* Header */}
                <div className="sender-modal-header">
                    <div className="header-left">
                        <div className="header-icon-circle">
                            <CheckCircle2 color="#22a6a8" size={24} />
                        </div>
                        <div className="header-text">
                            <h2>Sender</h2>
                            <p>Who is sending this email campaign?</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="sender-modal-body">
                    {/* Left Column - Form */}
                    <div className="form-section">
                        <div className="input-group">
                            <label className="label-with-help">
                                Email address
                                <HelpCircle size={14} className="help-icon" />
                            </label>
                            <div className="custom-dropdown" ref={dropdownRef}>
                                <div
                                    className={`dropdown-selected ${isDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span>{email}</span>
                                    <ChevronDown className={`select-arrow ${isDropdownOpen ? 'rotated' : ''}`} size={18} />
                                </div>
                                {isDropdownOpen && (
                                    <div className="dropdown-options">
                                        {emailOptions.map((option) => (
                                            <div
                                                key={option.email}
                                                className={`dropdown-option ${email === option.email ? 'active' : ''}`}
                                                onClick={() => {
                                                    setEmail(option.email);
                                                    setName(option.name);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <div className="option-content">
                                                    <div className="option-main">{option.email}</div>
                                                    <div className="option-sub">{option.name} – {option.email.split('@')[1]}</div>
                                                </div>
                                                <div className="option-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/settings?tab=senders&edit=${option._id}&returnTo=${encodeURIComponent(location.pathname)}`);
                                                            onClose();
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={(e) => handleDeleteSender(e, option._id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="dropdown-divider"></div>
                                        <div
                                            className="dropdown-option add-sender"
                                            onClick={() => {
                                                navigate(`/settings?tab=senders&returnTo=${encodeURIComponent(location.pathname)}`);
                                                onClose();
                                            }}
                                        >
                                            <PlusCircle size={18} />
                                            <span>Add a new sender</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Validation Notice */}
                        <div className="info-alert">
                            <div className="info-icon-circle">
                                <Info size={16} />
                            </div>
                            <p>
                                Your domain is not authenticated. To ensure delivery, we replace your domain with [@brevosend.com].
                            </p>
                        </div>
                    </div>

                    {/* Vertical Separator */}
                    <div className="vertical-divider">
                        <div className="divider-handle"></div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="preview-section">
                        <div className="preview-container">
                            <div className="preview-mockup">
                                <div className="mockup-header">
                                    <div className="time">9:47</div>
                                    <div className="status-icons">
                                        <div className="signal">📶</div>
                                        <div className="battery">🔋</div>
                                    </div>
                                </div>

                                <div className="inbox-title">Inbox</div>

                                <div className="email-preview-card">
                                    <div className="card-top">
                                        <span className="sender-display-name">{name || 'thebotmode'}</span>
                                        <span className="send-time">17:45</span>
                                    </div>
                                    <div className="card-subject">Message subject...</div>
                                    <div className="card-preview-text">Your preview text</div>
                                </div>

                                <div className="skeleton-list">
                                    <div className="skeleton-item">
                                        <div className="skeleton-header">
                                            <div className="skeleton-name"></div>
                                            <div className="skeleton-time">17:45</div>
                                        </div>
                                        <div className="skeleton-line-long"></div>
                                        <div className="skeleton-line-short"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="preview-footer-text">
                            Actual email preview may vary depending on the email client.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sender-modal-footer">
                    <button onClick={onClose} className="btn-cancel">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn-save">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SenderModal;
