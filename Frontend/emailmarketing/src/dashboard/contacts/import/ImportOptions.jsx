import React from 'react';
import { FileUp, Copy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './importoptions.css';

const ImportOptions = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        // Navigate back to the main contact list
        navigate('/dashboard?tab=contacts&view=list');
    };

    return (
        <div className="import-options-container">
            <div className="import-breadcrumb" onClick={handleBack}>
                <ArrowLeft size={16} />
                <span>Back to Contacts</span>
            </div>

            <header className="import-header">
                <h1 className="import-title">Import contacts for bulk creation or updating</h1>
                <p className="import-description">
                    Create, update, or blocklist contacts in bulk in Retner. And manage unlimited contacts in one place.
                    Keep in mind you must have your contacts' consent to send them campaigns.
                </p>
            </header>

            <div className="import-grid">
                <div className="import-card" onClick={() => navigate('/dashboard?tab=contacts&view=import-contacts-file')}>
                    <div className="import-card-icon file">
                        <FileUp size={24} />
                    </div>
                    <h3 className="import-card-title">Import from a file</h3>
                    <p className="import-card-text">
                        Import your contacts from a csv, xlsx, or txt file.
                    </p>
                </div>

                <div className="import-card" onClick={() => console.log('Copy paste clicked')}>
                    <div className="import-card-icon copy">
                        <Copy size={24} />
                    </div>
                    <h3 className="import-card-title">Copy-paste</h3>
                    <p className="import-card-text">
                        Paste the contacts as text from a spreadsheet or a similar list.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ImportOptions;
