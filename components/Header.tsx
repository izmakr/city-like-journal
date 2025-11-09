'use client';

import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { SearchBar } from './SearchBar';
import { useSearch } from '@/contexts/SearchContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b" style={{ borderColor: '#1F2633', background: 'rgba(11,14,19,0.6)', backdropFilter: 'blur(10px)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm md:text-base font-semibold tracking-tight flex-shrink-0">City Like Journal</Link>

        <div className="flex items-center gap-2">
          <button
            aria-label="検索"
            onClick={() => setSearchOpen(true)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#131823]"
            style={{ borderColor: '#1F2633' }}
          >
            <Search size={18} />
          </button>

          <button
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#131823]`}
            style={{ borderColor: '#1F2633' }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-200 opacity-100"
            onClick={() => setSearchOpen(false)}
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl mx-4"
          >
            <div className="relative bg-[#0B0E13] rounded-xl border p-4 shadow-lg" style={{ borderColor: '#1F2633' }}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar q={searchQuery} onChange={setSearchQuery} inputRef={searchInputRef} />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#131823]"
                  style={{ borderColor: '#1F2633' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Menu Overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-200 opacity-100"
            onClick={() => setMenuOpen(false)}
            style={{ background: 'rgba(0,0,0,0.3)' }}
          />
          {/* Menu panel */}
          <div
            className="fixed right-4 top-16 z-50 w-[220px] rounded-xl border p-2 shadow-lg transition-all duration-200 opacity-100 scale-100 translate-y-0"
            style={{ background: '#0B0E13', borderColor: '#1F2633' }}
          >
            <nav className="flex flex-col">
              <Link href="/" className="px-3 py-2 rounded-lg hover:bg-[#131823]" onClick={() => setMenuOpen(false)}>ホーム</Link>
              <Link href="/posts/valley-park-stand/" className="px-3 py-2 rounded-lg hover:bg-[#131823]" onClick={() => setMenuOpen(false)}>特別記事1</Link>
              <Link href="/posts/dummy-1/" className="px-3 py-2 rounded-lg hover:bg-[#131823]" onClick={() => setMenuOpen(false)}>特別記事2</Link>
              <Link href="/posts/dummy-2/" className="px-3 py-2 rounded-lg hover:bg-[#131823]" onClick={() => setMenuOpen(false)}>特別記事3</Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}


