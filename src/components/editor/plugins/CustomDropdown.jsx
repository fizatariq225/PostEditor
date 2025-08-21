import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../../../styles/global.css';
const IconDropdown = ({ options, value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue) => {
    // Simulate the same event structure as a regular select
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`icon-dropdown ${className}`}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="dropdown-selected">
          <span className="dropdown-icon">
            {selectedOption?.icon}
          </span>
          <span className="dropdown-text">
            {selectedOption?.label || 'Select...'}
          </span>
        </div>
        <span className="dropdown-chevron">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu" role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              <span className="option-icon">
                {option.icon}
              </span>
              <span className="option-text">
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IconDropdown;