import { createStaticRegistry } from "./utils/staticRegistry";

type AreaKey = string;

export type AreaGroupDefinition = {
  group: string;
  areas: readonly string[];
};

/**
 * エリアグループの定義（グループ名 + 属する駅/街）
 * 必要に応じてここへ追加するだけで Registry 全体が更新される
 */
export const AREA_GROUP_DEFINITIONS = [
  {
    group: '皇居・丸の内・日比谷',
    areas: ['千代田区', '東京駅', '東京', '大手町', '丸の内', '有楽町', '日比谷', '霞ヶ関', '神田', '秋葉原', '麹町'],
  },
  {
    group: '銀座・日本橋・八重洲',
    areas: ['中央区', '銀座', '日本橋', '八重洲', '京橋', '築地', '月島', '佃', '晴海'],
  },
  {
    group: '六本木・赤坂・虎ノ門',
    areas: ['港区', '六本木', '赤坂', '虎ノ門', '新橋', '芝', '高輪', '田町'],
  },
  {
    group: '麻布・広尾',
    areas: ['麻布十番', '西麻布', '東麻布', '元麻布', '広尾'],
  },
  {
    group: 'お台場・豊洲ベイエリア',
    areas: ['お台場', '台場', '有明', '国際展示場', '豊洲', '辰巳', '新豊洲'],
  },
  {
    group: '渋谷・原宿・表参道',
    areas: ['渋谷区', '渋谷', '原宿', '表参道', '青山', '外苑前', '明治神宮前', '代々木'],
  },
  {
    group: '恵比寿・代官山・中目黒',
    areas: ['恵比寿', '代官山', '中目黒'],
  },
  {
    group: '目黒・自由が丘・学芸大学',
    areas: ['目黒区', '目黒', '自由が丘', '学芸大学', '都立大学', '祐天寺'],
  },
  {
    group: '二子玉川・三軒茶屋・下北沢',
    areas: ['世田谷区', '二子玉川', '三軒茶屋', '下北沢', '用賀', '池尻大橋', '豪徳寺', '成城学園前'],
  },
  {
    group: '新宿・四ツ谷',
    areas: ['新宿区', '新宿', '西新宿', '歌舞伎町', '四ツ谷', '神楽坂', '高田馬場', '早稲田'],
  },
  {
    group: '池袋・目白・大塚',
    areas: ['豊島区', '池袋', '目白', '大塚', '巣鴨', '駒込', '東池袋'],
  },
  {
    group: '中野・高円寺・阿佐ヶ谷',
    areas: ['中野区', '杉並区', '中野', '東中野', '野方', '高円寺', '阿佐ヶ谷', '荻窪', '西荻窪'],
  },
  {
    group: '吉祥寺・三鷹',
    areas: ['武蔵野市', '吉祥寺', '三鷹', '井の頭公園'],
  },
  {
    group: '文京・上野・谷根千',
    areas: ['文京区', '台東区', '後楽園', '本郷', '根津', '千駄木', '湯島', '上野', '浅草', '谷中', '御徒町'],
  },
  {
    group: '押上・錦糸町',
    areas: ['墨田区', '押上', '錦糸町', 'とうきょうスカイツリー', '両国'],
  },
  {
    group: '清澄白河・門前仲町',
    areas: ['江東区', '清澄白河', '門前仲町', '木場', '東陽町', '亀戸', '森下'],
  },
  {
    group: '品川・五反田・大崎',
    areas: ['品川区', '品川', '五反田', '大崎', '大井町', '天王洲アイル', '戸越'],
  },
  {
    group: '北千住・日暮里',
    areas: ['足立区', '北千住', '綾瀬', '竹ノ塚', '荒川区', '日暮里', '西日暮里', '町屋', '三河島'],
  },
  {
    group: '赤羽・王子',
    areas: ['北区', '赤羽', '王子', '東十条', '田端'],
  },
  {
    group: '蒲田・羽田',
    areas: ['大田区', '蒲田', '羽田', '田園調布', '大鳥居', '池上'],
  },
  {
    group: '葛飾・亀有',
    areas: ['葛飾区', '亀有', '金町', '柴又', '青砥', '新小岩'],
  },
  {
    group: '江戸川・葛西',
    areas: ['江戸川区', '葛西', '西葛西', '小岩', '船堀', '瑞江'],
  },
  {
    group: '練馬・板橋',
    areas: ['練馬区', '板橋区', '練馬', '石神井公園', '江古田', '板橋', '成増', '大山', 'ときわ台'],
  },
  {
    group: '立川・多摩',
    areas: ['立川', '多摩', '府中', '調布', '国立', '国分寺', '小金井', '小平', '東村山', '西東京'],
  },
  {
    group: '八王子・町田',
    areas: ['八王子', '町田', '相原', '橋本', '多摩境'],
  },
  {
    group: 'その他東京エリア',
    areas: ['その他東京エリア', '青梅', '日野', '福生', '羽村'],
  },
] as const satisfies readonly { group: string; areas: readonly string[] }[];

/**
 * グループ名 → 定義全体 の参照に使う Registry
 */
export const AREA_GROUP_REGISTRY = createStaticRegistry(
  AREA_GROUP_DEFINITIONS.map((definition) => [definition.group, definition]),
  {
    normalizeKey: (value) => value.trim(),
  },
);

/**
 * 駅・街 → グループ名 への逆引きマップ
 */
export const AREA_GROUP_MAP: Record<AreaKey, string> = AREA_GROUP_DEFINITIONS.reduce(
  (acc, { group, areas }) => {
    acc[group] = group;
    areas.forEach((area) => {
      acc[area] = group;
    });
    return acc;
  },
  {} as Record<AreaKey, string>,
);

/**
 * 表示順（定義順に準ずる）
 */
export const AREA_GROUP_ORDER = AREA_GROUP_REGISTRY.keys;

/**
 * 駅名からグループ名を取得
 */
export const getAreaGroupName = (area: string | undefined): string => {
  if (!area) return 'その他東京エリア';
  return AREA_GROUP_MAP[area] ?? 'その他東京エリア';
};

/**
 * グループ名から定義情報を取得
 */
export const getAreaGroupDefinition = (group: string | undefined): AreaGroupDefinition | undefined => {
  if (!group) return undefined;
  return AREA_GROUP_REGISTRY.get(group);
};
