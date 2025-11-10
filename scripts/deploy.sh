#!/bin/bash

# 自动化部署脚本
# 在服务器上运行此脚本来自动部署应用

set -e  # 遇到错误立即退出

echo "🚀 Starting deployment..."

# 配置
PROJECT_DIR="/opt/ReForum"
COMPOSE_FILE="docker-compose.yml"

# 进入项目目录
cd "$PROJECT_DIR" || exit 1

echo "📦 Pulling latest code from GitHub..."
git pull origin master

echo "🛑 Stopping existing containers..."
docker-compose down

echo "🔨 Building new images..."
docker-compose build --no-cache

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "📋 Checking container status..."
docker-compose ps

echo "📊 Recent logs:"
docker-compose logs --tail=30

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://$(hostname -I | awk '{print $1}')"
echo "🔧 Backend API: http://$(hostname -I | awk '{print $1}'):3000"

