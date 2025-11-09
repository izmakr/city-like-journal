import { Post, isPost } from "./types";
import { readdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import matter from "gray-matter";
import {
  normalizeKind,
  getSortableDateValue,
  generateStoreNameShort,
  resolvePrimaryCategorySlug,
  buildPostPermalink,
  CITY_SLUG,
  ensureSlugValue,
} from "./postUtils";
import { getAreaGroupName, AREA_GROUP_ORDER } from "./areas";

const POSTS_DIR = join(process.cwd(), "content/posts");

// Markdownファイルを読み込む
function parseMarkdownFile(filePath: string, slug: string): Post | null {
  try {
    const fileContents = readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContents);

    const getString = (key: string): string => {
      const value = data[key];
      if (typeof value === 'string') {
        return value.trim();
      }
      if (typeof value === 'number') {
        return String(value);
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return '';
    };

    const getStringArray = (key: string): string[] => {
      const value = data[key];
      if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter((item) => item.length > 0);
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? [trimmed] : [];
      }
      return [];
    };

    const getNumber = (key: string): number | undefined => {
      const value = data[key];
      if (value === undefined || value === null) return undefined;

      const source = Array.isArray(value) ? value[0] : value;
      const num = Number.parseFloat(String(source));
      return Number.isFinite(num) ? num : undefined;
    };

    const nearestStation = getString('nearestStation') || undefined;
    const area = getString('area');
    const areaGroup =
      getString('areaGroup') || getString('areaGroupName') || getString('areaCategory') || getAreaGroupName(area);
    const storeName = getString('storeName');
    const storeNameShortFromFrontmatter = getString('storeNameShort') || undefined;
    const rawSlug = getString('slug') || slug;
    const slugSegments = rawSlug.split('/').map((segment) => segment.trim()).filter((segment) => segment.length > 0);
    const areaSlug = slugSegments[0] || ensureSlugValue(area, CITY_SLUG);
    const storeSlugFromSlug =
      slugSegments.length > 1 ? slugSegments[slugSegments.length - 1] : slugSegments[0];
    const storeSlug = storeSlugFromSlug || ensureSlugValue(storeName, slugSegments.join('-'));
    const kinds = normalizeKind(getStringArray('kind'));
    const primaryCategorySlug = resolvePrimaryCategorySlug(kinds, kinds[0]);
    const permalink = buildPostPermalink(CITY_SLUG, areaSlug, primaryCategorySlug, storeSlug);

    const candidate = {
      id: getString('id') || slug,
      slug: rawSlug,
      title: getString('title'),
      storeName,
      storeNameShort: storeNameShortFromFrontmatter,
      citySlug: CITY_SLUG,
      areaSlug,
      categorySlug: primaryCategorySlug,
      storeSlug,
      permalink,
      date: getString('date'),
      area,
      areaGroup: areaGroup || area,
      kind: kinds,
      cover: getString('cover'),
      excerpt: getString('excerpt'),
      content: content.trim(),
      latitude: getNumber('latitude'),
      longitude: getNumber('longitude'),
      address: getString('address') || undefined,
      nearestStation,
    } satisfies Partial<Post> & { kind: string[] };

    if (!candidate.storeNameShort) {
      const generatedShort = generateStoreNameShort(candidate.storeName);
      if (generatedShort && generatedShort.length < candidate.storeName.length) {
        candidate.storeNameShort = generatedShort;
      }
    }

    if (!candidate.storeName || !candidate.storeName.trim()) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Missing required "storeName" in frontmatter', { filePath, candidate });
      }
      return null;
    }

    if (!isPost(candidate)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Invalid post data parsed from frontmatter', { filePath, candidate });
      }
      return null;
    }

    return candidate;
  } catch (error) {
    console.error(`Error reading markdown file ${filePath}:`, error);
    return null;
  }
}

function getAllPosts(): Post[] {
  const collect = (dir: string): Post[] => {
    const entries = readdirSync(dir, { withFileTypes: true });
    const results: Post[] = [];

    for (const entry of entries) {
      const filePath = join(dir, entry.name);

      if (entry.isDirectory()) {
        results.push(...collect(filePath));
        continue;
      }

      if (!entry.name.endsWith('.md')) {
        continue;
      }

      const slug = relative(POSTS_DIR, filePath).replace(/\.md$/, '').replace(/\\/g, '/');
      const post = parseMarkdownFile(filePath, slug);

      if (post) {
        results.push(post);
      }
    }

    return results;
  };

  return collect(POSTS_DIR).sort((a, b) => {
    const aTime = getSortableDateValue(a.date);
    const bTime = getSortableDateValue(b.date);
    if (aTime === bTime) return 0;
    return aTime < bTime ? 1 : -1;
  });
}

// 開発環境では毎回最新のファイルを読み込むため、関数としてエクスポート
// 本番環境（ビルド時）では、一度だけ実行される
const isDev = process.env.NODE_ENV === 'development';

let cachedPosts: Post[] | null = null;

export function getPosts(): Post[] {
  // 開発環境では常に最新のファイルを読み込む
  if (isDev) {
    return getAllPosts();
  }
  // 本番環境（ビルド時）ではキャッシュを使用
  if (!cachedPosts) {
    cachedPosts = getAllPosts();
  }
  return cachedPosts;
}

// 後方互換性のため、定数としてもエクスポート（開発環境では常に最新を取得）
export const POSTS: Post[] = getPosts();

export function getAreaGroups(): string[] {
  const posts = getPosts();
  const present = new Set(posts.map((p) => p.areaGroup).filter(Boolean));
  const orderList = [...AREA_GROUP_ORDER];
  const orderSet = new Set<string>(orderList);
  const ordered = orderList.filter((group) => present.has(group));
  const others = Array.from(present).filter((group) => !orderSet.has(group)).sort();
  return ["all", ...ordered, ...others];
}

export function getKinds(): string[] {
  const posts = getPosts();
  // すべてのkindを展開してユニークなリストを作成
  const allKinds = posts.flatMap((p) => p.kind);
  return ["all", ...Array.from(new Set(allKinds)).sort()];
}

// 後方互換性のため、定数としてもエクスポート
export const AREA_GROUPS = getAreaGroups();
export const KINDS = getKinds();

export const getAreaSlugs = (): string[] => {
  const posts = getPosts();
  return Array.from(new Set(posts.map((post) => post.areaSlug)));
};

export const getAreaCategoryCombos = (): { area: string; category: string }[] => {
  const posts = getPosts();
  const combos = new Set<string>();
  posts.forEach((post) => {
    combos.add(`${post.areaSlug}::${post.categorySlug}`);
  });
  return Array.from(combos).map((combo) => {
    const [area, category] = combo.split('::');
    return { area, category };
  });
};

export const getPostsByArea = (areaSlug: string): Post[] =>
  getPosts().filter((post) => post.areaSlug === areaSlug);

export const getPostsByCategory = (categorySlug: string): Post[] =>
  getPosts().filter((post) => post.categorySlug === categorySlug);

export const getPostsByAreaAndCategory = (areaSlug: string, categorySlug: string): Post[] =>
  getPosts().filter((post) => post.areaSlug === areaSlug && post.categorySlug === categorySlug);

export const getCategorySlugs = (): string[] => {
  const posts = getPosts();
  return Array.from(new Set(posts.map((post) => post.categorySlug)));
};

export const getAreaGroupSummaries = () => {
  const posts = getPosts();
  const groups = new Map<string, { label: string; areas: Map<string, { label: string; count: number }> }>();

  posts.forEach((post) => {
    const groupLabel = getAreaGroupName(post.area);
    const areaLabel = post.area ?? post.areaSlug;
    if (!groups.has(groupLabel)) {
      groups.set(groupLabel, { label: groupLabel, areas: new Map() });
    }
    const groupEntry = groups.get(groupLabel)!;
    const areaEntry = groupEntry.areas.get(post.areaSlug);
    if (areaEntry) {
      areaEntry.count += 1;
    } else {
      groupEntry.areas.set(post.areaSlug, { label: areaLabel, count: 1 });
    }
  });

  const orderedGroups = AREA_GROUP_ORDER.filter((group) => groups.has(group)).map((group) => groups.get(group)!);
  const others = Array.from(groups.entries())
    .filter(([label]) => !AREA_GROUP_ORDER.includes(label as typeof AREA_GROUP_ORDER[number]))
    .map(([, value]) => value)
    .sort((a, b) => a.label.localeCompare(b.label, 'ja'));

  return [...orderedGroups, ...others].map((group) => ({
    label: group.label,
    areas: Array.from(group.areas.entries())
      .map(([slug, value]) => ({ slug, label: value.label, count: value.count }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja')),
  }));
};


