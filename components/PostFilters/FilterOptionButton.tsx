'use client';

type FilterOptionButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

export const FilterOptionButton = ({ label, isActive, onClick }: FilterOptionButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition ${
      isActive ? 'bg-[#2A4A6B] text-white' : 'text-gray-300 hover:bg-[#192233]'
    }`}
  >
    {label}
  </button>
);
