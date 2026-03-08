import { NextRequest, NextResponse } from 'next/server';
import { Solar, Lunar } from 'lunar-javascript';
import { 
  calculateBaZiPrecise,
  calculateFullShiShen,
  calculateFiveElementsPrecise,
  judgeDayMasterStrengthPrecise,
  calculateDaYunPrecise,
  getQiYunAge,
  getShenShaPrecise,
  getNaYin,
  getLiuNian,
  TIAN_GAN,
  DI_ZHI,
  WUXING_MAP,
  YINYANG_MAP,
  type BaZiResult
} from '@/lib/bazi-precise';

const AI_API_KEY = process.env.OPENAI_API_KEY;
const AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4-turbo';

// 地支藏干（用于展示）
const ZHI_CANG_GAN: Record<string, string[]> = {
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
  '亥': ['壬', '甲']
};

/**
 * 转换出生日期为公历
 * 如果输入是农历，先转换为公历
 */
function convertToSolarDate(person: any): { year: number; month: number; day: number; isLunar: boolean } {
  const { year, month, day, calendarType } = person;
  
  // 默认公历
  if (!calendarType || calendarType === 'solar') {
    return { year, month, day, isLunar: false };
  }
  
  // 农历转公历
  try {
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      isLunar: true
    };
  } catch (error) {
    console.error('农历转公历失败:', error);
    // 转换失败时返回原日期
    return { year, month, day, isLunar: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, readingType, person2 } = body;

    if (!person1 || !readingType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 转换日期为公历（如果是农历）
    const solarDate1 = convertToSolarDate(person1);
    const birthDateInfo1 = solarDate1.isLunar 
      ? `（农历${person1.year}年${person1.month}月${person1.day}日转换为公历${solarDate1.year}年${solarDate1.month}月${solarDate1.day}日）`
      : '';

    const hour = person1.hour >= 0 ? person1.hour : 12;
    
    // 使用精确的八字算法计算（使用转换后的公历日期）
    const bazi = calculateBaZiPrecise(
      solarDate1.year,
      solarDate1.month,
      solarDate1.day,
      hour
    );

    // 完整十神分析
    const fullShiShen = calculateFullShiShen(bazi);

    // 精确五行统计
    const fiveElements = calculateFiveElementsPrecise(bazi);

    // 精确日主强弱判断
    const dayMasterStrength = judgeDayMasterStrengthPrecise(bazi, fiveElements.elements);

    // 计算大运
    const daYun = calculateDaYunPrecise(
      person1.year,
      person1.month,
      person1.day,
      hour,
      person1.gender
    );

    // 起运信息
    const qiYunInfo = getQiYunAge(
      person1.year,
      person1.month,
      person1.day,
      hour,
      person1.gender
    );

    // 神煞
    const shenSha = getShenShaPrecise(
      person1.year,
      person1.month,
      person1.day,
      hour
    );

    // 纳音
    const naYin = getNaYin(
      person1.year,
      person1.month,
      person1.day,
      hour
    );

    // 当前流年
    const currentYear = new Date().getFullYear();
    const liuNian = getLiuNian(
      person1.year,
      person1.month,
      person1.day,
      hour,
      currentYear
    );

    // 准备详细数据
    const detailedData = {
      personInfo: person1,
      bazi: {
        year: { gan: bazi.year.gan, zhi: bazi.year.zhi, naYin: naYin.year },
        month: { gan: bazi.month.gan, zhi: bazi.month.zhi, naYin: naYin.month },
        day: { gan: bazi.day.gan, zhi: bazi.day.zhi, naYin: naYin.day },
        hour: bazi.hour ? { gan: bazi.hour.gan, zhi: bazi.hour.zhi, naYin: naYin.hour } : null,
      },
      fullBazi: bazi,
      fiveElements: fiveElements.elements,
      fiveElementCounts: fiveElements.counts,
      dominant: fiveElements.dominant,
      weakest: fiveElements.weakest,
      dayMaster: {
        gan: bazi.day.gan,
        element: fiveElements.dayMasterElement,
        strength: dayMasterStrength.strength,
        score: dayMasterStrength.score,
        reason: dayMasterStrength.reason,
        yongShen: dayMasterStrength.yongShen,
        xiShen: dayMasterStrength.xiShen,
        jiShen: dayMasterStrength.jiShen,
      },
      shiShen: fullShiShen,
      cangGan: {
        year: ZHI_CANG_GAN[bazi.year.zhi] || [],
        month: ZHI_CANG_GAN[bazi.month.zhi] || [],
        day: ZHI_CANG_GAN[bazi.day.zhi] || [],
        hour: bazi.hour ? ZHI_CANG_GAN[bazi.hour.zhi] || [] : [],
      },
      daYun: daYun.slice(0, 10),
      qiYun: qiYunInfo,
      shenSha,
      liuNian: {
        currentYear,
        ...liuNian,
      },
    };

    if (readingType === 'single') {
      // 如果有 AI Key，生成解读
      let analysis = '';
      
      if (AI_API_KEY) {
        const prompt = `你是一位资深命理大师。以下是经过精确计算的八字排盘结果，请基于这些真实数据进行专业解读。

【求测者信息】
姓名: ${person1.name || '未填写'}
性别: ${person1.gender === 'male' ? '男' : '女'}
出生时间: ${person1.year}年${person1.month}月${person1.day}日 ${person1.hour >= 0 ? person1.hour + '时' : '时辰未知'}
起运: ${qiYunInfo.startAge}岁起运，${qiYunInfo.direction}

【八字排盘 - 精确计算结果】
年柱: ${bazi.year.gan}${bazi.year.zhi} (${naYin.year})
月柱: ${bazi.month.gan}${bazi.month.zhi} (${naYin.month})
日柱: ${bazi.day.gan}${bazi.day.zhi} (${naYin.day}) - 日主
时柱: ${bazi.hour ? bazi.hour.gan + bazi.hour.zhi : '未知'} (${naYin.hour})

【五行力量分析】
木: ${fiveElements.elements['木'].toFixed(1)} | 火: ${fiveElements.elements['火'].toFixed(1)} | 土: ${fiveElements.elements['土'].toFixed(1)} | 金: ${fiveElements.elements['金'].toFixed(1)} | 水: ${fiveElements.elements['水'].toFixed(1)}
最强: ${fiveElements.dominant} | 最弱: ${fiveElements.weakest}

【日主强弱】
${bazi.day.gan}日主 ${dayMasterStrength.strength}（得分${dayMasterStrength.score}）
${dayMasterStrength.reason}

【喜用神】
用神: ${dayMasterStrength.yongShen.join('、')}
喜神: ${dayMasterStrength.xiShen.join('、')}
忌神: ${dayMasterStrength.jiShen.join('、')}

【十神配置】
年干: ${fullShiShen.year.gan} | 月干: ${fullShiShen.month.gan} | 时干: ${fullShiShen.hour?.gan || '未知'}

【地支藏干】
年支${bazi.year.zhi}: ${ZHI_CANG_GAN[bazi.year.zhi]?.join('、') || '未知'}
月支${bazi.month.zhi}: ${ZHI_CANG_GAN[bazi.month.zhi]?.join('、') || '未知'}
日支${bazi.day.zhi}: ${ZHI_CANG_GAN[bazi.day.zhi]?.join('、') || '未知'}
时支${bazi.hour ? bazi.hour.zhi : '?'}: ${bazi.hour ? ZHI_CANG_GAN[bazi.hour.zhi]?.join('、') : '未知'}

【大运走势】
${daYun.slice(0, 8).map(dy => `${dy.startAge}-${dy.endAge}岁: ${dy.gan}${dy.zhi} (${dy.element} ${dy.shiShen})`).join('\n')}

【神煞】
${shenSha.length > 0 ? shenSha.map(s => `${s.name}(${s.position}): ${s.description}`).join('\n') : '无特殊神煞'}

【流年】
${currentYear}年: ${liuNian.gan}${liuNian.zhi} ${liuNian.shiShen} ${liuNian.naYin}

请基于以上精确计算的八字数据，提供以下分析：

## 一、八字格局分析
- 分析格局类型（正官格、七杀格、财格、印格等）
- 结合日主强弱分析命局特点

## 二、性格特征
- 基于日主和十神分析性格
- 五行偏旺偏弱对性格的影响

## 三、事业财运
- 适合的行业方向（基于喜用神）
- 财运走势特点

## 四、婚姻感情
- 配偶特征（日支分析）
- 婚恋时机（大运流年提示）

## 五、健康提示
- 五行与健康对应关系
- 需要注意的身体部位

## 六、大运流年
- 当前大运分析
- 未来3-5年运势重点

## 七、开运建议
- 喜用神对应的幸运颜色、方位
- 有利行业和开运方法

注意：以上分析必须基于提供的精确八字数据，不要编造。`;

        try {
          const response = await fetch(AI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${AI_API_KEY}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { 
                  role: 'system', 
                  content: '你是一位严谨的命理大师。你收到的八字数据是经过精确算法计算的，请基于这些真实数据进行解读，不要编造。你的分析要专业、准确、有深度。'
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0.3,
              max_tokens: 3000,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            analysis = data.choices[0].message.content;
          }
        } catch (error) {
          console.error('AI API Error:', error);
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...detailedData,
          analysis: analysis || 'AI解读暂不可用，请查看下方的详细排盘数据。',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request type' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}
