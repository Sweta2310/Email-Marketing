import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './TermsStandalone.css';

const TermsStandalone = () => {
    const navigate = useNavigate();

    return (
        <div className="terms-standalone-container">
            <div className="terms-standalone-content">
                <button className="terms-standalone-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back
                </button>

                <div className="terms-standalone-header">
                    <h1>Terms & Privacy Policy</h1>
                    <p className="terms-standalone-subtitle">Email Marketing Terms & Policy covers how we handle your data.</p>
                </div>

                <div className="terms-standalone-tabs">
                    <button className="terms-standalone-tab active">General Policy</button>
                </div>

                <div className="terms-standalone-body">
                    <div className="terms-standalone-section">
                        <h2>About Email Marketing Platform</h2>
                        <p>
                            At our Email Marketing Platform, we think email marketing should be exciting and affordable.
                            That's why we team up with hundreds of email service providers to bring you the best tools
                            for managing your campaigns. Let us help you make your email marketing a reality!
                        </p>
                    </div>

                    <div className="terms-standalone-section">
                        <h2>Key Features Email Marketing Platform</h2>

                        <div className="terms-standalone-feature">
                            <div className="terms-standalone-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="terms-standalone-feature-content">
                                <h3>Easy Campaign Creation</h3>
                                <p>Create, send and track email campaigns with our intuitive drag-and-drop editor</p>
                            </div>
                        </div>

                        <div className="terms-standalone-feature">
                            <div className="terms-standalone-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="terms-standalone-feature-content">
                                <h3>Mobile Experience</h3>
                                <p>Access our services through website or mobile app for on-the-go management</p>
                            </div>
                        </div>

                        <div className="terms-standalone-feature">
                            <div className="terms-standalone-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="terms-standalone-feature-content">
                                <h3>Special Offers</h3>
                                <p>Enjoy free trials, premium templates and other rewards for your campaigns</p>
                            </div>
                        </div>

                        <div className="terms-standalone-feature">
                            <div className="terms-standalone-feature-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="terms-standalone-feature-content">
                                <h3>Analytics & Reporting</h3>
                                <p>Track campaign performance with detailed analytics and insights</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="terms-standalone-footer">
                    <button className="terms-standalone-accept-btn" onClick={() => navigate('/signup')}>
                        Accept & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsStandalone;
