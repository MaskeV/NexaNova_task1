// frontend/src/components/Profile/MyProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, createMyProfile, updateMyProfile, deleteMyProfile } from '../../services/profileService';
import { getAllSubjects } from '../../services/subjectService';
import Loading from '../Common/Loading';
import '../../styles/pages/Profile.css';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subjects: [],
    experience: ''
  });
  const [errors, setErrors] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [generatedEmpId, setGeneratedEmpId] = useState('');
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to access your profile');
      navigate('/login');
      return;
    }

    fetchProfile();
    fetchAvailableSubjects();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching profile for user:', user?.email);
      
      const response = await getMyProfile();
      console.log('✅ Profile API Response:', response);
      
      if (response.success && response.data) {
        const profileData = response.data;
        setProfile(profileData);
        setHasProfile(true);
        setGeneratedEmpId(profileData.empId || '');
        
        // Set form data from profile
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          subjects: profileData.subjects || [],
          experience: profileData.experience?.toString() || ''
        });
        
        console.log('✅ Profile loaded successfully');
      }
    } catch (error) {
      console.log('📭 Profile fetch status:', error.response?.status, 'Code:', error.code);
      
      if (error.code === 'PROFILE_NOT_FOUND' || error.response?.status === 404) {
        // No profile exists - this is normal for new users
        console.log('👤 No profile found - user can create one');
        setHasProfile(false);
        setProfile(null);
        setGeneratedEmpId(''); // Will be generated on creation
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        console.error('❌ Error loading profile:', error);
        toast.error('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await getAllSubjects();
      setAvailableSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setAvailableSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubjectToggle = (subjectId) => {
    const currentSubjects = [...(formData.subjects || [])];
    const index = currentSubjects.indexOf(subjectId);
    
    if (index === -1) {
      currentSubjects.push(subjectId);
    } else {
      currentSubjects.splice(index, 1);
    }
    
    setFormData({
      ...formData,
      subjects: currentSubjects
    });
  };

  const handleSelectAll = () => {
    const allSubjectIds = (availableSubjects || []).map(subject => subject.subjectId);
    setFormData({
      ...formData,
      subjects: allSubjectIds
    });
  };

  const handleClearAll = () => {
    setFormData({
      ...formData,
      subjects: []
    });
  };

  const toggleDropdown = () => {
    if ((availableSubjects || []).length > 0) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const removeSubject = (subjectId) => {
    const updatedSubjects = (formData.subjects || []).filter(id => id !== subjectId);
    setFormData({
      ...formData,
      subjects: updatedSubjects
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Phone validation
    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';
    }

    // Experience validation
    if (formData.experience && formData.experience !== '') {
      const exp = parseInt(formData.experience);
      if (isNaN(exp) || exp < 0) {
        newErrors.experience = 'Experience must be a positive number';
      } else if (exp > 50) {
        newErrors.experience = 'Experience cannot exceed 50 years';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      setSaving(true);

      // Prepare data for backend
      const profileData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        subjects: formData.subjects || [],
        experience: parseInt(formData.experience) || 0
      };

      console.log('📤 Submitting profile data:', profileData);

      let result;
      if (hasProfile) {
        // Update existing profile
        result = await updateMyProfile(profileData);
        toast.success('Profile updated successfully!');
      } else {
        // Create new profile
        result = await createMyProfile(profileData);
        toast.success('Profile created successfully!');
        setHasProfile(true);
        
        // Store generated empId from response
        if (result.data?.empId) {
          setGeneratedEmpId(result.data.empId);
        }
      }
      
      console.log('✅ Profile saved successfully:', result);
      
      // Refresh profile data
      await fetchProfile();
      setIsEditing(false);
      
    } catch (error) {
      console.error('❌ Save profile error:', error.response?.data || error);
      
      const errorMessage = error.response?.data?.message || 'Failed to save profile. Please try again.';
      toast.error(errorMessage);
      
      // Set specific field errors if available
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: errorMessage }));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your trainer profile? This action cannot be undone.')) {
      try {
        await deleteMyProfile();
        toast.success('Profile deleted successfully!');
        
        // Reset all state
        setHasProfile(false);
        setProfile(null);
        setGeneratedEmpId('');
        setFormData({
          name: '',
          phone: '',
          subjects: [],
          experience: ''
        });
        setIsEditing(true); // Show create form again
        
        // Refresh
        fetchProfile();
      } catch (error) {
        console.error('Delete profile error:', error);
        toast.error('Failed to delete profile');
      }
    }
  };

  // Show loading state
  if (loading) {
    return <Loading message="Loading your profile..." />;
  }

  // Admin users view (they don't need trainer profiles)
  const isAdmin = user?.role === 'admin';
  if (isAdmin) {
    return (
      <div className="profile-container">
        <div className="page-header">
          <h1>My Profile</h1>
        </div>
        <div className="admin-info-card card">
          <div className="admin-badge-large">ADMIN</div>
          <div className="admin-details">
            <h2>Administrator Account</h2>
            <div className="detail-row">
              <span className="detail-label">Username:</span>
              <span className="detail-value">{user?.username || 'Admin'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <span className="detail-value">Administrator</span>
            </div>
          </div>
          <div className="admin-info-message">
            <p>ℹ️ As an administrator, you don't need a trainer profile. You can manage trainers and subjects from the respective pages.</p>
          </div>
        </div>
      </div>
    );
  }

  // Regular users - decide what to show
  const showForm = !hasProfile || isEditing;

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Trainer Profile</h1>
        
        {hasProfile && !isEditing ? (
          <div className="header-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleDelete}
            >
              Delete Profile
            </button>
          </div>
        ) : !hasProfile && !isEditing ? (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsEditing(true)}
          >
            Create Profile
          </button>
        ) : null}
      </div>

      {showForm ? (
        <div className="profile-form card">
          <h2>{hasProfile ? 'Edit Your Profile' : 'Create Trainer Profile'}</h2>
          
          {!hasProfile && (
            <div className="create-profile-info">
              <p>Welcome! Create your trainer profile to get started.</p>
              <p className="empId-notice">
                Your Employee ID will be automatically generated upon creation.
              </p>
            </div>
          )}
          
          {hasProfile && profile?.empId && (
            <div className="current-empId-display">
              <p><strong>Employee ID:</strong> {profile.empId}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user?.email || ''}
                    readOnly
                    disabled
                  />
                  <small className="form-text">Your login email (cannot be changed)</small>
                </div>

                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="John Doe"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${errors.phone ? 'error' : ''}`}
                    placeholder="9876543210"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    maxLength="10"
                    required
                    disabled={saving}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                  <small className="form-text">10-digit mobile number starting with 6-9</small>
                </div>

                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    className={`form-control ${errors.experience ? 'error' : ''}`}
                    placeholder="0"
                    min="0"
                    max="50"
                    value={formData.experience || ''}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  {errors.experience && <span className="error-text">{errors.experience}</span>}
                  <small className="form-text">Years of experience (0-50)</small>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Subjects</h3>
              
              <div className="form-group" ref={dropdownRef}>
                <label>Select Subjects</label>
                {loadingSubjects ? (
                  <div className="loading-subjects">Loading subjects...</div>
                ) : (availableSubjects || []).length === 0 ? (
                  <div className="no-subjects-warning">
                    <p>⚠️ No subjects available in the system yet.</p>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`custom-dropdown ${dropdownOpen ? 'open' : ''}`}
                      onClick={toggleDropdown}
                    >
                      <div className="dropdown-selected">
                        {(formData.subjects || []).length === 0 
                          ? <span className="placeholder">Click to select subjects (optional)</span>
                          : <span className="selected-count">{(formData.subjects || []).length} subject(s) selected</span>
                        }
                        <span className={`dropdown-arrow ${dropdownOpen ? 'up' : 'down'}`}>
                          {dropdownOpen ? '▲' : '▼'}
                        </span>
                      </div>
                      
                      {dropdownOpen && (
                        <div className="dropdown-menu">
                          <div className="dropdown-header">
                            <div className="dropdown-title">Select Subjects</div>
                            <div className="dropdown-actions">
                              <button 
                                type="button" 
                                className="action-btn select-all" 
                                onClick={handleSelectAll}
                                disabled={saving}
                              >
                                Select All
                              </button>
                              <button 
                                type="button" 
                                className="action-btn clear-all" 
                                onClick={handleClearAll}
                                disabled={saving}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          
                          <div className="dropdown-options">
                            {(availableSubjects || []).map((subject) => (
                              <div 
                                key={subject.subjectId} 
                                className={`dropdown-option ${(formData.subjects || []).includes(subject.subjectId) ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubjectToggle(subject.subjectId);
                                }}
                              >
                                <div className="option-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={(formData.subjects || []).includes(subject.subjectId)}
                                    onChange={() => {}}
                                    className="checkbox"
                                    disabled={saving}
                                  />
                                </div>
                                <div className="option-content">
                                  <div className="option-id">{subject.subjectId || 'N/A'}</div>
                                  <div className="option-name">{subject.name || 'Unnamed Subject'}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <small className="form-text">Select the subjects you can teach</small>
                  </>
                )}
              </div>

              {(formData.subjects || []).length > 0 && (
                <div className="selected-subjects-preview">
                  <div className="preview-header">
                    <strong>Selected Subjects ({(formData.subjects || []).length})</strong>
                    <button 
                      type="button" 
                      className="clear-preview-btn" 
                      onClick={handleClearAll}
                      disabled={saving}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="selected-tags">
                    {(formData.subjects || []).map((subjectId) => {
                      const subject = (availableSubjects || []).find(s => s.subjectId === subjectId);
                      return (
                        <span key={subjectId} className="selected-tag">
                          {subject?.name || subjectId}
                          <button 
                            type="button" 
                            className="remove-tag-btn"
                            onClick={() => removeSubject(subjectId)}
                            disabled={saving}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
              >
                {saving ? (
                  <span className="saving-indicator">
                    <span className="spinner"></span> Saving...
                  </span>
                ) : hasProfile ? (
                  'Update Profile'
                ) : (
                  'Create Profile'
                )}
              </button>
              
              {hasProfile && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile(); // Reload original data
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : profile ? (
        <div className="profile-view card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h2>{profile?.name || 'No Name'}</h2>
              <p className="profile-empid">
                <span className="label">Employee ID:</span> {profile?.empId || 'Not assigned'}
              </p>
              <p className="profile-email">
                <span className="label">Email:</span> {profile?.email || user?.email}
              </p>
            </div>
          </div>

          <div className="profile-details">
            <h3>Profile Details</h3>
            
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{profile?.phone || 'Not provided'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Experience:</span>
              <span className="detail-value">{profile?.experience || 0} years</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Profile Created:</span>
              <span className="detail-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Last Updated:</span>
              <span className="detail-value">
                {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
            
            <div className="detail-row subjects-row">
              <span className="detail-label">Subjects:</span>
              <div className="subject-tags">
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="no-subjects">No subjects assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-profile-card card">
          <div className="no-profile-content">
            <h3>No Trainer Profile Found</h3>
            <p>You don't have a trainer profile yet. Create one to get started!</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsEditing(true)}
            >
              Create Trainer Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;