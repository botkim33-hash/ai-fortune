import { NextRequest, NextResponse } from 'next/server';

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

    // 构建用户信息的字符串
    const formatPersonInfo = (p: any) => {
      return `姓名: ${p.name || '未知'}
性别: ${p.gender === 'male' ? '男' : '女'}
出生时间: ${p.year}年${p.month}月${p.day}日 ${p.hour >= 0 ? p.hour + ':00' : '时辰未知'}`;
    };

    if (readingType === 'single') {
      // 单排 - 让 AI 计算八字并解读
      const prompt = `你是一位精通八字命理、紫微斗数、五行学说的大师。

请根据以下用户的出生信息，完成以下任务：
1. 计算八字（年柱、月柱、日柱、时柱）
2. 分析五行分布
3. 进行完整的命理解读

【用户信息】
${formatPersonInfo(person1)}

请按以下格式输出：

## 八字排盘
- 年柱: [天干][地支]
- 月柱: [天干][地支]
- 日柱: [天干][地支]
- 时柱: [天干][地支]
- 八字: [完整八字]

## 五行分析
- 木: X个
- 火: X个
- 土: X个
- 金: X个
- 水: X个
- 喜用神: [分析]

## 总体概况
[八字格局、命格特点]

## 性格分析
[性格特点、优缺点、处事风格]

## 事业运势
[适合的行业、职业发展方向]

## 感情婚姻
[感情特点、择偶建议]

## 开运建议
- 幸运颜色: [颜色]
- 幸运数字: [数字]
- 幸运方位: [方位]

请用中文回复，语气专业但不迷信，给出建设性的建议。`;

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: '你是一位专业的命理大师，精通八字排盘、五行分析和紫微斗数。请准确计算八字并进行专业解读。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
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

      // 解析八字
      const baZiMatch = aiResponse.match(/八字[:：]\s*([\u4e00-\u9fa5\s]+)/);
      const baZiStr = baZiMatch ? baZiMatch[1].trim() : '';

      return NextResponse.json({
        success: true,
        data: {
          personInfo: person1,
          baZiStr,
          rawResponse: aiResponse,
        },
      });

    } else if (readingType === 'compatibility' && person2) {
      // 合盘 - 让 AI 计算双方八字并分析配对
      const prompt = `你是一位精通八字合婚、命理配对的大师。

请根据以下两人的出生信息，完成以下任务：
1. 分别计算两人的八字
2. 分析双方五行互补性
3. 进行合盘配对分析

【甲方信息】
${formatPersonInfo(person1)}

【乙方信息】
${formatPersonInfo(person2)}

请按以下格式输出：

## 双方八字
- 甲方八字: [八字]
- 乙方八字: [八字]

## 匹配度评分
总分: XX分/100分

## 总体评价
[综合分析]

## 性格互补性
[分析]

## 感情关系前景
[分析]

## 事业合作潜力
[分析]

## 需要注意的冲突点
[分析]

## 增进关系的建议
[具体建议]

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
            { role: 'system', content: '你是一位专业的命理大师，精通八字合婚和配对分析。请准确计算双方八字并进行专业合盘分析。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
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

      // 解析匹配度
      const scoreMatch = aiResponse.match(/(\d{1,3})\s*分/);
      const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 70;

      return NextResponse.json({
        success: true,
        data: {
          person1Info: person1,
          person2Info: person2,
          result: {
            score,
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
