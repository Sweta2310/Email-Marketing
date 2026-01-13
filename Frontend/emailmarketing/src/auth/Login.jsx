import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
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

    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      await authAPI.login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          <button className="auth-tab active">LOGIN</button>
          <button className="auth-tab" onClick={() => navigate('/signup')}>SIGN IN</button>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-icon">
            <User size={40} />
          </div>

          <h1 className="auth-title">LOGIN</h1>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <User size={20} className="auth-input-icon" />
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

            <Link to="/forgot-password" className="auth-forgot">
              Forgot Password?
            </Link>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or Login With</span>
          </div>

          <div className="auth-social">
            <button type="button" className="auth-social-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={24} />
              <span>Google</span>
            </button>
            <button type="button" className="auth-social-btn">
              <FaFacebook size={24} color="#1877F2" />
              <span>Facebook</span>
            </button>
          </div>

          <div className="auth-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
