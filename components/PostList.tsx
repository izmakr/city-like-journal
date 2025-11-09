"use client";

import { useRef } from 'react';

import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/lib/hooks/usePagination';
import { Post } from '@/lib/types';

const PAGE_SIZE = 9;

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const { page, pageCount, pageItems, startIndex, endIndex, goToPage } = usePagination({
    items: posts,
    pageSize: PAGE_SIZE,
  });

  const hitsRef = useRef<HTMLDivElement | null>(null);

  const handlePage = (targetPage: number) => {
    goToPage(targetPage);
    if (typeof window !== 'undefined' && hitsRef.current) {
      const top = hitsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold text-white">コンテンツ一覧</h2>
        <Pagination page={page} pageCount={pageCount} onPage={handlePage} />
        <div ref={hitsRef} className="text-xs text-gray-400">
          {startIndex === 0 ? '0件表示' : `${startIndex}~${endIndex}件表示`} / 全{posts.length}件中
        </div>
      </div>

      <section className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {pageItems.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <Pagination page={page} pageCount={pageCount} onPage={handlePage} />
    </>
  );
}
