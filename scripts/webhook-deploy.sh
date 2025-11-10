#!/bin/bash

# GitHub Webhook 部署脚本
# 配置 GitHub Webhook 指向此脚本的 HTTP 端点

set -e

PROJECT_DIR="/opt/ReForum"
LOG_FILE="/var/log/reforum-deploy.log"

# 记录日志
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Deployment triggered ==="

cd "$PROJECT_DIR" || exit 1

log "Pulling latest code..."
git pull origin master

log "Stopping containers..."
docker-compose down

log "Building images..."
docker-compose build --no-cache

log "Starting containers..."
docker-compose up -d

log "Waiting for services..."
sleep 10

log "Checking health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "✅ Deployment successful!"
else
    log "❌ Health check failed!"
    docker-compose logs --tail=50
    exit 1
fi

log "=== Deployment completed ==="

