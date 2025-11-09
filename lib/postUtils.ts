import { resolveCategoryVisualForKinds } from "./categories";
import type { Post } from "./types";

export const normalizeKind = (kind: string | string[] | undefined): string[] => {
  if (!kind) return [];
  if (Array.isArray(kind)) {
    return kind.map((item) => item.trim()).filter((item) => item.length > 0);
  }
  const trimmed = kind.trim();
  return trimmed ? [trimmed] : [];
};

export const CITY_SLUG = 'tokyo';

const toAsciiSlug = (value: string | undefined): string => {
  if (!value) return '';
  const ascii = value
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return ascii;
};

export const ensureSlugValue = (value: string | undefined, fallback: string): string => {
  const primary = toAsciiSlug(value);
  if (primary) return primary;
  const secondary = toAsciiSlug(fallback);
  if (secondary) return secondary;
  return 'spot';
};

export const resolvePrimaryCategorySlug = (kinds: readonly string[], preferredKind?: string): string => {
  const definition = resolveCategoryVisualForKinds(kinds, preferredKind);
  if (definition?.slug) {
    return definition.slug;
  }
  const fallbackKind = preferredKind ?? kinds[0];
  return ensureSlugValue(fallbackKind, 'spot');
};

export const buildPostPermalink = (citySlug: string, areaSlug: string, categorySlug: string, storeSlug: string, trailingSlash: boolean = true): string => {
  const base = `/${citySlug}/${areaSlug}/${categorySlug}/${storeSlug}`;
  return trailingSlash ? `${base}/` : base;
};

const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const parsePostDate = (value: string | undefined): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  if (ISO_DATE_ONLY_PATTERN.test(trimmed)) {
    const tokyo = new Date(`${trimmed}T00:00:00+09:00`);
    if (!Number.isNaN(tokyo.getTime())) {
      return tokyo;
    }

    const utc = new Date(`${trimmed}T00:00:00Z`);
    if (!Number.isNaN(utc.getTime())) {
      return utc;
    }
  }

  return null;
};

export const formatPostDate = (value: string | undefined, locale: string = 'ja-JP'): string => {
  const date = parsePostDate(value);
  if (date) {
    return date.toLocaleDateString(locale);
  }
  return value?.trim() ?? '';
};

export const buildSearchText = (post: Post): string =>
  [post.title, post.excerpt, post.content, post.areaGroup, post.area, ...post.kind]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const getSortableDateValue = (value: string | undefined): number => {
  const date = parsePostDate(value);
  return date ? date.getTime() : Number.NEGATIVE_INFINITY;
};

const META_DESCRIPTION_MIN_LENGTH = 70;
const META_DESCRIPTION_MAX_LENGTH = 110;

const normalizeMetaText = (value: string | undefined): string => {
  if (!value) return '';
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*([、。,.!?])/g, '$1')
    .trim();
};

const truncateWithEllipsis = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  const truncated = value.slice(0, maxLength).replace(/[、。,.!?・／/|\s]+$/, '');
  return `${truncated}…`;
};

export const composeMetaDescription = (primary: string | undefined, fallback: string): string => {
  const normalizedPrimary = normalizeMetaText(primary);
  const normalizedFallback = normalizeMetaText(fallback);

  let candidate = normalizedPrimary;

  if (!candidate) {
    candidate = normalizedFallback;
  } else if (candidate.length < META_DESCRIPTION_MIN_LENGTH) {
    candidate = normalizeMetaText(`${candidate} ${normalizedFallback}`);
  }

  if (!candidate) {
    return '';
  }

  return truncateWithEllipsis(candidate, META_DESCRIPTION_MAX_LENGTH);
};

export const buildPostMetaDescription = (post: Post): string => {
  const primaryKind = post.kind[0]?.trim() || 'スポット';
  const fallback = `東京${post.area}の${primaryKind}「${post.storeName}」をCity Like Journalが紹介。アクセスや雰囲気、こだわりポイントまで丁寧にレポートします。`;
  return composeMetaDescription(post.excerpt, fallback);
};

// storeNameShort の自動生成用設定:
// - STORE_NAME_MAX_LENGTH: EOS で 30 文字を超えるタイトルは省略されることが多いため、ここを上限にする
// - STORE_NAME_TOKEN_SPLIT: 店名に含まれがちな区切り記号。トークン単位で組み合わせ直して短縮を試みる
const STORE_NAME_MAX_LENGTH = 30;
const STORE_NAME_TOKEN_SPLIT = /[ 　・／/|-]+/;

// storeNameShort が未入力の場合に内容・区切り記号を尊重しつつ 30 文字以内の短縮名を生成する。
// 1. 30 文字以内ならそのまま返す
// 2. 上限を超える場合はトークン単位で組み直し、それでも収まらなければ末尾を切り詰める
export const generateStoreNameShort = (storeName: string, maxLength: number = STORE_NAME_MAX_LENGTH): string | undefined => {
  const original = storeName?.trim();
  if (!original) return undefined;
  if (original.length <= maxLength) {
    return original;
  }

  const tokens = original.split(STORE_NAME_TOKEN_SPLIT).filter((token) => token.length > 0);
  if (tokens.length > 1) {
    let result = tokens[0];
    const separator = original.includes('　') ? '　' : original.includes('・') ? '・' : original.includes('／') ? '／' : original.includes('/') ? '/' : ' ';
    for (let i = 1; i < tokens.length; i += 1) {
      const candidate = `${result}${separator}${tokens[i]}`;
      if (candidate.length > maxLength) {
        break;
      }
      result = candidate;
    }
    if (result.length <= maxLength) {
      return result;
    }
  }

  return original.slice(0, maxLength);
};