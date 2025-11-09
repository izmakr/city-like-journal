import { getPosts, getAreaGroups } from '@/lib/data';
import { HeroSection } from '@/components/HeroSection';
import { HomeContent } from '@/components/HomeContent';

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
