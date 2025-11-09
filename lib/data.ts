import { Post, isPost } from "./types";
import { readdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import matter from "gray-matter";
import { normalizeKind } from "./postUtils";
import { getAreaGroupName, AREA_GROUP_ORDER } from "./areas";

const POSTS_DIR = join(process.cwd(), "content/posts");

// Markdownファイルを読み込む
function parseMarkdownFile(filePath: string, slug: string): Post | null {
  try {
    const fileContents = readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContents);

    const getString = (key: string): string => {
      const value = data[key];
      return typeof value === 'string' ? value.trim() : '';
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

    const candidate = {
      id: getString('id') || slug,
      slug: getString('slug') || slug,
      title: getString('title'),
      date: getString('date'),
      area,
      areaGroup: areaGroup || area,
      kind: normalizeKind(getStringArray('kind')),
      cover: getString('cover'),
      excerpt: getString('excerpt'),
      content: content.trim(),
      latitude: getNumber('latitude'),
      longitude: getNumber('longitude'),
      address: getString('address') || undefined,
      nearestStation,
    } satisfies Partial<Post> & { kind: string[] };

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

  return collect(POSTS_DIR).sort((a, b) => (a.date < b.date ? 1 : -1));
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


