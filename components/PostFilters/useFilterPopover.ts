'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ALL } from './types';

export type FilterStep = 'group' | 'detail';

type UseFilterPopoverOptions = {
  selectedGroup: string;
};

type UseFilterPopoverResult = {
  isOpen: boolean;
  step: FilterStep;
  containerRef: RefObject<HTMLDivElement | null>;
  toggle: () => void;
  close: () => void;
  showGroupStep: () => void;
  showDetailStep: () => void;
};

export const useFilterPopover = ({ selectedGroup }: UseFilterPopoverOptions): UseFilterPopoverResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<FilterStep>('group');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const preferredStep = useCallback<() => FilterStep>(
    () => (selectedGroup !== ALL ? 'detail' : 'group'),
    [selectedGroup],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setStep(preferredStep());
  }, [preferredStep]);

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    setStep(next ? (selectedGroup !== ALL ? 'detail' : 'group') : preferredStep());
  }, [isOpen, preferredStep, selectedGroup]);

  const showGroupStep = useCallback(() => {
    setIsOpen(true);
    setStep('group');
  }, []);

  const showDetailStep = useCallback(() => {
    setIsOpen(true);
    setStep('detail');
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    step,
    containerRef,
    toggle,
    close,
    showGroupStep,
    showDetailStep,
  };
};
