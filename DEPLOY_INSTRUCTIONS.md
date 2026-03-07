# AI Fortune Platform - Vercel 部署

## 项目信息
- **项目路径**: ~/.openclaw/workspace/projects/ai-fortune
- **框架**: Next.js 14
- **部署目标**: Vercel

## 已配置环境变量
```
OPENAI_API_KEY=sk-BTub47uvhXPPlnJpC03530076cAb42D28c86526bEaF22d64
OPENAI_API_URL=https://api.vveai.com/v1/chat/completions
```

## 部署步骤

### 1. 打开终端，进入项目目录
```bash
cd ~/.openclaw/workspace/projects/ai-fortune
```

### 2. 登录 Vercel
```bash
vercel login
```
- 按提示在浏览器中完成授权

### 3. 部署项目
```bash
vercel --prod
```

### 4. 配置环境变量（如需要）
部署后，在 Vercel Dashboard 中添加：
- OPENAI_API_KEY
- OPENAI_API_URL

## 项目结构
- 首页: 选择单排/合盘
- 表单: 填写生辰信息
- API: /api/fortune (AI 解读)
- 结果: 展示八字 + AI 分析

## 功能
✅ 八字排盘计算
✅ AI 智能解读
✅ 双人合盘配对
✅ 国风现代设计

---
请主人在本地终端运行上述命令完成部署 🚀
