"use client";

import { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon } from './icons';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}

export function Select({ value, onChange, options, allLabel }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedLabel = value === 'all' ? (allLabel || 'すべて') : value;

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl bg-[#0B0E13] border px-4 py-3 pr-10 text-sm text-gray-200 cursor-pointer transition-all duration-200 hover:border-[#2A4A6B] focus:outline-none focus:ring-2 focus:ring-[#2A4A6B] focus:border-[#2A4A6B] flex items-center justify-between relative"
        style={{ borderColor: '#1F2633' }}
      >
        <span className="truncate pr-2">{selectedLabel}</span>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon
            width={16}
            height={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl border overflow-hidden shadow-lg"
          style={{
            borderColor: '#1F2633',
            background: '#0B0E13',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option === value;
              const label = option === 'all' ? (allLabel || 'すべて') : option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#2A4A6B] text-white'
                      : 'text-gray-200 hover:bg-[#131823] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
