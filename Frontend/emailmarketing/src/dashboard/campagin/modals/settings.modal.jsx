import React, { useState } from 'react';
import { X, HelpCircle, Leaf } from 'lucide-react';
import './settings.model.css';

const SettingsModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [settings, setSettings] = useState(initialData || {
        personalizeSendTo: false,
        differentReplyTo: false,
        googleAnalytics: false,
        ignoreListSettings: false,
        addAttachment: false,
        addTag: false,
        setExpirationDate: false,
        customUnsubscribe: false,
        updateProfileForm: false,
        editHeader: false,
        editFooter: false,
        enableBrowserLink: false
    });

    if (!isOpen) return null;

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    const OptionItem = ({ id, label, value, hasLeaf }) => (
        <div className="option-item">
            <input
                type="checkbox"
                id={id}
                checked={value}
                onChange={() => handleToggle(id)}
            />
            <label htmlFor={id}>
                {label}
                <HelpCircle size={14} className="help-icon" />
                {hasLeaf && <Leaf size={14} className="leaf-icon" fill="currentColor" />}
            </label>
        </div>
    );

    return (
        <div className="settings-modal-overlay" onClick={(e) => e.target.className === 'settings-modal-overlay' && onClose()}>
            <div className="settings-modal-content">
                <div className="settings-modal-header">
                    <h2>Additional settings</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={24} />
                    </button>
                </div>

                <div className="settings-modal-body">
                    <section className="settings-section">
                        <h3>Personalization</h3>
                        <div className="settings-options">
                            <OptionItem
                                id="personalizeSendTo"
                                label="Personalize the 'Send To' field"
                                value={settings.personalizeSendTo}
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>Sending and Tracking</h3>
                        <div className="settings-options">
                            <OptionItem
                                id="differentReplyTo"
                                label="Use a different Reply-to address"
                                value={settings.differentReplyTo}
                            />
                            <OptionItem
                                id="googleAnalytics"
                                label="Activate Google Analytics tracking"
                                value={settings.googleAnalytics}
                            />
                            <OptionItem
                                id="ignoreListSettings"
                                label="Ignore list custom settings"
                                value={settings.ignoreListSettings}
                            />
                            <OptionItem
                                id="addAttachment"
                                label="Add an attachment"
                                value={settings.addAttachment}
                            />
                            <OptionItem
                                id="addTag"
                                label="Add a tag"
                                value={settings.addTag}
                            />
                            <OptionItem
                                id="setExpirationDate"
                                label="Set an expiration date"
                                value={settings.setExpirationDate}
                                hasLeaf={true}
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>Subscription</h3>
                        <div className="settings-options">
                            <OptionItem
                                id="customUnsubscribe"
                                label="Use a custom unsubscribe page"
                                value={settings.customUnsubscribe}
                            />
                            <OptionItem
                                id="updateProfileForm"
                                label="Use an update profile form"
                                value={settings.updateProfileForm}
                            />
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>Design</h3>
                        <div className="settings-options">
                            <OptionItem
                                id="editHeader"
                                label="Edit default header"
                                value={settings.editHeader}
                            />
                            <OptionItem
                                id="editFooter"
                                label="Edit default footer"
                                value={settings.editFooter}
                            />
                            <OptionItem
                                id="enableBrowserLink"
                                label="Enable 'View in browser' link"
                                value={settings.enableBrowserLink}
                            />
                        </div>
                    </section>
                </div>

                <div className="settings-modal-footer">
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="save-button">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
