'use client';

import { useCallback, useMemo } from 'react';

import type { FilterOption } from './PostFilters/types';
import { ALL } from './PostFilters/types';
import { FilterPopoverSection } from './PostFilters/FilterPopoverSection';
import { useFilterPopover } from './PostFilters/useFilterPopover';

type PostFiltersProps = {
  categoryGroups: string[];
  categories: string[];
  areaGroups: string[];
  areas: string[];
  categoryGroup: string;
  category: string;
  areaGroup: string;
  area: string;
  onCategoryGroupChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAreaGroupChange: (value: string) => void;
  onAreaChange: (value: string) => void;
};

const formatSummary = (groupValue: string, itemValue: string, allLabel = 'すべて') => {
  if (groupValue === ALL) return allLabel;
  if (itemValue !== ALL) return `${groupValue} ▶ ${itemValue}`;
  return groupValue;
};

const PostFiltersInner = ({
  categoryGroups,
  categories,
  areaGroups,
  areas,
  categoryGroup,
  category,
  areaGroup,
  area,
  onCategoryGroupChange,
  onCategoryChange,
  onAreaGroupChange,
  onAreaChange,
}: PostFiltersProps) => {
  const {
    isOpen: isCategoryOpen,
    step: categoryStep,
    containerRef: categoryRef,
    toggle: toggleCategoryPopover,
    close: closeCategoryPopover,
    showGroupStep: showCategoryGroupStep,
    showDetailStep: showCategoryDetailStep,
  } = useFilterPopover({ selectedGroup: categoryGroup });

  const {
    isOpen: isAreaOpen,
    step: areaStep,
    containerRef: areaRef,
    toggle: toggleAreaPopover,
    close: closeAreaPopover,
    showGroupStep: showAreaGroupStep,
    showDetailStep: showAreaDetailStep,
  } = useFilterPopover({ selectedGroup: areaGroup });

  const handleCategoryGroupSelect = useCallback(
    (value: string) => {
      onCategoryGroupChange(value);
      onCategoryChange('all');
      if (value === 'all') {
        closeCategoryPopover();
      } else {
        showCategoryDetailStep();
      }
    },
    [closeCategoryPopover, onCategoryChange, onCategoryGroupChange, showCategoryDetailStep],
  );

  const handleCategorySelect = useCallback(
    (value: string) => {
      onCategoryChange(value);
      closeCategoryPopover();
    },
    [closeCategoryPopover, onCategoryChange],
  );

  const handleAreaGroupSelect = useCallback(
    (value: string) => {
      onAreaGroupChange(value);
      onAreaChange('all');
      if (value === 'all') {
        closeAreaPopover();
      } else {
        showAreaDetailStep();
      }
    },
    [closeAreaPopover, onAreaChange, onAreaGroupChange, showAreaDetailStep],
  );

  const handleAreaSelect = useCallback(
    (value: string) => {
      onAreaChange(value);
      closeAreaPopover();
    },
    [closeAreaPopover, onAreaChange],
  );

  const categorySummary = formatSummary(categoryGroup, category);
  const areaSummary = formatSummary(areaGroup, area);

  const categoryGroupOptions = useMemo<FilterOption[]>(
    () =>
      categoryGroups.map((value) => ({
        value,
        label: value === ALL ? 'すべて' : value,
        isActive: categoryGroup === value,
      })),
    [categoryGroups, categoryGroup],
  );

  const categoryDetailOptions = useMemo<FilterOption[]>(
    () => [
      {
        value: ALL,
        label: 'すべて',
        isActive: category === ALL,
      },
      ...categories
        .filter((value) => value !== ALL)
        .map((value) => ({ value, label: value, isActive: category === value })),
    ],
    [categories, category],
  );

  const areaGroupOptions = useMemo<FilterOption[]>(
    () =>
      areaGroups.map((value) => ({
        value,
        label: value === ALL ? 'すべて' : value,
        isActive: areaGroup === value,
      })),
    [areaGroups, areaGroup],
  );

  const areaDetailOptions = useMemo<FilterOption[]>(
    () => [
      {
        value: ALL,
        label: 'すべて',
        isActive: area === ALL,
      },
      ...areas
        .filter((value) => value !== ALL)
        .map((value) => ({ value, label: value, isActive: area === value })),
    ],
    [areas, area],
  );


  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <FilterPopoverSection
        label="エリア"
        summary={areaSummary}
        groupTitle="エリアグループを選択"
        detailTitle={(groupLabel) => `エリア詳細を選択 (${groupLabel})`}
        selectedGroupValue={areaGroup}
        groupOptions={areaGroupOptions}
        detailOptions={areaDetailOptions}
        onGroupSelect={handleAreaGroupSelect}
        onDetailSelect={handleAreaSelect}
        popover={{
          isOpen: isAreaOpen,
          step: areaStep,
          containerRef: areaRef,
          toggle: toggleAreaPopover,
          close: closeAreaPopover,
          showGroupStep: showAreaGroupStep,
        }}
      />

      <FilterPopoverSection
        label="カテゴリ"
        summary={categorySummary}
        groupTitle="カテゴリグループを選択"
        detailTitle={(groupLabel) => `サブカテゴリを選択 (${groupLabel})`}
        selectedGroupValue={categoryGroup}
        groupOptions={categoryGroupOptions}
        detailOptions={categoryDetailOptions}
        onGroupSelect={handleCategoryGroupSelect}
        onDetailSelect={handleCategorySelect}
        popover={{
          isOpen: isCategoryOpen,
          step: categoryStep,
          containerRef: categoryRef,
          toggle: toggleCategoryPopover,
          close: closeCategoryPopover,
          showGroupStep: showCategoryGroupStep,
        }}
      />
    </div>
  );
};

export const PostFilters = (props: PostFiltersProps) => <PostFiltersInner {...props} />;



