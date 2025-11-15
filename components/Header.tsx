'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { SearchBar } from './SearchBar';
import { CloseIcon, MenuIcon, SearchIcon } from './icons';

import { useSearch } from '@/contexts/SearchContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearchOpen = () => {
    // まずマップへスクロール
    const mapElement = document.getElementById('spot-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // スクロール完了後にモーダルを開く
    setTimeout(() => {
      import('./SearchBar').then(() => {
        setSearchOpen(true);
      });
    }, 400); // スムーズスクロールの完了を待つ
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        import('./SearchBar').then(() => setSearchOpen(true));
      }
    };
    window.addEventListener('keydown', onKey, { passive: true });
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (menuOpen) {
      setMenuMounted(true);
    } else {
      const timer = setTimeout(() => setMenuMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [menuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b" style={{ borderColor: '#1F2633', background: 'rgba(11,14,19,0.6)', backdropFilter: 'blur(10px)' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-lg md:text-xl font-semibold tracking-tight flex-shrink-0 text-[#E6EAF2]" 
            style={{ 
              fontFamily: 'var(--font-cormorant), serif',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.3))'
            }}
          >
            City Like Journal
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link href="/tokyo/" className="text-[#9AA7B2] hover:text-[#E6EAF2] transition-colors">エリア一覧</Link>
            <Link href="/category/" className="text-[#9AA7B2] hover:text-[#E6EAF2] transition-colors">カテゴリ一覧</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* 検索中の表示 */}
          {searchQuery && (
            <>
              {/* PC版：アイコン付き */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131823] border text-xs" style={{ borderColor: '#1F2633' }}>
                <SearchIcon width={14} height={14} className="text-[#9AA7B2]" />
                <span className="text-[#E6EAF2] max-w-[120px] truncate">{searchQuery}</span>
                <button
                  onClick={handleClearSearch}
                  className="ml-1 text-[#9AA7B2] hover:text-[#E6EAF2] transition-colors"
                  aria-label="検索をクリア"
                >
                  <CloseIcon width={12} height={12} />
                </button>
              </div>
              {/* スマホ版：コンパクト */}
              <div className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-lg bg-[#131823] border text-xs" style={{ borderColor: '#1F2633' }}>
                <span className="text-[#E6EAF2] max-w-[60px] truncate">{searchQuery}</span>
                <button
                  onClick={handleClearSearch}
                  className="text-[#9AA7B2] hover:text-[#E6EAF2] transition-colors"
                  aria-label="検索をクリア"
                >
                  <CloseIcon width={12} height={12} />
                </button>
              </div>
            </>
          )}

          <button
            aria-label="検索"
            onClick={handleSearchOpen}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#131823]"
            style={{ borderColor: '#1F2633' }}
          >
            <SearchIcon width={18} height={18} />
          </button>

          <button
            aria-label="メニューを開く"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#131823]`}
            style={{ borderColor: '#1F2633' }}
          >
            <MenuIcon width={18} height={18} />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-200 opacity-100"
            onClick={handleSearchClose}
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="relative bg-[#0B0E13] rounded-xl border p-4 shadow-lg" style={{ borderColor: '#1F2633' }}>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar 
                    q={searchQuery} 
                    onChange={setSearchQuery} 
                    inputRef={searchInputRef}
                    onEnter={handleSearchClose}
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#131823]"
                  style={{ borderColor: '#1F2633' }}
                  title="閉じる (Esc)"
                >
                  <CloseIcon width={18} height={18} />
                </button>
              </div>
              {searchQuery && (
                <div className="mt-3 flex items-center justify-between text-xs text-[#9AA7B2]">
                  <span>「{searchQuery}」で検索中</span>
                  <button
                    onClick={handleClearSearch}
                    className="text-[#9AA7B2] hover:text-[#E6EAF2] underline transition-colors"
                  >
                    クリア
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Menu Overlay */}
      {menuMounted && (
        <>
          <div
            className="fixed inset-0 z-40 transition-opacity duration-200"
            onClick={() => setMenuOpen(false)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              opacity: menuOpen ? 1 : 0
            }}
          />
          {/* Menu panel */}
          <div className="fixed inset-x-0 top-14 z-50 flex justify-end">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full flex justify-end">
              <div
                className="mt-2 w-auto min-w-[160px] rounded-xl border p-2 shadow-lg transition-all duration-200"
                style={{
                  background: '#0B0E13',
                  borderColor: '#1F2633',
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <nav className="flex flex-col">
                  <Link href="/" className="px-4 py-2.5 rounded-lg hover:bg-[#131823] whitespace-nowrap transition-colors" onClick={() => setMenuOpen(false)}>ホーム</Link>
                  <Link href="/bookmarks" className="px-4 py-2.5 rounded-lg hover:bg-[#131823] whitespace-nowrap transition-colors" onClick={() => setMenuOpen(false)}>お気に入り一覧</Link>
                  <Link href="/tokyo/" className="px-4 py-2.5 rounded-lg hover:bg-[#131823] whitespace-nowrap transition-colors" onClick={() => setMenuOpen(false)}>エリア一覧</Link>
                  <Link href="/category/" className="px-4 py-2.5 rounded-lg hover:bg-[#131823] whitespace-nowrap transition-colors" onClick={() => setMenuOpen(false)}>カテゴリ一覧</Link>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}


