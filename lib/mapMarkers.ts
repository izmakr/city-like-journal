"use client";

import type { Post } from '@/lib/types';
import type { MapIconType } from '@/lib/mapIconTypes';
import { CATEGORY_DEFAULT_VISUAL, resolveCategoryVisualForKinds } from '@/lib/categories';

export type IconType = MapIconType;

const SVG_NS = 'http://www.w3.org/2000/svg';

export const getMarkerVisual = (post: Post, preferredKind?: string) => {
  const kinds = post.kind ?? [];
  const visual = resolveCategoryVisualForKinds(kinds, preferredKind) ?? CATEGORY_DEFAULT_VISUAL;
  return { icon: visual.icon, color: visual.color };
};

const ICON_CONTENT: Record<IconType, string> = {
  bar: `
    <path d="M4 4h16l-8 8-8-8z" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="12" y1="12" x2="12" y2="19" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="8" y1="19" x2="16" y2="19" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="15" y1="4" x2="19" y2="0" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  cafe: `
    <path d="M4 9h11a3 3 0 0 1 0 6H7a3 3 0 0 1-3-3z" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 9v3a6 6 0 0 0 6 6 6 6 0 0 0 6-6V9" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 4c0-1 .8-1.5 1.2-2" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 4c0-1 .8-1.5 1.2-2" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  dining: `
    <path d="M6 3v5a1.5 1.5 0 0 0 3 0V3" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="7.5" y1="8" x2="7.5" y2="21" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 3c-1 2-1 6 0 9 .5 2-1 3-1 5 0 1.5 1 2 2 2s2-.5 2-2c0-2-1.5-3-1-5 1-3 1-7 0-9z" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  bakery: `
    <path d="M6 10c0-3.3 2.7-6 6-6s6 2.7 6 6v5.5a3.5 3.5 0 0 1-3.5 3.5h-5A3.5 3.5 0 0 1 6 15.5V10z" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 11.5c.8 0 1.5-.7 1.5-1.5" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M12 11.5c.8 0 1.5-.7 1.5-1.5" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M15 11.5c.8 0 1.5-.7 1.5-1.5" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/>
  `,
  ramen: `
    <path d="M3 8h18" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 10h12c0 4.5-3 8-6 8s-6-3.5-6-8z" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 4l12 3" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 4l8 2" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `,
  sushi: `
    <rect x="4" y="8" width="16" height="8" rx="3" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linejoin="round"/>
    <path d="M4 12c2.5-2 13.5-2 16 0" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M8 6h8" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round"/>
  `,
  sweets: `
    <path d="M6 12h12l-1.5 6h-9z" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 10a4 4 0 0 1 8 0" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="6" r="1.5" fill="#ffffff"/>
  `,
  default: `
    <circle cx="12" cy="12" r="6" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  `,
};

function ICONS_CONTENT(type: IconType): string {
  return ICON_CONTENT[type] ?? ICON_CONTENT.default;
}

export function getMarkerSymbolDataURL(iconType: IconType, color: string): string {
  const iconContent = ICONS_CONTENT(iconType);
  const markerSvg = `
    <svg xmlns="${SVG_NS}" width="64" height="80" viewBox="0 0 64 80">
      <path d="M32 4C20 4 10 14.5 10 26.5c0 17.2 17.6 34.4 21.7 38.3a1.5 1.5 0 0 0 2.6 0C38.4 60.9 56 43.7 56 26.5 56 14.5 44 4 32 4z" fill="${color}" stroke="rgba(8,12,20,0.35)" stroke-width="1.6"/>
      <g transform="translate(32 28)">
        <g transform="translate(-12 -12)">
          ${iconContent}
        </g>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`;
}

export function getStationSymbolDataURL(): string {
  const markerSvg = `
    <svg xmlns="${SVG_NS}" width="64" height="80" viewBox="0 0 64 80">
      <defs>
        <linearGradient id="stationGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4f6f9"/>
          <stop offset="100%" stop-color="#c8ced8"/>
        </linearGradient>
      </defs>
      <path d="M32 4C20 4 10 14.5 10 26.5c0 17.2 17.6 34.4 21.7 38.3a1.5 1.5 0 0 0 2.6 0C38.4 60.9 56 43.7 56 26.5 56 14.5 44 4 32 4z" fill="url(#stationGradient)" stroke="rgba(24, 32, 45, 0.38)" stroke-width="1.6"/>
      <g transform="translate(32 26)">
        <rect x="-8" y="-6" width="16" height="12" rx="3" fill="none" stroke="#4b5563" stroke-width="2.1"/>
        <path d="M-5 6l-3 5" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 6l3 5" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="-3" cy="0" r="1.4" fill="#4b5563"/>
        <circle cx="3" cy="0" r="1.4" fill="#4b5563"/>
        <rect x="-4" y="-13" width="8" height="4" rx="1.2" fill="#4b5563"/>
        <path d="M-3.5 -9h7" stroke="#4b5563" stroke-width="1.6" stroke-linecap="round"/>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`;
}


