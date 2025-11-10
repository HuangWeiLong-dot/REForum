# 升级到 HTTPS 指南

## SSL 证书已配置

✅ 已为以下域名配置 SSL 证书：
- `reforum.space`
- `www.reforum.space`

## 下一步：为 API 子域名申请证书

在服务器上运行：

```bash
sudo certbot --nginx -d api.reforum.space
```

## 更新代码配置为 HTTPS

证书配置完成后，需要更新以下配置：

### 1. docker-compose.yml
- `VITE_API_BASE_URL`: `http://api.reforum.space/api` → `https://api.reforum.space/api`
- `FRONTEND_URL`: `http://reforum.space` → `https://reforum.space`
- `APP_URL`: `http://api.reforum.space` → `https://api.reforum.space`

### 2. frontend/Dockerfile
- `VITE_API_BASE_URL`: `http://api.reforum.space/api` → `https://api.reforum.space/api`

### 3. 重新构建和部署

```bash
cd /opt/ReForum
git pull origin master
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 验证 HTTPS

访问以下地址确认 HTTPS 正常工作：
- 前端：`https://reforum.space`
- API：`https://api.reforum.space/health`

