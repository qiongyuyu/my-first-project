# 时光元 (TimeMaster) Spring Boot 后端

## 项目概述

时光元后端服务，为微信小程序"时光元"提供 RESTful API 支持。系统涵盖任务管理、番茄钟计时、AI智能规划、游戏化激励、数据统计、好友社交和团队协作等功能。

### 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17+（开发环境 Java 24） | 运行环境 |
| Spring Boot | 3.2.5 | 核心框架 |
| Spring Data JPA | Hibernate 6 | ORM 持久化 |
| Spring Security | 6.x | 安全认证 |
| MySQL | 8.0+ | 关系数据库 |
| JJWT | 0.12.5 | JWT 令牌 |
| Lombok | 1.18.42 | 代码简化（Java 24 兼容） |
| SpringDoc OpenAPI | 2.3.0 | API 文档 |
| Maven | 3.8+ | 构建工具 |

---

## 前置要求

1. **JDK 17** 或更高版本
2. **Maven 3.8** 或更高版本
3. **MySQL 8.0** 或更高版本

---

## 快速开始

### 1. 数据库初始化

```bash
# 连接到 MySQL
mysql -u root -p

# 执行初始化脚本（创建数据库、表、种子数据）
source src/main/resources/db/init.sql
```

或使用命令行直接执行：

```bash
mysql -u root -p < src/main/resources/db/init.sql
```

初始化后数据库中包含：
- 12 张核心业务表
- 10 个成就徽章种子数据
- 8 个抽卡道具种子数据
- 3 条系统配置（抽卡概率、等级公式、番茄钟默认值）

### 2. 环境变量配置

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `MYSQL_USERNAME` | 数据库用户名 | `root` |
| `MYSQL_PASSWORD` | 数据库密码 | `root` |
| `JWT_SECRET` | JWT 签名密钥 | 内置默认值（生产环境务必修改） |
| `SERVER_PORT` | 服务端口 | `8080` |
| `WECHAT_APPID` | 微信小程序 AppID | `mock-app-id`（Mock 模式） |
| `WECHAT_SECRET` | 微信小程序 Secret | `mock-app-secret`（Mock 模式） |
| `AI_ENABLED` | 启用真实 AI 服务 | `false`（Mock 模式） |
| `AI_API_KEY` | AI 服务 API Key | `mock-api-key`（Mock 模式） |

### 3. 编译与启动

```bash
# 进入后端项目目录
cd TODOLIST/backend

# 编译项目
mvn clean compile

# 启动服务（默认 dev 环境）
mvn spring-boot:run

# 指定生产环境启动
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### 4. 验证服务

```bash
# 健康检查
curl http://localhost:8080/api/v1/health
```

预期响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "cache": "healthy",
      "ai": "healthy"
    }
  },
  "timestamp": 1714896000000
}
```

---

## API 文档

启动服务后，访问 Swagger UI：

```
http://localhost:8080/api/v1/swagger-ui.html
```

### 核心 API 端点一览

#### 认证模块 (`/api/v1/auth`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/wechat-login` | 微信登录 |
| POST | `/auth/refresh-token` | 刷新 Token |

#### 用户模块 (`/api/v1/user`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/user/profile` | 获取用户信息 |
| PUT | `/user/profile` | 更新用户信息 |
| PUT | `/user/settings` | 更新用户设置 |

#### 任务模块 (`/api/v1/tasks`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/tasks` | 获取任务列表（支持分页和筛选） |
| POST | `/tasks` | 创建任务 |
| GET | `/tasks/{taskId}` | 获取任务详情 |
| PUT | `/tasks/{taskId}` | 更新任务 |
| DELETE | `/tasks/{taskId}` | 删除任务 |

#### 番茄钟模块 (`/api/v1/pomodoros`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/pomodoros/start` | 开始番茄钟 |
| POST | `/pomodoros/{pomodoroId}/end` | 结束番茄钟 |
| GET | `/pomodoros` | 获取番茄钟记录 |
| POST | `/pomodoros/batch-sync` | 批量同步离线记录 |

#### AI 规划模块 (`/api/v1/ai`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/ai/evaluate-tasks` | AI 任务评估 |
| POST | `/ai/breakdown-task` | AI 任务拆解 |
| GET | `/ai/status` | AI 服务状态 |

#### 激励模块 (`/api/v1/rewards`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/rewards/user-stats` | 用户激励数据 |
| POST | `/rewards/gacha/draw` | 抽卡 |
| GET | `/rewards/inventory` | 背包道具列表 |
| POST | `/rewards/inventory/{itemId}/use` | 使用道具 |
| GET | `/rewards/custom-rewards` | 自定义奖励列表 |
| POST | `/rewards/custom-rewards` | 创建自定义奖励 |
| PUT | `/rewards/custom-rewards/{rewardId}` | 更新自定义奖励 |
| DELETE | `/rewards/custom-rewards/{rewardId}` | 删除自定义奖励 |

#### 统计模块 (`/api/v1/statistics`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/statistics/focus-time` | 专注时长统计 |
| GET | `/statistics/task-categories` | 任务类别分布 |
| GET | `/statistics/badges` | 成就徽章 |

#### 好友模块 (`/api/v1/friends`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/friends` | 好友列表 |
| POST | `/friends` | 添加好友 |
| GET | `/friends/activities` | 好友动态 |

#### 团队模块 (`/api/v1/teams`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/teams` | 团队列表 |
| POST | `/teams` | 创建团队 |
| GET | `/teams/{teamId}` | 团队详情 |
| GET | `/teams/{teamId}/ranking` | 团队专注排名 |

#### 系统模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |

所有认证接口以外的 API 需要在请求头中携带：
```
Authorization: Bearer {token}
```

详细 API 文档请参阅前端项目中的 `docs/API.md`。

---

## Mock 模式说明

默认情况下，以下服务使用 Mock 实现，无需真实的外部凭证：

### 微信登录 Mock
- 当 `wechat.app-id = mock-app-id` 时，系统使用传入的 `code` 生成模拟 `openId`
- 新用户自动获得 1000 积分和 500 经验值
- 切换到真实微信登录：设置环境变量 `WECHAT_APPID` 和 `WECHAT_SECRET`

### AI 服务 Mock
- 当 `ai.service.enabled = false` 时，AI 接口返回启发式算法结果
- 任务评估基于优先级和经验公式，任务拆解返回通用步骤模板
- 切换到真实 AI 服务：设置 `AI_ENABLED=true` 和 `AI_API_KEY`

### 测试登录流程

```bash
# 1. Mock 微信登录
curl -X POST http://localhost:8080/api/v1/auth/wechat-login \
  -H "Content-Type: application/json" \
  -d '{"code": "test-code-123", "userInfo": {"nickName": "测试用户", "avatarUrl": "", "gender": 0}}'

# 2. 使用返回的 token 调用需要认证的接口
curl http://localhost:8080/api/v1/user/profile \
  -H "Authorization: Bearer <your-token>"
```

---

## 项目结构

```
backend/
├── pom.xml                              # Maven 配置
├── README.md                            # 项目说明
├── .gitignore
└── src/
    └── main/
        ├── java/com/shiguangyuan/timemaster/
        │   ├── TimemasterApplication.java    # 启动类
        │   ├── config/                       # 配置类 (7个)
        │   │   ├── SecurityConfig.java       # Spring Security
        │   │   ├── JwtConfig.java            # JWT 配置
        │   │   ├── WebConfig.java            # CORS、Jackson
        │   │   ├── SwaggerConfig.java        # API 文档
        │   │   ├── WechatConfig.java         # 微信配置
        │   │   ├── AiServiceConfig.java      # AI 服务配置
        │   │   └── AuditingConfig.java       # JPA 审计
        │   ├── controller/                   # 控制器 (10个)
        │   │   ├── auth/AuthController.java
        │   │   ├── user/UserController.java
        │   │   ├── task/TaskController.java
        │   │   ├── pomodoro/PomodoroController.java
        │   │   ├── ai/AiController.java
        │   │   ├── reward/RewardController.java
        │   │   ├── statistics/StatisticsController.java
        │   │   ├── social/FriendController.java
        │   │   ├── social/TeamController.java
        │   │   └── system/HealthController.java
        │   ├── service/                      # 服务层 (9接口+9实现)
        │   │   ├── AuthService.java
        │   │   ├── UserService.java
        │   │   ├── TaskService.java
        │   │   ├── PomodoroService.java
        │   │   ├── AiPlanService.java
        │   │   ├── RewardService.java
        │   │   ├── StatisticsService.java
        │   │   ├── FriendService.java
        │   │   ├── TeamService.java
        │   │   └── impl/                     # 实现类
        │   ├── repository/                   # 数据访问 (12个)
        │   ├── model/
        │   │   ├── entity/                   # JPA 实体 (12个)
        │   │   └── enums/                    # 枚举 (8个)
        │   ├── dto/
        │   │   ├── request/                  # 请求 DTO (16个)
        │   │   └── response/                 # 响应 DTO (19个)
        │   ├── security/                     # 安全组件 (3个)
        │   ├── exception/                    # 异常处理 (3个)
        │   └── util/                         # 工具类 (2个)
        └── resources/
            ├── application.yml               # 主配置
            ├── application-dev.yml           # 开发环境
            ├── application-prod.yml          # 生产环境
            └── db/
                └── init.sql                  # 数据库初始化脚本
```

---

## 前端对接注意事项

### 当前状态
前端微信小程序已完成 5 个 Tab 页面的 UI 和本地存储逻辑，但尚未接入后端 API。所有数据目前使用 `wx.getStorageSync` 本地存储。

### 对接步骤（后续任务）
1. 创建 `services/` 目录，封装 `wx.request` HTTP 客户端
2. 配置 `baseUrl` 指向后端 API 地址
3. 在各页面的 TODO 标记处替换本地存储调用为 API 调用
4. 实现 Token 管理和自动刷新
5. 对接离线同步（利用 `POST /pomodoros/batch-sync` 接口）

### ID 兼容性
后端使用 `VARCHAR(32)` 作为所有主键。前端当前使用时间戳生成 ID（如 `Date.now().toString()`），长度为 13 位，与后端兼容。`batch-sync` 接口直接接受前端生成的 ID。

---

## 常见问题

### Q: 启动时提示 `Unable to connect to database`
A: 确保 MySQL 服务已启动，且已执行 `init.sql` 初始化脚本创建数据库。

### Q: 请求返回 401 未授权
A: 检查请求头是否携带 `Authorization: Bearer {token}`，Token 是否已过期（默认 2 小时）。

### Q: JWT 签名验证失败
A: 生产环境务必修改 `application.yml` 中的 `jwt.secret` 配置，建议使用 256 位以上随机字符串。

### Q: AI 服务返回固定格式的结果
A: 默认使用 Mock 模式。设置环境变量 `AI_ENABLED=true` 并配置 `AI_API_KEY` 切换到真实服务。

### Q: 表结构变更后如何更新数据库
A: 本系统使用 `ddl-auto: validate` 模式，表结构变更需先修改 `init.sql`，然后在数据库中手动执行 ALTER 语句或重新初始化。

---

## 部署指南

### Docker 部署

```dockerfile
FROM openjdk:17-slim
COPY target/timemaster-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar", "--spring.profiles.active=prod"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: timemaster
    volumes:
      - ./src/main/resources/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"

  backend:
    build: .
    environment:
      MYSQL_USERNAME: root
      MYSQL_PASSWORD: root
      JWT_SECRET: your-production-secret
    ports:
      - "8080:8080"
    depends_on:
      - mysql
```

### 微信云托管
推荐使用微信云托管部署，直接关联 GitHub 仓库并配置环境变量即可自动构建和部署。
