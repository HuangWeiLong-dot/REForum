# 自动化部署指南

本项目支持两种自动化部署方式：

## 方式一：GitHub Actions 自动部署（推荐）

### 设置步骤

1. **在 GitHub 仓库中添加 Secrets**

   进入仓库 Settings → Secrets and variables → Actions，添加以下 secrets：

   - `SERVER_HOST`: 服务器 IP 地址（例如：`43.167.196.43`）
   - `SERVER_USER`: SSH 用户名（例如：`root`）
   - `SERVER_SSH_KEY`: SSH 私钥内容
   - `SERVER_PORT`: SSH 端口（可选，默认 22）

2. **生成 SSH 密钥对（如果还没有）**

   ```bash
   # 在本地生成密钥对
   ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions
   
   # 将公钥添加到服务器
   ssh-copy-id -i ~/.ssh/github_actions.pub root@43.167.196.43
   
   # 复制私钥内容（用于 GitHub Secrets）
   cat ~/.ssh/github_actions
   ```

3. **推送代码触发部署**

   每次推送到 `master` 分支时，GitHub Actions 会自动：
   - 拉取最新代码
   - 重新构建 Docker 镜像
   - 重启容器
   - 执行健康检查

### 手动触发部署

在 GitHub 仓库的 Actions 页面，可以手动触发部署工作流。

## 方式二：Webhook 自动部署

### 设置步骤

1. **在服务器上运行设置脚本**

   ```bash
   cd /opt/ReForum
   chmod +x scripts/setup-webhook-server.sh
   sudo ./scripts/setup-webhook-server.sh
   ```

2. **配置 GitHub Webhook**

   - 进入仓库 Settings → Webhooks → Add webhook
   - Payload URL: `http://YOUR_SERVER_IP:9000/hooks/reforum-deploy`
   - Content type: `application/json`
   - Secret: 设置一个密钥（与 `/etc/webhook/hooks.json` 中的一致）
   - Events: 选择 "Just the push event"
   - Active: ✓

3. **更新 Webhook Secret**

   ```bash
   sudo nano /etc/webhook/hooks.json
   # 将 "YOUR_WEBHOOK_SECRET" 替换为实际的密钥
   sudo systemctl restart webhook
   ```

4. **测试 Webhook**

   推送代码到 GitHub，webhook 会自动触发部署。

## 方式三：服务器端 Git Hook（最简单）

### 设置步骤

1. **在服务器上设置 Git Hook**

   ```bash
   cd /opt/ReForum
   chmod +x scripts/deploy.sh
   
   # 创建 post-receive hook
   cat > .git/hooks/post-receive << 'EOF'
   #!/bin/bash
   cd /opt/ReForum
   ./scripts/deploy.sh
   EOF
   
   chmod +x .git/hooks/post-receive
   ```

2. **配置本地 Git 远程仓库**

   ```bash
   # 添加服务器作为远程仓库
   git remote add deploy root@43.167.196.43:/opt/ReForum/.git
   
   # 或者使用 SSH URL
   git remote add deploy ssh://root@43.167.196.43/opt/ReForum
   ```

3. **推送代码**

   ```bash
   git push deploy master
   ```

## 部署脚本说明

### `scripts/deploy.sh`

服务器端部署脚本，执行以下操作：
- 拉取最新代码
- 停止现有容器
- 重新构建镜像
- 启动新容器
- 检查服务状态

### `scripts/webhook-deploy.sh`

Webhook 触发的部署脚本，功能与 `deploy.sh` 相同，但包含日志记录。

### `scripts/setup-webhook-server.sh`

设置 webhook 服务器的脚本，安装并配置 webhook 服务。

## 监控和日志

### 查看部署日志

```bash
# GitHub Actions 日志
# 在 GitHub 仓库的 Actions 页面查看

# Webhook 日志
sudo journalctl -u webhook -f

# 部署脚本日志
tail -f /var/log/reforum-deploy.log

# Docker 容器日志
cd /opt/ReForum
docker-compose logs -f
```

### 健康检查

```bash
# 检查后端健康状态
curl http://localhost:3000/health

# 检查前端
curl http://localhost
```

## 故障排查

### 部署失败

1. 检查 SSH 连接
   ```bash
   ssh root@43.167.196.43
   ```

2. 检查服务器磁盘空间
   ```bash
   df -h
   ```

3. 检查 Docker 状态
   ```bash
   docker ps
   docker-compose ps
   ```

4. 查看容器日志
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

### 回滚部署

```bash
cd /opt/ReForum
git log --oneline -5  # 查看提交历史
git checkout <previous-commit-hash>
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 安全建议

1. **使用 SSH 密钥认证**，不要使用密码
2. **限制 SSH 访问**，只允许特定 IP
3. **定期更新系统**和 Docker
4. **备份数据库**，部署前建议备份
5. **使用 HTTPS**，配置 SSL 证书
6. **保护 Webhook Secret**，不要泄露

## 推荐方案

- **开发环境**: 使用方式三（Git Hook），简单快速
- **生产环境**: 使用方式一（GitHub Actions），功能完整，有日志和通知

