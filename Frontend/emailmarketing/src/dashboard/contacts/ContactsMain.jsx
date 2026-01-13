import React, { useState, useCallback } from 'react'; // Added useCallback
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ContactList from '../contactlist/ContactList';
import ImportOptions from './import/ImportOptions';
import ImportCompanies from './import/ImportCompanies';
import ImportContactsFile from './import/ImportContactsFile';
import ImportSegmentLeads from './import/ImportSegmentLeads';
import Segment from '../segment/Segment';
import SegmentLeads from '../segment/SegmentLeads';
import './contactsmain.css';

const ContactsMain = ({ activeInnerTab, setActiveInnerTab }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedSegment, setSelectedSegment] = useState(null);

    // Debug logging
    console.log('ContactsMain location.state:', location.state);
    console.log('activeInnerTab:', activeInnerTab);

    const handleViewLeads = useCallback((segmentId) => {
        setSelectedSegment({ _id: segmentId });
        setActiveInnerTab('Segment Leads');
    }, [setActiveInnerTab]);

    const handleSegmentLeadsData = useCallback((segmentData) => {
        setSelectedSegment(segmentData);
    }, []);

    const handleImportTrigger = useCallback((seg) => {
        setSelectedSegment(seg);
        setActiveInnerTab('Import Segment Leads');
    }, [setActiveInnerTab]);

    return (
        <div className="contacts-main-container">
            <div className="contacts-inner-content">
                {activeInnerTab === 'Contact List' ? (
                    <ContactList />
                ) : activeInnerTab === 'Segment' ? (
                    <>
                        {console.log('ContactsMain rendering Segment with:')}
                        {console.log('- location.state:', location.state)}
                        {console.log('- selectedContactIds:', location.state?.selectedContactIds)}
                        {console.log('- createSegment:', location.state?.createSegment)}
                        <Segment
                            onViewLeads={handleViewLeads}
                            preSelectedContacts={location.state?.selectedContactIds}
                            autoCreate={location.state?.createSegment}
                        />
                    </>
                ) : activeInnerTab === 'Segment Leads' ? (
                    <SegmentLeads
                        segmentId={selectedSegment?._id}
                        onBack={() => setActiveInnerTab('Segment')}
                        onImport={handleImportTrigger}
                        onDataLoaded={handleSegmentLeadsData}
                    />
                ) : activeInnerTab === 'Import Segment Leads' ? (
                    <ImportSegmentLeads
                        segment={selectedSegment}
                        onBack={() => setActiveInnerTab('Segment Leads')}
                    />
                ) : activeInnerTab === 'Import Options' ? (
                    <ImportOptions />
                ) : activeInnerTab === 'Import Companies' ? (
                    <ImportCompanies />
                ) : activeInnerTab === 'Import Contacts File' ? (
                    <ImportContactsFile />
                ) : null}
            </div>
        </div>
    );
};

export default ContactsMain;
