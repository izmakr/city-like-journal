export type StationCoordinates = {
  latitude: number;
  longitude: number;
};

// 駅名 → 座標 の静的マップ
export const STATION_COORDINATES: Record<string, StationCoordinates> = {
  渋谷駅: { latitude: 35.6580446385, longitude: 139.7016470909 },
  中目黒駅: { latitude: 35.6441536003, longitude: 139.6987772806 },
  代官山駅: { latitude: 35.6486530597, longitude: 139.7031667709 },
  恵比寿駅: { latitude: 35.6467385476, longitude: 139.7100718153 },
  外苑前駅: { latitude: 35.6707111201, longitude: 139.7181007385 },
  麻布十番駅: { latitude: 35.6565364741, longitude: 139.7365976274 },
  東銀座駅: { latitude: 35.6698475707, longitude: 139.7670994063 },
  銀座駅: { latitude: 35.6717570582, longitude: 139.7644323187 },
  表参道駅: { latitude: 35.6655268625, longitude: 139.7127304077 },
  青山一丁目駅: { latitude: 35.6728812267, longitude: 139.7223496437 },
  都庁前駅: { latitude: 35.6905945258, longitude: 139.6926178305 },
  日比谷駅: { latitude: 35.67504488, longitude: 139.7595844468 },
};

/**
 * 駅座標を取得するヘルパー（内部で軽量キャッシュ）
 * 同じ駅名が繰り返し問い合わせられてもメモリアクセスで済む
 */
export const getStationCoordinates = (() => {
  const cache = new Map<string, StationCoordinates>();

  return (name?: string): StationCoordinates | undefined => {
    if (!name) return undefined;
    if (cache.has(name)) {
      return cache.get(name);
    }
    const coordinates = STATION_COORDINATES[name];
    if (coordinates) {
      cache.set(name, coordinates);
    }
    return coordinates;
  };
})();

/**
 * 2地点間の距離を Haversine で計算（km単位）
 */
const haversineDistance = (
  a: StationCoordinates,
  b: StationCoordinates,
): number => {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const aCalc = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
  return R * c;
};

/**
 * 任意の座標からもっとも近い駅と距離を返す
 * スポット追加時の最寄駅候補表示などに利用できる
 */
export const findNearestStation = (
  coordinate?: StationCoordinates,
): { name: string; distanceKm: number } | undefined => {
  if (!coordinate) return undefined;

  let closest: { name: string; distanceKm: number } | undefined;

  for (const [name, stationCoordinate] of Object.entries(STATION_COORDINATES)) {
    const distanceKm = haversineDistance(coordinate, stationCoordinate);
    if (!closest || distanceKm < closest.distanceKm) {
      closest = { name, distanceKm };
    }
  }

  return closest;
};

