'use client';

import { useEffect, useState } from 'react';

const HERO_IMAGES = [
  'https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2089',
  'https://images.unsplash.com/photo-1759146136291-49cabecf8ad0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
  'https://images.unsplash.com/photo-1615887584283-91f1be7fdc34?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987',
  'https://images.unsplash.com/photo-1481833761820-0509d3217039?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070',
];

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
    <section className="relative overflow-hidden border p-8 md:p-12 lg:p-16 mb-8 min-h-[540px] md:min-h-[400px] lg:min-h-[500px] flex items-center" style={{ borderColor: '#1F2633' }}>
      {/* 背景画像レイヤー */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(19,24,35,.2), rgba(11,14,19,.9)), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: index === currentIndex ? 1 : 0,
            }}
          />
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

