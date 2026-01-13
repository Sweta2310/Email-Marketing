import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { marketingAPI } from '../../../services/marketing.services';
import './addcontact.modal.css';

const AddContactModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        whatsapp: '',
        consent_source: 'manual_add'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Email is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await marketingAPI.addContact(formData);
            onSuccess();
            onClose();
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                whatsapp: '',
                consent_source: 'manual_add'
            });
        } catch (err) {
            console.error('Error adding contact:', err);
            setError(err.response?.data?.message || 'Failed to add contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="add-contact-modal">
                <div className="modal-header">
                    <h2>Create a contact</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-message">{error}</div>}

                        <div className="input-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                required
                            />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First name"
                                />
                            </div>
                            <div className="input-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>WhatsApp Number</label>
                            <input
                                type="text"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                placeholder="Enter WhatsApp number (optional)"
                            />
                        </div>

                        <p className="consent-text">
                            By adding this contact, you confirm that you have permission to send them marketing communications.
                        </p>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Adding...</span>
                                </>
                            ) : (
                                'Create contact'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContactModal;
