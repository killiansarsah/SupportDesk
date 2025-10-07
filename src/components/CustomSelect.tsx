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
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-[#12172d] via-[#151b35] to-[#12172d] px-4 py-3 text-sm text-left font-medium text-slate-100 shadow-[0_10px_35px_rgba(19,24,47,0.35)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:ring-offset-2 focus:ring-offset-[#0c0f1f] ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:shadow-[0_18px_45px_rgba(46,13,104,0.45)]'
        } ${
          isOpen ? 'ring-2 ring-violet-500/70 ring-offset-2 ring-offset-[#0c0f1f]' : ''
        }`}
      >
        <span className="truncate flex-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`ml-3 w-4 h-4 flex-shrink-0 text-violet-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-2 origin-top rounded-xl border border-white/10 bg-[#0d1126]/95 shadow-xl backdrop-blur-md transition-all"
          style={{
            zIndex: 1050,
            maxHeight: '18rem',
            overflowY: 'auto'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500/80 via-purple-600/80 to-indigo-600/80 text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)]'
                    : 'text-slate-200 hover:bg-white/5'
                }`}
              >
                <span
                  className="block flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={option.label}
                >
                  {option.label}
                </span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;