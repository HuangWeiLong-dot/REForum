# 通知功能设置指南

## 问题排查

如果遇到以下错误：
- `500 Internal Server Error` 在 `/api/notifications/unread-count`
- `500 Internal Server Error` 在 `/api/notifications`
- 创建帖子后其他用户没有收到通知

**最可能的原因：数据库表 `notifications` 还没有创建**

## 解决方案

### 步骤 1: 运行数据库迁移

执行以下命令创建 `notifications` 表：

```bash
# 方法 1: 使用 psql
psql -U your_username -d reforum -f backend/migrations/add_notifications_table.sql

# 方法 2: 使用 Docker
docker exec -i reforum-db-1 psql -U your_username -d reforum < backend/migrations/add_notifications_table.sql

# 方法 3: 在 PostgreSQL 客户端中执行
# 复制 backend/migrations/add_notifications_table.sql 的内容并执行
```

### 步骤 2: 验证表是否创建成功

```sql
-- 连接到数据库
psql -U your_username -d reforum

-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'notifications';

-- 应该返回：
--  table_name
-- --------------
--  notifications
```

### 步骤 3: 使用诊断脚本检查

```bash
cd backend
npm run check
```

这个脚本会检查：
- 数据库连接
- 所有必要的表（包括 notifications 表）
- 后端服务状态

### 步骤 4: 重启后端服务

迁移完成后，重启后端服务：

```bash
# 如果使用 npm
cd backend
npm run dev

# 如果使用 Docker
docker-compose restart backend
```

## 测试通知功能

1. **创建两个测试账户**
   - 账户 A：创建帖子
   - 账户 B：应该收到通知

2. **检查通知**
   - 使用账户 B 登录
   - 查看右上角的通知图标
   - 应该显示未读数量徽章
   - 点击查看通知列表

3. **查看后端日志**
   - 创建帖子时应该看到：`✅ 成功为 X 个用户创建通知`
   - 如果有错误，会显示详细的错误信息

## 常见问题

### Q: 迁移脚本执行失败
**A:** 检查：
- 数据库连接信息是否正确
- 是否有足够的权限创建表
- 表是否已经存在（如果存在，脚本会跳过）

### Q: 创建帖子后没有通知
**A:** 检查：
- 后端日志是否有错误信息
- 是否有其他用户（除了发帖人）
- notifications 表是否已创建

### Q: 通知 API 返回 500 错误
**A:** 检查：
- notifications 表是否存在
- 后端日志中的详细错误信息
- 数据库连接是否正常

## 数据库表结构

`notifications` 表包含以下字段：
- `id` - 通知 ID（主键）
- `user_id` - 接收通知的用户 ID
- `type` - 通知类型（目前支持 'new_post'）
- `title` - 通知标题
- `content` - 通知内容（帖子标题）
- `related_post_id` - 关联的帖子 ID
- `related_user_id` - 关联的用户 ID（发帖人）
- `is_read` - 是否已读
- `created_at` - 创建时间
- `updated_at` - 更新时间

## 技术支持

如果问题仍然存在，请：
1. 查看后端日志的详细错误信息
2. 运行 `npm run check` 诊断脚本
3. 检查数据库连接和权限

