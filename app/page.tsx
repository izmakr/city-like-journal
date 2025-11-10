import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getPosts, getAreaGroups } from '@/lib/data';
import { HeroSection } from '@/components/HeroSection';
import { HomeContent } from '@/components/HomeContent';

export const metadata: Metadata = {
  title: {
    absolute: '東京のカフェ・バー案内｜City Like Journal',
  },
  description: '東京のカフェやバーを中心に、大人の街歩きに似合うスポットを厳選紹介。エリアとカテゴリから次の一軒を見つける City Like Journal。',
};

export default function Page() {
  // 開発環境では毎回最新の記事を取得
  const posts = getPosts();
  const areaGroups = getAreaGroups();

  return (
    <>
      <HeroSection />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <Suspense
          fallback={
            <div className="grid gap-8">
              <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
              <div className="space-y-4">
                <div className="h-6 w-1/2 rounded bg-gray-100 animate-pulse" />
                <div className="h-6 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-6 w-3/4 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          }
        >
          <HomeContent posts={posts} areaGroups={areaGroups} />
        </Suspense>
      </main>
      <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} City Like Journal
        </p>
      </footer>
    </>
    
  );
}
