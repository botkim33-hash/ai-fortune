import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, getFiveElementAnalysis, formatBaZi } from '@/lib/bazi';
import { BaZiInput, FortuneReading, CompatibilityResult } from '@/types/fortune';

const AI_API_KEY = process.env.OPENAI_API_KEY;
const AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

/**
 * 生成 AI 命理解读 Prompt
 */
function generateFortunePrompt(baZiStr: string, fiveElements: any, gender: string): string {
  return `你是一位精通八字命理、紫微斗数、五行学说的大师。请根据以下八字信息进行专业解读：

【八字排盘】
${baZiStr}

【五行分析】
木: ${fiveElements.wood} | 火: ${fiveElements.fire} | 土: ${fiveElements.earth} | 金: ${fiveElements.metal} | 水: ${fiveElements.water}

【求测者信息】
性别: ${gender === 'male' ? '男' : '女'}

请从以下几个方面进行详细解读，用现代易懂的语言：
1. 总体概况 - 八字格局、喜用神、命格特点
2. 性格分析 - 性格特点、优缺点、处事风格
3. 事业运势 - 适合的行业、职业发展方向、财运
4. 感情婚姻 - 感情特点、择偶建议、婚姻运势
5. 健康提醒 - 需要注意的健康问题
6. 开运建议 - 幸运颜色、数字、方位
7. 近年运势 - 未来3-5年运势走向

请用中文回复，语气要专业但不迷信，给出建设性的建议。`;
}

/**
 * 生成合盘 Prompt
 */
function generateCompatibilityPrompt(
  bazi1: string, 
  bazi2: string, 
  elements1: any, 
  elements2: any,
  name1?: string,
  name2?: string
): string {
  return `你是一位精通八字合婚、命理配对的大师。请分析以下两人的八字配对情况：

【甲方】${name1 || '第一方'}
八字: ${bazi1}
五行: 木${elements1.wood} 火${elements1.fire} 土${elements1.earth} 金${elements1.metal} 水${elements1.water}

【乙方】${name2 || '第二方'}
八字: ${bazi2}
五行: 木${elements2.wood} 火${elements2.fire} 土${elements2.earth} 金${elements2.metal} 水${elements2.water}

请从以下几个方面进行专业分析：
1. 总体匹配度评分 (0-100分) 及简要评价
2. 性格互补性分析
3. 感情关系前景
4. 事业合作潜力
5. 需要注意的冲突点
6. 增进关系的建议

请用中文回复，给出客观、建设性的分析。`;
}

/**
 * 调用 AI API
 */
async function callAI(prompt: string): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI API Key 未配置');
  }

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: '你是一位专业的命理大师，精通八字、五行、紫微斗数。请用现代、理性的语言进行解读，给出建设性的建议。' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API 错误: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 解析 AI 回复为结构化数据
 */
function parseFortuneReading(aiResponse: string): FortuneReading {
  // 简化版解析，实际可以用更复杂的逻辑
  const sections = aiResponse.split(/\n\d+\.|\n【/).filter(s => s.trim());
  
  return {
    summary: sections[0] || aiResponse.slice(0, 200),
    personality: sections.find(s => s.includes('性格')) || '',
    career: sections.find(s => s.includes('事业') || s.includes('财运')) || '',
    wealth: sections.find(s => s.includes('财')) || '',
    love: sections.find(s => s.includes('感情') || s.includes('婚姻')) || '',
    health: sections.find(s => s.includes('健康')) || '',
    advice: sections.find(s => s.includes('建议')) || '',
    lucky: {
      colors: ['金色', '紫色', '蓝色'], // 可以从 AI 回复中提取
      numbers: [3, 6, 9],
      directions: ['东南', '正南'],
    },
  };
}

/**
 * 单排算命 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person1, readingType, person2 } = body;

    if (readingType === 'single') {
      // 单排
      const bazi = calculateBaZi(person1);
      const baziStr = formatBaZi(bazi);
      const elements = getFiveElementAnalysis(bazi);

      const prompt = generateFortunePrompt(baziStr, elements, person1.gender);
      const aiResponse = await callAI(prompt);
      const reading = parseFortuneReading(aiResponse);

      return NextResponse.json({
        success: true,
        data: {
          baZi: bazi,
          baZiStr: baziStr,
          fiveElements: elements,
          reading,
          rawResponse: aiResponse,
        },
      });
    } else if (readingType === 'compatibility' && person2) {
      // 合盘
      const bazi1 = calculateBaZi(person1);
      const bazi2 = calculateBaZi(person2);
      const baziStr1 = formatBaZi(bazi1);
      const baziStr2 = formatBaZi(bazi2);
      const elements1 = getFiveElementAnalysis(bazi1);
      const elements2 = getFiveElementAnalysis(bazi2);

      const prompt = generateCompatibilityPrompt(
        baziStr1, baziStr2, elements1, elements2,
        person1.name, person2.name
      );
      const aiResponse = await callAI(prompt);

      // 解析合盘结果
      const scoreMatch = aiResponse.match(/(\d{1,3})\s*分/);
      const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 70;

      const result: CompatibilityResult = {
        score,
        summary: aiResponse.slice(0, 300),
        strengths: ['性格互补', '价值观相似'],
        challenges: ['沟通方式需调整'],
        relationship: {
          love: '有较好的感情基础',
          business: '合作潜力中等',
          friendship: '容易成为好友',
        },
        advice: aiResponse.slice(-500),
      };

      return NextResponse.json({
        success: true,
        data: {
          person1: { baZi: bazi1, baZiStr: baziStr1, fiveElements: elements1 },
          person2: { baZi: bazi2, baZiStr: baziStr2, fiveElements: elements2 },
          result,
          rawResponse: aiResponse,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
