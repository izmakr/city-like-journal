import type { Metadata } from 'next';
import Link from 'next/link';
import { getAreaGroupSummaries, getPosts } from '@/lib/data';
import { PostCard } from '@/components/PostCard';
import { Footer } from '@/components/Footer';
import { CITY_SLUG } from '@/lib/postUtils';

export const dynamic = 'error';

export const metadata: Metadata = {
  title: '東京のスポット一覧｜City Like Journal',
  description: '東京のエリア別・カテゴリ別に厳選スポットを紹介。渋谷、表参道、銀座など大人の街歩きに似合う場所をまとめています。',
};

const getLatestPosts = (limit = 6) => getPosts().slice(0, limit);

export default function TokyoIndexPage() {
  const areaGroups = getAreaGroupSummaries();
  const latestPosts = getLatestPosts();

  return (
    <>
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12 space-y-4">
        <p className="text-sm uppercase tracking-widest text-[#9AA7B2]">Tokyo Guide</p>
        <h1 className="text-3xl font-semibold text-[#E6EAF2]">東京で出会う、とっておきの場所たち</h1>
        <p className="text-[#C7D1DD] leading-relaxed">
          東京をエリアとカテゴリでナビゲート。大人が時間を預けたくなるカフェ、バー、ダイニングを厳選して紹介します。
        </p>
      </header>

      <section className="mb-16 space-y-6">
        <h2 className="text-2xl font-semibold text-[#E6EAF2]">エリアから探す</h2>
        <div className="space-y-6">
          {areaGroups.map((group) => (
            <div key={group.label} className="space-y-3">
              <h3 className="text-lg font-semibold text-[#E6EAF2]">{group.label}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.areas.map((area) => (
                  <Link
                    key={area.slug}
                    href={`/${CITY_SLUG}/${area.slug}/`}
                    className="group rounded-2xl border px-5 py-4 transition hover:-translate-y-0.5 hover:border-[#3B82F6]"
                    style={{ borderColor: '#1F2633', background: '#131823' }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-medium text-[#E6EAF2] group-hover:text-[#F5F9FF]">{area.label}</p>
                        <p className="text-xs text-[#9AA7B2] mt-1">記事数: {area.count}</p>
                      </div>
                      <span className="text-sm text-[#3B82F6] group-hover:text-[#60A5FA]">見る →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-semibold text-[#E6EAF2]">最新スポット</h2>
          <span className="text-xs text-[#9AA7B2]">更新順に6件を表示</span>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}

