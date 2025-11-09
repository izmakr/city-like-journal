import type { Post } from "./types";

export const normalizeKind = (kind: string | string[] | undefined): string[] => {
  if (!kind) return [];
  if (Array.isArray(kind)) {
    return kind.map((item) => item.trim()).filter((item) => item.length > 0);
  }
  const trimmed = kind.trim();
  return trimmed ? [trimmed] : [];
};

export const buildSearchText = (post: Post): string =>
  [post.title, post.excerpt, post.content, post.areaGroup, post.area, ...post.kind]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

