import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { getPosts } from '@/lib/data';
import { Footer } from '@/components/Footer';
import { buildBreadcrumbStructuredData } from '@/lib/postUtils';
import { CATEGORY_DEFINITIONS } from '@/lib/categories';

type CategoryGroup = {
  label: string;
  slug: string;
  areas: string[];
  postsCount: number;
};

const collectCategories = (): CategoryGroup[] => {
  const posts = getPosts();
  const counts = new Map<string, { areas: Set<string>; count: number }>();

  posts.forEach((post) => {
    const entry = counts.get(post.categorySlug);
    if (entry) {
      entry.count += 1;
      if (post.area) entry.areas.add(post.area);
    } else {
      counts.set(post.categorySlug, {
        count: 1,
        areas: new Set(post.area ? [post.area] : []),
      });
    }
  });

  const categories: CategoryGroup[] = [];

  for (const { slug, group } of CATEGORY_DEFINITIONS) {
    const entry = counts.get(slug);
    if (!entry) continue;
    categories.push({
      label: group,
      slug,
      postsCount: entry.count,
      areas: Array.from(entry.areas).sort((a, b) => a.localeCompare(b, 'ja')),
    });
  }

  return categories;
};

export const metadata: Metadata = {
  title: 'カテゴリ一覧｜City Like Journal',
  description: '東京のカフェ・バー・ダイニングなどカテゴリ別にスポットを一覧表示。City Like Journal が選ぶ大人の行き先ガイド。',
};

export default function CategoryIndexPage() {
  const categories = collectCategories();
  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: 'カテゴリ一覧' },
  ];
  const structuredData = buildBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <Script
        id="category-breadcrumbs"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="mb-12 space-y-3">
        <p className="text-sm uppercase tracking-widest text-[#9AA7B2]">Categories</p>
        <h1 className="text-3xl font-semibold text-[#E6EAF2]">カテゴリから探す</h1>
        <p className="text-[#C7D1DD] leading-relaxed">
          コーヒーが香るカフェから、夜を楽しむバーまで。City Like Journal が取材したカテゴリ別にスポットを探せます。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}/`}
            className="rounded-2xl border px-5 py-4 transition hover:-translate-y-0.5 hover:border-[#3B82F6]"
            style={{ borderColor: '#1F2633', background: '#131823' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#E6EAF2]">{category.label}</h2>
                <p className="text-xs text-[#9AA7B2] mt-1">記事数: {category.postsCount}</p>
                {category.areas.length > 0 && (
                  <p className="text-xs text-[#4A5568] mt-2">
                    主なエリア: {category.areas.slice(0, 4).join(' / ')}
                    {category.areas.length > 4 ? ' 他' : ''}
                  </p>
                )}
              </div>
              <span className="text-sm text-[#3B82F6]">見る →</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
    <Footer />
    </>
  );
}

