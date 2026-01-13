import React from 'react';
import { X } from 'lucide-react';
import './quitimportmodal.css';

const QuitImportModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="quit-modal-overlay">
            <div className="quit-modal-container">
                <button className="quit-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className="quit-modal-title">Confirm</h2>

                <p className="quit-modal-message">
                    Are you sure you want to quit contact import?
                </p>

                <div className="quit-modal-actions">
                    <button className="quit-modal-btn btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="quit-modal-btn btn-confirm" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuitImportModal;
