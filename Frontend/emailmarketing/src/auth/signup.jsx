import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { authAPI } from '../services/api';
import TermsModal from './TermsModal';
import '../auth/Login.css';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignup = () => {
        window.location.href = "http://localhost:8000/api/auth/google";
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('All fields are required');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!acceptedTerms) {
            setError('You must accept the Terms and Conditions to continue');
            return;
        }

        // Show terms modal instead of directly signing up
        setShowTermsModal(true);
    };

    const handleAcceptTerms = async () => {
        setShowTermsModal(false);
        setLoading(true);

        try {
            await authAPI.signup(formData.name, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side - Diagonal Gradient */}
            <div className="auth-left">
                <div className="auth-diagonal-bg"></div>
                <div className="auth-tabs">
                    <button className="auth-tab" onClick={() => navigate('/login')}>LOGIN</button>
                    <button className="auth-tab active">SIGN IN</button>
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="auth-right">
                <div className="auth-form-wrapper">
                    <div className="auth-icon">
                        <User size={40} />
                    </div>

                    <h1 className="auth-title">SIGN UP</h1>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <User size={20} className="auth-input-icon" />
                            <input
                                type="text"
                                id="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                                className="auth-input"
                            />
                        </div>

                        <div className="auth-input-group">
                            <Mail size={20} className="auth-input-icon" />
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                className="auth-input"
                            />
                        </div>

                        <div className="auth-input-group">
                            <Lock size={20} className="auth-input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                className="auth-input"
                            />
                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="auth-terms-wrapper">
                            <label className="auth-terms-label">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="auth-terms-checkbox"
                                />
                                <span>I accept the <Link to="/terms" className="auth-terms-link">Terms and Conditions</Link></span>
                            </label>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? 'SIGNING UP...' : 'SIGN UP'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>Or Sign Up With</span>
                    </div>

                    <div className="auth-social">
                        <button type="button" className="auth-social-btn" onClick={handleGoogleSignup}>
                            <FcGoogle size={24} />
                            <span>Google</span>
                        </button>
                        <button type="button" className="auth-social-btn">
                            <FaFacebook size={24} color="#1877F2" />
                            <span>Facebook</span>
                        </button>
                    </div>

                    <div className="auth-link">
                        Already have an account? <Link to="/login">Log in</Link>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions Modal */}
            <TermsModal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                onAccept={handleAcceptTerms}
            />
        </div>
    );
};

export default Signup;
