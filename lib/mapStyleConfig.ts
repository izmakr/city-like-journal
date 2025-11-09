import type { ExpressionSpecification } from 'maplibre-gl';

type ZoomStop = {
  zoom: number;
  value: number;
};

type OpacityStop = {
  zoom: number;
  value: number;
};

export const MAP_LABEL_TEXT_COLOR = '#d7dde9';
export const MAP_LABEL_TEXT_HALO_COLOR = '#0a0f19';
export const MAP_LABEL_TEXT_HALO_WIDTH = 1.3;
export const MAP_LABEL_PREFERRED_FONTS = [
  'Noto Sans Japanese Regular',
  'Noto Sans Regular',
  'Open Sans Regular',
] as const;

export const MAP_LABEL_ALLOWED_CLASSES = [
  'settlement',
  'settlement-subdivision',
  'settlement-subdistrict',
  'neighbourhood',
  'railway-station',
  'airport',
  'park',
  'national-park',
] as const;

export const MAP_LABEL_ALLOWED_NAME_PATTERNS = ['区', '駅', '公園'] as const;

export const MAP_LABEL_TEXT_SIZE_STOPS: readonly ZoomStop[] = [
  { zoom: 7, value: 8 },
  { zoom: 10, value: 10 },
  { zoom: 13, value: 12.5 },
  { zoom: 16, value: 15 },
];

export const MAP_LABEL_ICON_SIZE_STOPS: readonly ZoomStop[] = [
  { zoom: 8, value: 0.65 },
  { zoom: 12, value: 0.9 },
  { zoom: 16, value: 1.2 },
];

export const MAP_LABEL_ICON_OPACITY_STOPS: readonly OpacityStop[] = [
  { zoom: 8, value: 0.08 },
  { zoom: 12, value: 0.45 },
  { zoom: 16, value: 0.85 },
];

export const MAP_ROAD_OPACITY_MAJOR: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  7,
  0.08,
  11,
  0.35,
  13,
  0.65,
  16,
  0.9,
];

export const MAP_ROAD_OPACITY_MINOR: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  7,
  0.04,
  11,
  0.2,
  13,
  0.45,
  16,
  0.75,
];

export const MAP_RAILWAY_OPACITY: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  8,
  0.1,
  13,
  0.4,
  16,
  0.7,
];

export const POST_MARKER_ICON_SIZE_EXPRESSION: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  0.9,
  16,
  1.2,
  20,
  1.4,
];

export const ROUTE_MARKER_ICON_SIZE_EXPRESSION: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  10,
  0.7,
  16,
  1,
  20,
  1.15,
];

export const MAP_CUSTOM_LAYER_IDS = ['posts-layer', 'post-route-layer', 'post-route-layer-station-label'] as const;

export type { ZoomStop, OpacityStop };
