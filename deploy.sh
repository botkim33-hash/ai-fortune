#!/bin/bash

# AI Fortune Platform 部署脚本
# 用于在 Vercel 上部署

echo "🚀 开始部署 AI Fortune Platform..."

# 检查环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    
    # 检查 vercel CLI
    if command -v vercel &> /dev/null; then
        echo "🚀 部署到 Vercel..."
        vercel --prod
    else
        echo "⚠️ 未安装 Vercel CLI"
        echo "请运行: npm i -g vercel"
        echo "然后运行: vercel --prod"
    fi
else
    echo "❌ 构建失败"
    exit 1
fi
