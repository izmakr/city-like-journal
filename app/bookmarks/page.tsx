import { Metadata } from 'next';

import { BookmarksContent } from './BookmarksContent';
import { POSTS } from '@/lib/data';

export const metadata: Metadata = {
  title: 'お気に入り',
  description: 'お気に入りに登録した記事の一覧',
};

export default function BookmarksPage() {
  return <BookmarksContent posts={POSTS} />;
}

