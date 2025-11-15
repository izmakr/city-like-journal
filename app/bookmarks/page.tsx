import { Metadata } from 'next';

import { BookmarksContent } from './BookmarksContent';
import { Footer } from '@/components/Footer';
import { POSTS } from '@/lib/data';

export const metadata: Metadata = {
  title: 'お気に入り',
  description: 'お気に入りに登録した記事の一覧',
};

export default function BookmarksPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-10rem)]">
        <BookmarksContent posts={POSTS} />
      </main>
      <Footer />
    </>
  );
}

