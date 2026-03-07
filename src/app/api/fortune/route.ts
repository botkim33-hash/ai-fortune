import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, getFiveElementAnalysis, formatBaZi } from '@/lib/bazi';

const AI_API_KEY = process.env.OPENAI_API_KEY;
const AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    // 检查环境变量
    if (!AI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'API Key 未配置' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { person1, readingType, person2 } = body;

    if (!person1 || !readingType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (readingType === 'single') {
      // 单排
      const bazi = calculateBaZi(person1);
      const baziStr = formatBaZi(bazi);
      const elements = getFiveElementAnalysis(bazi);

      // 生成 AI Prompt
      const prompt = `你是一位精通八字命理、紫微斗数、五行学说的大师。请根据以下八字信息进行专业解读：

【八字排盘】
${baziStr}

【五行分析】
木: ${elements.wood} | 火: ${elements.fire} | 土: ${elements.earth} | 金: ${elements.metal} | 水: ${elements.water}

【求测者信息】
性别: ${person1.gender === 'male' ? '男' : '女'}

请从以下几个方面进行详细解读，用现代易懂的语言：
1. 总体概况 - 八字格局、喜用神
2. 性格分析 - 性格特点、优缺点
3. 事业运势 - 适合的行业、职业方向
4. 感情婚姻 - 感情特点、择偶建议
5. 开运建议 - 幸运颜色、数字、方位

请用中文回复，语气专业但不迷信，给出建设性的建议。`;

      // 调用 AI API
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一位专业的命理大师，精通八字、五行。请用现代、理性的语言进行解读，给出建设性的建议。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error:', response.status, errorText);
        return NextResponse.json(
          { success: false, error: `AI API 错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return NextResponse.json({
        success: true,
        data: {
          baZi: bazi,
          baZiStr,
          fiveElements: elements,
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

      const prompt = `你是一位精通八字合婚、命理配对的大师。请分析以下两人的八字配对情况：

【甲方】${person1.name || '第一方'}
八字: ${baziStr1}
五行: 木${elements1.wood} 火${elements1.fire} 土${elements1.earth} 金${elements1.metal} 水${elements1.water}

【乙方】${person2.name || '第二方'}
八字: ${baziStr2}
五行: 木${elements2.wood} 火${elements2.fire} 土${elements2.earth} 金${elements2.metal} 水${elements2.water}

请从以下几个方面进行专业分析：
1. 总体匹配度评分 (0-100分) 及简要评价
2. 性格互补性分析
3. 感情关系前景
4. 事业合作潜力
5. 增进关系的建议

请用中文回复，给出客观、建设性的分析。`;

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一位专业的命理大师，精通八字合婚。请用现代、理性的语言进行分析。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error:', response.status, errorText);
        return NextResponse.json(
          { success: false, error: `AI API 错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const scoreMatch = aiResponse.match(/(\d{1,3})\s*分/);
      const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 70;

      return NextResponse.json({
        success: true,
        data: {
          person1: { baZi: bazi1, baZiStr: baziStr1, fiveElements: elements1 },
          person2: { baZi: bazi2, baZiStr: baziStr2, fiveElements: elements2 },
          result: {
            score,
            summary: aiResponse.slice(0, 300),
            rawResponse: aiResponse,
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
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
