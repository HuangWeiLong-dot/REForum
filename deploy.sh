#!/bin/bash

# REForum 部署脚本
# 使用方法: ./deploy.sh

set -e

echo "🚀 开始部署 REForum..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查 database_schema.sql 是否存在
if [ ! -f "database_schema.sql" ]; then
    echo "⚠️  警告: database_schema.sql 文件不存在"
    echo "数据库将不会自动初始化"
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker-compose build --no-cache

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 检查后端健康状态
echo "💚 检查后端健康状态..."
sleep 5
curl -f http://localhost:3000/health || echo "⚠️  后端健康检查失败"

# 显示日志
echo "📋 显示服务日志..."
docker-compose logs --tail=50

echo ""
echo "✅ 部署完成！"
echo "🌐 前端访问: http://43.167.196.43"
echo "🔌 后端 API: http://43.167.196.43:3000"
echo "💚 健康检查: http://43.167.196.43:3000/health"
echo ""
echo "📝 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo "🔄 重启服务: docker-compose restart"

