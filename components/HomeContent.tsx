"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';
import { useDeferredValue } from 'react';

import type { Post } from '@/lib/types';
import { useSearch } from '@/contexts/SearchContext';
import { useMapFilters } from '@/lib/hooks/useMapFilters';

const LazyMapView = dynamic(() => import('@/components/LazyMapView').then((mod) => mod.LazyMapView), {
  ssr: false,
  loading: () => (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
      {/* スケルトングリッド */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-6 h-full gap-0.5 p-4">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-700 rounded"
              style={{
                animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                animationDelay: `${(i % 12) * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* 中央のピンアイコン */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-slate-600 animate-bounce"
          style={{ animationDuration: '2s' }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
    </div>
  ),
});

const LazyPostList = dynamic(() => import('@/components/PostList').then((mod) => mod.PostList), {
  loading: () => (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="h-6 w-40 rounded bg-slate-800 animate-pulse" />
        <div className="h-6 w-24 rounded bg-slate-800 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[16/10] rounded-2xl border border-slate-800 bg-slate-900 animate-pulse" />
        ))}
      </div>
    </div>
  ),
});

type HomeContentProps = {
  posts: Post[];
  areaGroups: string[];
};

export function HomeContent({ posts, areaGroups }: HomeContentProps) {
  const { searchQuery } = useSearch();
  const router = useRouter();
  const filtersResult = useMapFilters(posts, searchQuery, areaGroups);
  const deferredFiltersResult = useDeferredValue(filtersResult);
  const {
    categoryGroup,
    categoryGroups: availableCategoryGroups,
    categories: availableCategories,
    category,
    areaGroup,
    areaGroups: availableAreaGroups,
    area,
    areas: availableAreas,
    setAreaGroup,
    setArea,
    setCategoryGroup,
    setCategory,
    filteredPosts,
    normalizedQuery,
  } = deferredFiltersResult;

  useEffect(() => {
    if (filteredPosts.length === 0) return;

    const prefetchTargets = filteredPosts.slice(0, 6);
    let cancelled = false;

    const runPrefetch = () => {
      if (cancelled) return;
      prefetchTargets.forEach((post) => {
        try {
          router.prefetch(post.permalink);
        } catch {
          // ignore prefetch errors
        }
      });
    };

    if (typeof window !== 'undefined') {
      const win = window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (id: number) => void;
      };

      if (typeof win.requestIdleCallback === 'function') {
        const handle = win.requestIdleCallback(runPrefetch);
        return () => {
          cancelled = true;
          win.cancelIdleCallback?.(handle);
        };
      }

      const timeout = window.setTimeout(runPrefetch, 200);
      return () => {
        cancelled = true;
        window.clearTimeout(timeout);
      };
    }
  }, [filteredPosts, router]);

  return (
    <div className="space-y-8">
      <LazyMapView
        posts={filteredPosts}
        category={category}
        categoryGroup={categoryGroup}
        categoryGroups={availableCategoryGroups}
        categories={availableCategories}
        areaGroup={areaGroup}
        areaGroups={availableAreaGroups}
        areas={availableAreas}
        area={area}
        onCategoryGroupChange={setCategoryGroup}
        onCategoryChange={setCategory}
        onAreaGroupChange={setAreaGroup}
        onAreaChange={setArea}
      />
      <LazyPostList
        key={`${categoryGroup}-${category}-${areaGroup}-${area}-${normalizedQuery}`}
        posts={filteredPosts}
      />
    </div>
  );
}
