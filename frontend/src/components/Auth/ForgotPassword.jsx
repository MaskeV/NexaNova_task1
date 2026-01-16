// frontend/src/components/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/api';
import { VALIDATION } from '../../utils/constants';
import '../../styles/pages/Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Reset code is required';
    } else if (!/^\d{6}$/.test(formData.code)) {
      newErrors.code = 'Code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.newPassword = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', {
        email: formData.email.trim().toLowerCase()
      });
      
      toast.success(response.data.message);
      
      // Show reset code in development
      if (response.data.resetCode) {
        toast.info(`Reset Code: ${response.data.resetCode}`, {
          autoClose: false,
          closeButton: true
        });
      }
      
      setStep(2);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset code';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!validateCode()) return;
    
    try {
      setLoading(true);
      const response = await api.post('/auth/verify-reset-code', {
        email: formData.email.trim().toLowerCase(),
        code: formData.code.trim()
      });
      
      toast.success(response.data.message);
      setStep(3);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid reset code';
      toast.error(errorMessage);
      
      if (error.response?.data?.attemptsLeft !== undefined) {
        toast.warning(`Attempts left: ${error.response.data.attemptsLeft}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    try {
      setLoading(true);
      const response = await api.post('/auth/reset-password', {
        email: formData.email.trim().toLowerCase(),
        code: formData.code.trim(),
        newPassword: formData.newPassword
      });
      
      toast.success(response.data.message);
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Reset Password</h1>
            <p>
              {step === 1 && 'Enter your email to receive a reset code'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create your new password'}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestCode} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="code">Reset Code</label>
                <input
                  id="code"
                  type="text"
                  name="code"
                  className={`form-input ${errors.code ? 'error' : ''}`}
                  placeholder="Enter 6-digit code"
                  value={formData.code}
                  onChange={handleChange}
                  maxLength="6"
                  disabled={loading}
                  autoComplete="off"
                />
                {errors.code && (
                  <span className="error-message">{errors.code}</span>
                )}
                <small className="input-hint">
                  Check your email for the 6-digit code
                </small>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                type="button"
                className="submit-btn"
                style={{ background: '#6c757d', marginTop: '0.5rem' }}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back to Email
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    className={`form-input ${errors.newPassword ? 'error' : ''}`}
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword}</span>
                )}
                <small className="input-hint">
                  Minimum {VALIDATION.PASSWORD_MIN_LENGTH} characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;