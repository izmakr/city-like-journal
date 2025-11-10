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
      <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
        マップを読み込み中…
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
