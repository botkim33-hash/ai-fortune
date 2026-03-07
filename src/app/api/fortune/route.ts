import { NextRequest, NextResponse } from 'next/server';

const AI_API_KEY = process.env.OPENAI_API_KEY;
const AI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

// 使用更强的模型
const MODEL = 'gpt-4-turbo-preview'; // 或 'gpt-4'，视 API 支持而定

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
    const formatPersonInfo = (p: any, label: string) => {
      const timeStr = p.hour >= 0 
        ? `${p.hour.toString().padStart(2, '0')}:${(p.minute || 0).toString().padStart(2, '0')}`
        : '时辰未知';
      return `【${label}】
姓名: ${p.name || '未填写'}
性别: ${p.gender === 'male' ? '男' : '女'}
出生时间: ${p.year}年${p.month}月${p.day}日 ${timeStr}
出生地: ${p.birthPlace || '未填写'}`;
    };

    if (readingType === 'single') {
      // 单排 - 使用 GPT-4 进行详细分析
      const prompt = `你是一位精通子平八字、紫微斗数、五行学说的大师，拥有30年命理研究经验。

请根据以下用户的出生信息，进行专业的八字命理分析。

${formatPersonInfo(person1, '求测者')}

请提供以下详细分析（使用 Markdown 格式）：

## 一、八字排盘
1. **四柱八字**：年柱、月柱、日柱、时柱（天干地支）
2. **藏干分析**：各地支藏干
3. **十神分析**：比肩、劫财、食神、伤官、偏财、正财、七杀、正官、偏印、正印
4. **日主强弱**：判断日主旺衰
5. **五行统计**：金木水火土各自数量
6. **喜用神**：喜神、用神、忌神分析

## 二、命局分析
1. **格局判断**：如正官格、七杀格、财格、印格等
2. **性格特征**：详细性格分析
3. **天赋才能**：适合的发展方向
4. **人生课题**：需要注意的人生课题

## 三、大运分析（至关重要）
请排出大运表（每步大运10年）：
- 起运年龄
- 每步大运的天干地支
- 每步大运的年龄范围（如 3-12岁、13-22岁等）
- 每步大运的吉凶分析
- 特别重要的大运年份提示

## 四、流年分析
- 当前流年分析
- 未来3-5年运势预测
- 重要流年提示

## 五、事业财运
- 适合的行业方向
- 财运走势
- 事业高峰期

## 六、婚姻感情
- 配偶特征
- 婚恋时机
- 感情注意事项

## 七、健康提示
- 五行与健康对应
- 需要注意的身体部位
- 养生建议

## 八、开运建议
- 幸运颜色
- 幸运数字
- 幸运方位
- 有利行业
- 开运饰品

请用专业但易懂的语言，给出详细、准确的分析。分析要深入，不要泛泛而谈。`;

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
              content: '你是一位资深命理大师，精通子平八字、紫微斗数、五行生克。你的分析要准确、详细、专业，特别注重大运流年的推算。请确保八字排盘的准确性。'
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5, // 降低随机性，提高准确性
          max_tokens: 4000, // 增加输出长度以容纳详细分析
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
          personInfo: person1,
          rawResponse: aiResponse,
        },
      });

    } else if (readingType === 'compatibility' && person2) {
      // 合盘 - 使用 GPT-4 进行详细合婚分析
      const prompt = `你是一位精通八字合婚、命理配对的大师，拥有30年合婚研究经验。

请根据以下两人的出生信息，进行专业的八字合盘分析。

${formatPersonInfo(person1, '甲方')}

${formatPersonInfo(person2, '乙方')}

请提供以下详细分析（使用 Markdown 格式）：

## 一、双方八字排盘
1. **甲方八字**：四柱、日主、五行
2. **乙方八字**：四柱、日主、五行
3. **双方日主关系**：天干地支合冲分析

## 二、八字合婚分析
1. **年柱合婚**：祖上、家庭背景匹配度
2. **月柱合婚**：性格、价值观匹配度
3. **日柱合婚**：夫妻宫分析（最重要）
4. **时柱合婚**：子女、晚年运势

## 三、五行互补分析
- 双方五行互补性
- 谁旺谁、谁克谁
- 如何调和

## 四、纳音合婚
- 年命纳音分析
- 纳音生克关系

## 五、神煞合婚
- 桃花分析
- 红鸾天喜
- 孤辰寡宿
- 其他重要神煞

## 六、综合匹配度评分
- 总分：XX/100
- 分项评分：性格、感情、事业、财运、健康

## 七、不同关系维度分析
1. **感情婚姻**：恋爱、婚姻前景、相处之道
2. **事业合作**：合作潜力、分工建议
3. **朋友关系**：友谊持久度
4. **亲子关系**：如适用

## 八、大运流年同步分析
- 双方大运同步性
- 重要时间节点
- 共同运势高峰期

## 九、注意事项
- 需要磨合的方面
- 化解冲突的建议
- 增进感情的方法

## 十、合婚建议
- 是否适合结婚
- 最佳结婚时间
- 婚后注意事项

请给出客观、专业、详细的分析。`;

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
              content: '你是一位资深合婚大师，精通八字合婚、纳音五行、神煞合婚。你的分析要准确、详细、专业，注重实际可行性。'
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 4000,
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
