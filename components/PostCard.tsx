import Image from 'next/image';
import Link from 'next/link';

import { Chip } from './Chip';
import { CalendarIcon } from './icons';
import type { Post } from '@/lib/types';
import { formatPostDate } from '@/lib/postUtils';

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={post.permalink} className="block">
      <article className="rounded-2xl overflow-hidden border hover:-translate-y-0.5 transition transform" style={{ borderColor: '#1F2633', background: '#131823' }}>
      <div className="aspect-[16/10] relative overflow-hidden">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CalendarIcon width={14} height={14} />
          <time>{formatPostDate(post.date)}</time>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Chip variant="area">{post.area}</Chip>
          {post.kind.map((k, i) => (
            <Chip key={i} variant="kind">{k}</Chip>
          ))}
        </div>
        <h3 className="mt-2 text-base font-semibold leading-tight">{post.title}</h3>
        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{post.excerpt}</p>
      </div>
      </article>
    </Link>
  );
}


