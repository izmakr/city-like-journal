import type { Map as MapLibreMap } from 'maplibre-gl';

import {
  MAP_CUSTOM_LAYER_IDS,
  MAP_LABEL_ALLOWED_CLASSES,
  MAP_LABEL_ALLOWED_NAME_PATTERNS,
  MAP_LABEL_ICON_OPACITY_STOPS,
  MAP_LABEL_ICON_SIZE_STOPS,
  MAP_LABEL_PREFERRED_FONTS,
  MAP_LABEL_TEXT_COLOR,
  MAP_LABEL_TEXT_HALO_COLOR,
  MAP_LABEL_TEXT_HALO_WIDTH,
  MAP_LABEL_TEXT_SIZE_STOPS,
  MAP_RAILWAY_OPACITY,
  MAP_ROAD_OPACITY_MAJOR,
  MAP_ROAD_OPACITY_MINOR,
} from './mapStyleConfig';

const buildAllowedNameCondition = () => {
  const classMatch = [
    'match',
    ['coalesce', ['get', 'class'], ['literal', '']],
    MAP_LABEL_ALLOWED_CLASSES,
    true,
    false,
  ] as const;

  const patternMatches = MAP_LABEL_ALLOWED_NAME_PATTERNS.map(
    (pattern) =>
      [
        '>=',
        [
          'index-of',
          pattern,
          ['coalesce', ['get', 'name:ja'], ['get', 'name'], ['literal', '']],
        ],
        0,
      ] as const,
  );

  return ['any', classMatch, ...patternMatches] as const;
};

const buildConditionalInterpolate = (stops: readonly { zoom: number; value: number }[], condition: unknown) => {
  const expression: unknown[] = ['interpolate', ['linear'], ['zoom']];
  stops.forEach(({ zoom, value }) => {
    expression.push(zoom, ['case', condition, value, 0]);
  });
  return expression;
};

const buildConditionalOpacity = (stops: readonly { zoom: number; value: number }[], condition: unknown) => [
  'case',
  condition,
  ['interpolate', ['linear'], ['zoom'], ...stops.flatMap(({ zoom, value }) => [zoom, value])],
  0,
] as const;

export const preferJapaneseLabels = (map: MapLibreMap) => {
  const style = map.getStyle();
  if (!style?.layers) return;

  const allowedNameCondition = buildAllowedNameCondition();

  for (const layer of style.layers) {
    if (typeof layer.id === 'string' && MAP_CUSTOM_LAYER_IDS.includes(layer.id as typeof MAP_CUSTOM_LAYER_IDS[number])) {
      continue;
    }

    if (layer.type === 'symbol') {
      const layout = (layer.layout ?? {}) as Record<string, unknown>;
      const textField = layout['text-field'];
      const hasIcon = Boolean(layout['icon-image']);

      if (textField) {
        const fallbackExpression =
          typeof textField === 'string'
            ? ['literal', textField]
            : Array.isArray(textField)
            ? (textField as unknown[])
            : null;

        if (fallbackExpression) {
          try {
            map.setLayoutProperty(layer.id, 'text-field', [
              'coalesce',
              ['get', 'name:ja'],
              ['get', 'name_ja'],
              ['get', 'name'],
              ['get', 'name_en'],
              fallbackExpression,
            ]);
          } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('[MapStyles] ラベル切替に失敗しました', layer.id, error);
            }
          }
        }

        try {
          map.setPaintProperty(layer.id, 'text-color', MAP_LABEL_TEXT_COLOR);
          map.setPaintProperty(layer.id, 'text-halo-color', MAP_LABEL_TEXT_HALO_COLOR);
          map.setPaintProperty(layer.id, 'text-halo-width', MAP_LABEL_TEXT_HALO_WIDTH);
          map.setLayoutProperty(layer.id, 'text-font', MAP_LABEL_PREFERRED_FONTS);
          map.setLayoutProperty(layer.id, 'text-size', buildConditionalInterpolate(MAP_LABEL_TEXT_SIZE_STOPS, allowedNameCondition));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[MapStyles] ラベル調整に失敗しました', layer.id, error);
          }
        }

        try {
          map.setPaintProperty(layer.id, 'text-opacity', ['case', allowedNameCondition, 1, 0]);
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[MapStyles] ラベル透過調整に失敗しました', layer.id, error);
          }
        }
      }

      if (hasIcon) {
        try {
          map.setLayoutProperty(layer.id, 'icon-size', buildConditionalInterpolate(MAP_LABEL_ICON_SIZE_STOPS, allowedNameCondition));
          map.setPaintProperty(layer.id, 'icon-opacity', buildConditionalOpacity(MAP_LABEL_ICON_OPACITY_STOPS, allowedNameCondition));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[MapStyles] アイコン調整に失敗しました', layer.id, error);
          }
        }
      }
      continue;
    }

    if (layer.type === 'line' && typeof layer.id === 'string' && layer.id.includes('road')) {
      const isMajor =
        layer.id.includes('motorway') ||
        layer.id.includes('primary') ||
        layer.id.includes('trunk') ||
        layer.id.includes('main');
      try {
        map.setPaintProperty(layer.id, 'line-opacity', isMajor ? MAP_ROAD_OPACITY_MAJOR : MAP_ROAD_OPACITY_MINOR);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[MapStyles] 道路調整に失敗しました', layer.id, error);
        }
      }
      continue;
    }

    if (layer.type === 'line' && typeof layer.id === 'string' && layer.id.includes('railway')) {
      try {
        map.setPaintProperty(layer.id, 'line-opacity', MAP_RAILWAY_OPACITY);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[MapStyles] 鉄道路線調整に失敗しました', layer.id, error);
        }
      }
      continue;
    }
  }
};

export const collapseAttributionControl = (map: MapLibreMap) => {
  const attribution = map.getContainer().querySelector<HTMLElement>('.maplibregl-ctrl-attrib');
  if (attribution) {
    attribution.classList.add('maplibregl-compact');
    attribution.classList.remove('maplibregl-compact-show');
  }
};

