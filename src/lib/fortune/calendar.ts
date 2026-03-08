/**
 * 干支暦計算ライブラリ
 *
 * 天干地支の日・月・年を正確に計算し、
 * 円香さんの注意日（卯の日・月）を判定する
 */

// ============================================================
// 定数定義
// ============================================================

/** 天干（十干） */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

/** 地支（十二支） */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 地支の日本語読み */
export const DI_ZHI_READING: Record<string, string> = {
  子: 'ね', 丑: 'うし', 寅: 'とら', 卯: 'う',
  辰: 'たつ', 巳: 'み', 午: 'うま', 未: 'ひつじ',
  申: 'さる', 酉: 'とり', 戌: 'いぬ', 亥: 'い',
};

/** 卯の地支インデックス */
const U_BRANCH_INDEX = 3; // 卯

// ============================================================
// 節気データ（2025〜2027年）
// 月の干支は節気ベースで決まる（旧暦ではない）
// 各節気は月の開始を定義する
// ============================================================

/** 節気月の開始日（年別） */
const MONTH_STARTS: Record<number, Array<{ branch: number; mmdd: string }>> = {
  2025: [
    { branch: 2, mmdd: '02-03' },   // 立春 → 寅月
    { branch: 3, mmdd: '03-05' },   // 驚蟄 → 卯月 ⚠️
    { branch: 4, mmdd: '04-04' },   // 清明 → 辰月
    { branch: 5, mmdd: '05-05' },   // 立夏 → 巳月
    { branch: 6, mmdd: '06-05' },   // 芒種 → 午月
    { branch: 7, mmdd: '07-07' },   // 小暑 → 未月
    { branch: 8, mmdd: '08-07' },   // 立秋 → 申月
    { branch: 9, mmdd: '09-07' },   // 白露 → 酉月
    { branch: 10, mmdd: '10-08' },  // 寒露 → 戌月
    { branch: 11, mmdd: '11-07' },  // 立冬 → 亥月
    { branch: 0, mmdd: '12-07' },   // 大雪 → 子月
  ],
  2026: [
    { branch: 1, mmdd: '01-05' },   // 小寒 → 丑月
    { branch: 2, mmdd: '02-04' },   // 立春 → 寅月
    { branch: 3, mmdd: '03-06' },   // 驚蟄 → 卯月 ⚠️
    { branch: 4, mmdd: '04-05' },   // 清明 → 辰月
    { branch: 5, mmdd: '05-06' },   // 立夏 → 巳月
    { branch: 6, mmdd: '06-06' },   // 芒種 → 午月
    { branch: 7, mmdd: '07-07' },   // 小暑 → 未月
    { branch: 8, mmdd: '08-07' },   // 立秋 → 申月
    { branch: 9, mmdd: '09-08' },   // 白露 → 酉月
    { branch: 10, mmdd: '10-08' },  // 寒露 → 戌月
    { branch: 11, mmdd: '11-07' },  // 立冬 → 亥月
    { branch: 0, mmdd: '12-07' },   // 大雪 → 子月
  ],
  2027: [
    { branch: 1, mmdd: '01-05' },   // 小寒 → 丑月
    { branch: 2, mmdd: '02-04' },   // 立春 → 寅月
    { branch: 3, mmdd: '03-06' },   // 驚蟄 → 卯月 ⚠️
    { branch: 4, mmdd: '04-05' },   // 清明 → 辰月
    { branch: 5, mmdd: '05-06' },   // 立夏 → 巳月
    { branch: 6, mmdd: '06-06' },   // 芒種 → 午月
    { branch: 7, mmdd: '07-07' },   // 小暑 → 未月
    { branch: 8, mmdd: '08-08' },   // 立秋 → 申月
    { branch: 9, mmdd: '09-08' },   // 白露 → 酉月
    { branch: 10, mmdd: '10-09' },  // 寒露 → 戌月
    { branch: 11, mmdd: '11-08' },  // 立冬 → 亥月
    { branch: 0, mmdd: '12-07' },   // 大雪 → 子月
  ],
};

// ============================================================
// 化禄・化権・化科・化忌テーブル（鑑定書データ）
// ============================================================

export interface SiHua {
  huaLu: string;   // 化禄
  huaQuan: string;  // 化権
  huaKe: string;   // 化科
  huaJi: string;   // 化忌
}

/** 天干→四化 変換テーブル */
export const SI_HUA_TABLE: Record<string, SiHua> = {
  甲: { huaLu: '廉貞', huaQuan: '破軍', huaKe: '武曲', huaJi: '太陽' },
  乙: { huaLu: '天機', huaQuan: '天梁', huaKe: '紫微', huaJi: '太陰' },
  丙: { huaLu: '天同', huaQuan: '天機', huaKe: '文昌', huaJi: '廉貞' },
  丁: { huaLu: '太陰', huaQuan: '天同', huaKe: '天機', huaJi: '巨門' },
  戊: { huaLu: '貪狼', huaQuan: '太陰', huaKe: '右弼', huaJi: '天機' },
  己: { huaLu: '武曲', huaQuan: '貪狼', huaKe: '天梁', huaJi: '文曲' },
  庚: { huaLu: '太陽', huaQuan: '武曲', huaKe: '太陰', huaJi: '天同' },
  辛: { huaLu: '巨門', huaQuan: '太陽', huaKe: '文曲', huaJi: '文昌' },
  壬: { huaLu: '天梁', huaQuan: '紫微', huaKe: '左輔', huaJi: '武曲' },
  癸: { huaLu: '破軍', huaQuan: '巨門', huaKe: '太陰', huaJi: '貪狼' },
};

// ============================================================
// 円香さんの命盤キースター
// ============================================================

/** 命盤の重要な星（これらに四化が当たると影響大） */
export const MADOKA_KEY_STARS = {
  命宮: ['文曲', '天機'],
  主星: ['貪狼', '七殺', '紫微', '破軍'],
  財運: ['破軍'],
} as const;

// ============================================================
// 計算関数
// ============================================================

/**
 * グレゴリオ暦からユリウス日数(JDN)を計算
 */
function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * 日付文字列(YYYY-MM-DD)をパースする
 */
function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

export interface GanZhi {
  stem: string;       // 天干
  branch: string;     // 地支
  stemIndex: number;
  branchIndex: number;
  full: string;       // 例: "丙午"
}

/**
 * 日の干支を計算する
 *
 * JDNベースの計算式:
 *   stem  = (JDN + 9) % 10
 *   branch = (JDN + 1) % 12
 */
export function getDayGanZhi(dateStr: string): GanZhi {
  const { year, month, day } = parseDate(dateStr);
  const jdn = toJDN(year, month, day);
  const stemIndex = (jdn + 9) % 10;
  const branchIndex = (jdn + 1) % 12;
  return {
    stem: TIAN_GAN[stemIndex],
    branch: DI_ZHI[branchIndex],
    stemIndex,
    branchIndex,
    full: `${TIAN_GAN[stemIndex]}${DI_ZHI[branchIndex]}`,
  };
}

/**
 * 年の干支を計算する（立春基準）
 *
 * 立春前は前年扱い
 */
export function getYearGanZhi(dateStr: string): GanZhi {
  const { year, month, day } = parseDate(dateStr);

  // 立春の日付を取得して、立春前は前年扱い
  let effectiveYear = year;
  const monthStarts = MONTH_STARTS[year];
  if (monthStarts) {
    const lichun = monthStarts.find((m) => m.branch === 2); // 寅月開始=立春
    if (lichun) {
      const [lm, ld] = lichun.mmdd.split('-').map(Number);
      if (month < lm || (month === lm && day < ld)) {
        effectiveYear = year - 1;
      }
    }
  }

  const index = ((effectiveYear - 4) % 60 + 60) % 60;
  const stemIndex = index % 10;
  const branchIndex = index % 12;
  return {
    stem: TIAN_GAN[stemIndex],
    branch: DI_ZHI[branchIndex],
    stemIndex,
    branchIndex,
    full: `${TIAN_GAN[stemIndex]}${DI_ZHI[branchIndex]}`,
  };
}

/**
 * 月の干支を計算する（節気基準）
 *
 * 年干から月干を導出:
 *   甲/己年 → 寅月=丙寅
 *   乙/庚年 → 寅月=戊寅
 *   丙/辛年 → 寅月=庚寅
 *   丁/壬年 → 寅月=壬寅
 *   戊/癸年 → 寅月=甲寅
 */
export function getMonthGanZhi(dateStr: string): GanZhi {
  const { year, month, day } = parseDate(dateStr);
  const mmdd = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // 現在の月の地支を節気から判定
  let branchIndex = -1;

  // 今年のデータから判定
  const thisYearStarts = MONTH_STARTS[year];
  if (thisYearStarts) {
    for (let i = thisYearStarts.length - 1; i >= 0; i--) {
      if (mmdd >= thisYearStarts[i].mmdd) {
        branchIndex = thisYearStarts[i].branch;
        break;
      }
    }
  }

  // 年初で今年のどの節気にもマッチしない場合、前年の大雪（子月）を確認
  if (branchIndex === -1) {
    const prevYearStarts = MONTH_STARTS[year - 1];
    if (prevYearStarts) {
      // 前年の最後の節気（大雪→子月）がまだ続いている
      const lastEntry = prevYearStarts[prevYearStarts.length - 1];
      branchIndex = lastEntry.branch; // 子月(0)
    } else {
      branchIndex = 0; // フォールバック: 子月
    }
  }

  // 年干を取得（立春基準）
  const yearGanZhi = getYearGanZhi(dateStr);
  const yearStemIndex = yearGanZhi.stemIndex;

  // 月干の計算: 年干 × 2 + 月支（寅からのオフセット）
  // 寅月(branch=2)からのオフセットを計算
  const monthOffset = ((branchIndex - 2) % 12 + 12) % 12;
  // 年干→寅月の天干: (yearStemIndex % 5) * 2 + 2
  const yinMonthStem = ((yearStemIndex % 5) * 2 + 2) % 10;
  const stemIndex = (yinMonthStem + monthOffset) % 10;

  return {
    stem: TIAN_GAN[stemIndex],
    branch: DI_ZHI[branchIndex],
    stemIndex,
    branchIndex,
    full: `${TIAN_GAN[stemIndex]}${DI_ZHI[branchIndex]}`,
  };
}

// ============================================================
// 卯（注意日）判定
// ============================================================

export interface CautionInfo {
  level: 'high' | 'medium' | 'low' | 'none';
  isUMonth: boolean;  // 卯月か
  isUDay: boolean;    // 卯日か
  message: string;
}

/**
 * 卯の注意レベルを判定
 *
 * 鑑定士の指摘: 卯がつく月日が注意
 *   - 卯月 + 卯日 = high（ダブル卯: 最大注意）
 *   - 卯月 = medium（月全体が注意期間）
 *   - 卯日 = low（その日だけ注意）
 *   - どちらでもない = none
 */
export function getCautionInfo(dateStr: string): CautionInfo {
  const monthGZ = getMonthGanZhi(dateStr);
  const dayGZ = getDayGanZhi(dateStr);

  const isUMonth = monthGZ.branchIndex === U_BRANCH_INDEX;
  const isUDay = dayGZ.branchIndex === U_BRANCH_INDEX;

  if (isUMonth && isUDay) {
    return {
      level: 'high',
      isUMonth: true,
      isUDay: true,
      message: '卯月 × 卯日: 最大注意日。重要な契約・ローンチ・大きな決断は避けてください。',
    };
  }

  if (isUMonth) {
    return {
      level: 'medium',
      isUMonth: true,
      isUDay: false,
      message: '卯月期間中: 新規ローンチや重要契約は慎重に。準備・計画に充てるのが吉。',
    };
  }

  if (isUDay) {
    return {
      level: 'low',
      isUMonth: false,
      isUDay: true,
      message: '卯日: 重要な意思決定やローンチは翌日以降にずらすのが安全。',
    };
  }

  return {
    level: 'none',
    isUMonth: false,
    isUDay: false,
    message: '',
  };
}

// ============================================================
// 四化の命盤影響判定
// ============================================================

export interface DayFortuneImpact {
  daySiHua: SiHua;
  impacts: Array<{
    type: '化禄' | '化権' | '化科' | '化忌';
    star: string;
    palace: string;   // 命宮 / 主星 / 財運
    effect: 'positive' | 'negative';
    description: string;
  }>;
  overallTone: 'very_good' | 'good' | 'neutral' | 'caution' | 'warning';
}

/**
 * 日の天干から四化を計算し、命盤への影響を判定
 */
export function getDayFortuneImpact(dateStr: string): DayFortuneImpact {
  const dayGZ = getDayGanZhi(dateStr);
  const siHua = SI_HUA_TABLE[dayGZ.stem];
  const impacts: DayFortuneImpact['impacts'] = [];

  // 各四化が命盤のキースターに当たるかチェック
  const allKeyStars = [
    ...MADOKA_KEY_STARS.命宮.map((s) => ({ star: s, palace: '命宮' })),
    ...MADOKA_KEY_STARS.主星.map((s) => ({ star: s, palace: '主星' })),
    ...MADOKA_KEY_STARS.財運.map((s) => ({ star: s, palace: '財運' })),
  ];

  for (const { star, palace } of allKeyStars) {
    if (siHua.huaLu === star) {
      impacts.push({
        type: '化禄',
        star,
        palace,
        effect: 'positive',
        description: `${star}に化禄 → ${palace}の運気アップ、財運・良縁の流れ`,
      });
    }
    if (siHua.huaQuan === star) {
      impacts.push({
        type: '化権',
        star,
        palace,
        effect: 'positive',
        description: `${star}に化権 → ${palace}の力が強まる、主導権を握れる`,
      });
    }
    if (siHua.huaKe === star) {
      impacts.push({
        type: '化科',
        star,
        palace,
        effect: 'positive',
        description: `${star}に化科 → ${palace}の知性・評価が上がる`,
      });
    }
    if (siHua.huaJi === star) {
      impacts.push({
        type: '化忌',
        star,
        palace,
        effect: 'negative',
        description: `${star}に化忌 → ${palace}に障害・停滞の暗示、慎重に`,
      });
    }
  }

  // 全体トーンの判定
  const positives = impacts.filter((i) => i.effect === 'positive').length;
  const negatives = impacts.filter((i) => i.effect === 'negative').length;
  // 命宮への化忌は特に注意
  const meikyuJi = impacts.some(
    (i) => i.palace === '命宮' && i.type === '化忌'
  );

  let overallTone: DayFortuneImpact['overallTone'] = 'neutral';
  if (meikyuJi) {
    overallTone = 'warning';
  } else if (negatives > positives) {
    overallTone = 'caution';
  } else if (positives >= 2) {
    overallTone = 'very_good';
  } else if (positives > 0) {
    overallTone = 'good';
  }

  return { daySiHua: siHua, impacts, overallTone };
}

// ============================================================
// 統合: 日の運勢データ
// ============================================================

export interface DailyFortuneData {
  date: string;
  yearGanZhi: GanZhi;
  monthGanZhi: GanZhi;
  dayGanZhi: GanZhi;
  caution: CautionInfo;
  fortuneImpact: DayFortuneImpact;
}

/**
 * 指定日の全運勢データを生成
 */
export function getDailyFortuneData(dateStr: string): DailyFortuneData {
  return {
    date: dateStr,
    yearGanZhi: getYearGanZhi(dateStr),
    monthGanZhi: getMonthGanZhi(dateStr),
    dayGanZhi: getDayGanZhi(dateStr),
    caution: getCautionInfo(dateStr),
    fortuneImpact: getDayFortuneImpact(dateStr),
  };
}

// ============================================================
// ユーティリティ: 次の卯日を探す
// ============================================================

/**
 * 指定日から次の卯日を探す（最大60日先まで）
 */
export function getNextUDays(dateStr: string, count: number = 3): string[] {
  const { year, month, day } = parseDate(dateStr);
  const results: string[] = [];
  const baseDate = new Date(year, month - 1, day);

  for (let i = 1; i <= 60 && results.length < count; i++) {
    const d = new Date(baseDate.getTime() + i * 86400000);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const gz = getDayGanZhi(ds);
    if (gz.branchIndex === U_BRANCH_INDEX) {
      results.push(ds);
    }
  }
  return results;
}

/**
 * 卯月の期間を取得（指定年）
 */
export function getUMonthPeriod(year: number): { start: string; end: string } | null {
  const starts = MONTH_STARTS[year];
  if (!starts) return null;

  const uMonthStart = starts.find((m) => m.branch === 3); // 卯
  const nextMonth = starts.find((m) => m.branch === 4);    // 辰

  if (!uMonthStart) return null;

  const start = `${year}-${uMonthStart.mmdd}`;
  const end = nextMonth
    ? `${year}-${nextMonth.mmdd}`
    : `${year}-04-05`; // fallback

  return { start, end };
}
