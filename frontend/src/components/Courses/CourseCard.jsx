// frontend/src/components/Courses/CourseCard.jsx
import React, { useState } from 'react';
import { FaBook, FaClock, FaChartLine, FaChevronDown, FaChevronUp, FaUsers, FaEdit, FaTrash, FaLayerGroup, FaCheckCircle, FaBullseye, FaFileAlt } from 'react-icons/fa';

const CourseCard = ({ course, onEdit, onDelete, canEdit = false, canDelete = false }) => {
  const [showSubjects, setShowSubjects] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'intermediate': return { bg: '#fff3e0', color: '#e65100' };
      case 'advanced': return { bg: '#fce4ec', color: '#c2185b' };
      default: return { bg: '#f5f5f5', color: '#666' };
    }
  };

  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const toggleModuleDetails = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const subjectCount = course.subjects?.length || 0;
  
  // Calculate total modules across all subjects
  const totalModules = course.subjects?.reduce((sum, subject) => {
    return sum + (subject.modules?.length || 0);
  }, 0) || 0;

  return (
    <div className="course-card">
      <div className="course-card-header">
        <div className="course-icon">
          <FaBook size={32} />
        </div>
        <div className="course-title-section">
          <h3>{course.name}</h3>
          <span className="course-id">{course.courseId}</span>
        </div>
      </div>

      <div className="course-card-body">
        {course.description && (
          <p className="course-description">{course.description}</p>
        )}

        <div className="course-stats">
          <div className="stat-item">
            <FaClock size={16} />
            <span>{course.duration || course.totalHours || 0} weeks</span>
          </div>
          <div className="stat-item">
            <FaChartLine size={16} />
            <span 
              className="level-badge"
              style={{
                background: getLevelColor(course.level).bg,
                color: getLevelColor(course.level).color
              }}
            >
              {course.level}
            </span>
          </div>
          <div className="stat-item">
            <FaBook size={16} />
            <span>{subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}</span>
          </div>
          <div className="stat-item">
            <FaLayerGroup size={16} />
            <span>{totalModules} {totalModules === 1 ? 'module' : 'modules'}</span>
          </div>
        </div>

        {subjectCount > 0 && (
          <div className="subjects-section">
            <button 
              className="btn-toggle-subjects"
              onClick={() => setShowSubjects(!showSubjects)}
              type="button"
            >
              {showSubjects ? (
                <>
                  <FaChevronUp /> Hide Course Content
                </>
              ) : (
                <>
                  <FaChevronDown /> Show {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'} & {totalModules} {totalModules === 1 ? 'Module' : 'Modules'}
                </>
              )}
            </button>

            {showSubjects && (
              <div className="subjects-list">
                <h4 className="subjects-title">📚 Course Subjects</h4>
                {course.subjects
                  .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0))
                  .map((subject, index) => {
                    const subjectLevelColors = getLevelColor(subject.level);
                    const isExpanded = expandedSubjects[subject.subjectId];
                    const moduleCount = subject.modules?.length || 0;
                    
                    return (
                      <div key={subject.subjectId || index} className="subject-item">
                        <div className="subject-header">
                          <div className="subject-number">{subject.sequenceOrder || index + 1}</div>
                          <div className="subject-title-section">
                            <div className="subject-title">
                              <strong>{subject.name || subject.subjectId}</strong>
                              <span className="subject-id">{subject.subjectId}</span>
                            </div>
                            
                            {subject.description && (
                              <p className="subject-description">{subject.description}</p>
                            )}
                            
                            <div className="subject-meta">
                              {subject.duration && (
                                <span className="meta-tag">
                                  <FaClock size={12} />
                                  {subject.duration} hours
                                </span>
                              )}
                              {subject.level && (
                                <span 
                                  className="meta-tag level-tag"
                                  style={{
                                    background: subjectLevelColors.bg,
                                    color: subjectLevelColors.color
                                  }}
                                >
                                  <FaChartLine size={12} />
                                  {subject.level}
                                </span>
                              )}
                              <span className="meta-tag modules-tag">
                                <FaLayerGroup size={12} />
                                {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {moduleCount > 0 && (
                          <>
                            <button 
                              className="btn-toggle-modules"
                              onClick={() => toggleSubject(subject.subjectId)}
                              type="button"
                            >
                              {isExpanded ? (
                                <>
                                  <FaChevronUp /> Hide Modules
                                </>
                              ) : (
                                <>
                                  <FaChevronDown /> Show {moduleCount} {moduleCount === 1 ? 'Module' : 'Modules'}
                                </>
                              )}
                            </button>

                            {isExpanded && (
                              <div className="modules-list">
                                {subject.modules
                                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                                  .map((module, mIndex) => {
                                    const isModuleExpanded = expandedModules[module.moduleId];
                                    
                                    return (
                                      <div key={module.moduleId || mIndex} className="module-item">
                                        <div className="module-header-row">
                                          <div className="module-number">{module.order || mIndex + 1}</div>
                                          <div className="module-title-wrapper">
                                            <div className="module-title">
                                              <strong>{module.name}</strong>
                                              <span className="module-id">{module.moduleId}</span>
                                            </div>
                                            
                                            {module.description && (
                                              <p className="module-description">{module.description}</p>
                                            )}
                                            
                                            <div className="module-meta">
                                              {module.duration && (
                                                <span className="meta-tag">
                                                  <FaClock size={10} />
                                                  {module.duration} hours
                                                </span>
                                              )}
                                              {module.isActive !== undefined && (
                                                <span className="meta-tag status-tag" style={{
                                                  background: module.isActive ? '#e8f5e9' : '#ffebee',
                                                  color: module.isActive ? '#2e7d32' : '#c62828'
                                                }}>
                                                  {module.isActive ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Module Details Toggle */}
                                        {(module.content || module.learningObjectives?.length > 0 || module.prerequisites?.length > 0) && (
                                          <>
                                            <button 
                                              className="btn-toggle-module-details"
                                              onClick={() => toggleModuleDetails(module.moduleId)}
                                              type="button"
                                            >
                                              {isModuleExpanded ? (
                                                <>
                                                  <FaChevronUp /> Hide Details
                                                </>
                                              ) : (
                                                <>
                                                  <FaChevronDown /> Show Details
                                                </>
                                              )}
                                            </button>

                                            {isModuleExpanded && (
                                              <div className="module-details">
                                                {/* Content */}
                                                {module.content && (
                                                  <div className="detail-section">
                                                    <div className="detail-header">
                                                      <FaFileAlt size={14} />
                                                      <strong>Content</strong>
                                                    </div>
                                                    <p className="detail-text">{module.content}</p>
                                                  </div>
                                                )}

                                                {/* Learning Objectives */}
                                                {module.learningObjectives && module.learningObjectives.length > 0 && (
                                                  <div className="detail-section">
                                                    <div className="detail-header">
                                                      <FaBullseye size={14} />
                                                      <strong>Learning Objectives</strong>
                                                    </div>
                                                    <ul className="detail-list">
                                                      {module.learningObjectives.map((objective, idx) => (
                                                        <li key={idx}>
                                                          <FaCheckCircle size={12} />
                                                          <span>{objective}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {/* Prerequisites */}
                                                {module.prerequisites && module.prerequisites.length > 0 && (
                                                  <div className="detail-section">
                                                    <div className="detail-header">
                                                      <FaLayerGroup size={14} />
                                                      <strong>Prerequisites</strong>
                                                    </div>
                                                    <ul className="detail-list">
                                                      {module.prerequisites.map((prereq, idx) => (
                                                        <li key={idx}>
                                                          <span>{prereq}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}

                                                {/* Resources */}
                                                {module.resources && module.resources.length > 0 && (
                                                  <div className="detail-section">
                                                    <div className="detail-header">
                                                      <FaBook size={14} />
                                                      <strong>Resources</strong>
                                                    </div>
                                                    <ul className="detail-list">
                                                      {module.resources.map((resource, idx) => (
                                                        <li key={idx}>
                                                          <span>{resource}</span>
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {(canEdit || canDelete) && (
        <div className="course-card-footer">
          {canEdit && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onEdit(course)}
              type="button"
            >
              <FaEdit /> Edit Course
            </button>
          )}
          {canDelete && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(course.courseId)}
              type="button"
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .course-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .course-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .course-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .course-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .course-title-section {
          flex: 1;
          min-width: 0;
        }

        .course-title-section h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.25rem;
          line-height: 1.3;
        }

        .course-id {
          display: inline-block;
          color: #666;
          font-size: 0.875rem;
          font-family: monospace;
          background: #f0f0f0;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-weight: 600;
        }

        .course-card-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .course-description {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        .course-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .stat-item svg {
          color: #667eea;
        }

        .level-badge {
          padding: 0.3rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .subjects-section {
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }

        .btn-toggle-subjects,
        .btn-toggle-modules,
        .btn-toggle-module-details {
          width: 100%;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .btn-toggle-subjects:hover,
        .btn-toggle-modules:hover,
        .btn-toggle-module-details:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-toggle-modules {
          margin-top: 0.75rem;
          padding: 0.75rem;
          font-size: 0.875rem;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: 1px solid #d0d0d0;
        }

        .btn-toggle-module-details {
          margin-top: 0.5rem;
          padding: 0.5rem;
          font-size: 0.8rem;
          background: #fff;
          border: 1px solid #c0c0c0;
        }

        .subjects-list {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subjects-title {
          color: #333;
          font-size: 1.1rem;
          margin: 0 0 0.75rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .subject-item {
          padding: 1.25rem;
          background: linear-gradient(135deg, #f0f4ff 0%, #fff 100%);
          border-radius: 10px;
          border: 2px solid #e0e7ff;
          box-shadow: 0 2px 6px rgba(102, 126, 234, 0.1);
        }

        .subject-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .subject-number {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
        }

        .subject-title-section {
          flex: 1;
        }

        .subject-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .subject-title strong {
          color: #333;
          font-size: 1.1rem;
          line-height: 1.3;
        }

        .subject-id {
          color: #667eea;
          font-size: 0.8rem;
          font-family: monospace;
          background: white;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
          font-weight: 600;
        }

        .subject-description {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0.5rem 0 0.75rem 0;
        }

        .subject-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: white;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
          border: 1px solid #e0e0e0;
        }

        .level-tag {
          font-weight: 600;
          border: none;
        }

        .modules-tag {
          color: #667eea;
          font-weight: 600;
          border-color: #c7d2fe;
          background: #f0f4ff;
        }

        .status-tag {
          font-weight: 600;
          border: none;
        }

        .modules-list {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-left: 1rem;
          border-left: 3px solid #c7d2fe;
        }

        .module-item {
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e7ff;
          box-shadow: 0 1px 4px rgba(102, 126, 234, 0.08);
        }

        .module-header-row {
          display: flex;
          gap: 0.75rem;
        }

        .module-number {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%);
          color: #4338ca;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .module-title-wrapper {
          flex: 1;
        }

        .module-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .module-title strong {
          color: #333;
          font-size: 0.95rem;
        }

        .module-id {
          color: #667eea;
          font-size: 0.75rem;
          font-family: monospace;
          background: #f0f4ff;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .module-description {
          color: #666;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 0.5rem 0;
        }

        .module-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .module-meta .meta-tag {
          font-size: 0.8rem;
          padding: 0.25rem 0.6rem;
        }

        /* Module Details Section */
        .module-details {
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
          border-radius: 6px;
          border: 1px solid #e0e7ff;
          animation: slideDown 0.3s ease;
        }

        .detail-section {
          margin-bottom: 1rem;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4338ca;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .detail-header svg {
          color: #667eea;
        }

        .detail-text {
          color: #555;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 0;
          padding-left: 1.5rem;
        }

        .detail-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: #555;
          font-size: 0.875rem;
          line-height: 1.5;
          padding-left: 1.5rem;
        }

        .detail-list li svg {
          color: #4caf50;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .course-card-footer {
          padding-top: 1rem;
          border-top: 2px solid #f0f0f0;
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-danger {
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
        }

        @media (max-width: 768px) {
          .course-card {
            padding: 1rem;
          }

          .course-stats {
            flex-direction: column;
            gap: 0.75rem;
          }

          .subject-header {
            flex-direction: column;
          }

          .modules-list {
            padding-left: 0.5rem;
          }

          .detail-text,
          .detail-list li {
            padding-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseCard;