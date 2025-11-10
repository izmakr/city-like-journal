"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { PostRouteMapProps } from "@/components/PostRouteMap";

const RouteMapSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-5 w-36 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-60 rounded bg-slate-800 animate-pulse" />
      </div>
      <div className="h-3 w-48 rounded bg-slate-800 animate-pulse" />
    </div>
    <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
      <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
        マップを読み込み中…
      </div>
    </div>
  </div>
);

const DynamicPostRouteMap = dynamic<PostRouteMapProps>(
  () => import("@/components/PostRouteMap").then((mod) => mod.PostRouteMap),
  {
    ssr: false,
    loading: RouteMapSkeleton,
  },
);

export const LazyPostRouteMap = (props: PostRouteMapProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  return (
    <div ref={containerRef}>
      {shouldRender ? <DynamicPostRouteMap {...props} /> : <RouteMapSkeleton />}
    </div>
  );
};


