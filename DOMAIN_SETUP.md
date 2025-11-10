# 域名配置指南

## 域名信息

- **主域名**: `reforum.space`
- **API 子域名**: `api.reforum.space`（推荐）

## DNS 解析配置

### 方案一：使用子域名（推荐）

**DNS 记录配置：**

```
类型    主机记录    记录值          说明
A       @          43.167.196.43   主域名指向服务器
A       www        43.167.196.43   www 子域名
A       api        43.167.196.43   API 子域名
```

**访问地址：**
- 前端：`http://reforum.space` 或 `http://www.reforum.space`
- API：`http://api.reforum.space`

**注意**：当前使用 HTTP，配置 SSL 证书后可升级到 HTTPS

### 方案二：使用路径（如果不想用子域名）

**DNS 记录配置：**

```
类型    主机记录    记录值          说明
A       @          43.167.196.43   主域名指向服务器
A       www        43.167.196.43   www 子域名
```

**访问地址：**
- 前端：`http://reforum.space`
- API：`http://reforum.space:3000` 或通过 Nginx 反向代理

## 已更新的配置

### 1. docker-compose.yml
- ✅ `VITE_API_BASE_URL`: 更新为 `http://api.reforum.space/api`
- ✅ `FRONTEND_URL`: 更新为 `http://reforum.space`
- ✅ `APP_URL`: 更新为 `http://api.reforum.space`

### 2. frontend/Dockerfile
- ✅ `VITE_API_BASE_URL`: 更新为 `http://api.reforum.space/api`

### 3. frontend/nginx.conf
- ✅ `server_name`: 更新为 `reforum.space www.reforum.space`

## 需要额外配置

### 1. Nginx 反向代理（推荐）

如果使用子域名方案，需要在服务器上配置 Nginx 反向代理：

**创建 `/etc/nginx/sites-available/reforum.space`：**

```nginx
# 前端服务
server {
    listen 80;
    server_name reforum.space www.reforum.space;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API 服务
server {
    listen 80;
    server_name api.reforum.space;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用配置：**

```bash
sudo ln -s /etc/nginx/sites-available/reforum.space /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. SSL 证书配置（HTTPS）

**使用 Let's Encrypt 免费证书：**

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 为域名申请证书
sudo certbot --nginx -d reforum.space -d www.reforum.space -d api.reforum.space

# 自动续期
sudo certbot renew --dry-run
```

**更新 Nginx 配置支持 HTTPS：**

```nginx
# 前端服务
server {
    listen 80;
    server_name reforum.space www.reforum.space;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reforum.space www.reforum.space;
    
    ssl_certificate /etc/letsencrypt/live/reforum.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reforum.space/privkey.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API 服务
server {
    listen 80;
    server_name api.reforum.space;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.reforum.space;
    
    ssl_certificate /etc/letsencrypt/live/reforum.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reforum.space/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 更新 Docker Compose 端口映射

如果使用 Nginx 反向代理，可以移除端口映射，让服务只在内部网络访问：

```yaml
frontend:
  ports:
    - "127.0.0.1:80:80"  # 只监听本地，通过 Nginx 代理

backend:
  ports:
    - "127.0.0.1:3000:3000"  # 只监听本地，通过 Nginx 代理
```

## 部署步骤

1. **确认 DNS 解析已生效**
   ```bash
   nslookup reforum.space
   nslookup api.reforum.space
   ```

2. **配置 Nginx 反向代理**（如果使用子域名）

3. **申请 SSL 证书**（推荐使用 HTTPS）

4. **更新代码并重新部署**
   ```bash
   cd /opt/ReForum
   git pull origin master
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

5. **测试访问**
   - 前端：`http://reforum.space`
   - API：`http://api.reforum.space/health`

## 注意事项

1. **DNS 解析生效时间**：通常需要几分钟到几小时
2. **当前使用 HTTP**：配置暂时使用 HTTP，等 SSL 证书配置好后可升级到 HTTPS
3. **SSL 证书**：Let's Encrypt 证书每 90 天需要续期（配置 HTTPS 时）
4. **CORS 配置**：后端已配置允许 `http://reforum.space` 访问
5. **环境变量**：确保所有环境变量使用 HTTP URL（当前）或 HTTPS URL（配置 SSL 后）

## 升级到 HTTPS

配置 SSL 证书后，需要将以下配置改为 HTTPS：

1. **docker-compose.yml**：
   - `VITE_API_BASE_URL`: `http://` → `https://`
   - `FRONTEND_URL`: `http://` → `https://`
   - `APP_URL`: `http://` → `https://`

2. **frontend/Dockerfile**：
   - `VITE_API_BASE_URL`: `http://` → `https://`

3. **重新构建和部署**：
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 验证配置

```bash
# 检查 DNS 解析
dig reforum.space
dig api.reforum.space

# 检查端口监听
sudo netstat -tulpn | grep -E '80|3000'

# 检查 Nginx 配置
sudo nginx -t

# 检查 SSL 证书
sudo certbot certificates
```

