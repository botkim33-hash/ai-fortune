// 八字相关类型定义

export interface BaZiInput {
  year: number;
  month: number;
  day: number;
  hour: number; // 0-23，-1 表示不知道时辰
  minute?: number; // 0-59，精确到分钟
  gender: 'male' | 'female';
  name?: string; // 可选的名字
  birthPlace?: string; // 出生地（用于真太阳时校正）
  calendarType?: 'solar' | 'lunar'; // 历法类型：公历/农历
}

export interface BaZiResult {
  yearPillar: HeavenlyEarthlyPillar;
  monthPillar: HeavenlyEarthlyPillar;
  dayPillar: HeavenlyEarthlyPillar;
  hourPillar: HeavenlyEarthlyPillar | null; // 不知道时辰时为 null
}

export interface HeavenlyEarthlyPillar {
  heavenly: HeavenlyStem;
  earthly: EarthlyBranch;
  hiddenStems: HeavenlyStem[]; // 地支藏干
}

export type HeavenlyStem = 
  | '甲' | '乙' | '丙' | '丁' | '戊' 
  | '己' | '庚' | '辛' | '壬' | '癸';

export type EarthlyBranch = 
  | '子' | '丑' | '寅' | '卯' | '辰' | '巳'
  | '午' | '未' | '申' | '酉' | '戌' | '亥';

export type FiveElement = '木' | '火' | '土' | '金' | '水';

export type YinYang = '阴' | '阳';

export interface FiveElementAnalysis {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// AI 解读结果
export interface FortuneReading {
  summary: string; // 总体概况
  personality: string; // 性格分析
  career: string; // 事业运势
  wealth: string; // 财运
  love: string; // 感情
  health: string; // 健康
  advice: string; // 建议
  lucky: {
    colors: string[];
    numbers: number[];
    directions: string[];
  };
}

// 合盘结果
export interface CompatibilityResult {
  score: number; // 0-100 匹配度
  summary: string; // 总体评价
  strengths: string[]; // 优势
  challenges: string[]; // 挑战
  relationship: {
    love: string; // 感情
    business: string; // 合作
    friendship: string; // 友谊
  };
  advice: string; // 建议
}

// 用户输入表单数据
export interface FortuneFormData {
  person1: BaZiInput;
  person2?: BaZiInput; // 合盘时才有
  readingType: 'single' | 'compatibility';
}
