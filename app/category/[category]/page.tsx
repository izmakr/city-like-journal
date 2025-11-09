import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getCategorySlugs, getPostsByCategory } from '@/lib/data';
import { PostCard } from '@/components/PostCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildBreadcrumbStructuredData, buildCategoryBreadcrumbItems, getPrimaryCategoryLabel } from '@/lib/postUtils';

export const dynamic = 'error';

export async function generateStaticParams() {
  const slugs = getCategorySlugs();
  return slugs.map((slug) => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  if (posts.length === 0) {
    return {
      title: 'カテゴリ一覧｜City Like Journal',
    };
  }
  const categoryLabel = getPrimaryCategoryLabel(posts[0]);
  return {
    title: `${categoryLabel}特集｜City Like Journal`,
    description: `東京で楽しむ${categoryLabel}を厳選。シーンに合わせて訪れたいスポットをまとめました。`,
  };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  if (posts.length === 0) {
    notFound();
  }
  const categoryLabel = getPrimaryCategoryLabel(posts[0]);

  const areas = Array.from(new Set(posts.map((post) => post.area?.trim()).filter(Boolean) as string[])).sort(
    (a, b) => a.localeCompare(b, 'ja'),
  );

  const breadcrumbItems = buildCategoryBreadcrumbItems(categoryLabel);
  const structuredData = buildBreadcrumbStructuredData(breadcrumbItems);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <Script
        id={`category-detail-${category}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <header className="mt-4 mb-12 space-y-3">
        <p className="text-sm uppercase tracking-widest text-[#9AA7B2]">Category</p>
        <h1 className="text-3xl font-semibold text-[#E6EAF2]">{categoryLabel}で訪れたい場所</h1>
        <p className="text-[#C7D1DD] leading-relaxed">
          東京で楽しむ{categoryLabel}
          をまとめてピックアップ。大人の時間に似合うスポットを City Like Journal が紹介します。
        </p>
      </header>

      {areas.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#E6EAF2]">主な掲載エリア</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {areas.map((area) => (
              <span
                key={area}
                className="rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: '#1F2633', background: '#131823', color: '#E6EAF2' }}
              >
                {area}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

