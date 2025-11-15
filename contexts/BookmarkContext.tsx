'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type BookmarkContextType = {
  bookmarks: string[]; // post.idの配列
  addBookmark: (postId: string) => void;
  removeBookmark: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;
};

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = 'city-like-journal-bookmarks';

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ローカルストレージから読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Failed to save bookmarks:', error);
      }
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((postId: string) => {
    setBookmarks((prev) => {
      if (prev.includes(postId)) return prev;
      return [...prev, postId];
    });
  }, []);

  const removeBookmark = useCallback((postId: string) => {
    setBookmarks((prev) => prev.filter((id) => id !== postId));
  }, []);

  const toggleBookmark = useCallback((postId: string) => {
    setBookmarks((prev) => {
      if (prev.includes(postId)) {
        return prev.filter((id) => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
  }, []);

  const isBookmarked = useCallback(
    (postId: string) => {
      return bookmarks.includes(postId);
    },
    [bookmarks]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
}

