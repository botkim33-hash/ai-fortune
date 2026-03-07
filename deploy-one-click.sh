#!/bin/bash
# AI Fortune Platform - 一键部署脚本
# 运行后自动完成：GitHub登录 → 创建仓库 → 推送代码 → Vercel部署

echo "🚀 AI Fortune Platform 一键部署"
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="$HOME/.openclaw/workspace/projects/ai-fortune"

echo ""
echo "${BLUE}步骤 1/4: 检查 GitHub CLI${NC}"
if ! command -v gh &> /dev/null; then
    echo "正在安装 GitHub CLI..."
    brew install gh
fi

echo ""
echo "${BLUE}步骤 2/4: 登录 GitHub${NC}"
echo "${YELLOW}请按提示在浏览器中完成授权...${NC}"
gh auth login --hostname github.com --web

# 检查登录状态
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub 登录失败，请重试"
    exit 1
fi

echo ""
echo "${GREEN}✅ GitHub 登录成功!${NC}"

# 获取用户名
GITHUB_USER=$(gh api user -q .login)
echo "用户名: $GITHUB_USER"

# 进入项目目录
cd "$PROJECT_DIR" || exit 1

echo ""
echo "${BLUE}步骤 3/4: 创建 GitHub 仓库${NC}"
REPO_NAME="ai-fortune"

# 检查仓库是否已存在
if gh repo view "$GITHUB_USER/$REPO_NAME" &> /dev/null; then
    echo "仓库已存在，使用现有仓库"
else
    echo "创建新仓库: $REPO_NAME"
    gh repo create "$REPO_NAME" --public --source=. --push
fi

echo ""
echo "${GREEN}✅ 代码已推送到 GitHub!${NC}"
echo "仓库地址: https://github.com/$GITHUB_USER/$REPO_NAME"

echo ""
echo "${BLUE}步骤 4/4: 部署到 Vercel${NC}"

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 登录 Vercel（如果未登录）
echo "${YELLOW}请按提示在浏览器中完成 Vercel 授权...${NC}"
vercel login

echo ""
echo "正在部署..."
vercel --prod --yes

echo ""
echo "${GREEN}================================${NC}"
echo "${GREEN}🎉 部署完成!${NC}"
echo "${GREEN}================================${NC}"
echo ""
echo "项目地址: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "${YELLOW}提示：首次部署后，请在 Vercel Dashboard 中检查环境变量:${NC}"
echo "  - OPENAI_API_KEY"
echo "  - OPENAI_API_URL"
echo ""
