import { useCallback, useMemo, useState } from 'react';
import type { Post } from '@/lib/types';
import { buildSearchText } from '@/lib/postUtils';
import { getAllCategoryGroups, getCategoriesByGroup, getCategoryVisual } from '@/lib/categories';

const ALL = 'all';

export type UseMapFiltersResult = {
  categoryGroup: string;
  categoryGroups: string[];
  categories: string[];
  category: string;
  areaGroup: string;
  area: string;
  areaGroups: string[];
  areas: string[];
  filteredPosts: Post[];
  normalizedQuery: string;
  setCategoryGroup: (value: string) => void;
  setCategory: (value: string) => void;
  setAreaGroup: (value: string) => void;
  setArea: (value: string) => void;
};

export const useMapFilters = (
  posts: Post[],
  searchQuery: string,
  predefinedAreaGroups?: string[],
): UseMapFiltersResult => {
  const [categoryGroup, setCategoryGroupState] = useState<string>(ALL);
  const [category, setCategoryState] = useState<string>(ALL);
  const [areaGroup, setAreaGroupState] = useState<string>(ALL);
  const [area, setAreaState] = useState<string>(ALL);

  const normalizedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const categoryGroups = useMemo(() => {
    const base = getAllCategoryGroups().map((definition) => definition.group);
    return [ALL, ...base];
  }, []);

  const categories = useMemo(() => {
    if (categoryGroup === ALL) {
      const collected = new Set<string>();
      getAllCategoryGroups().forEach((definition) => {
        definition.categories.forEach((category) => collected.add(category));
      });
      return [ALL, ...Array.from(collected).sort()];
    }
    const scoped = new Set<string>(getCategoriesByGroup(categoryGroup));
    posts.forEach((post) => {
      post.kind?.forEach((entry) => {
        const visual = getCategoryVisual(entry);
        if (visual?.group === categoryGroup) {
          scoped.add(entry);
        }
      });
    });
    return [ALL, ...Array.from(scoped).sort()];
  }, [categoryGroup, posts]);

  const areaGroups = useMemo(() => {
    if (predefinedAreaGroups && predefinedAreaGroups.length > 0) {
      const unique = Array.from(new Set(predefinedAreaGroups));
      return unique[0] === ALL ? unique : [ALL, ...unique.filter((group) => group !== ALL)];
    }
    const unique = Array.from(new Set(posts.map((post) => post.areaGroup).filter(Boolean))).sort();
    return [ALL, ...unique];
  }, [posts, predefinedAreaGroups]);

  const areas = useMemo(() => {
    const scopedPosts = areaGroup === ALL ? posts : posts.filter((post) => post.areaGroup === areaGroup);
    const unique = Array.from(new Set(scopedPosts.map((post) => post.area).filter(Boolean))).sort();
    return [ALL, ...unique];
  }, [posts, areaGroup]);

  const normalizedArea = useMemo(() => {
    if (area === ALL) return ALL;
    return areas.includes(area) ? area : ALL;
  }, [area, areas]);

  const normalizedCategory = useMemo(() => {
    if (category === ALL) return ALL;
    return categories.includes(category) ? category : ALL;
  }, [category, categories]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery = !normalizedQuery || buildSearchText(post).includes(normalizedQuery);
      const matchesAreaGroup = areaGroup === ALL || post.areaGroup === areaGroup;
      const matchesArea = normalizedArea === ALL || post.area === normalizedArea;
      const matchesCategory =
        normalizedCategory === ALL
          ? categoryGroup === ALL
            ? true
            : post.kind.some((entry) => getCategoryVisual(entry)?.group === categoryGroup)
          : post.kind.includes(normalizedCategory);
      return matchesQuery && matchesAreaGroup && matchesArea && matchesCategory;
    });
  }, [posts, normalizedQuery, areaGroup, normalizedArea, normalizedCategory, categoryGroup]);

  const setCategoryGroup = useCallback((value: string) => {
    setCategoryGroupState(value || ALL);
    setCategoryState(ALL);
  }, []);

  const setCategory = useCallback((value: string) => {
    const next = value || ALL;
    setCategoryState(next);
  }, []);

  const setAreaGroup = useCallback((value: string) => {
    const next = value || ALL;
    setAreaGroupState(next);
    if (next === ALL) {
      setAreaState(ALL);
    }
  }, []);

  const setArea = useCallback((value: string) => {
    setAreaState(value || ALL);
  }, []);

  return {
    categoryGroup,
    categoryGroups,
    categories,
    category: normalizedCategory,
    areaGroup,
    area: normalizedArea,
    areaGroups,
    areas,
    filteredPosts,
    normalizedQuery,
    setCategoryGroup,
    setCategory,
    setAreaGroup,
    setArea,
  };
};

