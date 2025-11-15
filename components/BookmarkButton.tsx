'use client';

import { useBookmark } from '@/contexts/BookmarkContext';
import { BookmarkIcon, BookmarkFilledIcon } from './icons';

type BookmarkButtonProps = {
  postId: string;
  postTitle: string;
};

export function BookmarkButton({ postId, postTitle }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmark();
  const bookmarked = isBookmarked(postId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Linkの遷移を防ぐ
    e.stopPropagation();
    toggleBookmark(postId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={bookmarked ? `${postTitle}をお気に入りから削除` : `${postTitle}をお気に入りに追加`}
      className="h-8 w-8 inline-flex items-center justify-center rounded-lg border flex-shrink-0 transition-colors hover:bg-[#1F2633]"
      style={{ 
        borderColor: '#1F2633',
        color: bookmarked ? '#F59E0B' : '#9AA7B2',
      }}
    >
      {bookmarked ? (
        <BookmarkFilledIcon width={16} height={16} />
      ) : (
        <BookmarkIcon width={16} height={16} />
      )}
    </button>
  );
}

