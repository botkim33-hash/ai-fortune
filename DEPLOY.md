# 🚀 Vercel 部署指南

## 1. 准备工作

### 安装依赖
```bash
cd ai-fortune
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env.local` 并填入你的 AI API Key：
```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```env
OPENAI_API_KEY=sk-your-api-key-here
```

## 2. 本地测试

```bash
npm run dev
```

访问 http://localhost:3000 测试功能。

## 3. 部署到 Vercel

### 方式一：Vercel CLI

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel --prod
```

### 方式二：GitHub + Vercel 自动部署

1. 创建 GitHub 仓库并推送代码
2. 登录 [Vercel Dashboard](https://vercel.com)
3. 点击 "Add New Project"
4. 导入 GitHub 仓库
5. 配置环境变量（在 Vercel 项目设置中添加 OPENAI_API_KEY）
6. 部署

## 4. 配置环境变量（Vercel）

在 Vercel Dashboard → Project Settings → Environment Variables 中添加：

| Name | Value |
|------|-------|
| OPENAI_API_KEY | sk-your-key |

## 5. 自定义域名（可选）

在 Vercel Dashboard → Domains 中添加你的域名。

---

## 📁 项目结构

```
ai-fortune/
├── src/
│   ├── app/
│   │   ├── api/fortune/route.ts    # API 路由
│   │   ├── globals.css             # 全局样式
│   │   ├── layout.tsx              # 根布局
│   │   └── page.tsx                # 首页
│   ├── components/
│   │   ├── FortuneForm.tsx         # 表单组件
│   │   └── FortuneResult.tsx       # 结果组件
│   ├── lib/
│   │   └── bazi.ts                 # 八字计算
│   └── types/
│       └── fortune.ts              # 类型定义
├── public/                         # 静态资源
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.example
```

## 🎨 设计特点

- 国风现代主义设计
- 深色主题 + 金色点缀
- 玻璃态效果
- 星空背景
- 流畅动效

## 🔧 技术栈

- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- OpenAI API

## ⚠️ 注意事项

1. **API Key 安全**：不要将 `.env.local` 提交到 GitHub
2. **免费额度**：注意 OpenAI API 的用量和费用
3. **八字算法**：当前为简化版，精准排盘需加入节气计算

---

有问题随时找 Kim 🐨
