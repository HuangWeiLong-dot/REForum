# 故障排查指南

## 后端数据加载不出来 - 常见问题解决方案

### 1. 检查后端服务是否运行

**问题症状：** 前端显示"无法连接到服务器"或帖子列表为空

**解决步骤：**

1. **确认后端服务已启动**
   ```bash
   cd backend
   npm run dev
   ```
   
   应该看到类似输出：
   ```
   🚀 服务器运行在端口 3000
   📡 API 地址: http://localhost:3000/api
   💚 健康检查: http://localhost:3000/health
   ```

2. **使用诊断脚本检查**
   ```bash
   cd backend
   npm run check
   ```
   
   这个脚本会检查：
   - 环境变量配置
   - 数据库连接
   - 后端服务状态

### 2. 检查数据库连接

**问题症状：** 后端服务运行但返回 500 错误

**解决步骤：**

1. **确认 PostgreSQL 服务运行**
   - Windows: 检查服务管理器中的 PostgreSQL 服务
   - Linux/Mac: `sudo systemctl status postgresql` 或 `brew services list`

2. **检查数据库配置**
   
   在 `backend/` 目录下创建 `.env` 文件（如果不存在）：
   ```env
   # 数据库配置
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=reforum
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT 配置
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   
   # 服务器配置
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

3. **测试数据库连接**
   ```bash
   cd backend
   npm run check
   ```

### 3. 检查前端 API 配置

**问题症状：** 前端无法连接到后端 API

**解决步骤：**

1. **检查前端环境变量**
   
   在 `frontend/` 目录下创建 `.env` 文件（如果不存在）：
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. **确认 API 地址正确**
   
   打开浏览器开发者工具（F12），查看 Network 标签：
   - 检查 API 请求的 URL 是否正确
   - 查看是否有 CORS 错误
   - 检查响应状态码

3. **测试 API 连接**
   
   在浏览器中访问：
   ```
   http://localhost:3000/health
   ```
   
   应该返回：
   ```json
   {
     "status": "ok",
     "message": "服务运行正常",
     "database": "connected"
   }
   ```

### 4. 检查数据库表是否存在

**问题症状：** 数据库连接成功但查询失败

**解决步骤：**

1. **检查数据库表**
   ```sql
   -- 连接到数据库
   psql -U postgres -d reforum
   
   -- 查看所有表
   \dt
   
   -- 应该看到以下表：
   -- users, posts, comments, categories, tags, post_tags, post_likes, post_views, notifications
   ```

2. **如果表不存在，运行初始化脚本**
   ```bash
   # 查看数据库初始化脚本
   cat database_schema.sql
   
   # 或使用 Docker Compose 自动初始化
   docker-compose up -d
   ```

### 5. 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| `ECONNREFUSED` | 无法连接到服务器 | 确认后端服务已启动 |
| `500 INTERNAL_ERROR` | 服务器内部错误 | 查看后端日志，检查数据库连接 |
| `404 NOT_FOUND` | API 路由不存在 | 检查路由配置 |
| `401 UNAUTHORIZED` | 未授权 | 检查 JWT token 是否有效 |
| `429 TOO_MANY_REQUESTS` | 请求过于频繁 | 等待一段时间后重试 |

### 6. 使用 Docker 一键启动（推荐）

如果本地环境配置复杂，可以使用 Docker：

```bash
# 在项目根目录
docker-compose up -d --build

# 查看日志
docker-compose logs -f backend

# 检查服务状态
docker-compose ps
```

### 7. 调试技巧

1. **查看后端日志**
   - 后端控制台会显示所有请求和错误
   - 注意查看数据库连接错误信息

2. **查看浏览器控制台**
   - F12 打开开发者工具
   - Console 标签查看 JavaScript 错误
   - Network 标签查看 API 请求详情

3. **测试 API 端点**
   ```bash
   # 使用 curl 测试
   curl http://localhost:3000/api/posts
   
   # 或使用浏览器直接访问
   http://localhost:3000/api/posts
   ```

### 8. 快速检查清单

- [ ] 后端服务正在运行（`npm run dev`）
- [ ] 数据库服务正在运行
- [ ] `backend/.env` 文件存在且配置正确
- [ ] `frontend/.env` 文件存在且配置正确（可选）
- [ ] 数据库表已创建
- [ ] 端口 3000 未被其他程序占用
- [ ] 防火墙允许本地连接

### 9. 通知功能问题

**问题症状：** 通知 API 返回 500 错误，或创建帖子后没有通知

**解决步骤：**

1. **检查 notifications 表是否存在**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'notifications';
   ```

2. **如果表不存在，运行迁移脚本**
   ```bash
   psql -U your_username -d reforum -f backend/migrations/add_notifications_table.sql
   ```

3. **查看详细设置指南**
   - 参考 `docs/NOTIFICATION_SETUP.md` 获取完整的设置说明

### 10. 获取帮助

如果以上步骤都无法解决问题：

1. 运行诊断脚本并查看完整输出：
   ```bash
   cd backend
   npm run check
   ```

2. 查看后端日志中的详细错误信息

3. 检查 GitHub Issues 或联系项目维护者

