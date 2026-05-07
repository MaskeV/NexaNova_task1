// src/components/Common/MultiSelectDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ 
  label, 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = 'Select options...', 
  error = '',
  searchable = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionId) => {
    const newValues = selectedValues.includes(optionId)
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    onChange(newValues);
  };

  const handleSelectAll = () => {
    onChange(options.map(opt => opt.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const filteredOptions = searchable
    ? options.filter(opt => 
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const getSelectedNames = () => {
    return options
      .filter(opt => selectedValues.includes(opt.id))
      .map(opt => opt.name);
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      
      <div 
        className={`dropdown-toggle ${error ? 'error' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-display">
          {selectedValues.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <span className="selected-count">
              {selectedValues.length} selected
            </span>
          )}
        </div>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {error && <span className="error-message">{error}</span>}

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            {searchable && (
              <input
                type="text"
                className="dropdown-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div className="dropdown-actions">
              <button type="button" onClick={handleSelectAll} className="action-btn">
                Select All
              </button>
              <button type="button" onClick={handleClearAll} className="action-btn">
                Clear All
              </button>
            </div>
          </div>

          <div className="dropdown-options">
            {filteredOptions.length === 0 ? (
              <div className="no-options">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`dropdown-option ${selectedValues.includes(option.id) ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(option.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => {}}
                    className="option-checkbox"
                  />
                  <div className="option-content">
                    <div className="option-name">{option.name}</div>
                    {option.extra && <div className="option-extra">{option.extra}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedValues.length > 0 && (
        <div className="selected-tags">
          {getSelectedNames().map((name, index) => (
            <span key={index} className="tag">
              {name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const option = options.find(opt => opt.name === name);
                  if (option) handleToggle(option.id);
                }}
                className="tag-remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <style jsx>{`
        .multi-select-dropdown {
          position: relative;
          width: 100%;
        }

        .dropdown-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
          font-size: 0.95rem;
        }

        .dropdown-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dropdown-toggle:hover {
          border-color: #667eea;
        }

        .dropdown-toggle.open {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .dropdown-toggle.error {
          border-color: #e74c3c;
        }

        .selected-display {
          flex: 1;
        }

        .placeholder {
          color: #999;
        }

        .selected-count {
          color: #333;
          font-weight: 500;
        }

        .dropdown-arrow {
          color: #666;
          font-size: 0.8rem;
          margin-left: 0.5rem;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.875rem;
          font-weight: 600;
          display: block;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #fff5f5;
          border-left: 3px solid #e74c3c;
          border-radius: 4px;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 400px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .dropdown-header {
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .dropdown-search {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .dropdown-search:focus {
          outline: none;
          border-color: #667eea;
        }

        .dropdown-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #f0f0f0;
          border-color: #667eea;
        }

        .dropdown-options {
          overflow-y: auto;
          max-height: 250px;
        }

        .dropdown-option {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
          border-bottom: 1px solid #f0f0f0;
        }

        .dropdown-option:hover {
          background: #f8f9fa;
        }

        .dropdown-option.selected {
          background: #e8eaf6;
        }

        .option-checkbox {
          margin-right: 0.75rem;
          cursor: pointer;
        }

        .option-content {
          flex: 1;
        }

        .option-name {
          font-weight: 500;
          color: #333;
        }

        .option-extra {
          font-size: 0.85rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .no-options {
          padding: 1.5rem;
          text-align: center;
          color: #999;
        }

        .selected-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          background: #e8eaf6;
          color: #667eea;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .tag-remove {
          background: none;
          border: none;
          color: #667eea;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
        }

        .tag-remove:hover {
          background: rgba(102, 126, 234, 0.2);
        }
      `}</style>
    </div>
  );
};

export default MultiSelectDropdown;