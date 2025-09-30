import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = 'Select...',
  className = '',
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`} style={style}>
      {/* Select Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-all duration-200 rounded-lg ${
          disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:brightness-110'
        }`}
      >
        <span className="truncate flex-1 text-white">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-white transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-700 ${
                option.value === value
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-200'
              }`}
            >
              <span className="block truncate" title={option.label}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;