export type Post = {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO
  area: string; // エリア
  areaGroup: string; // 大カテゴリ
  kind: string[]; // カテゴリ（配列）
  cover: string;
  excerpt: string;
  content: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  nearestStation?: string;
};

export const isPost = (value: unknown): value is Post => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  const requiredStrings: (keyof Post)[] = ['id', 'slug', 'title', 'date', 'area', 'areaGroup', 'cover', 'excerpt', 'content'];

  if (!requiredStrings.every((key) => typeof candidate[key] === 'string')) {
    return false;
  }

  const kind = candidate.kind;
  if (!Array.isArray(kind) || kind.some((item) => typeof item !== 'string')) {
    return false;
  }

  const numericKeys: (keyof Post)[] = ['latitude', 'longitude'];
  if (!numericKeys.every((key) => candidate[key] === undefined || typeof candidate[key] === 'number')) {
    return false;
  }

  const optionalStringKeys: (keyof Post)[] = ['address', 'nearestStation'];
  if (!optionalStringKeys.every((key) => candidate[key] === undefined || typeof candidate[key] === 'string')) {
    return false;
  }

  return true;
};
