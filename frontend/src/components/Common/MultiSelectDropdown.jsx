// src/components/Common/MultiSelectDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaCheck } from 'react-icons/fa';

const MultiSelectDropdown = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Select items...",
  label,
  error,
  disabled = false,
  searchable = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleToggle = (optionId) => {
    const newSelection = selectedValues.includes(optionId)
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    onChange(filteredOptions.map(opt => opt.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleRemoveItem = (optionId, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter(id => id !== optionId));
  };

  const getSelectedItems = () => {
    return options.filter(opt => selectedValues.includes(opt.id));
  };

  return (
    <div className={`multi-select-container ${className}`} ref={dropdownRef}>
      {label && <label className="multi-select-label">{label}</label>}
      
      <div 
        className={`multi-select-trigger ${error ? 'error' : ''} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="trigger-content">
          {selectedValues.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <div className="selected-items-preview">
              {getSelectedItems().slice(0, 2).map(item => (
                <span key={item.id} className="selected-chip">
                  {item.name}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    disabled={disabled}
                  >
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
              {selectedValues.length > 2 && (
                <span className="more-count">+{selectedValues.length - 2} more</span>
              )}
            </div>
          )}
        </div>
        <div className="trigger-arrow">
          {isOpen ? '▲' : '▼'}
        </div>
      </div>

      {error && <span className="error-text">{error}</span>}

      {isOpen && (
        <div className="multi-select-dropdown">
          {searchable && (
            <div className="dropdown-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          )}

          <div className="dropdown-actions">
            <button type="button" onClick={handleSelectAll}>
              Select All {filteredOptions.length > 0 && `(${filteredOptions.length})`}
            </button>
            <button type="button" onClick={handleClearAll}>
              Clear All
            </button>
          </div>

          <div className="dropdown-options">
            {filteredOptions.length === 0 ? (
              <div className="no-results">
                {searchTerm ? 'No items found' : 'No items available'}
              </div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = selectedValues.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggle(option.id)}
                  >
                    <div className="option-checkbox">
                      {isSelected && <FaCheck size={12} />}
                    </div>
                    <div className="option-content">
                      <div className="option-name">{option.name}</div>
                      <div className="option-meta">{option.id}</div>
                      {option.extra && (
                        <div className="option-extra">{option.extra}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="dropdown-footer">
            <span className="selection-count">
              {selectedValues.length} item(s) selected
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .multi-select-container {
          position: relative;
          width: 100%;
        }

        .multi-select-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .multi-select-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 45px;
          padding: 0.5rem 0.75rem;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .multi-select-trigger:hover:not(.disabled) {
          border-color: #667eea;
        }

        .multi-select-trigger.open {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .multi-select-trigger.error {
          border-color: #e74c3c;
        }

        .multi-select-trigger.disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .trigger-content {
          flex: 1;
          min-width: 0;
        }

        .placeholder {
          color: #999;
        }

        .selected-items-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .selected-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .chip-remove {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .chip-remove:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .more-count {
          padding: 0.25rem 0.5rem;
          background: #e9ecef;
          color: #666;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .trigger-arrow {
          color: #666;
          font-size: 0.75rem;
          margin-left: 0.5rem;
          transition: transform 0.2s;
        }

        .multi-select-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #667eea;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          animation: dropdownSlide 0.2s ease;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-search {
          position: relative;
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .dropdown-search input {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .dropdown-search input:focus {
          outline: none;
          border-color: #667eea;
        }

        .clear-search {
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.25rem;
        }

        .dropdown-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .dropdown-actions button {
          flex: 1;
          padding: 0.4rem 0.75rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dropdown-actions button:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .dropdown-options {
          flex: 1;
          overflow-y: auto;
          max-height: 250px;
        }

        .dropdown-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f5f5f5;
        }

        .dropdown-option:hover {
          background: #f8f9fa;
        }

        .dropdown-option.selected {
          background: #e8f5e9;
        }

        .option-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .dropdown-option.selected .option-checkbox {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .option-content {
          flex: 1;
          min-width: 0;
        }

        .option-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 0.1rem;
        }

        .option-meta {
          font-size: 0.85rem;
          color: #666;
        }

        .option-extra {
          font-size: 0.8rem;
          color: #999;
          margin-top: 0.2rem;
        }

        .no-results {
          padding: 2rem;
          text-align: center;
          color: #999;
        }

        .dropdown-footer {
          padding: 0.5rem 0.75rem;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .error-text {
          color: #e74c3c;
          font-size: 0.875rem;
          font-weight: 600;
          display: block;
          margin-top: 0.5rem;
        }

        /* Scrollbar styling */
        .dropdown-options::-webkit-scrollbar {
          width: 8px;
        }

        .dropdown-options::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .dropdown-options::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .dropdown-options::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default MultiSelectDropdown;