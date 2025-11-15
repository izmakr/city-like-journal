'use client';

import { useMemo } from 'react';

import { PostCard } from '@/components/PostCard';
import { useBookmark } from '@/contexts/BookmarkContext';
import type { Post } from '@/lib/types';

type BookmarksContentProps = {
  posts: Post[];
};

export function BookmarksContent({ posts }: BookmarksContentProps) {
  const { bookmarks } = useBookmark();

  const bookmarkedPosts = useMemo(() => {
    return posts.filter((post) => bookmarks.includes(post.id));
  }, [bookmarks, posts]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">お気に入り</h1>
        <p className="mt-2 text-sm text-gray-400">
          {bookmarkedPosts.length > 0
            ? `${bookmarkedPosts.length}件の記事をお気に入り登録しています`
            : 'お気に入り登録した記事はありません'}
        </p>
      </div>

      {bookmarkedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-300 mb-2">お気に入りがありません</p>
          <p className="text-sm text-gray-400">
            気になる記事を見つけたら、お気に入りボタンをタップして保存しましょう
          </p>
        </div>
      )}
    </div>
  );
}

