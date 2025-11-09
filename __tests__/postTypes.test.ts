import { isPost, type Post } from '@/lib/types';

describe('isPost', () => {
  const base: Post = {
    id: 'id-1',
    slug: 'slug-1',
    title: 'Title',
    date: '2024-01-01',
    area: '恵比寿',
    areaGroup: '恵比寿・代官山・中目黒',
    kind: ['カフェ'],
    cover: '/cover.jpg',
    excerpt: 'excerpt',
    content: 'content',
  };

  it('returns true for valid post', () => {
    expect(isPost(base)).toBe(true);
  });

  it('rejects when required string field is missing', () => {
    const invalid = { ...base, title: undefined } as unknown;
    expect(isPost(invalid)).toBe(false);
  });

  it('rejects when kind contains non-string values', () => {
    const invalid = { ...base, kind: ['カフェ', 123] } as unknown;
    expect(isPost(invalid)).toBe(false);
  });

  it('rejects when optional numeric field has invalid type', () => {
    const invalid = { ...base, latitude: 'not-a-number' } as unknown;
    expect(isPost(invalid)).toBe(false);
  });
});
