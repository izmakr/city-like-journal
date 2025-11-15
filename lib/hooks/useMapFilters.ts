import { useCallback, useMemo, useState } from 'react';

import { getAllCategoryGroups, getCategoriesByGroup, getCategoryVisual } from '@/lib/categories';
import type { Post } from '@/lib/types';
import { buildSearchText } from '@/lib/postUtils';

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
  const categoryDefinitions = useMemo(() => getAllCategoryGroups(), []);

  const {
    searchTextById,
    categoriesByGroupFromPosts,
    allCategoriesFromPosts,
    postGroupsById,
    areaGroupsFromPosts,
    areasByAreaGroup,
    allAreasFromPosts,
  } = useMemo(() => {
    const searchText = new Map<string, string>();
    const categoriesByGroupMap = new Map<string, Set<string>>();
    const allCategoriesSet = new Set<string>();
    const groupsByPost = new Map<string, Set<string>>();
    const areaGroupsSet = new Set<string>();
    const areasByGroupMap = new Map<string, Set<string>>();
    const allAreasSet = new Set<string>();

    posts.forEach((post) => {
      searchText.set(post.id, buildSearchText(post));

      const groupSet = new Set<string>();
      post.kind?.forEach((entry) => {
        const visual = getCategoryVisual(entry);
        if (!visual?.group) return;
        groupSet.add(visual.group);

        const existingCategories = categoriesByGroupMap.get(visual.group) ?? new Set<string>();
        existingCategories.add(entry);
        categoriesByGroupMap.set(visual.group, existingCategories);
        allCategoriesSet.add(entry);
      });

      if (groupSet.size > 0) {
        groupsByPost.set(post.id, groupSet);
      }

      if (post.areaGroup) {
        areaGroupsSet.add(post.areaGroup);
        const existingAreas = areasByGroupMap.get(post.areaGroup) ?? new Set<string>();
        if (post.area) {
          existingAreas.add(post.area);
          allAreasSet.add(post.area);
        }
        areasByGroupMap.set(post.areaGroup, existingAreas);
      }

      if (post.area) {
        allAreasSet.add(post.area);
      }
    });

    const categoriesByGroupSorted = new Map<string, string[]>();
    categoriesByGroupMap.forEach((value, key) => {
      categoriesByGroupSorted.set(key, Array.from(value).sort());
    });

    const areasByGroupSorted = new Map<string, string[]>();
    areasByGroupMap.forEach((value, key) => {
      areasByGroupSorted.set(key, Array.from(value).sort());
    });

    return {
      searchTextById: searchText,
      categoriesByGroupFromPosts: categoriesByGroupSorted,
      allCategoriesFromPosts: Array.from(allCategoriesSet).sort(),
      postGroupsById: groupsByPost,
      areaGroupsFromPosts: Array.from(areaGroupsSet).sort(),
      areasByAreaGroup: areasByGroupSorted,
      allAreasFromPosts: Array.from(allAreasSet).sort(),
    };
  }, [posts]);

  const categoriesFromConfig = useMemo(() => {
    const map = new Map<string, string[]>();
    const all = new Set<string>();
    categoryDefinitions.forEach((definition) => {
      map.set(definition.group, [...definition.categories]);
      definition.categories.forEach((category) => all.add(category));
    });
    return {
      map,
      all: Array.from(all).sort(),
    };
  }, [categoryDefinitions]);

  const [categoryGroup, setCategoryGroupState] = useState<string>(ALL);
  const [category, setCategoryState] = useState<string>(ALL);
  const [areaGroup, setAreaGroupState] = useState<string>(ALL);
  const [area, setAreaState] = useState<string>(ALL);

  const normalizedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  // 複数ワード検索：全角・半角スペースで分割してAND検索
  const searchKeywords = useMemo(() => {
    if (!normalizedQuery) return [];
    // 全角・半角スペースで分割し、空文字を除外
    return normalizedQuery.split(/[\s　]+/).filter(keyword => keyword.length > 0);
  }, [normalizedQuery]);

  const categoryGroups = useMemo(() => {
    const base = categoryDefinitions.map((definition) => definition.group);
    return [ALL, ...base];
  }, [categoryDefinitions]);

  const categories = useMemo(() => {
    const collected = new Set<string>();
    const fromConfig = categoriesFromConfig.map.get(categoryGroup) ?? [];
    fromConfig.forEach((entry) => collected.add(entry));

    if (categoryGroup === ALL) {
      categoriesFromConfig.all.forEach((entry) => collected.add(entry));
      allCategoriesFromPosts.forEach((entry) => collected.add(entry));
    } else {
      const fromPosts = categoriesByGroupFromPosts.get(categoryGroup) ?? [];
      fromPosts.forEach((entry) => collected.add(entry));
      const predefined = getCategoriesByGroup(categoryGroup) ?? [];
      predefined.forEach((entry) => collected.add(entry));
    }

    return [ALL, ...Array.from(collected).sort()];
  }, [categoryGroup, categoriesByGroupFromPosts, categoriesFromConfig, allCategoriesFromPosts]);

  const areaGroups = useMemo(() => {
    if (predefinedAreaGroups && predefinedAreaGroups.length > 0) {
      const unique = Array.from(new Set(predefinedAreaGroups));
      return unique[0] === ALL ? unique : [ALL, ...unique.filter((group) => group !== ALL)];
    }
    return [ALL, ...areaGroupsFromPosts];
  }, [areaGroupsFromPosts, predefinedAreaGroups]);

  const areas = useMemo(() => {
    if (areaGroup === ALL) {
      return [ALL, ...allAreasFromPosts];
    }
    const scoped = areasByAreaGroup.get(areaGroup) ?? [];
    return [ALL, ...scoped];
  }, [areaGroup, areasByAreaGroup, allAreasFromPosts]);

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
      const searchText = searchTextById.get(post.id) ?? '';
      // 複数ワード検索：すべてのキーワードが含まれているかチェック（AND検索）
      const matchesQuery = searchKeywords.length === 0 || 
        searchKeywords.every(keyword => searchText.includes(keyword));
      const matchesAreaGroup = areaGroup === ALL || post.areaGroup === areaGroup;
      const matchesArea = normalizedArea === ALL || post.area === normalizedArea;
      const matchesCategory =
        normalizedCategory === ALL
          ? categoryGroup === ALL
            ? true
            : (postGroupsById.get(post.id)?.has(categoryGroup) ?? false)
          : post.kind.includes(normalizedCategory);
      return matchesQuery && matchesAreaGroup && matchesArea && matchesCategory;
    });
  }, [posts, searchKeywords, areaGroup, normalizedArea, normalizedCategory, categoryGroup, searchTextById, postGroupsById]);

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

