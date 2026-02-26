// frontend/src/components/Common/SearchBox.jsx
import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchBox = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "" 
}) => {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className={`search-box ${className}`}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}
      </div>

      <style jsx>{`
        .search-box {
          width: 100%;
          max-width: 500px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .search-input-wrapper:focus-within {
          border-color: #2a5298;
          box-shadow: 0 4px 12px rgba(42, 82, 152, 0.15);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #999;
          font-size: 1rem;
          pointer-events: none;
          transition: color 0.3s ease;
        }

        .search-input-wrapper:focus-within .search-icon {
          color: #2a5298;
        }

        .search-input {
          width: 100%;
          padding: 0.85rem 3rem 0.85rem 3rem;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          background: transparent;
          color: #333;
          outline: none;
        }

        .search-input::placeholder {
          color: #999;
        }

        .search-clear-btn {
          position: absolute;
          right: 0.75rem;
          background: #f0f0f0;
          border: none;
          color: #666;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
        }

        .search-clear-btn:hover {
          background: #e74c3c;
          color: white;
          transform: scale(1.1);
        }

        .search-clear-btn:active {
          transform: scale(0.95);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .search-box {
            max-width: 100%;
          }

          .search-input {
            font-size: 0.95rem;
            padding: 0.75rem 2.75rem 0.75rem 2.75rem;
          }

          .search-icon {
            left: 0.875rem;
            font-size: 0.95rem;
          }

          .search-clear-btn {
            right: 0.625rem;
            width: 26px;
            height: 26px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBox;