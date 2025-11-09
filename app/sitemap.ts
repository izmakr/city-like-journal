import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/data';
import { SITE_ORIGIN } from '@/lib/postUtils';

const buildAbsoluteUrl = (path: string): string => new URL(path, SITE_ORIGIN).toString();

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const today = new Date();

  return [
    {
      url: SITE_ORIGIN,
      lastModified: today,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: buildAbsoluteUrl(post.permalink),
      lastModified: post.date ? new Date(post.date) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
  ];
}

