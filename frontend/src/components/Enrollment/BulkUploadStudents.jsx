import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { bulkUploadStudents } from '../../services/enrollmentService';
import { FaUpload, FaFileExcel, FaFileCsv, FaDownload, FaInfoCircle } from 'react-icons/fa';

const BulkUploadStudents = ({ onSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Please upload CSV or Excel files only.');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      const response = await bulkUploadStudents(file);
      
      setResults(response.details);
      
      if (response.results.successful > 0) {
        toast.success(`Successfully created ${response.results.successful} student accounts!`);
      }
      
      if (response.results.failed > 0) {
        toast.warning(`${response.results.failed} entries failed to upload`);
      }
      
      if (response.results.skipped > 0) {
        toast.info(`${response.results.skipped} entries were skipped (already exist)`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'username,email,password\nJohn Doe,john@example.com,password123\nJane Smith,jane@example.com,password456';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setFile(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bulk-upload-students card">
      <div className="form-header">
        <FaUpload size={24} color="#667eea" />
        <h3>Bulk Upload Students</h3>
      </div>

      <div className="upload-instructions">
        <div className="instruction-box">
          <FaInfoCircle color="#2196f3" />
          <div>
            <strong>Instructions:</strong>
            <ol>
              <li>Download the CSV template below</li>
              <li>Fill in student details (username, email, password)</li>
              <li>Upload the completed file</li>
              <li>Review the results and confirm</li>
            </ol>
          </div>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={downloadTemplate}
          type="button"
        >
          <FaDownload /> Download CSV Template
        </button>
      </div>

      {!results ? (
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="file-input"
              disabled={uploading}
            />
            
            {file ? (
              <div className="file-selected">
                {file.name.endsWith('.csv') ? <FaFileCsv size={30} color="#4caf50" /> : <FaFileExcel size={30} color="#4caf50" />}
                <div>
                  <strong>{file.name}</strong>
                  <small>{(file.size / 1024).toFixed(2)} KB</small>
                </div>
                <button 
                  className="btn-remove"
                  onClick={resetUpload}
                  disabled={uploading}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <FaUpload size={40} color="#ccc" />
                <p>Click to select or drag & drop a CSV/Excel file</p>
                <small>Max file size: 5MB</small>
              </div>
            )}
          </div>

          <div className="upload-actions">
            <button 
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              type="button"
            >
              {uploading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload /> Upload Students
                </>
              )}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={uploading}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="upload-results">
          <h4>Upload Results</h4>
          
          <div className="results-summary">
            <div className="result-stat success">
              <strong>{results.success.length}</strong>
              <span>Successful</span>
            </div>
            <div className="result-stat failed">
              <strong>{results.failed.length}</strong>
              <span>Failed</span>
            </div>
            <div className="result-stat skipped">
              <strong>{results.skipped.length}</strong>
              <span>Skipped</span>
            </div>
          </div>

          {results.success.length > 0 && (
            <div className="result-section">
              <h5>✓ Successfully Created ({results.success.length})</h5>
              <div className="result-list">
                {results.success.map((student, index) => (
                  <div key={index} className="result-item success">
                    <strong>{student.username}</strong>
                    <span>{student.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.failed.length > 0 && (
            <div className="result-section">
              <h5>✗ Failed ({results.failed.length})</h5>
              <div className="result-list">
                {results.failed.map((item, index) => (
                  <div key={index} className="result-item failed">
                    <strong>{item.data?.email || 'Unknown'}</strong>
                    <span className="error-reason">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.skipped.length > 0 && (
            <div className="result-section">
              <h5>⊘ Skipped ({results.skipped.length})</h5>
              <div className="result-list">
                {results.skipped.map((item, index) => (
                  <div key={index} className="result-item skipped">
                    <strong>{item.email}</strong>
                    <span>{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="results-actions">
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetUpload();
                onSuccess();
              }}
              type="button"
            >
              Done
            </button>
            <button 
              className="btn btn-secondary"
              onClick={resetUpload}
              type="button"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .bulk-upload-students {
          max-width: 800px;
          margin: 0 auto;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-header h3 {
          margin: 0;
        }

        .upload-instructions {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .instruction-box {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #e3f2fd;
          border-radius: 8px;
          border-left: 4px solid #2196f3;
        }

        .instruction-box ol {
          margin: 0.5rem 0 0 1rem;
          padding: 0;
        }

        .instruction-box li {
          margin: 0.25rem 0;
        }

        .upload-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .file-input-wrapper {
          position: relative;
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .file-input-wrapper:hover {
          border-color: #667eea;
          background: #f8f9fa;
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-placeholder {
          pointer-events: none;
        }

        .file-placeholder p {
          margin: 1rem 0 0.5rem 0;
          color: #666;
          font-weight: 600;
        }

        .file-placeholder small {
          color: #999;
        }

        .file-selected {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .file-selected > div {
          flex: 1;
          text-align: left;
        }

        .file-selected strong {
          display: block;
          color: #333;
        }

        .file-selected small {
          display: block;
          color: #666;
          margin-top: 0.25rem;
        }

        .btn-remove {
          background: #f44336;
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-remove:hover {
          background: #d32f2f;
        }

        .upload-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .upload-results {
          margin-top: 2rem;
        }

        .upload-results h4 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .results-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .result-stat {
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .result-stat.success {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          border: 2px solid #4caf50;
        }

        .result-stat.failed {
          background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
          border: 2px solid #f44336;
        }

        .result-stat.skipped {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          border: 2px solid #ff9800;
        }

        .result-stat strong {
          display: block;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .result-stat.success strong {
          color: #2e7d32;
        }

        .result-stat.failed strong {
          color: #c62828;
        }

        .result-stat.skipped strong {
          color: #e65100;
        }

        .result-section {
          margin-bottom: 1.5rem;
        }

        .result-section h5 {
          margin: 0 0 0.75rem 0;
          color: #333;
          font-size: 1rem;
        }

        .result-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 0.5rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border-radius: 6px;
          background: white;
        }

        .result-item.success {
          border-left: 4px solid #4caf50;
        }

        .result-item.failed {
          border-left: 4px solid #f44336;
        }

        .result-item.skipped {
          border-left: 4px solid #ff9800;
        }

        .result-item strong {
          color: #333;
        }

        .result-item span {
          color: #666;
          font-size: 0.9rem;
        }

        .error-reason {
          color: #f44336 !important;
          font-weight: 600;
        }

        .results-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f0f0f0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
          background: #e0e0e0;
          color: #666;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #d0d0d0;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #fff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

export default BulkUploadStudents;