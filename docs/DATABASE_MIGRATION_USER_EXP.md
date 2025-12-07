# 用户经验值和获赞数功能 - 数据库迁移文档

## 概述

本次更新为系统添加了用户经验值（exp）和获赞数（receivedLikes）功能，用于支持用户等级系统和统计功能。

## 数据库变更

### 迁移脚本

执行以下迁移脚本以更新数据库结构：

```bash
psql -U postgres -d reforum -f backend/migrations/add_user_exp_and_received_likes.sql
```

或者直接在数据库中执行 `backend/migrations/add_user_exp_and_received_likes.sql` 文件。

### 变更内容

1. **添加 `exp` 字段到 `users` 表**
   - 类型：`INTEGER`
   - 默认值：`0`
   - 非空：`NOT NULL`
   - 用途：存储用户经验值，用于等级系统计算

2. **创建 `user_received_likes` 视图**
   - 统计每个用户发布的所有帖子收到的点赞总数
   - 通过 JOIN `posts` 和 `post_likes` 表计算

3. **创建索引**
   - `idx_users_exp`：优化经验值查询性能（用于等级排行榜）

## API 变更

### 用户资料接口

#### GET /users/profile
返回的用户资料现在包含以下新字段：
- `exp` (integer): 用户经验值
- `receivedLikes` (integer): 用户收到的总点赞数
- `tag` (string): 用户标签/称号（已存在，现在在API文档中明确说明）
- `usernameUpdatedAt` (string, nullable): 用户名最后修改时间
- `tagUpdatedAt` (string, nullable): 称号最后修改时间

#### GET /users/{userId}
公开用户资料现在包含以下新字段：
- `exp` (integer): 用户经验值
- `receivedLikes` (integer): 用户收到的总点赞数
- `tag` (string): 用户标签/称号

#### PUT /users/profile
更新用户资料请求现在支持以下新字段：
- `username` (string): 用户名（30天内只能修改一次）
- `tag` (string): 用户标签/称号（30天内只能修改一次）

## 后端代码变更

### 模型层 (User.js)

1. **findById**: 查询结果现在包含 `exp` 字段
2. **create**: 新用户创建时默认 `exp = 0`
3. **update**: 支持更新用户资料（avatar, bio, username, tag）
4. **getStats**: 现在返回 `received_likes` 统计
5. **getProfile**: 返回完整的用户资料，包含 `exp` 和 `receivedLikes`
6. **getPublicProfile**: 返回公开用户资料，包含 `exp` 和 `receivedLikes`

### 控制器层 (userController.js)

1. **getProfile**: 返回包含 `exp` 和 `receivedLikes` 的用户资料
2. **updateProfile**: 支持更新 `username` 和 `tag`，包含30天修改限制检查
3. **getPublicProfile**: 返回包含 `exp` 和 `receivedLikes` 的公开用户资料

## OpenAPI 文档更新

已更新 `openapi.yaml` 文件，包含以下变更：

1. **UserProfile Schema**: 添加了 `exp`, `tag`, `receivedLikes`, `usernameUpdatedAt`, `tagUpdatedAt` 字段
2. **PublicUserProfile Schema**: 添加了 `exp`, `tag`, `receivedLikes` 字段
3. **UpdateProfileRequest Schema**: 添加了 `username` 和 `tag` 字段

## 前端功能

前端已实现以下功能（本次更新仅更新后端以支持这些功能）：

1. **用户等级系统**
   - 经验值（exp）显示
   - 等级计算（1-70级）
   - 等级徽章显示
   - 经验进度条

2. **用户标签/称号**
   - 可编辑的用户标签
   - 特殊"官方"标签样式
   - 30天修改限制

3. **用户统计**
   - 帖子数
   - 评论数
   - 获赞数（receivedLikes）

4. **用户资料编辑**
   - 头像上传
   - 简介编辑
   - 标签编辑

## 注意事项

1. **数据迁移**
   - 现有用户的 `exp` 字段将自动设置为 0
   - `receivedLikes` 通过视图自动计算，无需手动更新

2. **性能考虑**
   - `user_received_likes` 视图会在每次查询时计算，对于大量数据可能需要优化
   - 已创建索引以优化查询性能

3. **兼容性**
   - 所有新字段都是可选的或具有默认值
   - API 向后兼容，不会破坏现有功能

## 测试建议

1. 执行数据库迁移脚本
2. 验证新用户注册时 `exp` 默认为 0
3. 验证用户资料接口返回 `exp` 和 `receivedLikes`
4. 验证用户资料更新接口支持 `username` 和 `tag`
5. 验证30天修改限制功能
6. 验证 `user_received_likes` 视图正确计算获赞数

## 回滚方案

如果需要回滚，可以执行以下SQL：

```sql
-- 删除视图
DROP VIEW IF EXISTS user_received_likes;

-- 删除索引
DROP INDEX IF EXISTS idx_users_exp;

-- 删除字段（注意：会丢失数据）
ALTER TABLE users DROP COLUMN IF EXISTS exp;
```

