import type { Metadata } from 'next';
import type { Post } from '@/lib/types';
import { getPosts } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { PostContent } from '@/components/PostContent';
import { Chip } from '@/components/Chip';
import { PostRouteMap } from '@/components/PostRouteMap';
import { buildPostMetaDescription, formatPostDate } from '@/lib/postUtils';

export const dynamic = 'error'; // 完全静的

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((p) => ({ slug: p.slug.split('/') }));
}

const createPostTitle = (post: Post | undefined): string => {
  if (!post) {
    return '東京 スポット 特集';
  }

  const tokens: string[] = [];
  tokens.push('東京');

  const area = post.area?.trim();
  if (area && area !== '東京') {
    tokens.push(area);
  }

  const category = post.kind[0]?.trim();
  tokens.push(category && category.length > 0 ? category : 'スポット');

  const storeName = post.storeNameShort?.trim()
    || post.storeName?.trim()
    || post.title.trim();
  tokens.push(storeName);

  return tokens.join(' ');
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;
  const posts = getPosts();
  const post = posts.find((p) => p.slug === slugPath);

  return {
    title: createPostTitle(post),
    description: post ? buildPostMetaDescription(post) : undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;
  const posts = getPosts();
  const post: Post | undefined = posts.find((p) => p.slug === slugPath);
  if (!post) return null;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#9AA7B2] hover:text-[#E6EAF2]">
          <span>←</span>
          <span>一覧に戻る</span>
        </Link>
      </div>
      <Image
        src={post.cover}
        alt={post.title}
        width={1280}
        height={800}
        className="w-full h-auto rounded-2xl border"
        style={{ borderColor: '#1F2633' }}
        unoptimized
        sizes="(min-width: 1024px) 768px, 100vw"
      />
      <h1 className="mt-6 text-2xl md:text-3xl font-bold leading-tight">{post.title}</h1>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <time className="text-xs text-gray-400">{formatPostDate(post.date)}</time>
        <Chip variant="area">{post.area}</Chip>
        {post.kind.map((k, i) => (
          <Chip key={i} variant="kind">{k}</Chip>
        ))}
      </div>
      <div className="mt-6">
        <PostContent content={post.content} />
      </div>
      {post.latitude !== undefined && post.longitude !== undefined && (
        <div className="mt-12">
          <PostRouteMap post={post} />
        </div>
      )}
    </article>
  );
}


