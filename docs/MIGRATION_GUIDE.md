# 数据库迁移（Docker 部署版）

仅保留 Docker 场景，按版本列出脚本与执行顺序。

## 通用参数
- 数据库名：`forum_db`
- 数据库用户：`HuangWeiLong`
- 容器名示例：`reforum-db-1`（请以 `docker ps | grep postgres` 实际结果为准）
- 所有脚本可安全重复执行（均含 IF NOT EXISTS/EXISTS）

## 版本清单

### v1.9.0（4 个脚本，按序执行）
1) `add_user_tag_column.sql`
2) `add_username_tag_update_tracking.sql`
3) `add_user_exp_and_received_likes.sql`（依赖 post_likes 表）
4) `add_user_tag_unique_constraint.sql`（依赖 tag 字段和 post_likes 表）

### v1.9.5（1 个新增脚本）
1) `add_daily_tasks_table.sql`

## Docker 执行命令（推荐）

```bash
# 查看容器名称
docker ps | grep postgres

# 进入项目根目录后（示例容器名：reforum-db-1）
# v1.9.0
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_user_tag_column.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_username_tag_update_tracking.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_user_exp_and_received_likes.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_user_tag_unique_constraint.sql

# v1.9.5
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db < backend/migrations/add_daily_tasks_table.sql
```

## 容器内执行（可选）

```bash
# 复制脚本进容器
docker cp backend/migrations/add_user_tag_column.sql reforum-db-1:/tmp/
docker cp backend/migrations/add_username_tag_update_tracking.sql reforum-db-1:/tmp/
docker cp backend/migrations/add_user_exp_and_received_likes.sql reforum-db-1:/tmp/
docker cp backend/migrations/add_user_tag_unique_constraint.sql reforum-db-1:/tmp/
docker cp backend/migrations/add_daily_tasks_table.sql reforum-db-1:/tmp/

# 容器内执行
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -f /tmp/add_user_tag_column.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -f /tmp/add_username_tag_update_tracking.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -f /tmp/add_user_exp_and_received_likes.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -f /tmp/add_user_tag_unique_constraint.sql
docker exec -i reforum-db-1 psql -U HuangWeiLong -d forum_db -f /tmp/add_daily_tasks_table.sql
```

## 验证（可选）

```bash
docker exec -it reforum-db-1 psql -U HuangWeiLong -d forum_db

-- 示例检查
SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('tag','exp','username_updated_at','tag_updated_at');
SELECT table_name FROM information_schema.tables WHERE table_name = 'user_received_likes';
SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND indexname IN ('idx_users_exp','idx_users_tag_unique');
```

