import Sidebar from './sidebar';
import {
    User,
    Lock,
    Bell,
    Shield,
    Save,
    Mail,
    Globe,
    Users,
    Key,
    Cpu,
    Unlock,
    Activity,
    Database,
    HelpCircle,
    ArrowLeft,
    MoreVertical,
    Share2,
    Trash2,
    Smartphone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { marketingAPI } from '../services/marketing.services';

const Settings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    return (
        <div className="dashboard-container">
            <Sidebar activeTab="Settings" />

            <main className="main-content" style={{ padding: 0 }}>
                <div className="settings-wrapper" style={{ padding: '2rem', height: 'calc(100vh - 4rem)', overflowY: 'auto', boxSizing: 'border-box' }}>
                    <div className="settings-layout" style={{ display: 'flex', gap: '3rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100%' }}>
                        {/* Settings Navigation */}
                        <aside style={{ width: '250px', flexShrink: 0 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h2>

                            <div className="settings-nav-group">
                                <h4 className="nav-group-title">Personal settings</h4>
                                <SettingsNavLink label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} />
                                <SettingsNavLink label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                                <SettingsNavLink label="Language" active={activeTab === 'language'} onClick={() => setActiveTab('language')} />
                            </div>

                            {/* <div className="settings-nav-group">
                                <h4 className="nav-group-title">Organization settings</h4>
                                <SettingsNavLink label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} />
                                <SettingsNavLink label="Senders, domains, IPs" active={activeTab === 'senders'} onClick={() => setActiveTab('senders')} icon={<Globe size={18} />} />
                                <SettingsNavLink label="SMTP & API" active={activeTab === 'smtp'} onClick={() => setActiveTab('smtp')} icon={<Key size={18} />} />
                                <SettingsNavLink label="Aura AI control center" active={activeTab === 'aura'} onClick={() => setActiveTab('aura')} icon={<Cpu size={18} />} />
                                <SettingsNavLink label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18} />} />
                                <SettingsNavLink label="Deliverability Center" active={activeTab === 'deliverability'} onClick={() => setActiveTab('deliverability')} icon={<Activity size={18} />} />
                            </div> */}

                            {/* <div className="settings-nav-group">
                                <h4 className="nav-group-title">Data Management</h4>
                                <SettingsNavLink
                                    label="Custom objects"
                                    active={activeTab === 'custom-objects'}
                                    onClick={() => setActiveTab('custom-objects')}
                                    icon={<Database size={18} />}
                                    isPremium
                                />
                                <SettingsNavLink
                                    label="Data feeds"
                                    active={activeTab === 'data-feeds'}
                                    onClick={() => setActiveTab('data-feeds')}
                                    icon={<Activity size={18} />}
                                    isPremium
                                />
                            </div> */}
                        </aside>

                        {/* Settings Content */}
                        <main style={{ flex: 1 }}>
                            {activeTab === 'profile' && <ProfileSettings />}
                            {activeTab === 'senders' && <AddSenderView />}
                            {/* Placeholder for other tabs */}
                            {!['profile', 'senders'].includes(activeTab) && (
                                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
                                    <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings</h3>
                                    <p style={{ color: '#718096' }}>This section is under development.</p>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </main>

            <style>{`
                .settings-nav-group {
                    margin-bottom: 2rem;
                }
                .nav-group-title {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #a0aec0;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                    font-weight: 500;
                }
                .settings-nav-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 0;
                    color: #4a5568;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .settings-nav-item:hover {
                    color: #1a202c;
                }
                .settings-nav-item.active {
                    color: #5850ec;
                    font-weight: 600;
                }
                .premium-icon {
                    color: #d69e2e;
                    background: #fefcbf;
                    padding: 2px;
                    border-radius: 4px;
                    display: flex;
                }
            `}</style>
        </div>
    );
};

const SettingsNavLink = ({ label, active, onClick, isPremium, icon }) => (
    <div className={`settings-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {icon && <span style={{ color: active ? '#5850ec' : '#a0aec0' }}>{icon}</span>}
            <span>{label}</span>
        </div>
        {isPremium && <span className="premium-icon"><Key size={12} /></span>}
    </div>
);


const AddSenderView = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [fromName, setFromName] = useState('');
    const [fromEmail, setFromEmail] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (editId) {
            const fetchSenderDetails = async () => {
                try {
                    const sender = await marketingAPI.getSenderById(editId);
                    if (sender) {
                        setFromName(sender.name);
                        setFromEmail(sender.email);
                    }
                } catch (error) {
                    console.error('Fetch sender details error:', error);
                }
            };
            fetchSenderDetails();
        }
    }, [editId]);

    const handleSaveSender = async () => {
        if (!fromName || !fromEmail) {
            setMessage({ type: 'error', text: 'Please fill in all required fields.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const senderData = { name: fromName, email: fromEmail };

            if (editId) {
                await marketingAPI.updateSender(editId, senderData);
                setMessage({ type: 'success', text: 'Sender updated successfully!' });
            } else {
                await marketingAPI.createSender(senderData);
                setMessage({ type: 'success', text: 'Sender added successfully!' });
                setFromEmail('');
            }

            const returnTo = searchParams.get('returnTo');
            if (returnTo) {
                setTimeout(() => {
                    navigate(returnTo);
                }, 1000); // Small delay to show success message
            }
        } catch (error) {
            console.error('Save sender error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'An error occurred. Please try again.'
            });
        } finally {
            setLoading(false);

            // Check for returnTo
            const returnTo = searchParams.get('returnTo');
            if (returnTo && (message.type === 'success' || !message.type)) { // Only redirect on success or if setting state didn't fail
                // We depend on message state update which is async, but here we can rely on try/catch flow
                // Actually safer to redirect inside the try block
            }
        }
    };

    return (
        <div className="add-sender-view" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 420px', gap: '4rem', alignItems: 'start' }}>

                {/* Left Column: Form */}
                <div className="form-column">
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a202c' }}>
                        {editId ? 'Edit Sender' : 'Add Sender'}
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#4a5568', marginBottom: '3rem', fontWeight: 400 }}>
                        Specify what your recipients will see when they receive emails from this sender.
                    </p>

                    {message.text && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '1rem',
                            marginBottom: '2rem',
                            background: message.type === 'success' ? '#f0fff4' : '#fff5f5',
                            color: message.type === 'success' ? '#2f855a' : '#c53030',
                            border: `1px solid ${message.type === 'success' ? '#c6f6d5' : '#fed7d7'}`,
                            fontSize: '0.9375rem',
                            fontWeight: 500
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            From Name <span style={{ color: '#e53e3e' }}>*</span>
                        </label>
                        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem', lineHeight: 1.4 }}>
                            Specify what your recipients will see when they receive emails from this sender.
                        </p>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={fromName}
                            onChange={(e) => setFromName(e.target.value)}
                            style={{
                                width: '100%',
                                height: '3.75rem',
                                padding: '0 1.25rem',
                                border: '2px solid #5850ec',
                                borderRadius: '1.25rem',
                                outline: 'none',
                                fontSize: '1.125rem',
                                color: '#1a202c'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            From Email <span style={{ color: '#e53e3e' }}>*</span>
                        </label>
                        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                            From email is the sender email address from which your recipients will receive your emails.
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem', lineHeight: 1.4 }}>
                            Format must be name@domain.com.
                        </p>
                        <input
                            type="email"
                            placeholder="john.doe@email.com"
                            value={fromEmail}
                            onChange={(e) => setFromEmail(e.target.value)}
                            style={{
                                width: '100%',
                                height: '3.75rem',
                                padding: '0 1.25rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '1.25rem',
                                outline: 'none',
                                fontSize: '1.125rem',
                                color: '#1a202c',
                                background: '#f8fafc'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem' }}>
                        <button
                            onClick={() => { setFromName(''); setFromEmail(''); setMessage({ type: '', text: '' }); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#5850ec',
                                fontWeight: 700,
                                fontSize: '1.125rem',
                                cursor: 'pointer',
                                padding: '0.5rem 1rem'
                            }}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveSender}
                            disabled={loading}
                            style={{
                                background: loading ? '#cbd5e0' : '#5850ec',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 3rem',
                                borderRadius: '1.5rem',
                                fontWeight: 700,
                                fontSize: '1.125rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s'
                            }}>
                            {loading ? 'Saving...' : (editId ? 'Update sender' : 'Add sender')}
                        </button>
                    </div>
                </div>

                {/* Right Column: Mobile Preview */}
                <div className="preview-column" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="phone-outer-frame" style={{
                        width: '320px',
                        height: '560px',
                        background: 'white',
                        borderRadius: '3rem',
                        border: '1px solid #e2e8f0',
                        padding: '1.5rem',
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        {/* Notch/Top bits */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>9:41</span>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: '#94a3b8' }}>
                                <Activity size={12} />
                                <Smartphone size={12} />
                                <span>🔋</span>
                            </div>
                        </div>

                        {/* Top bar icons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
                            <ArrowLeft size={20} color="#64748b" />
                            <div style={{ flex: 1 }}></div>
                            <Share2 size={18} color="#64748b" />
                            <Trash2 size={18} color="#64748b" />
                            <MoreVertical size={18} color="#64748b" />
                        </div>

                        {/* Content Area */}
                        <div style={{ padding: '0 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid #cbd5e1' }}></div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Inbox</h3>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '2.5rem', paddingLeft: '1.75rem' }}>
                                10 June 2021, 19:45
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>From:</span>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: '#e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8'
                                }}>
                                    <User size={18} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {fromName || 'John Doe'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {fromEmail || 'john.doe@email.com'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PasswordChangeSection = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords({
            ...showPasswords,
            [field]: !showPasswords[field]
        });
    };

    const handleChangePassword = async () => {
        setMessage({ type: '', text: '' });

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'All fields are required' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
            return;
        }

        setLoading(true);

        try {
            const response = await profileAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword,
                passwordData.confirmPassword
            );
            setMessage({ type: 'success', text: response.message || 'Password changed successfully!' });
            // Clear form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Change password error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#1a202c' }}>
                Set Password
            </h3>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '2rem',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    fontSize: '0.9375rem',
                    fontWeight: 500
                }}>
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
                {/* Current Password */}
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a202c' }}>
                        Current Password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            style={{
                                width: '100%',
                                padding: '0 3rem 0 1rem',
                                height: '3rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                outline: 'none',
                                fontSize: '0.9375rem',
                                color: '#1a202c'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280'
                            }}
                        >
                            {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a202c' }}>
                        Enter a new password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handleChange}
                            placeholder="New password"
                            style={{
                                width: '100%',
                                padding: '0 3rem 0 1rem',
                                height: '3rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                outline: 'none',
                                fontSize: '0.9375rem',
                                color: '#1a202c'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280'
                            }}
                        >
                            {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a202c' }}>
                        Confirm your new password <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            style={{
                                width: '100%',
                                padding: '0 3rem 0 1rem',
                                height: '3rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                outline: 'none',
                                fontSize: '0.9375rem',
                                color: '#1a202c'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280'
                            }}
                        >
                            {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => {
                            setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                            });
                            setMessage({ type: '', text: '' });
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#22a6a8',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            padding: '0.875rem 2rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        style={{
                            background: loading ? '#cbd5e0' : '#22a6a8',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem 2.5rem',
                            borderRadius: '0.75rem',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Changing...' : 'Set a password'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileSettings = () => {
    const [activeTab, setActiveTab] = useState('information');
    const [countryCode, setCountryCode] = useState('+91');
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        website: '',
        street: '',
        zipCode: '',
        city: '',
        country: 'India'
    });
    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch profile data on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await profileAPI.getProfile();
                setFormData({
                    email: profileData.email || '',
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    phone: profileData.phone || '',
                    company: profileData.company || '',
                    website: profileData.website || '',
                    street: profileData.street || '',
                    zipCode: profileData.zipCode || '',
                    city: profileData.city || '',
                    country: profileData.country || 'India'
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                setMessage({ type: 'error', text: 'Failed to load profile data' });
            } finally {
                setFetchingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await profileAPI.updateProfile(formData);
            setMessage({ type: 'success', text: response.message || 'Profile updated successfully!' });
        } catch (error) {
            console.error('Update profile error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-section" style={{ background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Profile</h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '2px solid #e5e7eb', marginBottom: '3rem' }}>
                <button
                    onClick={() => setActiveTab('information')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '1rem 0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: activeTab === 'information' ? '#22a6a8' : '#6b7280',
                        borderBottom: activeTab === 'information' ? '2px solid #22a6a8' : '2px solid transparent',
                        marginBottom: '-2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Information
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '1rem 0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: activeTab === 'password' ? '#22a6a8' : '#6b7280',
                        borderBottom: activeTab === 'password' ? '2px solid #22a6a8' : '2px solid transparent',
                        marginBottom: '-2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Password
                </button>
                <button
                    onClick={() => setActiveTab('legal')}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '1rem 0',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: activeTab === 'legal' ? '#22a6a8' : '#6b7280',
                        borderBottom: activeTab === 'legal' ? '2px solid #22a6a8' : '2px solid transparent',
                        marginBottom: '-2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Legal Documents
                </button>
            </div>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '2rem',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    fontSize: '0.9375rem',
                    fontWeight: 500
                }}>
                    {message.text}
                </div>
            )}

            {/* Information Tab */}
            {activeTab === 'information' && (
                <div>
                    {/* Personal Information */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a202c' }}>
                            Personal information
                        </h3>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <ProfileInputField
                                label="Email address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <ProfileInputField
                                    label="First name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <ProfileInputField
                                    label="Last name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <PhoneInputField
                                label="Phone number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                countryCode={countryCode}
                                onCountryCodeChange={setCountryCode}
                                required
                            />
                        </div>
                    </div>

                    {/* Company Information */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a202c' }}>
                            Company information
                        </h3>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <ProfileInputField
                                label="Company / Organization"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                required
                            />

                            <ProfileInputField
                                label="Website (optional)"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="www.mywebsite.com"
                                helpText="Example: www.mywebsite.com or https://www.mywebsite.com/"
                            />

                            <ProfileInputField
                                label="Street address"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                required
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <ProfileInputField
                                    label="ZIP code"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                />
                                <ProfileInputField
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a202c' }}>
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0 1rem',
                                        height: '3rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid #e5e7eb',
                                        outline: 'none',
                                        fontSize: '0.9375rem',
                                        color: '#1a202c',
                                        background: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="India">India</option>
                                    <option value="USA">United States</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Australia">Australia</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Update Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            style={{
                                background: loading ? '#cbd5e0' : '#22a6a8',
                                color: 'white',
                                border: 'none',
                                padding: '0.875rem 2.5rem',
                                borderRadius: '0.75rem',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && <PasswordChangeSection />}

            {/* Legal Documents Tab */}
            {activeTab === 'legal' && (
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#1a202c' }}>
                        Terms of Service
                    </h3>

                    <div style={{ marginBottom: '3rem', lineHeight: '1.8', color: '#4a5568' }}>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>
                            By subscribing to a Retner account or by using the platform or the services provided by Retner you accept, on behalf of your organization, Retner's{' '}
                            <a href="#" style={{ color: '#22a6a8', textDecoration: 'underline', fontWeight: 500 }}>
                                General Conditions of Use
                            </a>{' '}
                            as well as our{' '}
                            <a href="#" style={{ color: '#22a6a8', textDecoration: 'underline', fontWeight: 500 }}>
                                Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a href="#" style={{ color: '#22a6a8', textDecoration: 'underline', fontWeight: 500 }}>
                                Anti-Spam Policy
                            </a>.
                        </p>
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#1a202c' }}>
                        Data Processing Agreement
                    </h3>

                    <div style={{ lineHeight: '1.8', color: '#4a5568' }}>
                        <p style={{ fontSize: '0.9375rem' }}>
                            In accordance with article 28 of the General Data Protection Regulation (GDPR), a Data Processing Agreement (DPA) forms part with Retner's General Conditions of Use. The DPA is entered into by your organization and is applicable upon subscription to a Retner account or upon usage of Retner's services or platform. Retner provides a SaaS standard solution, without any possibility of specific developments, allowing its hundreds of thousands of users to benefit from features that are available "as is" on Retner's platform. The DPA provides a ready-to-use agreement that reflects the standard processing of personal data at Retner.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Country codes data
const countryCodes = [
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+355', country: 'Albania', flag: '🇦🇱' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
];

const PhoneInputField = ({ label, required, value, onChange, countryCode, onCountryCodeChange, ...props }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCountries = countryCodes.filter(country =>
        country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.includes(searchQuery)
    );

    const selectedCountry = countryCodes.find(c => c.code === countryCode) || countryCodes[5];

    return (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a202c' }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                <div style={{ position: 'relative', width: '140px' }}>
                    <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            width: '100%',
                            height: '3rem',
                            padding: '0 0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontSize: '0.9375rem',
                            color: '#1a202c'
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>{selectedCountry.flag}</span>
                            <span>{selectedCountry.code}</span>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>▼</span>
                    </button>

                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.25rem)',
                            left: 0,
                            width: '320px',
                            maxHeight: '320px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                <input
                                    type="text"
                                    placeholder="Search a country or country code"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.75rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                        fontSize: '0.875rem'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                                {filteredCountries.map((country) => (
                                    <button
                                        key={country.code + country.country}
                                        type="button"
                                        onClick={() => {
                                            onCountryCodeChange(country.code);
                                            setShowDropdown(false);
                                            setSearchQuery('');
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: 'none',
                                            background: countryCode === country.code ? '#f3f4f6' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            cursor: 'pointer',
                                            fontSize: '0.9375rem',
                                            color: '#1a202c',
                                            textAlign: 'left',
                                            transition: 'background 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = countryCode === country.code ? '#f3f4f6' : 'white'}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{country.flag}</span>
                                        <span style={{ flex: 1 }}>{country.country}</span>
                                        <span style={{ color: '#6b7280' }}>{country.code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="tel"
                    value={value}
                    onChange={onChange}
                    style={{
                        flex: 1,
                        height: '3rem',
                        padding: '0 1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        outline: 'none',
                        fontSize: '0.9375rem',
                        color: '#1a202c',
                        transition: 'border-color 0.2s'
                    }}
                    {...props}
                />
            </div>

            {showDropdown && (
                <div
                    onClick={() => setShowDropdown(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
};

const ProfileInputField = ({ label, required, helpText, icon, ...props }) => (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a202c' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
            {icon && (
                <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.25rem'
                }}>
                    {icon}
                </span>
            )}
            <input
                style={{
                    width: '100%',
                    padding: icon ? '0 1rem 0 3rem' : '0 1rem',
                    height: '3rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    outline: 'none',
                    fontSize: '0.9375rem',
                    color: '#1a202c',
                    transition: 'border-color 0.2s'
                }}
                {...props}
            />
        </div>
        {helpText && (
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>
                {helpText}
            </p>
        )}
    </div>
);

const InputField = ({ label, ...props }) => (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4a5568' }}>{label}</label>
        <input
            style={{ width: '100%', padding: '0 1.25rem', height: '3.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9375rem' }}
            {...props}
        />
    </div>
);

export default Settings;
