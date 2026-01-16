// frontend/src/components/Profile/MyProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getMyProfile, createMyProfile, updateMyProfile, deleteMyProfile } from '../../services/profileService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllTrainers } from '../../services/trainerService';
import Loading from '../Common/Loading';
import '../../styles/pages/Profile.css';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    email: '',
    phone: '',
    subjects: [],
    experience: ''
  });
  const [errors, setErrors] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
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
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getMyProfile();
      setProfile(response.data);
      setHasProfile(true);
      setFormData({
        empId: response.data.empId || '',
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        subjects: response.data.subjects || [],
        experience: response.data.experience || ''
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
        setProfile(null);
        generateEmpId();
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateEmpId = async () => {
    try {
      const response = await getAllTrainers();
      const trainers = response.data;
      
      let maxNum = 0;
      trainers.forEach(trainer => {
        if (trainer.empId) {
          const match = trainer.empId.match(/EMP(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
          }
        }
      });

      const nextNum = maxNum + 1;
      const newEmpId = `EMP${String(nextNum).padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, empId: newEmpId }));
    } catch (error) {
      console.error('Failed to generate ID:', error);
      setFormData(prev => ({ ...prev, empId: 'EMP001' }));
    }
  };

  const fetchAvailableSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await getAllSubjects();
      setAvailableSubjects(response.data || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
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

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.phone || formData.phone.trim() === '') {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must start with 6, 7, 8, or 9';
    }

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

      const profileData = {
        empId: formData.empId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subjects: formData.subjects || [],
        experience: parseInt(formData.experience) || 0
      };

      if (hasProfile) {
        await updateMyProfile(profileData);
        toast.success('Profile updated successfully!');
      } else {
        await createMyProfile(profileData);
        toast.success('Profile created successfully!');
        setHasProfile(true);
      }
      
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save profile';
      toast.error(errorMessage);
      
      if (errorMessage.includes('Employee ID')) {
        setErrors(prev => ({ ...prev, empId: errorMessage }));
      } else if (errorMessage.includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
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
        setHasProfile(false);
        setProfile(null);
        setFormData({
          empId: '',
          name: '',
          email: '',
          phone: '',
          subjects: [],
          experience: ''
        });
        generateEmpId();
      } catch (error) {
        toast.error('Failed to delete profile');
      }
    }
  };

  if (loading) return <Loading message="Loading profile..." />;

  // Main render logic with proper null checks
  const showForm = !hasProfile || isEditing;
  const showProfileView = hasProfile && !isEditing && profile;

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Trainer Profile</h1>
        {showProfileView && (
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Profile
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="profile-form card">
          <h2>{hasProfile ? 'Edit Profile' : 'Create Trainer Profile'}</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="empId"
                  className={`form-control ${errors.empId ? 'error' : ''}`}
                  value={formData.empId || ''}
                  readOnly
                />
                {errors.empId && <span className="error-text">{errors.empId}</span>}
                <small>Auto-generated (Read-only)</small>
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
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="john@example.com"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

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
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" ref={dropdownRef}>
                <label>Subjects</label>
                {loadingSubjects ? (
                  <div className="loading-subjects">Loading subjects...</div>
                ) : (availableSubjects || []).length === 0 ? (
                  <div className="no-subjects-warning">
                    <p>⚠️ No subjects available yet.</p>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`custom-dropdown ${errors.subjects ? 'error' : ''} ${dropdownOpen ? 'open' : ''}`}
                      onClick={toggleDropdown}
                    >
                      <div className="dropdown-selected">
                        {(formData.subjects || []).length === 0 
                          ? <span className="placeholder">Click to select subjects</span>
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
                              <button type="button" className="action-btn select-all" onClick={handleSelectAll}>
                                Select All
                              </button>
                              <button type="button" className="action-btn clear-all" onClick={handleClearAll}>
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
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  className={`form-control ${errors.experience ? 'error' : ''}`}
                  placeholder="5"
                  min="0"
                  max="50"
                  value={formData.experience || ''}
                  onChange={handleChange}
                />
                {errors.experience && <span className="error-text">{errors.experience}</span>}
              </div>
            </div>

            {(formData.subjects || []).length > 0 && (
              <div className="selected-subjects-preview">
                <div className="preview-header">
                  <strong>Selected Subjects ({(formData.subjects || []).length})</strong>
                  <button type="button" className="clear-preview-btn" onClick={handleClearAll}>
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
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (hasProfile ? 'Update Profile' : 'Create Profile')}
              </button>
              {hasProfile && (
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : showProfileView ? (
        <div className="profile-view card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="profile-info">
              <h2>{profile?.name || 'No Name'}</h2>
              <p className="profile-empid">{profile?.empId || 'No ID'}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{profile?.email || 'Not provided'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{profile?.phone || 'Not provided'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Experience:</span>
              <span className="detail-value">{profile?.experience || 0} years</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subjects:</span>
              <div className="subject-tags">
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((subject, index) => (
                    <span key={index} className="subject-tag">{subject}</span>
                  ))
                ) : (
                  <span className="no-subjects">No subjects assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-profile-state">
          <p>No profile data available. Please create a profile.</p>
        </div>
      )}
    </div>
  );
};

export default MyProfile;