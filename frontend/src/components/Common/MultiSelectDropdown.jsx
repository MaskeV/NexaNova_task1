// frontend/src/components/Common/MultiSelectDropdown.jsx
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionToggle = (optionId) => {
    const currentValues = [...selectedValues];
    const index = currentValues.indexOf(optionId);

    if (index === -1) {
      currentValues.push(optionId);
    } else {
      currentValues.splice(index, 1);
    }

    onChange(currentValues);
  };

  const handleSelectAll = () => {
    const allIds = options.map(opt => opt.id);
    onChange(allIds);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const removeOption = (optionId) => {
    const updatedValues = selectedValues.filter(id => id !== optionId);
    onChange(updatedValues);
  };

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className="form-group" ref={dropdownRef}>
      {label && <label>{label}</label>}
      
      <div 
        className={`custom-dropdown ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={toggleDropdown}
      >
        <div className="dropdown-selected">
          {selectedValues.length === 0 ? (
            <span className="placeholder">{placeholder}</span>
          ) : (
            <span className="selected-count">
              {selectedValues.length} selected
            </span>
          )}
          <span className={`dropdown-arrow ${isOpen ? 'up' : 'down'}`}>
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {isOpen && (
          <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
            <div className="dropdown-header">
              <div className="dropdown-title">
                {label || 'Select Options'}
              </div>
              <div className="dropdown-actions">
                <button 
                  type="button" 
                  className="action-btn select-all"
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button 
                  type="button" 
                  className="action-btn clear-all"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </div>

            {searchable && (
              <div className="dropdown-search">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="dropdown-options">
              {filteredOptions.length === 0 ? (
                <div className="empty-message">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`dropdown-option ${
                      selectedValues.includes(option.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <div className="option-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option.id)}
                        onChange={() => {}}
                        className="checkbox"
                      />
                    </div>
                    <div className="option-content">
                      <div className="option-id">{option.id}</div>
                      <div className="option-name">{option.name}</div>
                      {option.extra && (
                        <div className="option-extra">{option.extra}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <span className="error-text">{error}</span>}

      {selectedValues.length > 0 && (
        <div className="selected-subjects-preview">
          <div className="preview-header">
            <strong>Selected ({selectedValues.length})</strong>
            <button 
              type="button" 
              className="clear-preview-btn"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
          <div className="selected-tags">
            {selectedValues.map((valueId) => {
              const option = options.find(opt => opt.id === valueId);
              return (
                <span key={valueId} className="selected-tag">
                  {option?.name || valueId}
                  <button 
                    type="button" 
                    className="remove-tag-btn"
                    onClick={() => removeOption(valueId)}
                    title="Remove"
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
  );
};

export default MultiSelectDropdown;