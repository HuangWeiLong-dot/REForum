# 修复验证码发送失败问题

## 🔍 问题分析

从控制台错误可以看到：
1. **500 错误**：服务器内部错误，可能是邮件服务配置问题
2. **429 错误**：请求过于频繁，限流机制触发

## ✅ 已修复的问题

### 1. 限流逻辑优化

**之前的问题**：
- 限流逻辑使用 `remainingTime > 240`，判断不够准确
- 可能导致误判

**修复后**：
- 使用 `lastSentTime` 记录最后发送时间
- 准确计算距离上次发送的时间间隔
- 60秒内只能发送一次，并显示剩余等待时间

### 2. 错误处理改进

**改进内容**：
- 添加更详细的错误日志
- 发送失败时自动清理已存储的验证码
- 检查 Resend API Key 是否配置
- 输出 Resend API 的详细错误信息

### 3. 邮件服务错误处理

**改进内容**：
- 检查 API Key 配置
- 输出详细的错误信息（错误类型、消息、堆栈）
- 帮助快速定位问题

## 🔧 可能的原因和解决方案

### 原因 1: Resend API Key 配置问题

**检查方法**：
1. 确认 `docker-compose.yml` 中的 `RESEND_API_KEY` 是否正确
2. 检查后端容器日志：
   ```bash
   docker logs reforum-backend-1 | grep -i "resend\|email\|verification"
   ```

**解决方案**：
- 确认 API Key 有效
- 检查 Resend 账户状态
- 确认 API Key 有发送邮件的权限

### 原因 2: 请求过于频繁（429 错误）

**说明**：
- 60秒内只能发送一次验证码
- 这是正常的限流保护

**解决方案**：
- 等待 60 秒后再试
- 前端会显示剩余等待时间

### 原因 3: 数据库连接问题

**检查方法**：
```bash
docker logs reforum-backend-1 | grep -i "database\|db\|error"
```

**解决方案**：
- 确认数据库容器运行正常
- 检查数据库连接配置

## 📝 检查步骤

### 1. 检查后端日志

在服务器上执行：

```bash
# 查看最近的错误日志
docker logs reforum-backend-1 --tail 50 | grep -i "verification\|email\|error"

# 查看完整的后端日志
docker logs reforum-backend-1 --tail 100
```

### 2. 检查环境变量

```bash
# 检查后端容器的环境变量
docker exec reforum-backend-1 env | grep RESEND
```

### 3. 测试邮件服务

可以在后端代码中添加测试接口，或直接查看日志中的错误信息。

## 🎯 快速修复

### 如果看到 429 错误

这是正常的限流，等待 60 秒后再试即可。

### 如果看到 500 错误

1. **检查后端日志**：
   ```bash
   docker logs reforum-backend-1 --tail 50
   ```

2. **检查 Resend API Key**：
   - 确认 `docker-compose.yml` 中的 `RESEND_API_KEY` 正确
   - 确认 API Key 在 Resend 控制台中有效

3. **重启后端容器**（如果配置已更新）：
   ```bash
   docker-compose restart backend
   ```

## 📋 常见错误信息

### "RESEND_API_KEY 未配置"
- **原因**：环境变量未设置
- **解决**：检查 `docker-compose.yml` 中的 `RESEND_API_KEY`

### "发送验证码邮件失败"
- **原因**：Resend API 调用失败
- **解决**：查看日志中的详细错误信息，检查 API Key 和账户状态

### "验证码发送过于频繁"
- **原因**：60秒内重复发送
- **解决**：等待 60 秒后再试（这是正常保护）

## 🔄 重启服务

如果修改了配置，需要重启后端：

```bash
cd /opt/ReForum
docker-compose restart backend

# 或重新构建
docker-compose up -d --build backend
```

