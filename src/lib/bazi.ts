import { 
  BaZiInput, 
  BaZiResult, 
  HeavenlyEarthlyPillar,
  HeavenlyStem,
  EarthlyBranch 
} from '@/types/fortune';

// 天干
const heavenlyStems: HeavenlyStem[] = 
  ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const earthlyBranches: EarthlyBranch[] = 
  ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const stemElements: Record<HeavenlyStem, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支五行
const branchElements: Record<EarthlyBranch, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 地支藏干
const branchHiddenStems: Record<EarthlyBranch, HeavenlyStem[]> = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲'],
};

/**
 * 计算年柱
 * 以立春为界（简化版：以春节为界）
 */
function calculateYearPillar(year: number): HeavenlyEarthlyPillar {
  // 年干 = (年份 - 3) % 10
  const stemIndex = (year - 4) % 10;
  // 年支 = (年份 - 3) % 12
  const branchIndex = (year - 4) % 12;
  
  const heavenly = heavenlyStems[stemIndex];
  const earthly = earthlyBranches[branchIndex];
  
  return {
    heavenly,
    earthly,
    hiddenStems: branchHiddenStems[earthly],
  };
}

/**
 * 计算月柱
 * 需要根据节气计算（简化版）
 */
function calculateMonthPillar(year: number, month: number): HeavenlyEarthlyPillar {
  // 月干根据年干推算
  const yearStemIndex = (year - 4) % 10;
  const yearStemGroup = yearStemIndex % 5; // 0-4 对应甲己、乙庚、丙辛、丁壬、戊癸
  
  // 月支：正月寅开始
  const branchIndex = (month + 1) % 12;
  const earthly = earthlyBranches[branchIndex];
  
  // 月干起始：甲己年丙月始，乙庚年戊月始...
  const monthStemStart = [2, 4, 6, 8, 0][yearStemGroup]; // 丙、戊、庚、壬、甲
  const stemIndex = (monthStemStart + month - 1) % 10;
  const heavenly = heavenlyStems[stemIndex];
  
  return {
    heavenly,
    earthly,
    hiddenStems: branchHiddenStems[earthly],
  };
}

/**
 * 计算日柱
 * 使用已知基准日推算
 */
function calculateDayPillar(year: number, month: number, day: number): HeavenlyEarthlyPillar {
  // 基准日：1900年1月31日是甲辰日
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (diffDays % 10 + 10) % 10;
  const branchIndex = (diffDays % 12 + 12) % 12;
  
  const heavenly = heavenlyStems[stemIndex];
  const earthly = earthlyBranches[branchIndex];
  
  return {
    heavenly,
    earthly,
    hiddenStems: branchHiddenStems[earthly],
  };
}

/**
 * 计算时柱
 */
function calculateHourPillar(dayStem: HeavenlyStem, hour: number): HeavenlyEarthlyPillar | null {
  if (hour < 0 || hour > 23) return null;
  
  // 时辰对应
  const hourToBranch = [
    0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5,
    6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11
  ]; // 0=子, 1=丑...
  
  const branchIndex = hourToBranch[hour];
  const earthly = earthlyBranches[branchIndex];
  
  // 时干根据日干推算
  const dayStemIndex = heavenlyStems.indexOf(dayStem);
  const dayStemGroup = dayStemIndex % 5;
  const hourStemStart = [0, 2, 4, 6, 8][dayStemGroup]; // 甲己日甲子时，乙庚日丙子时...
  
  const stemIndex = (hourStemStart + branchIndex) % 10;
  const heavenly = heavenlyStems[stemIndex];
  
  return {
    heavenly,
    earthly,
    hiddenStems: branchHiddenStems[earthly],
  };
}

/**
 * 计算八字
 */
export function calculateBaZi(input: BaZiInput): BaZiResult {
  const yearPillar = calculateYearPillar(input.year);
  const monthPillar = calculateMonthPillar(input.year, input.month);
  const dayPillar = calculateDayPillar(input.year, input.month, input.day);
  const hourPillar = input.hour >= 0 
    ? calculateHourPillar(dayPillar.heavenly, input.hour)
    : null;
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
  };
}

/**
 * 获取五行分析
 */
export function getFiveElementAnalysis(baZi: BaZiResult) {
  const allStems = [
    baZi.yearPillar.heavenly,
    baZi.monthPillar.heavenly,
    baZi.dayPillar.heavenly,
    ...(baZi.hourPillar ? [baZi.hourPillar.heavenly] : []),
  ];
  
  const allBranches = [
    baZi.yearPillar.earthly,
    baZi.monthPillar.earthly,
    baZi.dayPillar.earthly,
    ...(baZi.hourPillar ? [baZi.hourPillar.earthly] : []),
  ];
  
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 计算天干五行
  allStems.forEach(stem => {
    const element = stemElements[stem];
    if (element === '木') counts.wood++;
    if (element === '火') counts.fire++;
    if (element === '土') counts.earth++;
    if (element === '金') counts.metal++;
    if (element === '水') counts.water++;
  });
  
  // 计算地支五行
  allBranches.forEach(branch => {
    const element = branchElements[branch];
    if (element === '木') counts.wood++;
    if (element === '火') counts.fire++;
    if (element === '土') counts.earth++;
    if (element === '金') counts.metal++;
    if (element === '水') counts.water++;
  });
  
  return counts;
}

/**
 * 格式化八字显示
 */
export function formatBaZi(baZi: BaZiResult): string {
  const parts = [
    `${baZi.yearPillar.heavenly}${baZi.yearPillar.earthly}`,
    `${baZi.monthPillar.heavenly}${baZi.monthPillar.earthly}`,
    `${baZi.dayPillar.heavenly}${baZi.dayPillar.earthly}`,
  ];
  
  if (baZi.hourPillar) {
    parts.push(`${baZi.hourPillar.heavenly}${baZi.hourPillar.earthly}`);
  }
  
  return parts.join(' ');
}
