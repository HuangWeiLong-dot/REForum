# 通知功能数据库迁移

## 说明

此迁移脚本用于创建通知功能所需的数据库表。

## 运行迁移

### 方法 1: 使用 psql 直接执行

```bash
psql -U your_username -d reforum -f backend/migrations/add_notifications_table.sql
```

### 方法 2: 使用 Docker

```bash
docker exec -i reforum-db-1 psql -U your_username -d reforum < backend/migrations/add_notifications_table.sql
```

### 方法 3: 在 PostgreSQL 客户端中执行

1. 连接到数据库
2. 复制 `add_notifications_table.sql` 文件内容
3. 在客户端中执行

## 验证

迁移成功后，可以运行以下查询验证：

```sql
-- 检查表是否存在
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'notifications';

-- 检查索引
SELECT indexname FROM pg_indexes 
WHERE tablename = 'notifications';
```

## 回滚（如果需要）

如果需要删除通知表：

```sql
DROP TABLE IF EXISTS notifications CASCADE;
```

**注意：** 这将删除所有通知数据，请谨慎操作。

