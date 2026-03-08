// 使用 lunar-javascript 库进行精确农历和八字计算
import { Solar, Lunar } from 'lunar-javascript';

// 天干地支数据
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行对应
export const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 阴阳对应
export const YINYANG_MAP: Record<string, '阳' | '阴'> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳', '巳': '阴',
  '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
};

// 地支藏干（本气、中气、余气）
export const ZHI_CANG_GAN: Record<string, [string, number][]> = {
  '子': [['癸', 1]],
  '丑': [['己', 0.6], ['癸', 0.3], ['辛', 0.1]],
  '寅': [['甲', 0.6], ['丙', 0.3], ['戊', 0.1]],
  '卯': [['乙', 1]],
  '辰': [['戊', 0.6], ['乙', 0.3], ['癸', 0.1]],
  '巳': [['丙', 0.6], ['庚', 0.3], ['戊', 0.1]],
  '午': [['丁', 0.6], ['己', 0.4]],
  '未': [['己', 0.6], ['丁', 0.3], ['乙', 0.1]],
  '申': [['庚', 0.6], ['壬', 0.3], ['戊', 0.1]],
  '酉': [['辛', 1]],
  '戌': [['戊', 0.6], ['辛', 0.3], ['丁', 0.1]],
  '亥': [['壬', 0.7], ['甲', 0.3]]
};

// 十神定义
export const SHI_SHEN_NAMES = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

// 八字结果接口
export interface BaZiResult {
  year: { gan: string; zhi: string; ganIndex: number; zhiIndex: number };
  month: { gan: string; zhi: string; ganIndex: number; zhiIndex: number };
  day: { gan: string; zhi: string; ganIndex: number; zhiIndex: number };
  hour: { gan: string; zhi: string; ganIndex: number; zhiIndex: number } | null;
  lunar: {
    year: number;
    month: number;
    day: number;
    isLeap: boolean;
  };
}

// 大运接口
export interface DaYunItem {
  startAge: number;
  endAge: number;
  gan: string;
  zhi: string;
  element: string;
  shiShen: string; // 对日主而言的十神
}

// 神煞接口
export interface ShenShaResult {
  name: string;
  position: string;
  description: string;
}

/**
 * 使用 lunar-javascript 库精确计算八字
 */
export function calculateBaZiPrecise(
  year: number,
  month: number,
  day: number,
  hour: number
): BaZiResult {
  // 创建公历日期
  const solar = Solar.fromYmd(year, month, day);
  
  // 转换为农历
  const lunar = solar.getLunar();
  
  // 获取八字 (使用类型断言)
  const bazi = (lunar as any).getEightChar();
  
  return {
    year: {
      gan: bazi.getYearGan(),
      zhi: bazi.getYearZhi(),
      ganIndex: TIAN_GAN.indexOf(bazi.getYearGan()),
      zhiIndex: DI_ZHI.indexOf(bazi.getYearZhi())
    },
    month: {
      gan: bazi.getMonthGan(),
      zhi: bazi.getMonthZhi(),
      ganIndex: TIAN_GAN.indexOf(bazi.getMonthGan()),
      zhiIndex: DI_ZHI.indexOf(bazi.getMonthZhi())
    },
    day: {
      gan: bazi.getDayGan(),
      zhi: bazi.getDayZhi(),
      ganIndex: TIAN_GAN.indexOf(bazi.getDayGan()),
      zhiIndex: DI_ZHI.indexOf(bazi.getDayZhi())
    },
    hour: hour >= 0 ? {
      gan: bazi.getTimeGan(),
      zhi: bazi.getTimeZhi(),
      ganIndex: TIAN_GAN.indexOf(bazi.getTimeGan()),
      zhiIndex: DI_ZHI.indexOf(bazi.getTimeZhi())
    } : null,
    lunar: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() !== lunar.getMonth()
    }
  };
}

/**
 * 计算十神
 * 以日干为基准，计算其他干支对日主的十神关系
 */
export function calculateShiShen(dayGan: string, targetGan: string): string {
  const dayIndex = TIAN_GAN.indexOf(dayGan);
  const targetIndex = TIAN_GAN.indexOf(targetGan);
  
  const dayYinYang = YINYANG_MAP[dayGan];
  const targetYinYang = YINYANG_MAP[targetGan];
  
  const sameYinYang = dayYinYang === targetYinYang;
  const diff = (targetIndex - dayIndex + 10) % 10;
  
  // 十神：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
  if (sameYinYang) {
    return SHI_SHEN_NAMES[diff];
  } else {
    // 阴阳不同的序列
    const diffYinYangNames = ['劫财', '比肩', '伤官', '食神', '正财', '偏财', '正官', '七杀', '正印', '偏印'];
    return diffYinYangNames[diff];
  }
}

/**
 * 计算完整十神分析
 */
export function calculateFullShiShen(bazi: BaZiResult) {
  const dayGan = bazi.day.gan;
  
  return {
    year: {
      gan: calculateShiShen(dayGan, bazi.year.gan),
      cangGan: ZHI_CANG_GAN[bazi.year.zhi].map(([gan, weight]) => ({
        gan,
        weight,
        shiShen: calculateShiShen(dayGan, gan)
      }))
    },
    month: {
      gan: calculateShiShen(dayGan, bazi.month.gan),
      cangGan: ZHI_CANG_GAN[bazi.month.zhi].map(([gan, weight]) => ({
        gan,
        weight,
        shiShen: calculateShiShen(dayGan, gan)
      }))
    },
    day: {
      gan: '日主',
      cangGan: ZHI_CANG_GAN[bazi.day.zhi].map(([gan, weight]) => ({
        gan,
        weight,
        shiShen: calculateShiShen(dayGan, gan)
      }))
    },
    hour: bazi.hour ? {
      gan: calculateShiShen(dayGan, bazi.hour.gan),
      cangGan: ZHI_CANG_GAN[bazi.hour.zhi].map(([gan, weight]) => ({
        gan,
        weight,
        shiShen: calculateShiShen(dayGan, gan)
      }))
    } : null
  };
}

/**
 * 计算五行力量（精确版）
 * 考虑月令权重、地支藏干、天干地支的生克关系
 */
export function calculateFiveElementsPrecise(bazi: BaZiResult): {
  elements: Record<string, number>;
  counts: Record<string, number>;
  dominant: string;
  weakest: string;
  dayMasterElement: string;
} {
  const elements: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  // 天干权重（天干直接显现）
  const addStemWeight = (stem: string, weight: number) => {
    const wx = WUXING_MAP[stem];
    if (wx) {
      elements[wx] += weight;
      counts[wx]++;
    }
  };
  
  addStemWeight(bazi.year.gan, 1);
  addStemWeight(bazi.month.gan, 1.5); // 月干权重稍高
  addStemWeight(bazi.day.gan, 1.2);   // 日干稍高
  if (bazi.hour) addStemWeight(bazi.hour.gan, 0.8);
  
  // 地支本气权重
  const addBranchWeight = (branch: string, weight: number, isMonth: boolean = false) => {
    const wx = WUXING_MAP[branch];
    if (wx) {
      // 月令权重最高
      elements[wx] += weight * (isMonth ? 3 : 1);
      counts[wx]++;
    }
  };
  
  addBranchWeight(bazi.year.zhi, 0.8);
  addBranchWeight(bazi.month.zhi, 1.5, true); // 月令权重最高
  addBranchWeight(bazi.day.zhi, 1);
  if (bazi.hour) addBranchWeight(bazi.hour.zhi, 0.8);
  
  // 地支藏干权重
  [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi, bazi.hour?.zhi].forEach((zhi, idx) => {
    if (!zhi) return;
    const isMonthZhi = idx === 1;
    const cangGanList = ZHI_CANG_GAN[zhi];
    cangGanList.forEach(([gan, weight]) => {
      const wx = WUXING_MAP[gan];
      if (wx) {
        // 月令藏干权重更高
        elements[wx] += weight * (isMonthZhi ? 2 : 1);
      }
    });
  });
  
  // 找出最强和最弱
  const entries = Object.entries(elements);
  entries.sort((a, b) => b[1] - a[1]);
  
  return {
    elements,
    counts,
    dominant: entries[0][0],
    weakest: entries[entries.length - 1][0],
    dayMasterElement: WUXING_MAP[bazi.day.gan]
  };
}

/**
 * 判断日主强弱（精确版）
 */
export function judgeDayMasterStrengthPrecise(
  bazi: BaZiResult,
  fiveElements: Record<string, number>
): {
  strength: '身旺' | '身弱' | '身中和' | '从强' | '从弱';
  score: number;
  reason: string;
  yongShen: string[];
  xiShen: string[];
  jiShen: string[];
} {
  const dayMaster = bazi.day.gan;
  const dayElement = WUXING_MAP[dayMaster];
  const dayYinYang = YINYANG_MAP[dayMaster];
  
  // 计算得分（满分100）
  let score = 0;
  
  // 1. 月令最重要（40分）
  const monthElement = WUXING_MAP[bazi.month.zhi];
  const monthCangGan = ZHI_CANG_GAN[bazi.month.zhi];
  
  if (monthElement === dayElement) {
    score += 35; // 得令（临官、帝旺）
  } else if (isElementSheng(dayElement, monthElement)) {
    score += 30; // 月令生我（长生、沐浴、冠带）
  } else if (monthCangGan.some(([gan]) => WUXING_MAP[gan] === dayElement)) {
    score += 20; // 月令藏干有日主五行
  } else if (isElementKe(dayElement, monthElement)) {
    score += 10; // 月令克我（死、墓、绝）
  }
  
  // 2. 地支根气（30分）
  [bazi.year.zhi, bazi.day.zhi, bazi.hour?.zhi].forEach((zhi, idx) => {
    if (!zhi) return;
    const zhiElement = WUXING_MAP[zhi];
    const cangGanList = ZHI_CANG_GAN[zhi];
    
    if (zhiElement === dayElement) {
      score += 8; // 地支本气相同
    }
    
    // 藏干有日主五行
    if (cangGanList.some(([gan]) => WUXING_MAP[gan] === dayElement)) {
      score += 5;
    }
    
    // 地支生我
    if (isElementSheng(dayElement, zhiElement)) {
      score += 3;
    }
  });
  
  // 3. 天干透干（20分）
  [bazi.year.gan, bazi.month.gan, bazi.hour?.gan].forEach((gan, idx) => {
    if (!gan || gan === dayMaster) return;
    const ganElement = WUXING_MAP[gan];
    
    if (ganElement === dayElement) {
      score += 7; // 比劫帮身
    } else if (isElementSheng(dayElement, ganElement)) {
      score += 5; // 印星生身
    }
  });
  
  // 4. 五行力量平衡（10分）
  const dayElementPower = fiveElements[dayElement] || 0;
  if (dayElementPower >= 3) score += 10;
  else if (dayElementPower >= 2) score += 5;
  
  // 判断强弱和格局
  let strength: '身旺' | '身弱' | '身中和' | '从强' | '从弱';
  let reason: string;
  let yongShen: string[];
  let xiShen: string[];
  let jiShen: string[];
  
  // 检查是否从格（极端情况）
  if (score <= 15) {
    // 从弱格：日主极弱，无根无气，只能顺势而从
    const keDayElement = getKeElement(dayElement);
    const xieDayElement = getXieElement(dayElement);
    strength = '从弱';
    reason = `日主${dayMaster}(${dayElement})失令失地失势，无根无气，只能顺势而从（得分${score}）`;
    yongShen = [keDayElement, xieDayElement]; // 克我者为官，我生者为食伤
    xiShen = [getShengElement(dayElement)];   // 生我者
    jiShen = [dayElement];                    // 同我者
  } else if (score >= 85) {
    // 从强格：日主极旺，只能顺势
    strength = '从强';
    reason = `日主${dayMaster}(${dayElement})得令得地得势，气太旺，只能顺势而从（得分${score}）`;
    yongShen = [dayElement, getShengElement(dayElement)]; // 同我者、生我者
    xiShen = [getXieElement(dayElement)];
    jiShen = [getKeElement(dayElement)];
  } else if (score >= 60) {
    strength = '身旺';
    reason = `日主${dayMaster}(${dayElement})得令或得地，五行${dayElement}气偏旺（得分${score}）`;
    yongShen = [getKeElement(dayElement), getXieElement(dayElement)]; // 克泄耗
    xiShen = [dayElement];  // 同我者比劫
    jiShen = [getShengElement(dayElement)]; // 生我者印星
  } else if (score <= 35) {
    strength = '身弱';
    reason = `日主${dayMaster}(${dayElement})失令失地，需要生扶（得分${score}）`;
    yongShen = [getShengElement(dayElement), dayElement]; // 生我、同我
    xiShen = [getKeElement(dayElement)];
    jiShen = [getXieElement(dayElement)];
  } else {
    strength = '身中和';
    reason = `日主${dayMaster}(${dayElement})强弱适中，五行相对平衡（得分${score}）`;
    // 中和命局需要根据大运流年动态判断
    yongShen = ['根据大运流年调整'];
    xiShen = [];
    jiShen = [];
  }
  
  return { strength, score, reason, yongShen, xiShen, jiShen };
}

/**
 * 计算大运（使用 lunar-javascript 精确计算）
 */
export function calculateDaYunPrecise(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
): DaYunItem[] {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const bazi = (lunar as any).getEightChar();
  
  // 获取大运 (1=男, 0=女)
  const yun = bazi.getYun(gender === 'male' ? 1 : 0);
  const daYunList = yun.getDaYun();
  
  const dayGan = bazi.getDayGan();
  const result: DaYunItem[] = [];
  
  for (let i = 0; i < Math.min(12, daYunList.length); i++) {
    const dy = daYunList[i];
    const ganZhi = dy.getGanZhi();
    const gan = ganZhi.substring(0, 1);
    const zhi = ganZhi.substring(1, 2);
    
    result.push({
      startAge: (dy as any).getStartAge(),
      endAge: (dy as any).getEndAge(),
      gan,
      zhi,
      element: WUXING_MAP[gan],
      shiShen: calculateShiShen(dayGan, gan)
    });
  }
  
  return result;
}

/**
 * 获取起运年龄
 */
export function getQiYunAge(
  year: number,
  month: number,
  day: number,
  hour: number,
  gender: 'male' | 'female'
): { startAge: number; startYear: number; direction: string } {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const bazi = (lunar as any).getEightChar();
  
  // 获取大运
  const yun = bazi.getYun(gender === 'male' ? 1 : 0);
  
  // 阳男阴女顺行，阴男阳女逆行
  const yearGan = bazi.getYearGan();
  const isYang = YINYANG_MAP[yearGan] === '阳';
  const isForward = (gender === 'male' && isYang) || (gender === 'female' && !isYang);
  
  return {
    startAge: (yun as any).getStartAge(),
    startYear: (yun as any).getStartYear(),
    direction: isForward ? '顺行' : '逆行'
  };
}

/**
 * 获取神煞（使用 lunar-javascript）
 */
export function getShenShaPrecise(
  year: number,
  month: number,
  day: number,
  hour: number
): ShenShaResult[] {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const bazi = (lunar as any).getEightChar();
  
  const shenSha: ShenShaResult[] = [];
  const positions = ['年柱', '月柱', '日柱', '时柱'];
  const zhiList = [bazi.getYearZhi(), bazi.getMonthZhi(), bazi.getDayZhi(), bazi.getTimeZhi()];
  const ganList = [bazi.getYearGan(), bazi.getMonthGan(), bazi.getDayGan(), bazi.getTimeGan()];
  
  // 桃花（子午卯酉）
  zhiList.forEach((zhi, idx) => {
    if (['子', '午', '卯', '酉'].includes(zhi)) {
      shenSha.push({
        name: '桃花',
        position: positions[idx],
        description: idx === 2 ? '墙内桃花，夫妻恩爱' : idx === 3 ? '墙外桃花，异性缘佳' : '人缘好，有魅力'
      });
    }
  });
  
  // 天乙贵人
  const tianYiMap: Record<string, string[]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['寅', '午']
  };
  
  const dayGan = bazi.getDayGan();
  zhiList.forEach((zhi, idx) => {
    if (tianYiMap[dayGan]?.includes(zhi)) {
      shenSha.push({
        name: '天乙贵人',
        position: positions[idx],
        description: '逢凶化吉，贵人相助'
      });
    }
  });
  
  // 驿马（寅申巳亥）
  const dayZhi = bazi.getDayZhi();
  const yearZhi = bazi.getYearZhi();
  const maMap: Record<string, string> = {
    '申': '寅', '子': '寅', '辰': '寅',
    '寅': '申', '午': '申', '戌': '申',
    '亥': '巳', '卯': '巳', '未': '巳',
    '巳': '亥', '酉': '亥', '丑': '亥'
  };
  
  zhiList.forEach((zhi, idx) => {
    if (zhi === maMap[yearZhi] || zhi === maMap[dayZhi]) {
      shenSha.push({
        name: '驿马',
        position: positions[idx],
        description: '好动，适合奔波求财'
      });
    }
  });
  
  // 华盖
  const huaGaiMap: Record<string, string> = {
    '申': '辰', '子': '辰', '辰': '辰',
    '寅': '戌', '午': '戌', '戌': '戌',
    '亥': '未', '卯': '未', '未': '未',
    '巳': '丑', '酉': '丑', '丑': '丑'
  };
  
  zhiList.forEach((zhi, idx) => {
    if (zhi === huaGaiMap[yearZhi]) {
      shenSha.push({
        name: '华盖',
        position: positions[idx],
        description: '聪明好学，有艺术天赋，略显孤独'
      });
    }
  });
  
  // 文昌
  const wenChangMap: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
    '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
    '壬': '寅', '癸': '卯'
  };
  
  zhiList.forEach((zhi, idx) => {
    if (zhi === wenChangMap[dayGan]) {
      shenSha.push({
        name: '文昌',
        position: positions[idx],
        description: '聪明智慧，学业有成'
      });
    }
  });
  
  // 羊刃
  const yangRenMap: Record<string, string> = {
    '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳',
    '戊': '午', '己': '巳', '庚': '酉', '辛': '申',
    '壬': '子', '癸': '亥'
  };
  
  zhiList.forEach((zhi, idx) => {
    if (zhi === yangRenMap[dayGan]) {
      shenSha.push({
        name: '羊刃',
        position: positions[idx],
        description: '性格刚强，有决断力，注意控制脾气'
      });
    }
  });
  
  // 空亡计算
  const xunKong = bazi.getDayXunKong();
  if (xunKong) {
    shenSha.push({
      name: '空亡',
      position: '日柱旬空',
      description: `空亡：${xunKong}，主虚幻不实之事`
    });
  }
  
  return shenSha;
}

/**
 * 获取纳音五行
 */
export function getNaYin(year: number, month: number, day: number, hour: number): {
  year: string;
  month: string;
  day: string;
  hour: string;
} {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const bazi = (lunar as any).getEightChar();
  
  return {
    year: bazi.getYearNaYin(),
    month: bazi.getMonthNaYin(),
    day: bazi.getDayNaYin(),
    hour: bazi.getTimeNaYin()
  };
}

/**
 * 获取当前流年分析
 */
export function getLiuNian(year: number, month: number, day: number, hour: number, targetYear: number): {
  gan: string;
  zhi: string;
  naYin: string;
  shiShen: string;
  relationToDayMaster: string;
} {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const bazi = (lunar as any).getEightChar();
  const dayGan = bazi.getDayGan();
  
  // 计算流年
  const liuNianGanZhi = (Lunar.fromYmd(targetYear, 1, 1) as any).getEightChar().getYearGanZhi();
  const gan = liuNianGanZhi.substring(0, 1);
  const zhi = liuNianGanZhi.substring(1, 2);
  
  return {
    gan,
    zhi,
    naYin: bazi.getYearNaYin(),
    shiShen: calculateShiShen(dayGan, gan),
    relationToDayMaster: getLiuNianRelation(bazi, gan, zhi)
  };
}

// 辅助函数：五行生克关系
function isElementSheng(target: string, source: string): boolean {
  const sheng: Record<string, string> = {
    '木': '水', '火': '木', '土': '火', '金': '土', '水': '金'
  };
  return sheng[target] === source;
}

function isElementKe(target: string, source: string): boolean {
  const ke: Record<string, string> = {
    '木': '金', '火': '水', '土': '木', '金': '火', '水': '土'
  };
  return ke[target] === source;
}

function getShengElement(element: string): string {
  const map: Record<string, string> = {
    '木': '水', '火': '木', '土': '火', '金': '土', '水': '金'
  };
  return map[element] || '';
}

function getKeElement(element: string): string {
  const map: Record<string, string> = {
    '木': '金', '火': '水', '土': '木', '金': '火', '水': '土'
  };
  return map[element] || '';
}

function getXieElement(element: string): string {
  // 我生者为食伤（泄气）
  const map: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  };
  return map[element] || '';
}

function getLiuNianRelation(bazi: any, gan: string, zhi: string): string {
  // 简化版流年关系判断
  const dayGan = bazi.getDayGan();
  const dayZhi = bazi.getDayZhi();
  
  const ganRelation = calculateShiShen(dayGan, gan);
  
  // 地支刑冲合害（简化）
  const heMap: Record<string, string> = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳', '午': '未', '未': '午'
  };
  
  const chongMap: Record<string, string> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑',
    '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
  };
  
  let relation = `天干为${ganRelation}`;
  
  if (heMap[dayZhi] === zhi) {
    relation += '，地支六合，主和顺';
  } else if (chongMap[dayZhi] === zhi) {
    relation += '，地支六冲，主变动';
  }
  
  return relation;
}

// 数据已在文件开头导出
