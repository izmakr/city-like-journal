import type { Post } from "./types";

export const normalizeKind = (kind: string | string[] | undefined): string[] => {
  if (!kind) return [];
  if (Array.isArray(kind)) {
    return kind.map((item) => item.trim()).filter((item) => item.length > 0);
  }
  const trimmed = kind.trim();
  return trimmed ? [trimmed] : [];
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