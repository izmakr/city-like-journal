'use client';

import type { RefObject } from 'react';

import { FilterOptionButton } from './FilterOptionButton';
import type { FilterOption } from './types';
import { ALL } from './types';
import type { FilterStep } from './useFilterPopover';

type FilterPopoverSectionProps = {
  label: string;
  summary: string;
  groupTitle: string;
  detailTitle: (groupLabel: string) => string;
  selectedGroupValue: string;
  groupOptions: FilterOption[];
  detailOptions: FilterOption[];
  onGroupSelect: (value: string) => void;
  onDetailSelect: (value: string) => void;
  popover: {
    isOpen: boolean;
    step: FilterStep;
    containerRef: RefObject<HTMLDivElement | null>;
    toggle: () => void;
    close: () => void;
    showGroupStep: () => void;
  };
};

const getOptionLabel = (value: string, options: FilterOption[]) => {
  if (value === ALL) return 'すべて';
  return options.find((option) => option.value === value)?.label ?? value;
};

export function FilterPopoverSection({
  label,
  summary,
  groupTitle,
  detailTitle,
  selectedGroupValue,
  groupOptions,
  detailOptions,
  onGroupSelect,
  onDetailSelect,
  popover,
}: FilterPopoverSectionProps) {
  const { isOpen, step, containerRef, toggle, close, showGroupStep } = popover;
  const options = step === 'group' ? groupOptions : detailOptions;
  const handleSelect = step === 'group' ? onGroupSelect : onDetailSelect;
  const detailHeading = detailTitle(getOptionLabel(selectedGroupValue, groupOptions));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        className="w-full rounded-2xl bg-[#0B0E13] border border-[#1F2633] px-4 py-3 text-left text-sm text-gray-200 flex items-center justify-between"
      >
        <span>{label}</span>
        <span className="text-xs text-gray-500">{summary}</span>
      </button>
      {isOpen ? (
        <div className="absolute z-40 mt-2 w-full rounded-2xl border border-[#1F2633] bg-[#0B0E13] shadow-lg">
          <div className="px-4 py-3 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                {step === 'detail' ? (
                  <button
                    type="button"
                    onClick={showGroupStep}
                    className="text-gray-400 hover:text-gray-200 transition"
                    aria-label={`${label}グループ選択に戻る`}
                  >
                    ←
                  </button>
                ) : null}
                <p className="font-medium">{step === 'group' ? groupTitle : detailHeading}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-gray-400 hover:text-gray-200 transition"
                aria-label={`${label}選択を閉じる`}
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {options.map(({ value, label: optionLabel, isActive }) => (
                <FilterOptionButton
                  key={value}
                  label={optionLabel}
                  isActive={isActive}
                  onClick={() => handleSelect(value)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
