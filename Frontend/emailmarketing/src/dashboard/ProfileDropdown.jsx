import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Building2 } from 'lucide-react';
import { authAPI } from '../services/api';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API call fails, clear local storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Generate consistent color based on name
    const getAvatarColor = (name) => {
        if (!name) return '#22a6a8';
        const colors = [
            '#22a6a8', '#3b82f6', '#8b5cf6', '#ec4899', 
            '#f59e0b', '#10b981', '#6366f1', '#ef4444'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const initials = getInitials(user?.name);
    const avatarColor = getAvatarColor(user?.name);

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button
                className="profile-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User menu"
            >
                {user?.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="profile-avatar-img"
                    />
                ) : (
                    <div
                        className="profile-avatar-initials"
                        style={{ backgroundColor: avatarColor }}
                    >
                        {initials}
                    </div>
                )}
                <span className="profile-username">{user?.name || 'User'}</span>
                <svg
                    className={`profile-chevron ${isOpen ? 'open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                        <div
                            className="profile-dropdown-avatar"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="profile-dropdown-info">
                            <div className="profile-dropdown-name">{user?.name || 'User'}</div>
                            <div className="profile-dropdown-email">{user?.email || ''}</div>
                        </div>
                    </div>

                    <div className="profile-dropdown-divider"></div>

                    <div className="profile-dropdown-items">
                        {/* <button className="profile-dropdown-item" onClick={() => setIsOpen(false)}>
                            <User size={18} />
                            <span>My profile</span>
                        </button> */}

                        {/* <button className="profile-dropdown-item" onClick={() => setIsOpen(false)}>
                            <Building2 size={18} />
                            <span>My plan</span>
                        </button> */}

                        <button className="profile-dropdown-item" onClick={() => {
                            setIsOpen(false);
                            navigate('/settings');
                        }}>
                            <Settings size={18} />
                            <span>Settings</span>
                        </button>
                    </div>

                    <div className="profile-dropdown-divider"></div>

                    <div className="profile-dropdown-items">
                        <button
                            className="profile-dropdown-item profile-dropdown-logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} />
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
