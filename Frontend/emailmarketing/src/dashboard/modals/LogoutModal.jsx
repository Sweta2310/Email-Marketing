import React from 'react';
import { AlertCircle } from 'lucide-react';
import './logoutmodal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="logout-modal-overlay">
            <div className="logout-modal">
                <div className="logout-modal-icon">
                    <AlertCircle size={48} />
                </div>
                <h2 className="logout-modal-title">Are you leaving?</h2>
                <p className="logout-modal-message">
                    Are you sure want to log out? All your unsaved data will be lost.
                </p>
                <div className="logout-modal-actions">
                    <button className="logout-btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="logout-btn-confirm" onClick={onConfirm}>
                        Yes →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
