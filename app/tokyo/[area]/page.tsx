import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAreaSlugs, getPostsByArea } from '@/lib/data';
import { PostCard } from '@/components/PostCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import {
  CITY_SLUG,
  buildBreadcrumbStructuredData,
  buildAreaBreadcrumbItems,
  getPrimaryCategoryLabel,
} from '@/lib/postUtils';
import Script from 'next/script';

export const dynamic = 'error';

export async function generateStaticParams() {
  const slugs = getAreaSlugs();
  return slugs.map((slug) => ({ area: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  const posts = getPostsByArea(area);
  if (posts.length === 0) {
    return {
      title: '東京のスポット｜City Like Journal',
    };
  }
  const areaName = posts[0].area ?? area;
  return {
    title: `${areaName}のスポット一覧｜City Like Journal`,
    description: `${areaName}で訪れたいカフェ・バー・レストランを厳選。City Like Journal が大人の街歩きをガイドします。`,
  };
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const posts = getPostsByArea(area);
  if (posts.length === 0) {
    notFound();
  }
  const areaName = posts[0].area ?? area;

  const categories = Array.from(
    posts.reduce((map, post) => {
      if (map.has(post.categorySlug)) return map;
      map.set(post.categorySlug, {
        label: getPrimaryCategoryLabel(post),
        slug: post.categorySlug,
      });
      return map;
    }, new Map<string, { label: string; slug: string }>()),
    ([, value]) => value,
  );

  const breadcrumbItems = buildAreaBreadcrumbItems(areaName);

  const structuredData = buildBreadcrumbStructuredData(breadcrumbItems);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <Script
        id={`area-breadcrumb-${area}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <header className="mt-4 mb-12 space-y-3">
        <h1 className="text-3xl font-semibold text-[#E6EAF2]">{areaName}で出会うおすすめスポット</h1>
        <p className="text-[#C7D1DD] leading-relaxed">
          {areaName}
          の街で、City Like Journal が選ぶカフェ・バー・レストラン。カテゴリ別におすすめの一軒を探せます。
        </p>
      </header>

      {categories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-[#E6EAF2]">カテゴリから探す</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${CITY_SLUG}/${area}/${category.slug}/`}
                className="rounded-full border px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-[#3B82F6]"
                style={{ borderColor: '#1F2633', background: '#131823', color: '#E6EAF2' }}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-[#E6EAF2]">新着スポット</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

