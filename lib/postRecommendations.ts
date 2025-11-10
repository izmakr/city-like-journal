
import type { Post } from "./types";

type RecommendationOptions = {
  maxResults?: number;
  includeArea?: boolean;
  includeCategory?: boolean;
};

const DEFAULT_OPTIONS: Required<RecommendationOptions> = {
  maxResults: 5,
  includeArea: true,
  includeCategory: true,
};

const computeScore = (target: Post, candidate: Post, options: Required<RecommendationOptions>) => {
  let score = 0;

  if (options.includeArea && target.areaSlug === candidate.areaSlug) {
    score += 4;
  }

  if (options.includeCategory && target.categorySlug === candidate.categorySlug) {
    score += 3;
  }

  const kindIntersection = target.kind.filter((kind) => candidate.kind.includes(kind)).length;
  score += kindIntersection;

  return score;
};

export const getRelatedPosts = (target: Post, allPosts: readonly Post[], options?: RecommendationOptions): Post[] => {
  const appliedOptions = { ...DEFAULT_OPTIONS, ...options };

  return allPosts
    .filter((post) => post.id !== target.id)
    .map((post) => ({
      post,
      score: computeScore(target, post, appliedOptions),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (a.score === b.score) {
        return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
      }
      return b.score - a.score;
    })
    .slice(0, appliedOptions.maxResults)
    .map((entry) => entry.post);
};

