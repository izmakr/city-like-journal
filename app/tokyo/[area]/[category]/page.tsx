import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAreaCategoryCombos, getPostsByAreaAndCategory } from '@/lib/data';
import { PostCard } from '@/components/PostCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import {
  buildBreadcrumbStructuredData,
  buildAreaCategoryBreadcrumbItems,
  getPrimaryCategoryLabel,
} from '@/lib/postUtils';
import Script from 'next/script';

export const dynamic = 'error';

export async function generateStaticParams() {
  const combos = getAreaCategoryCombos();
  return combos.map(({ area, category }) => ({ area, category }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ area: string; category: string }> },
): Promise<Metadata> {
  const { area, category } = await params;
  const posts = getPostsByAreaAndCategory(area, category);
  if (posts.length === 0) {
    return {
      title: '東京のスポット',
    };
  }
  const areaName = posts[0].area ?? area;
  const categoryLabel = getPrimaryCategoryLabel(posts[0]);
  return {
    title: `${areaName}の${categoryLabel}一覧`,
    description: `${areaName}で楽しむ${categoryLabel}を特集。City Like Journal が厳選したスポットをまとめました。`,
  };
}

export default async function AreaCategoryPage(
  { params }: { params: Promise<{ area: string; category: string }> },
) {
  const { area, category } = await params;
  const posts = getPostsByAreaAndCategory(area, category);
  if (posts.length === 0) {
    notFound();
  }
  const areaName = posts[0].area ?? area;
  const categoryLabel = getPrimaryCategoryLabel(posts[0]);

  const breadcrumbItems = buildAreaCategoryBreadcrumbItems(areaName, area, categoryLabel);
  const structuredData = buildBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <Script
        id={`area-category-breadcrumb-${area}-${category}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <header className="mt-4 mb-12 space-y-3">
        <p className="text-sm uppercase tracking-widest text-[#9AA7B2]">{areaName} × {categoryLabel}</p>
        <h1 className="text-3xl font-semibold text-[#E6EAF2]">{areaName}で楽しむ{categoryLabel}</h1>
        <p className="text-[#C7D1DD] leading-relaxed">
          {areaName}
          の街で出会える{categoryLabel}
          をピックアップ。シーンに合わせて訪れたい一軒を City Like Journal が紹介します。
        </p>
      </header>

      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}

