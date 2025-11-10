# REForum 服务器部署指南

本指南将帮助您将 REForum 论坛系统部署到服务器上。

## 前置要求

- 服务器操作系统：Linux (Ubuntu 20.04+ 推荐)
- Docker 和 Docker Compose 已安装
- 服务器 IP: 43.167.196.43
- 域名（可选）

## 1. 服务器准备

### 1.1 安装 Docker 和 Docker Compose

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 1.2 配置防火墙

```bash
# 开放必要端口
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 3000/tcp  # 后端 API
sudo ufw allow 5432/tcp  # PostgreSQL (可选，建议仅内网访问)
sudo ufw enable
```

## 2. 上传项目文件

### 2.1 使用 Git (推荐)

```bash
# 在服务器上克隆项目
git clone <your-repository-url> REForum
cd REForum
```

### 2.2 或使用 SCP

```bash
# 从本地机器上传
scp -r /path/to/REForum user@43.167.196.43:/home/user/
```

## 3. 配置环境变量

### 3.1 修改 docker-compose.yml

确保 `docker-compose.yml` 中的配置正确：

- `DB_HOST=db` (Docker 服务名)
- `DB_NAME=forum_db`
- `DB_USER=HuangWeiLong`
- `DB_PASSWORD=20070511SuKiISuKiI`
- `JWT_SECRET` (请更改为强密钥)
- `RESEND_API_KEY` (如果需要邮件服务)

### 3.2 设置 JWT Secret (重要!)

```bash
# 生成强随机密钥
openssl rand -base64 32

# 在 docker-compose.yml 中替换 JWT_SECRET
```

### 3.3 设置 Resend API Key (可选)

如果需要邮件服务，在服务器上设置环境变量：

```bash
export RESEND_API_KEY=re_your_api_key_here
```

或在 `docker-compose.yml` 中直接设置。

## 4. 初始化数据库

### 4.1 确保 database_schema.sql 存在

检查项目根目录是否有 `database_schema.sql` 文件。

### 4.2 数据库将自动初始化

Docker Compose 配置已设置自动执行 SQL 脚本。

## 5. 构建和启动服务

### 5.1 构建 Docker 镜像

```bash
cd /path/to/REForum
docker-compose build
```

### 5.2 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 5.3 检查服务状态

```bash
# 检查容器状态
docker-compose ps

# 检查后端健康状态
curl http://localhost:3000/health

# 检查前端
curl http://localhost
```

## 6. 验证部署

### 6.1 访问应用

- 前端: http://43.167.196.43
- 后端 API: http://43.167.196.43:3000
- 健康检查: http://43.167.196.43:3000/health

### 6.2 测试 API

```bash
# 测试注册接口
curl -X POST http://43.167.196.43:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

## 7. 常用操作

### 7.1 停止服务

```bash
docker-compose down
```

### 7.2 重启服务

```bash
docker-compose restart
```

### 7.3 更新代码

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

### 7.4 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 7.5 进入容器

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入数据库容器
docker-compose exec db psql -U HuangWeiLong -d forum_db
```

## 8. 数据库管理

### 8.1 备份数据库

```bash
docker-compose exec db pg_dump -U HuangWeiLong forum_db > backup.sql
```

### 8.2 恢复数据库

```bash
docker-compose exec -T db psql -U HuangWeiLong forum_db < backup.sql
```

### 8.3 执行 SQL 脚本

```bash
docker-compose exec -T db psql -U HuangWeiLong forum_db < database_schema.sql
```

## 9. 故障排查

### 9.1 检查容器状态

```bash
docker-compose ps
```

### 9.2 查看错误日志

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### 9.3 检查数据库连接

```bash
# 进入数据库容器
docker-compose exec db psql -U HuangWeiLong -d forum_db

# 测试连接
\c forum_db
\dt  # 查看表
```

### 9.4 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

## 10. 安全建议

### 10.1 更改默认密码

- 修改数据库密码
- 修改 JWT_SECRET
- 使用强密码

### 10.2 配置 HTTPS

使用 Nginx 反向代理配置 HTTPS：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

### 10.3 限制数据库访问

在 `docker-compose.yml` 中，可以移除数据库的端口映射，仅允许内部访问：

```yaml
db:
  # ports:
  #   - "5432:5432"  # 注释掉，仅内部访问
```

### 10.4 设置环境变量文件

创建 `.env` 文件存储敏感信息：

```bash
# .env
JWT_SECRET=your_strong_secret_key
RESEND_API_KEY=your_resend_api_key
DB_PASSWORD=your_db_password
```

在 `docker-compose.yml` 中引用：

```yaml
environment:
  - JWT_SECRET=${JWT_SECRET}
  - RESEND_API_KEY=${RESEND_API_KEY}
```

## 11. 性能优化

### 11.1 启用 Gzip 压缩

已在前端 nginx 配置中启用。

### 11.2 设置资源缓存

已在前端 nginx 配置中设置静态资源缓存。

### 11.3 数据库连接池

后端已配置连接池，可根据需要调整 `config/database.js`。

## 12. 监控和维护

### 12.1 设置日志轮转

```bash
# 配置 Docker 日志驱动
# 在 docker-compose.yml 中添加：
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 12.2 定期备份

设置定时任务备份数据库：

```bash
# 添加到 crontab
0 2 * * * docker-compose exec -T db pg_dump -U HuangWeiLong forum_db > /backup/forum_$(date +\%Y\%m\%d).sql
```

## 13. 故障恢复

### 13.1 服务无法启动

1. 检查日志：`docker-compose logs`
2. 检查端口占用：`netstat -tulpn | grep :80`
3. 检查 Docker 状态：`docker ps -a`

### 13.2 数据库连接失败

1. 检查数据库容器状态
2. 检查环境变量配置
3. 检查网络连接：`docker-compose exec backend ping db`

### 13.3 前端无法访问后端

1. 检查后端服务是否运行
2. 检查 CORS 配置
3. 检查网络连接

## 14. 更新部署

### 14.1 更新代码

```bash
# 拉取最新代码
git pull

# 重新构建
docker-compose build

# 重启服务
docker-compose up -d
```

### 14.2 数据库迁移

如果需要更新数据库结构：

```bash
# 备份现有数据
docker-compose exec db pg_dump -U HuangWeiLong forum_db > backup.sql

# 执行新的 SQL 脚本
docker-compose exec -T db psql -U HuangWeiLong forum_db < new_schema.sql
```

## 15. 联系和支持

如遇问题，请检查：
1. Docker 日志
2. 应用程序日志
3. 数据库连接
4. 网络配置

---

**部署完成后，您的论坛系统将在 http://43.167.196.43 运行！** 🎉

