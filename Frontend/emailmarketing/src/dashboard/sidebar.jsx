import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Layers,
    Inbox,
    Mail,
    Settings,
    LogOut,
    Layout,
    Users,
    Users2,
    Target,
    HelpCircle,
    BarChart3,
    Bell,
    FileText,
    ChevronRight
} from 'lucide-react';
import LogoutModal from './modals/LogoutModal';
import './dashboard.css';

const Sidebar = ({ activeTab, setActiveTab, innerTab, setInnerTab }) => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutModal(false);
        // Redirect to login
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon"><Mail size={20} /></div>
                <span className="logo-text">Retner</span>
            </div>

            <nav className="sidebar-nav">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active={activeTab === 'Dashboard'}
                    onClick={() => {
                        setActiveTab?.('Dashboard');
                        navigate('/dashboard?tab=dashboard');
                    }}
                />
                {/* <NavItem
                    icon={<FileText size={20} />}
                    label="List"
                    active={activeTab === 'List'}
                    onClick={() => setActiveTab?.('List')}
                /> */}
                <NavItem
                    icon={<Target size={20} />}
                    label="Campaign"
                    active={activeTab === 'Campaigns'}
                    onClick={() => {
                        setActiveTab?.('Campaigns');
                        navigate('/dashboard?tab=campaigns');
                    }}
                />
                <div className="sidebar-group">
                    <NavItem
                        icon={<Users size={20} />}
                        label="Contacts"
                        active={activeTab === 'Contacts'}
                        onClick={() => {
                            setActiveTab?.('Contacts');
                            if (!innerTab) setInnerTab?.('Contact List');
                            navigate('/dashboard?tab=contacts&view=list');
                        }}
                        hasSubmenu={true}
                        isOpen={activeTab === 'Contacts'}
                    />
                    {activeTab === 'Contacts' && (
                        <div className="sidebar-submenu">
                            <SubNavItem
                                label="Lists"
                                active={innerTab === 'Contact List'}
                                onClick={() => {
                                    setInnerTab?.('Contact List');
                                    navigate('/dashboard?tab=contacts&view=list');
                                }}
                            />
                            <SubNavItem
                                label="Segments"
                                active={innerTab === 'Segment'}
                                onClick={() => {
                                    setInnerTab?.('Segment');
                                    navigate('/dashboard?tab=contacts&view=segments');
                                }}
                            />
                        </div>
                    )}
                </div>
                {/* <NavItem
                    icon={<BarChart3 size={20} />}
                    label="Analytics"
                    active={activeTab === 'Analytics'}
                    onClick={() => setActiveTab?.('Analytics')}
                /> */}
                {/* <NavItem
                    icon={<Bell size={20} />}
                    label="Notification"
                    active={activeTab === 'Notification'}
                    onClick={() => setActiveTab?.('Notification')}
                /> */}
                {/* <NavItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    active={activeTab === 'Settings'}
                    onClick={() => {
                        setActiveTab?.('Settings');
                        navigate('/settings');
                    }}
                /> */}
            </nav>

            <div className="sidebar-footer">
                {/* <NavItem
                    icon={<HelpCircle size={20} />}
                    label="Support"
                    onClick={() => { }}
                /> */}
                <NavItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    active={activeTab === 'Settings'}
                    onClick={() => {
                        setActiveTab?.('Settings');
                        navigate('/settings');
                    }}
                />
                <NavItem
                    icon={<LogOut size={20} />}
                    label="Log out"
                    onClick={handleLogoutClick}
                />
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </aside>
    );
};

const NavItem = ({ icon, label, active, onClick, hasSubmenu, isOpen }) => (
    <div className={`sidebar-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <span className="sidebar-nav-icon">{icon}</span>
            <span className="sidebar-nav-label">{label}</span>
        </div>
        {hasSubmenu && (
            <div className={`submenu-arrow ${isOpen ? 'open' : ''}`}>
                <ChevronRight size={16} />
            </div>
        )}
    </div>
);

const SubNavItem = ({ label, active, onClick }) => (
    <div className={`sidebar-subnav-item ${active ? 'active' : ''}`} onClick={onClick}>
        <span className="sidebar-subnav-label">{label}</span>
    </div>
);

export default Sidebar;
