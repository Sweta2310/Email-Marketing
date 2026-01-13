import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Bell,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Download,
    Globe
} from 'lucide-react';
import Sidebar from './sidebar';
import EmailLog from './logs/EmailLog';
import CampaignModal from './campagin/campagin';
import ContactsMain from './contacts/ContactsMain';
import TemplateGrid from './templates/templategrid';
import CampaignList from './campaigns/CampaignList';
import ProfileDropdown from './ProfileDropdown';
import { authAPI } from '../services/api';
import './dashboard.css';

const Dashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Dashboard');
    const [innerTab, setInnerTab] = useState(location.state?.innerTab || 'Contact List');
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [campaignFolderId, setCampaignFolderId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tabParam = query.get('tab');
        const viewParam = query.get('view');

        if (tabParam) {
            const tabMap = {
                'dashboard': 'Dashboard',
                'contacts': 'Contacts',
                'campaigns': 'Campaigns',
                'settings': 'Settings'
            };
            if (tabMap[tabParam]) setActiveTab(tabMap[tabParam]);
        } else if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }

        if (viewParam) {
            const viewMap = {
                'list': 'Contact List',
                'import': 'Import Options',
                'import-companies': 'Import Companies',
                'import-contacts-file': 'Import Contacts File',
                'segments': 'Segment',
                'create-segment': 'Segment'
            };
            if (viewMap[viewParam]) setInnerTab(viewMap[viewParam]);
        } else if (location.state?.innerTab) {
            setInnerTab(location.state.innerTab);
        }
    }, [location.state, location.search]);

    // Fetch current user data
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await authAPI.getCurrentUser();
                setCurrentUser(response.user);
            } catch (error) {
                console.error('Error fetching current user:', error);
                // If user data fetch fails, try to get from localStorage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                }
            }
        };

        fetchCurrentUser();
    }, []);

    const stats = [
        { title: 'Total Sent', value: '21,300', change: '+42%', up: true },
        { title: 'Total Delivered', value: '1,200', change: '+22%', up: true },
        { title: 'New Subscribe', value: '5,790', change: '+22%', up: true },
        { title: 'Total Unsubscribe', value: '200', change: '-12%', up: false },
    ];

    const emailPerformance = [
        { date: '6/19/14', email: 'nevaeh.simmons@example.com', name: 'Nevaeh Simmons', sent: 1, ctr: '13%', delivered: '60.0%', unsub: '12.5%', spam: '10.0%' },
        { date: '12/10/13', email: 'tim.jennings@example.com', name: 'Tim Jennings', sent: 1, ctr: '22%', delivered: '80.0%', unsub: '97.5%', spam: '52.5%' },
        { date: '8/30/14', email: 'georgia.young@example.com', name: 'Georgia Young', sent: 1, ctr: '12.85%', delivered: '70.0%', unsub: '85.0%', spam: '30.0%' },
        { date: '6/21/19', email: 'felicia.reid@example.com', name: 'Felicia Reid', sent: 1, ctr: '61%', delivered: '97.5%', unsub: '45.0%', spam: '50.0%' },
    ];

    return (
        <div className="dashboard-container">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                innerTab={innerTab}
                setInnerTab={setInnerTab}
            />

            {/* Main Content */}
            <main className="main-content">
                {activeTab === 'Dashboard' && (
                    <header className="header">
                        <div>
                            <h2 style={{ fontSize: '3.0rem', fontWeight: 1000 }}>
                                Hello {currentUser?.name || 'User'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Welcome to your dashboard</p>
                        </div>

                        <div className="header-actions">
                            <div className="icon-btn"><Bell size={20} /></div>
                            <ProfileDropdown user={currentUser} />
                        </div>
                    </header>
                )}

                <div className="dashboard-grid">
                    {activeTab === 'Dashboard' ? (
                        <>
                            {/* Stat Cards */}
                            {stats.map((stat, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-header">
                                        <span>{stat.title}</span>
                                        <div style={{ width: 40, height: 20, background: '#f7fafc', borderRadius: 4 }}></div>
                                    </div>
                                    <div className="stat-value">{stat.value}</div>
                                    <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
                                        {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {stat.change}
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>From Last Month</span>
                                    </div>
                                </div>
                            ))}

                            {/* Performance Chart Placeholder */}
                            <div className="performance-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem' }}>Performance</h3>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', alignItems: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#cbd5e0' }}></div> User Joined</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#22a6a8' }}></div> Campaign Active</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: 2, background: '#2d3748' }}></div> Email Sent</span>
                                    </div>
                                </div>
                                <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                                    {[60, 40, 80, 50, 70, 90, 65].map((h, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: '2px' }}>
                                            <div style={{ height: h, background: '#cbd5e0', borderRadius: '4px 4px 0 0' }}></div>
                                            <div style={{ height: h * 0.6, background: '#22a6a8', borderRadius: '4px 4px 0 0' }}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Email Performance Table */}
                            <div className="table-card">
                                <div className="table-header">
                                    <h3 style={{ fontSize: '1rem' }}>All Email Performance</h3>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div className="header-search" style={{ width: '240px' }}>
                                            {/* <Search size={16} color="var(--text-muted)" /> */}
                                            <input type="text" placeholder="Search" style={{ fontSize: '0.85rem' }} />
                                        </div>
                                        <button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                                            <Download size={14} /> Export
                                        </button>
                                        <div className="icon-btn" style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}><MoreHorizontal size={16} /></div>
                                    </div>
                                </div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th><input type="checkbox" /></th>
                                            <th>Date</th>
                                            <th>Email</th>
                                            <th>Sent</th>
                                            <th>Click-Through Rate</th>
                                            <th>Delivered Rate</th>
                                            <th>Unsubscribed - rate</th>
                                            <th>Spam Report Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emailPerformance.map((item, i) => (
                                            <tr key={i}>
                                                <td><input type="checkbox" /></td>
                                                <td>{item.date}</td>
                                                <td>
                                                    <div className="user-cell">
                                                        <img src={`https://ui-avatars.com/api/?name=${item.name}&background=random`} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                                                        <span>{item.email}</span>
                                                    </div>
                                                </td>
                                                <td>{item.sent}</td>
                                                <td>{item.ctr}</td>
                                                <td>{item.delivered}</td>
                                                <td>{item.unsub}</td>
                                                <td>{item.spam}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Geography Card - Moved below Email Performance */}
                            <div className="geo-card">
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Geography</h3>
                                <div style={{ position: 'relative', height: '200px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyItems: 'center', overflow: 'hidden' }}>
                                    <Globe size={100} color="#e2e8f0" style={{ margin: 'auto' }} />
                                    <div style={{ position: 'absolute', top: '40%', left: '60%', background: 'white', padding: '8px', borderRadius: '8px', boxShadow: 'var(--shadow)', fontSize: '0.75rem' }}>
                                        <p style={{ fontWeight: 600 }}>Ethiopia</p>
                                        <p style={{ color: 'var(--primary-color)' }}>12000 User</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', border: '5px solid var(--primary-color)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>80%</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ width: 60, height: 60, borderRadius: '50%', border: '5px solid #2d3748', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>20%</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversion</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'EmailLog' ? (
                        <div style={{ gridColumn: 'span 5' }}>
                            <EmailLog onCreateCampaign={() => setShowCampaignModal(true)} />
                        </div>
                    ) : activeTab === 'Contacts' ? (
                        <div style={{ gridColumn: 'span 5' }}>
                            <ContactsMain
                                activeInnerTab={innerTab}
                                setActiveInnerTab={setInnerTab}
                            />
                        </div>
                    ) : activeTab === 'Templates' ? (
                        <div style={{ gridColumn: 'span 5' }}>
                            <TemplateGrid />
                        </div>
                    ) : activeTab === 'Campaigns' ? (
                        <div style={{ gridColumn: 'span 5' }}>
                            <CampaignList
                                onCreateCampaign={(folderId) => {
                                    setCampaignFolderId(folderId);
                                    setShowCampaignModal(true);
                                }}
                                onBack={() => setActiveTab('Dashboard')}
                            />
                        </div>
                    ) : (
                        <div style={{ gridColumn: 'span 5', textAlign: 'center', padding: '4rem' }}>
                            <h2>{activeTab} Content Loading...</h2>
                        </div>
                    )}
                </div>

                <CampaignModal
                    isOpen={showCampaignModal}
                    onClose={() => setShowCampaignModal(false)}
                    folderId={campaignFolderId}
                />
            </main >
        </div >
    );
};

export default Dashboard;
