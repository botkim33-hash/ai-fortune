// 八字算法核心库
// 真正的农历转干支算法

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行对应
const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 阴阳对应
const YINYANG_MAP: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳', '巳': '阴',
  '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
};

// 1900-2100年农历数据（简化版，实际需要完整数据）
// 每个元素: [闰月位置(0=无), 每月天数, ...]
const LUNAR_DATA = [
  // 1900-1999年数据（部分）
  [0, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], // 1900
  [0, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], // 1901
  // ... 需要完整的1900-2100年数据
];

// 1900年1月31日是庚子年正月初一
const BASE_YEAR = 1900;
const BASE_TIMESTAMP = new Date(1900, 0, 31).getTime();

/**
 * 公历转农历（简化版，实际需要完整农历库）
 */
export function solarToLunar(year: number, month: number, day: number): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeap: boolean;
} {
  // 这里应该使用完整的农历转换库
  // 简化版本：使用第三方库 lunar-javascript
  // 实际项目中应该安装: npm install lunar-javascript
  
  // 临时返回示例数据
  return {
    lunarYear: year,
    lunarMonth: month,
    lunarDay: day,
    isLeap: false
  };
}

/**
 * 计算年柱
 * 年柱以立春为界（大约2月4日）
 */
export function getYearPillar(year: number, month: number, day: number): [string, string] {
  // 立春通常在2月4日前后
  const isAfterLichun = month > 2 || (month === 2 && day >= 4);
  const ganZhiYear = isAfterLichun ? year : year - 1;
  
  // 年干 = (年份 - 3) % 10
  const ganIndex = (ganZhiYear - 4) % 10;
  // 年支 = (年份 - 3) % 12
  const zhiIndex = (ganZhiYear - 4) % 12;
  
  return [TIAN_GAN[ganIndex], DI_ZHI[zhiIndex]];
}

/**
 * 计算月柱
 * 月柱以节气为界
 */
export function getMonthPillar(year: number, month: number, day: number, yearGan: string): [string, string] {
  // 月干根据年干推算（五虎遁）
  // 甲己之年丙作首，乙庚之岁戊为头
  // 丙辛之岁寻庚上，丁壬壬位顺行流
  // 若问戊癸何处起，甲寅之上好追求
  
  const yearGanMap: Record<string, number> = {
    '甲': 2, '己': 2,  // 丙(2)
    '乙': 4, '庚': 4,  // 戊(4)
    '丙': 6, '辛': 6,  // 庚(6)
    '丁': 8, '壬': 8,  // 壬(8)
    '戊': 0, '癸': 0,  // 甲(0)
  };
  
  // 确定节气月（简化版，实际需要完整的节气计算）
  let jieqiMonth = month;
  // 这里需要根据具体日期判断节气
  
  // 月干起始
  const ganStart = yearGanMap[yearGan] || 0;
  const ganIndex = (ganStart + jieqiMonth - 1) % 10;
  
  // 月支固定：正月寅，二月卯...
  const zhiIndex = (jieqiMonth + 1) % 12;
  
  return [TIAN_GAN[ganIndex], DI_ZHI[zhiIndex]];
}

/**
 * 计算日柱
 * 使用蔡勒公式或查找表
 */
export function getDayPillar(year: number, month: number, day: number): [string, string] {
  // 1900年1月31日是甲辰日
  // 使用基期推算
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 甲辰 = index 0, 4
  const ganIndex = (diffDays % 10 + 10) % 10;
  const zhiIndex = ((diffDays + 4) % 12 + 12) % 12;
  
  return [TIAN_GAN[ganIndex], DI_ZHI[zhiIndex]];
}

/**
 * 计算时柱
 */
export function getHourPillar(hour: number, dayGan: string): [string, string] | null {
  if (hour < 0 || hour > 23) return null;
  
  // 时辰对应：23-1子, 1-3丑, 3-5寅...
  const shiChen = Math.floor((hour + 1) / 2) % 12;
  
  // 时干根据日干推算（五鼠遁）
  // 甲己还加甲，乙庚丙作初
  // 丙辛从戊起，丁壬庚子居
  // 戊癸何方发，壬子是真途
  
  const dayGanMap: Record<string, number> = {
    '甲': 0, '己': 0,  // 甲(0)
    '乙': 2, '庚': 2,  // 丙(2)
    '丙': 4, '辛': 4,  // 戊(4)
    '丁': 6, '壬': 6,  // 庚(6)
    '戊': 8, '癸': 8,  // 壬(8)
  };
  
  const ganStart = dayGanMap[dayGan] || 0;
  const ganIndex = (ganStart + shiChen) % 10;
  
  return [TIAN_GAN[ganIndex], DI_ZHI[shiChen]];
}

/**
 * 完整的八字排盘
 */
export interface BaZiResult {
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string } | null;
}

export function calculateBaZi(
  year: number,
  month: number,
  day: number,
  hour: number
): BaZiResult {
  const [yearGan, yearZhi] = getYearPillar(year, month, day);
  const [monthGan, monthZhi] = getMonthPillar(year, month, day, yearGan);
  const [dayGan, dayZhi] = getDayPillar(year, month, day);
  const hourResult = hour >= 0 ? getHourPillar(hour, dayGan) : null;
  
  return {
    year: { gan: yearGan, zhi: yearZhi },
    month: { gan: monthGan, zhi: monthZhi },
    day: { gan: dayGan, zhi: dayZhi },
    hour: hourResult ? { gan: hourResult[0], zhi: hourResult[1] } : null
  };
}

/**
 * 五行统计
 */
export function calculateFiveElements(bazi: BaZiResult): Record<string, number> {
  const elements: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  const stems = [bazi.year.gan, bazi.month.gan, bazi.day.gan];
  if (bazi.hour) stems.push(bazi.hour.gan);
  
  const branches = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi];
  if (bazi.hour) branches.push(bazi.hour.zhi);
  
  // 天干五行
  stems.forEach(stem => {
    const wx = WUXING_MAP[stem];
    if (wx) elements[wx]++;
  });
  
  // 地支五行（本气）
  branches.forEach(zhi => {
    const wx = WUXING_MAP[zhi];
    if (wx) elements[wx]++;
  });
  
  return elements;
}

/**
 * 判断日主强弱（简化版）
 */
export function judgeDayMasterStrength(
  bazi: BaZiResult,
  fiveElements: Record<string, number>
): { strength: '旺' | '弱' | '中和'; reason: string } {
  const dayMaster = bazi.day.gan;
  const dayMasterElement = WUXING_MAP[dayMaster];
  const dayMasterYinYang = YINYANG_MAP[dayMaster];
  
  let supporting = 0;
  let weakening = 0;
  
  // 计算生助和克泄
  const allStems = [bazi.year.gan, bazi.month.gan, bazi.day.gan];
  if (bazi.hour) allStems.push(bazi.hour.gan);
  
  const allBranches = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi];
  if (bazi.hour) allBranches.push(bazi.hour.zhi);
  
  // 生克关系判断（简化）
  // 同我、生我 = 助
  // 克我、我克、我生 = 泄
  
  const elementStrength = fiveElements[dayMasterElement] || 0;
  
  if (elementStrength >= 3) {
    return { strength: '旺', reason: `${dayMasterElement}气充沛，得时得地` };
  } else if (elementStrength <= 1) {
    return { strength: '弱', reason: `${dayMasterElement}气不足，需要生助` };
  } else {
    return { strength: '中和', reason: '五行相对平衡' };
  }
}

/**
 * 计算大运
 */
export function calculateDaYun(
  bazi: BaZiResult,
  gender: 'male' | 'female',
  startYear: number
): Array<{
  age: number;
  gan: string;
  zhi: string;
  element: string;
}> {
  const dayGan = bazi.day.gan;
  const yearGan = bazi.year.gan;
  
  // 阳男阴女顺排，阴男阳女逆排
  const dayYinYang = YINYANG_MAP[dayGan];
  const isForward = (gender === 'male' && dayYinYang === '阳') || 
                    (gender === 'female' && dayYinYang === '阴');
  
  const daYun: Array<{ age: number; gan: string; zhi: string; element: string }> = [];
  
  // 月柱为起点
  let currentGanIndex = TIAN_GAN.indexOf(bazi.month.gan);
  let currentZhiIndex = DI_ZHI.indexOf(bazi.month.zhi);
  
  for (let i = 0; i < 10; i++) { // 排出10步大运
    if (isForward) {
      currentGanIndex = (currentGanIndex + 1) % 10;
      currentZhiIndex = (currentZhiIndex + 1) % 12;
    } else {
      currentGanIndex = (currentGanIndex - 1 + 10) % 10;
      currentZhiIndex = (currentZhiIndex - 1 + 12) % 12;
    }
    
    const gan = TIAN_GAN[currentGanIndex];
    const zhi = DI_ZHI[currentZhiIndex];
    
    daYun.push({
      age: startYear + i * 10,
      gan,
      zhi,
      element: WUXING_MAP[gan]
    });
  }
  
  return daYun;
}

// 导出所有函数
export {
  TIAN_GAN,
  DI_ZHI,
  WUXING_MAP,
  YINYANG_MAP
};
