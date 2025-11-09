import type { Metadata } from 'next';
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
        <HomeContent posts={posts} areaGroups={areaGroups} />
      </main>
      <footer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} City Like Journal
        </p>
      </footer>
    </>
    
  );
}
