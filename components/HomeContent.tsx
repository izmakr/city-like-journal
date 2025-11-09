"use client";

import type { Post } from '@/lib/types';
import { MapView } from '@/components/MapView';
import { PostList } from '@/components/PostList';
import { useSearch } from '@/contexts/SearchContext';
import { useMapFilters } from '@/lib/hooks/useMapFilters';

type HomeContentProps = {
  posts: Post[];
  areaGroups: string[];
};

export function HomeContent({ posts, areaGroups }: HomeContentProps) {
  const { searchQuery } = useSearch();
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
  } = useMapFilters(posts, searchQuery, areaGroups);

  return (
    <div className="space-y-8">
      <MapView
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
      <PostList key={`${categoryGroup}-${category}-${areaGroup}-${area}-${normalizedQuery}`} posts={filteredPosts} />
    </div>
  );
}
