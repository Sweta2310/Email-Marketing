import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="privacy-policy-container">
            <div className="privacy-policy-content">
                <button className="privacy-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                {/* <div className="privacy-header">
                    <h1>Privacy Policy</h1>
                    <p className="last-update">Last update: October 1st 2025</p>
                </div> */}

                <div className="toc-box">
                    <h2>Table of contents</h2>
                    <ol>
                        <li><a href="#introduction">Introduction</a>
                            <ul>
                                <li><a href="#controller">1.1. WHO IS THE DATA CONTROLLER FOR THE PROCESSING OF YOUR PERSONAL DATA?</a></li>
                                <li><a href="#scope">1.2. WHAT IS THE SCOPE OF THIS POLICY?</a></li>
                                <li><a href="#purposes">1.3. FOR WHAT PURPOSES IS YOUR PERSONAL DATA COLLECTED AND PROCESSED?</a></li>
                                <li><a href="#source">1.4. SOURCE OF COLLECTION</a></li>
                                <li><a href="#free-text">1.5. WHICH PERSONAL DATA CAN YOU PROVIDE WITHIN FREE TEXT/DATA SLOTS?</a></li>
                                <li><a href="#disclose">1.6. TO WHOM DO WE DISCLOSE YOUR PERSONAL DATA?</a></li>
                                <li><a href="#transfer">1.7. International Data Transfers</a></li>
                                <li><a href="#rights">1.8. WHAT ARE YOUR RIGHTS WITH RESPECT TO THE PROCESSING OF YOUR PERSONAL DATA?</a></li>
                                <li><a href="#contact">1.9. How to Contact Us Regarding Privacy Matters</a></li>
                                <li><a href="#children">1.10. Children's Privacy</a></li>
                            </ul>
                        </li>
                        <li><a href="#privacy-notices">Regional Privacy Notices</a></li>
                        <li><a href="#consent">Consent to Data Processing</a></li>
                        <li><a href="#data-security">Data Security</a></li>
                        <li><a href="#inbox-feature">Use of Messaging and Inbox Features</a></li>
                        <li><a href="#third-party">Third-Party Websites</a></li>
                        <li><a href="#changes">Changes to This Privacy Policy</a></li>
                        <li><a href="#definitions">Definitions</a></li>
                    </ol>
                </div>

                <div className="privacy-body">
                    <section id="introduction">
                        <h1>Introduction</h1>
                        <p>
                            Your privacy is fundamental to how our platform is built. This Privacy Policy explains what data we collect, why we collect it, and—most importantly—what we do not do with your data.
                            We do not sell your data. We do not rent it. We do not exploit it.
                        </p>
                        <p>
                            We value the trust you place in us and are committed to protecting your personal data with the highest level of care. 
                            This Privacy Policy explains how we collect, use, store, and protect information when you access or use our website, platform, and related services.
                            Our approach to privacy is built on transparency, minimal data collection, and clear boundaries around data usage. 
                            We do not believe in exploiting user information for profit, and we design our systems to respect your privacy at every stage of interaction.
                        </p>
                    </section>

                    <section id="controller">
                        <h2>1.1. WHO IS THE DATA CONTROLLER FOR THE PROCESSING OF YOUR PERSONAL DATA?</h2>
                        <p>
                            The data controller responsible for the processing of your personal data is Retner. As the data controller, we determine the purposes and means of processing personal information and ensure that it is handled lawfully, fairly, and securely.
                            We take full responsibility for protecting your data and complying with applicable data protection laws. If you have any questions or concerns regarding how your data is processed, you may contact us using the details provided in this policy.
                        </p>
                    </section>

                    <section id="scope">
                        <h2>1.2. WHAT IS THE SCOPE OF THIS POLICY?</h2>
                        <p>
                            This Privacy Policy applies to all personal data collected through our website, platform, applications, and services, whether you are a visitor, registered user, or customer. 
                            It covers data collected online, through direct interactions, file uploads, customer support communications, and system usage. 
                            This policy does not apply to third-party websites or services that may be linked from our platform, as they operate under their own privacy practices.
                        </p>
                    </section>

                    <section id="purposes">
                        <h2>1.3. FOR WHAT PURPOSES IS YOUR PERSONAL DATA COLLECTED AND PROCESSED?</h2>
                        <p>
                            We collect and process personal data strictly for legitimate and necessary purposes related to providing and improving our services. 
                            This includes enabling file uploads and data imports, operating platform features, ensuring system security, preventing misuse, and communicating essential service-related information.
                            We do not collect personal data for advertising, resale, or data-broker activities. Your data is never sold, rented, or used for commercial exploitation, and it is processed only to fulfill the specific functions you request.
                        </p>
                    </section>

                    <section id="source">
                        <h2>1.4. SOURCE OF COLLECTION</h2>
                        <p>
                            Personal data is collected directly from you when you voluntarily provide it while using our platform. 
                            This may occur when you upload files, create an account, submit forms, or communicate with our support team. 
                            We do not obtain personal data from unauthorized sources, scrape public databases, or purchase information from third parties. Any data processed through our systems originates from user-initiated actions.
                        </p>
                    </section>

                    <section id="free-text">
                        <h2>1.5. Which Personal Data Can You Provide Within Free Text or Data Slots?</h2>
                        <p>
                            Depending on how you use our services, you may provide personal data such as names, email addresses, phone numbers, or business-related contact details within free-text fields or uploaded files. 
                            You remain responsible for ensuring that you have the legal right and necessary consent to upload and process such information. 
                            We do not analyze this data for profiling or marketing purposes and treat all uploaded content as confidential.
                        </p>
                    </section>

                    <section id="disclosure">
                        <h2>1.6. To Whom Do We Disclose Your Personal Data?</h2>
                        <p>
                            We do not sell, rent, trade, or share your personal data with advertisers, data brokers, or unrelated third parties. 
                            Personal data may only be disclosed to trusted service providers who assist us in operating our infrastructure, such as hosting, security, or maintenance providers, and only to the extent necessary to perform those services. 
                            All such providers are contractually bound to maintain strict confidentiality and data protection standards. Data may also be disclosed if required by law or legal process.
                        </p>
                    </section>

                    <section id="transfer">
                        <h2>1.7. International Data Transfers</h2>
                        <p>
                           In some cases, your personal data may be processed or stored on servers located outside your country or region. 
                           When transferring data internationally, we ensure that appropriate safeguards are in place, including contractual protections and security measures, to maintain the same level of data protection regardless of location. 
                           Your privacy rights remain protected even when data is transferred across borders.
                        </p>
                    </section>

                    <section id="rights">
                        <h2>1.8. Your Rights With Respect to the Processing of Your Personal Data</h2>
                        <p>
                            You have the right to access, correct, update, or request deletion of your personal data at any time, subject to legal requirements. 
                            You may also request restrictions on processing or object to certain types of data use. We respect these rights and respond to valid requests within a reasonable timeframe. 
                            Our goal is to give you full control over your data and how it is handled.
                        </p>
                    </section>

                    <section id="contact">
                        <h2>1.9. How to Contact Us Regarding Privacy Matters</h2>
                        <p>
                            If you have any questions, concerns, or requests related to this Privacy Policy or the processing of your personal data, you may contact us at privacy@[yourdomain].com. 
                            We treat all privacy inquiries seriously and aim to resolve them promptly and transparently.
                        </p>
                    </section>

                    <section id="children">
                        <h2>1.10. Children's Privacy</h2>
                        <p>
                            Our services are not intended for use by children, and we do not knowingly collect or process personal data belonging to individuals under the applicable legal age. 
                            If we become aware that such data has been collected unintentionally, we will take immediate steps to delete it.
                        </p>
                    </section>

                    <section id="privacy-notices">
                        <h1>Regional Privacy Notices</h1>
                        <p>
                            We comply with applicable data protection laws, including GDPR, CCPA/CPRA, and India’s DPDP Act. 
                            Regardless of jurisdiction, our core privacy principle remains the same: we do not sell personal data and do not use it beyond providing our services.
                        </p>
                    </section>

                    <section id="consent">
                        <h1>Consent to Data Processing</h1>
                        <p>
                           By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy and consent to the processing of your personal data as described herein. 
                           You may withdraw consent at any time where applicable, subject to legal and operational limitations.
                        </p>
                    </section>

                    <section id="data-security">
                        <h1>Data Security</h1>
                        <p>
                           We implement appropriate technical and organizational measures to protect personal data against unauthorized access, loss, misuse, or disclosure. 
                           These measures include secure infrastructure, encrypted data transmission, access controls, and regular monitoring. While no system can guarantee absolute security, we continuously work to strengthen our safeguards.
                        </p>
                    </section>

                    <section id="inbox-feature">
                        <h1>Use of Messaging and Inbox Features</h1>
                        <p>
                            Any personal data processed through messaging, inbox, or communication features is used solely to deliver the intended messages and interactions.
                            We do not analyze these communications for advertising purposes or reuse them for unrelated activities.
                        </p>
                    </section>

                    <section id="third-party">
                        <h1>Third-Party Websites</h1>
                        <p>
                            Our platform may contain links to external websites operated by third parties. 
                            We are not responsible for the privacy practices, content, or data handling policies of those websites, and we encourage you to review their privacy policies separately.
                        </p>
                    </section>

                    <section id="changes">
                        <h1>Changes to This Privacy Policy</h1>
                        <p>
                           We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
                           Any updates will be posted on this page, and continued use of our services indicates acceptance of the revised policy.
                        </p>
                    </section>

                    <section id="definitions">
                        <h1>Definitions</h1>
                        <p>
                           For clarity, terms such as “personal data,” “processing,” and “data controller” are interpreted in accordance with applicable data protection laws and used consistently throughout this policy.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
