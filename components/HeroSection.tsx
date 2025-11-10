'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const HERO_IMAGES = [
  {
    src: '/images/common/hero1.webp',
    alt: 'レストランの内観',
  },
  {
    src: '/images/common/hero2.webp',
    alt: '最上級のスイーツカフェ',
  },
  {
    src: '/images/common/hero3.webp',
    alt: '照明に照らされた店内の様子',
  },
  {
    src: '/images/common/hero4.webp',
    alt: '綺麗なバーの外観',
  },
] as const;

const TRANSITION_DURATION = 5000; // 5秒ごとに切り替え

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, TRANSITION_DURATION);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="relative overflow-hidden border p-8 md:p-12 lg:p-16 mb-8 min-h-[540px] md:min-h-[400px] lg:min-h-[500px] flex items-center"
      style={{ borderColor: '#1F2633' }}
    >
      {/* 背景画像レイヤー */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map(({ src, alt }, index) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              opacity: index === currentIndex ? 1 : 0,
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="(min-width: 1280px) 1200px, (min-width: 1024px) 90vw, (min-width: 768px) 95vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#13182333] to-[#0b0e13e6]" />
          </div>
        ))}
      </div>

      {/* コンテンツ */}
      <div className="relative max-w-2xl w-full">
        <span className="text-xs px-2 py-1 rounded-md" style={{ color: '#9AA7B2' }}>都市の&ldquo;好き&rdquo;を、気ままにアーカイブする</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">City Like Journal</h1>
        <p className="mt-3 text-sm text-gray-300">行きたい場所が、気分で見つかる&ldquo;東京メディア&rdquo;</p>
      </div>

    </section>
  );
}

