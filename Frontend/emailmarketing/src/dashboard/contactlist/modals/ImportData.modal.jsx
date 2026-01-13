import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, Building2 } from 'lucide-react';
import './importdata.modal.css';

const ImportDataModal = ({ isOpen, onClose, onContinue }) => {
    const [selectedOption, setSelectedOption] = useState('contacts');

    if (!isOpen) return null;

    return createPortal(
        <div className="import-modal-overlay" onClick={(e) => e.target.className === 'import-modal-overlay' && onClose()}>
            <div className="import-modal-content">
                <header className="import-modal-header">
                    <h2 className="import-modal-title">Import your data into Retner</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className="import-modal-body">
                    <div className="import-options-grid">
                        <div
                            className={`import-option-card ${selectedOption === 'contacts' ? 'selected' : ''}`}
                            onClick={() => setSelectedOption('contacts')}
                        >
                            <div className="card-header">
                                <Users size={24} className="option-icon" />
                                <div className="radio-circle"></div>
                            </div>
                            <span className="option-title">Contacts</span>
                            <p className="option-description">
                                Create and update contacts (leads, prospects, customers...)
                            </p>
                        </div>

                        <div
                            className={`import-option-card ${selectedOption === 'companies' ? 'selected' : ''}`}
                            onClick={() => setSelectedOption('companies')}
                        >
                            <div className="card-header">
                                <Building2 size={24} className="option-icon" />
                                <div className="radio-circle"></div>
                            </div>
                            <span className="option-title">Companies</span>
                            <p className="option-description">
                                Create and update companies. Associate companies with existing contacts.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="import-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-continue"
                        onClick={() => onContinue(selectedOption)}
                    >
                        Continue
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default ImportDataModal;
