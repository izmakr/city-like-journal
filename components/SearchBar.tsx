'use client';

import { RefObject } from 'react';

import { SearchIcon } from './icons';

export function SearchBar({
  q,
  onChange,
  placeholder,
  inputRef,
}: {
  q: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'スポット名・エリア・カテゴリで検索'}
        className="w-full rounded-xl bg-[#131823] border px-4 py-3 pl-10 text-sm md:text-base outline-none focus:ring-2 focus:ring-[#2A4A6B] focus:border-[#2A4A6B]"
        style={{ borderColor: '#1F2633' }}
      />
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width={18} height={18} />
    </div>
  );
}


