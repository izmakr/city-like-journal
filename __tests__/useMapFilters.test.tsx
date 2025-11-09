import { act, renderHook } from '@testing-library/react';

import { useMapFilters } from '@/lib/hooks/useMapFilters';
import type { Post } from '@/lib/types';
import { getAllCategoryGroups } from '@/lib/categories';

const basePost: Omit<Post, 'id' | 'slug'> = {
  title: 'Sample',
  date: '2024-01-01',
  area: '恵比寿',
  areaGroup: '恵比寿・代官山・中目黒',
  kind: ['カフェ'],
  cover: '/cover.jpg',
  excerpt: 'excerpt',
  content: 'content',
  nearestStation: '恵比寿駅',
};

const posts: Post[] = [
  { id: '1', slug: 'group-a/post-1', ...basePost },
  { id: '2', slug: 'group-a/post-2', ...basePost, area: '中目黒', kind: ['バー'], nearestStation: '中目黒駅' },
  {
    id: '3',
    slug: 'group-b/post-1',
    ...basePost,
    area: '銀座',
    areaGroup: '銀座・日本橋・八重洲',
    kind: ['寿司'],
    nearestStation: '銀座駅',
  },
];

describe('useMapFilters', () => {
  it('returns defaults and computed lists', () => {
    const { result } = renderHook(() => useMapFilters(posts, '', undefined));

    expect(result.current.categoryGroup).toBe('all');
    expect(result.current.categories).toContain('カフェ');
    expect(result.current.areaGroups).toContain('恵比寿・代官山・中目黒');
    expect(result.current.filteredPosts).toHaveLength(posts.length);
  });

  it('filters categories and normalizes selections when parent changes', () => {
    const { result } = renderHook(() => useMapFilters(posts, '', undefined));

    act(() => {
      const group = getAllCategoryGroups()[0]?.group ?? 'カフェ・喫茶';
      result.current.setCategoryGroup(group);
    });

    const selectedGroup = result.current.categoryGroup;
    expect(result.current.categoryGroups).toContain(selectedGroup);
    expect(result.current.category).toBe('all');
    expect(result.current.categories.some((category) => category === 'カフェ')).toBe(true);

    act(() => {
      result.current.setCategory('カフェ');
    });
    expect(result.current.category).toBe('カフェ');

    act(() => {
      const otherGroup = getAllCategoryGroups().find((entry) => entry.group !== result.current.categoryGroup)?.group;
      if (otherGroup) {
        result.current.setCategoryGroup(otherGroup);
      }
    });

    expect(result.current.categoryGroup).not.toBe(selectedGroup);
    expect(result.current.category).toBe('all');
  });

  it('normalizes area when selected area is not part of new area group', () => {
    const { result } = renderHook(() => useMapFilters(posts, '', undefined));

    act(() => {
      result.current.setAreaGroup('恵比寿・代官山・中目黒');
      result.current.setArea('恵比寿');
    });

    expect(result.current.area).toBe('恵比寿');

    act(() => {
      result.current.setAreaGroup('銀座・日本橋・八重洲');
    });

    expect(result.current.areaGroup).toBe('銀座・日本橋・八重洲');
    expect(result.current.area).toBe('all');
  });
});
