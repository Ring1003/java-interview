# Java 八股文面试题学习系统

一个现代化的 Java 面试题学习平台，部署在 Cloudflare Pages + Workers + D1。

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TailwindCSS
- **后端**: Cloudflare Workers (Pages Functions)
- **数据库**: Cloudflare D1 (SQLite)
- **部署**: Cloudflare Pages
- **包管理**: pnpm

## 功能特性

- 📚 **108+ 道精选面试题**：覆盖 Java 基础、并发、JVM、Spring、MySQL、Redis、算法、分布式
- 🏔️ **金字塔学习结构**：基础题 → 进阶追问 → 深层问题
- 📊 **学习进度跟踪**：设备级进度存储，支持多端同步
- 🎨 **iOS 卡片风格**：现代化 UI，毛玻璃效果
- 📱 **响应式设计**：完美适配手机和电脑

## 题库分类

1. **Java 基础**: 数据类型、集合框架、异常处理、IO流、反射、泛型
2. **并发编程**: synchronized、volatile、Lock、线程池、AQS、ThreadLocal
3. **JVM**: 内存模型、GC算法、类加载机制、调优参数
4. **Spring**: IOC、AOP、Bean生命周期、事务、自动配置
5. **MySQL**: 索引原理、事务隔离级别、MVCC、锁机制
6. **Redis**: 数据结构、持久化、缓存问题、分布式锁
7. **算法与数据结构**: 排序、树、链表、动态规划
8. **分布式**: 消息队列、分布式事务、CAP、微服务

## 项目结构

```
java-interview/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── pages/              # 页面
│   ├── types/              # TypeScript 类型
│   └── utils/              # 工具函数
├── functions/api/          # Cloudflare Pages Functions
│   ├── questions.ts        # 题目 API
│   └── progress.ts         # 进度 API
├── data/                   # 题库数据 (JSON)
├── schema.sql              # D1 数据库 Schema
├── seed.sql                # 初始数据
└── wrangler.toml           # Cloudflare 配置
```

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 部署到 Cloudflare

### 1. 创建 D1 数据库

```bash
wrangler d1 create java-interview-db
```

将返回的 database_id 更新到 `wrangler.toml`。

### 2. 执行数据库迁移

```bash
wrangler d1 execute java-interview-db --file=./schema.sql
wrangler d1 execute java-interview-db --file=./seed.sql
```

### 3. 部署 Pages

```bash
wrangler pages deploy dist
```

## API 接口

- `GET /api/questions?category=xxx&level=0` - 获取题目列表
- `POST /api/progress` - 更新学习进度
- `GET /api/progress/:deviceId` - 获取学习进度
- `GET /api/progress/:deviceId/stats` - 获取学习统计

## License

MIT
