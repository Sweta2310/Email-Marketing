import React from 'react';
import { X } from 'lucide-react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
    if (!isOpen) return null;

    return (
        <div className="terms-modal-overlay" onClick={onClose}>
            <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="terms-modal-header">
                    <div>
                        <h2>Terms & Privacy Policy</h2>
                        <p className="terms-subtitle">Email Marketing Terms & Policy covers how we handle your data.</p>
                    </div>
                    <button className="terms-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="terms-tabs">
                    <button className="terms-tab active">General Policy</button>
                </div>

                <div className="terms-body">
                    <div className="terms-section">
                        <h3>About Email Marketing Platform</h3>
                        <p>
                            At our Email Marketing Platform, we think email marketing should be exciting and affordable.
                            That's why we team up with hundreds of email service providers to bring you the best tools
                            for managing your campaigns. Let us help you make your email marketing a reality!
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3>Key Features Email Marketing Platform</h3>

                        <div className="terms-feature">
                            <div className="terms-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="terms-feature-content">
                                <h4>Easy Campaign Creation</h4>
                                <p>Create, send and track email campaigns with our intuitive drag-and-drop editor</p>
                            </div>
                        </div>

                        <div className="terms-feature">
                            <div className="terms-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="terms-feature-content">
                                <h4>Mobile Experience</h4>
                                <p>Access our services through website or mobile app for on-the-go management</p>
                            </div>
                        </div>

                        <div className="terms-feature">
                            <div className="terms-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="terms-feature-content">
                                <h4>Special Offers</h4>
                                <p>Enjoy free trials, premium templates and other rewards for your campaigns</p>
                            </div>
                        </div>

                        <div className="terms-feature">
                            <div className="terms-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="terms-feature-content">
                                <h4>Analytics & Reporting</h4>
                                <p>Track campaign performance with detailed analytics and insights</p>
                            </div>
                        </div>
                    </div>

                    {/* <div className="terms-help-section">
                        <h4>Need Help?</h4>
                        <p>Contact our customer service team at <a href="mailto:support@emailmarketing.com">support@emailmarketing.com</a></p>
                    </div> */}
                </div>

                <div className="terms-modal-footer">
                    <button className="terms-accept-btn" onClick={onAccept}>
                        Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
