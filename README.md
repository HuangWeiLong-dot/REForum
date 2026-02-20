# REForum - Modern Forum
---

## 项目结构

```bash
REForum/
├── frontend/              # React 前端应用（Vite）
├── backend/               # Node.js/Express 后端服务
├── docs/                  # 部署与更新说明文档
├── logs/                  # 更新日志与 Bug 跟踪文档
├── openapi.yaml           # API 规范文档（OpenAPI 3）
├── docker-compose.yml     # Docker 编排配置
└── README.md
```

## 技术栈

### 前端
- React 18
- React Router 6
- Axios
- Vite
- React Icons
- date-fns

### 后端
- Node.js
- Express
- PostgreSQL

### 基础设施与部署
- Docker
- Docker Compose
- Nginx（前后端/静态资源反向代理）

## 功能特性

- ✅ 用户认证（注册、登录、登出）
- ✅ 邮箱验证码注册
- ✅ 用户资料管理与头像上传
- ✅ 用户标签/称号功能（支持自定义称号，30天内可修改一次）
- ✅ 用户等级系统（1-70级，每10级一个颜色区间，70级显示彩虹渐变动画）
- ✅ 经验值系统（通过每日任务获得经验值，经验进度条实时显示升级进度）
- ✅ 每日任务系统（发布帖子、点赞、评论，每个任务完成获得5经验值）
- ✅ 获赞数统计（统计用户所有帖子收到的点赞总数）
- ✅ PWA 支持（渐进式Web应用，支持安装到主屏幕、离线访问、自动更新）
- ✅ 帖子发布、编辑、删除、查看
- ✅ 评论与回复
- ✅ 帖子点赞、浏览统计与热门排序
- ✅ 版块与标签分类
- ✅ 搜索（按标题、内容、作者）
- ✅ 站内通知系统（新帖子通知）
- ✅ 站外邮箱通知（新帖子发布时自动发送邮件）
- ✅ 夜间模式与主题记忆
- ✅ 多语言界面（中/英/日），含协议、隐私、关于等页面
- ✅ 图片上传与帖子内图片展示
- ✅ 年龄验证与 Cookie 同意提示
- ✅ 响应式设计，移动端优化

更多细节可参考 `logs/UPDATE_LOG.md`、`logs/BUG_TRACKER.md`(已删除) 与前端 `Changelog` / `Fixes` 页面。

### 前置要求

- Node.js 18+（推荐 20+）
- npm（或 pnpm）
- Docker & Docker Compose（可选，用于一键部署）
- PostgreSQL（如不使用 Docker，请手动安装）

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认在 `http://localhost:5173`（或终端提示的端口）启动。

### 启动后端

```bash
cd backend
npm install
npm run dev
```

默认在 `http://localhost:3000` 启动 API 服务（具体以 `backend/app.js` 与环境变量为准）。

### Docker

```bash
# 在项目根目录
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 最后更新日期

2026年2月7日

修复页面header布局,user页面下的布局

