/**
 * 設定オプション:
 * - aliases: 別名 → 正規キーへのマッピング
 * - normalizeKey: 入力キーを正規化する関数
 */
type RegistryOptions<K extends string> = {
  aliases?: Record<string, K>;
  normalizeKey?: (key: string) => string;
};

/**
 * Registry が提供する共通インターフェース
 */
export type StaticRegistry<K extends string, V> = {
  entries: ReadonlyArray<Readonly<[K, V]>>;
  keys: readonly K[];
  values: readonly V[];
  record: Record<K, V>;
  map: ReadonlyMap<K, V>;
  get: (key?: string | K) => V | undefined;
  has: (key?: string | K) => key is K;
};

/**
 * 小さな静的データセットをまとめる汎用ユーティリティ。
 * 本ユーティリティを使えば、カテゴリや駅など共通構造を楽に再利用できる。
 */
export function createStaticRegistry<K extends string, V>(
  entries: readonly (readonly [K, V])[],
  options: RegistryOptions<K> = {},
): StaticRegistry<K, V> {
  const map = new Map<K, V>(entries.map(([key, value]) => [key, value]));
  const aliases = options.aliases ?? {};

  const normalizeKey = (raw: string): K | undefined => {
    const directKey = raw as K;
    if (map.has(directKey)) {
      return directKey;
    }

    const normalizedRaw = options.normalizeKey ? options.normalizeKey(raw) : raw;
    const normalizedKey = normalizedRaw as K;
    if (map.has(normalizedKey)) {
      return normalizedKey;
    }

    const aliasKey = aliases[raw] ?? aliases[normalizedRaw];
    if (aliasKey && map.has(aliasKey)) {
      return aliasKey;
    }

    return undefined;
  };

  const get = (key?: string | K): V | undefined => {
    if (!key) return undefined;
    if (typeof key !== 'string') {
      return map.get(key);
    }

    // normalizeKey・aliases を駆使して実データに寄せる
    const resolvedKey = normalizeKey(key);
    return resolvedKey ? map.get(resolvedKey) : undefined;
  };

  const has = (key?: string | K): key is K => {
    if (!key) return false;
    if (typeof key !== 'string') {
      return map.has(key);
    }
    return Boolean(normalizeKey(key));
  };

  return {
    entries: entries.slice() as ReadonlyArray<Readonly<[K, V]>>,
    keys: entries.map(([key]) => key) as readonly K[],
    values: entries.map(([, value]) => value) as readonly V[],
    record: Object.fromEntries(map) as Record<K, V>,
    map,
    get,
    has,
  };
}

