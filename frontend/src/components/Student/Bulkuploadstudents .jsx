// frontend/src/components/Student/BulkUploadModal.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { bulkUploadStudents } from '../../services/studentService';
import { FaTimes, FaUpload, FaFileExcel, FaFileCsv, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const BulkUploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setUploadResults(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await bulkUploadStudents(formData);
      
      setUploadResults(response.data);
      
      if (response.data.successful.length > 0) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload size={48} />;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') return <FaFileCsv size={48} />;
    return <FaFileExcel size={48} />;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content bulk-upload-modal">
        <div className="modal-header">
          <h2>📤 Bulk Upload Students</h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {!uploadResults ? (
            <>
              <div className="upload-instructions">
                <h3>Instructions:</h3>
                <ol>
                  <li>Download the template CSV file</li>
                  <li>Fill in student data (username, email, password)</li>
                  <li>Upload the completed file below</li>
                </ol>
                <div className="file-requirements">
                  <strong>Requirements:</strong>
                  <ul>
                    <li>Columns: username, email, password</li>
                    <li>File format: CSV or Excel (.xlsx)</li>
                    <li>Maximum size: 5MB</li>
                  </ul>
                </div>
              </div>

              <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                
                <div className="upload-content">
                  <div className="upload-icon">
                    {getFileIcon()}
                  </div>
                  
                  {file ? (
                    <div className="file-info">
                      <strong>{file.name}</strong>
                      <small>{(file.size / 1024).toFixed(2)} KB</small>
                      <button
                        className="btn-change-file"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        Change File
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>Drag and drop your file here</p>
                      <p className="or-text">or</p>
                      <label htmlFor="file-upload" className="btn btn-secondary">
                        Browse Files
                      </label>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="upload-results">
              <div className="results-summary">
                <div className="result-stat success">
                  <FaCheckCircle size={32} />
                  <div>
                    <div className="result-number">{uploadResults.successful.length}</div>
                    <div className="result-label">Successful</div>
                  </div>
                </div>
                <div className="result-stat failed">
                  <FaExclamationCircle size={32} />
                  <div>
                    <div className="result-number">{uploadResults.failed.length}</div>
                    <div className="result-label">Failed</div>
                  </div>
                </div>
              </div>

              {uploadResults.successful.length > 0 && (
                <div className="results-section">
                  <h4>✅ Successfully Created ({uploadResults.successful.length})</h4>
                  <div className="results-list">
                    {uploadResults.successful.slice(0, 10).map((student, idx) => (
                      <div key={idx} className="result-item success">
                        <strong>{student.username}</strong>
                        <span>{student.email}</span>
                      </div>
                    ))}
                    {uploadResults.successful.length > 10 && (
                      <div className="more-results">
                        +{uploadResults.successful.length - 10} more students
                      </div>
                    )}
                  </div>
                </div>
              )}

              {uploadResults.failed.length > 0 && (
                <div className="results-section">
                  <h4>❌ Failed ({uploadResults.failed.length})</h4>
                  <div className="results-list">
                    {uploadResults.failed.map((failure, idx) => (
                      <div key={idx} className="result-item failed">
                        <strong>{failure.email || 'Unknown'}</strong>
                        <span className="error-reason">{failure.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {!uploadResults ? (
            <>
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner"></span>
                    Uploading...
                  </>
                ) : (
                  '✓ Upload Students'
                )}
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .bulk-upload-modal {
          max-width: 700px;
          width: 100%;
        }

        .upload-instructions {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .upload-instructions h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .upload-instructions ol {
          margin: 0 0 1rem 0;
          padding-left: 1.5rem;
          color: #666;
        }

        .file-requirements {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .file-requirements strong {
          color: #333;
          display: block;
          margin-bottom: 0.5rem;
        }

        .file-requirements ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #666;
        }

        .upload-zone {
          border: 2px dashed #d0d0d0;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .upload-zone.drag-active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .upload-zone.has-file {
          border-color: #4caf50;
          background: #f1f8f4;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-icon {
          color: #667eea;
        }

        .upload-zone.has-file .upload-icon {
          color: #4caf50;
        }

        .upload-zone p {
          margin: 0;
          color: #666;
        }

        .or-text {
          color: #999;
          font-weight: 600;
        }

        .file-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .file-info strong {
          color: #333;
        }

        .file-info small {
          color: #666;
        }

        .btn-change-file {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #d0d0d0;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-change-file:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .upload-results {
          padding: 1rem 0;
        }

        .results-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .result-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .result-stat.success {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
        }

        .result-stat.failed {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          color: #c62828;
        }

        .result-number {
          font-size: 2rem;
          font-weight: 700;
        }

        .result-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .results-section {
          margin-bottom: 1.5rem;
        }

        .results-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 6px;
        }

        .result-item.success {
          background: #f1f8f4;
          border-left: 3px solid #4caf50;
        }

        .result-item.failed {
          background: #fff5f5;
          border-left: 3px solid #f44336;
        }

        .result-item strong {
          color: #333;
        }

        .result-item span {
          color: #666;
          font-size: 0.9rem;
        }

        .error-reason {
          color: #d32f2f !important;
          font-weight: 500;
        }

        .more-results {
          padding: 0.75rem;
          text-align: center;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .results-summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkUploadModal;