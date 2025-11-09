import { createStaticRegistry } from './utils/staticRegistry';
import type { MapIconType } from './mapIconTypes';

type CategoryKey = string;

export type CategoryVisualDefinition = {
  group: string;
  slug: string;
  categories: readonly string[];
  icon: MapIconType;
  color: string;
};

const CATEGORY_DEFINITIONS = [
  {
    group: 'カフェ',
    slug: 'cafe',
    categories: ['カフェ', 'コーヒー', '喫茶', 'ティーラウンジ', 'ティーハウス', 'ブランチ'],
    icon: 'cafe',
    color: '#8D6E63',
  },
  {
    group: 'スイーツ・ベーカリー',
    slug: 'sweets-bakery',
    categories: [
      'スイーツ',
      'デザート',
      'パティスリー',
      'ショコラ',
      'ケーキ',
      'ジェラート',
      'スイーツビュッフェ',
      'ベーカリー',
      'パン',
    ],
    icon: 'sweets',
    color: '#F3B6D1',
  },
  {
    group: 'バー・ラウンジ',
    slug: 'bar-lounge',
    categories: [
      'バー',
      'ワインバー',
      'カクテル',
      'バーラウンジ',
      'ウイスキーバー',
      'ビアバー',
      'ホテルバー',
      'ホテルラウンジ',
      'ナイトバー',
      'ラウンジ',
    ],
    icon: 'bar',
    color: '#A260BF',
  },
  {
    group: 'レストラン・ダイニング',
    slug: 'restaurant-dining',
    categories: [
      'レストラン',
      'ダイニング',
      'ダイニングバー',
      '洋食',
      'モダンヨーロピアン',
      'アメリカン',
      'グリル',
      'ステーキ',
      '鉄板焼き',
      'ホテルダイニング',
      'ファインダイニング',
    ],
    icon: 'dining',
    color: '#E69A2E',
  },
  {
    group: 'イタリアン・フレンチ',
    slug: 'italian-french',
    categories: ['イタリアン', 'フレンチ', 'ビストロ', 'トラットリア', 'リストランテ'],
    icon: 'dining',
    color: '#D2691E',
  },
  {
    group: '和食・寿司',
    slug: 'japanese-sushi',
    categories: ['和食', '寿司', '割烹', '天ぷら', '懐石', 'そば', 'うどん', 'しゃぶしゃぶ', 'すき焼き', 'おでん'],
    icon: 'sushi',
    color: '#BFA56A',
  },
  {
    group: '中華・アジア',
    slug: 'asian-dining',
    categories: [
      '中華',
      '中国料理',
      '四川料理',
      '上海料理',
      '韓国料理',
      'タイ料理',
      'アジア料理',
      'エスニック',
      'ベトナム料理',
    ],
    icon: 'dining',
    color: '#E07A5F',
  },
  {
    group: 'ラーメン・麺料理',
    slug: 'noodles',
    categories: ['ラーメン', 'つけ麺', '担々麺', '麺料理'],
    icon: 'ramen',
    color: '#E5843A',
  },
] as const satisfies readonly CategoryVisualDefinition[];

const CATEGORY_REGISTRY = createStaticRegistry(
  CATEGORY_DEFINITIONS.map((definition) => [definition.group, definition]),
  {
    normalizeKey: (value) => value.trim(),
  },
);

const CATEGORY_NAME_TO_GROUP = CATEGORY_DEFINITIONS.reduce(
  (acc, { group, categories }) => {
    categories.forEach((name) => {
      acc[name] = group;
    });
    return acc;
  },
  {} as Record<CategoryKey, string>,
);

const CATEGORY_PRIORITY = CATEGORY_DEFINITIONS.map((definition) => definition.group);

export const CATEGORY_DEFAULT_VISUAL: CategoryVisualDefinition = {
  group: 'その他',
  slug: 'other',
  categories: [],
  icon: 'default',
  color: '#7FB4FF',
};

export const getCategoryVisual = (category?: string): CategoryVisualDefinition | undefined => {
  if (!category) return undefined;
  const normalized = category.trim();
  if (!normalized) return undefined;

  const groupName = CATEGORY_NAME_TO_GROUP[normalized] ?? normalized;
  const definition = CATEGORY_REGISTRY.get(groupName);
  return definition ?? undefined;
};

export const resolveCategoryVisualForKinds = (
  kinds: readonly string[],
  preferredKind?: string,
): CategoryVisualDefinition | undefined => {
  const normalizedKinds = kinds.map((kind) => kind.trim()).filter((kind) => kind.length > 0);

  if (preferredKind) {
    const preferred = getCategoryVisual(preferredKind);
    if (preferred) {
      return preferred;
    }
  }

  for (const group of CATEGORY_PRIORITY) {
    const definition = CATEGORY_REGISTRY.get(group);
    if (!definition) continue;
    const matched = normalizedKinds.some((kind) => CATEGORY_NAME_TO_GROUP[kind] === group || kind === group);
    if (matched) {
      return definition;
    }
  }

  for (const kind of normalizedKinds) {
    const definition = getCategoryVisual(kind);
    if (definition) {
      return definition;
    }
  }

  return undefined;
};

export const getAllCategoryGroups = (): readonly CategoryVisualDefinition[] => CATEGORY_DEFINITIONS;

export const getCategoriesByGroup = (group: string | undefined): readonly string[] => {
  if (!group) return [];
  const definition = CATEGORY_REGISTRY.get(group);
  return definition?.categories ?? [];
};

