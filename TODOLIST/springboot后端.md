Spring Boot后端项目详细目录结构设计
基于对前端API文档（docs/API.md）和数据模型（docs/DATA_MODEL.md）的分析，设计完整的Java Spring Boot后端项目结构。
建议后端项目位置
• 建议路径：D:\java code\todolist\TODOLIST\backend\（新建目录）
• 项目名称：timemaster-backend
• 包名：com.shiguangyuan.timemaster
完整项目结构
timemaster-backend/
├── pom.xml                              # Maven项目配置文件
├── README.md                            # 项目说明文档
├── .gitignore                           # Git忽略文件配置
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── shiguangyuan/
│   │   │           └── timemaster/
│   │   │               ├── TimemasterApplication.java      # Spring Boot启动类
│   │   │               ├── config/                         # 配置类包
│   │   │               ├── controller/                     # 控制器层（按功能模块组织）
│   │   │               ├── service/                        # 服务层
│   │   │               ├── repository/                     # 数据访问层
│   │   │               ├── model/                          # 实体模型
│   │   │               ├── dto/                            # 数据传输对象
│   │   │               ├── vo/                             # 视图对象
│   │   │               ├── exception/                      # 异常处理
│   │   │               ├── interceptor/                    # 拦截器
│   │   │               ├── aspect/                         # 切面编程
│   │   │               ├── util/                           # 工具类
│   │   │               ├── security/                       # 安全相关
│   │   │               ├── scheduler/                      # 定时任务
│   │   │               └── ai/                             # AI服务集成
│   │   └── resources/
│   │       ├── application.yml           # 主配置文件
│   │       ├── application-dev.yml       # 开发环境配置
│   │       ├── application-prod.yml      # 生产环境配置
│   │       ├── application-test.yml      # 测试环境配置
│   │       ├── static/                   # 静态资源
│   │       ├── templates/                # 模板文件
│   │       └── db/
│   │           ├── migration/            # 数据库迁移脚本
│   │           └── init.sql              # 初始化SQL脚本
│   └── test/
│       └── java/
│           └── com/
│               └── shiguangyuan/
│                   └── timemaster/
│                       ├── controller/
│                       ├── service/
│                       └── repository/
└── docs/
    ├── api/                             # API文档
    ├── database/                        # 数据库设计文档
    └── deployment/                      # 部署文档
详细包结构说明
1. config/ 配置类包
config/
├── WebConfig.java                      # Web配置（跨域、拦截器等）
├── SecurityConfig.java                  # Spring Security配置
├── JwtConfig.java                       # JWT配置
├── RedisConfig.java                     # Redis配置
├── DatabaseConfig.java                  # 数据库配置
├── SwaggerConfig.java                   # API文档配置
├── WechatConfig.java                    # 微信登录配置
├── AiServiceConfig.java                 # AI服务配置
└── AsyncConfig.java                     # 异步任务配置
2. controller/ 控制器层（按功能模块组织）
controller/
├── auth/                               # 认证相关
│   ├── AuthController.java              # 微信登录、token刷新
│   └── WechatAuthController.java        # 微信认证处理
├── user/                               # 用户管理
│   ├── UserController.java              # 用户信息、设置管理
│   └── ProfileController.java           # 个人资料
├── task/                               # 任务管理
│   ├── TaskController.java              # 任务CRUD操作
│   └── TaskStatusController.java        # 任务状态管理
├── pomodoro/                           # 番茄钟
│   ├── PomodoroController.java          # 番茄钟记录管理
│   └── FocusController.java             # 专注计时
├── ai/                                 # AI规划
│   ├── AiPlanController.java            # AI任务规划
│   └── TaskEvaluationController.java    # 任务评估
├── reward/                             # 激励系统
│   ├── RewardController.java            # 积分、等级管理
│   ├── GachaController.java             # 抽卡系统
│   └── BadgeController.java             # 成就徽章
├── statistics/                         # 数据统计
│   ├── StatisticsController.java        # 数据统计接口
│   └── ChartController.java             # 图表数据
├── social/                             # 社交功能
│   ├── FriendController.java            # 好友管理
│   ├── TeamController.java              # 团队功能
│   └── ActivityController.java          # 动态分享
└── system/                             # 系统管理
    ├── HealthController.java            # 健康检查
    └── SystemController.java            # 系统状态
3. service/ 服务层（业务逻辑）
service/
├── impl/                               # 服务实现类
│   ├── AuthServiceImpl.java             # 认证服务实现
│   ├── UserServiceImpl.java             # 用户服务实现
│   ├── TaskServiceImpl.java             # 任务服务实现
│   ├── PomodoroServiceImpl.java         # 番茄钟服务实现
│   ├── AiPlanServiceImpl.java           # AI规划服务实现
│   ├── RewardServiceImpl.java           # 激励服务实现
│   ├── StatisticsServiceImpl.java       # 统计服务实现
│   └── SocialServiceImpl.java           # 社交服务实现
├── AuthService.java                     # 认证服务接口
├── UserService.java                     # 用户服务接口
├── TaskService.java                     # 任务服务接口
├── PomodoroService.java                 # 番茄钟服务接口
├── AiPlanService.java                   # AI规划服务接口
├── RewardService.java                   # 激励服务接口
├── StatisticsService.java               # 统计服务接口
└── SocialService.java                   # 社交服务接口
4. repository/ 数据访问层
repository/
├── UserRepository.java                  # 用户数据访问
├── TaskRepository.java                  # 任务数据访问
├── PomodoroRepository.java              # 番茄钟数据访问
├── FriendshipRepository.java            # 好友关系数据访问
├── TeamRepository.java                  # 团队数据访问
├── ItemRepository.java                  # 道具数据访问
├── InventoryRepository.java             # 背包数据访问
├── BadgeRepository.java                 # 徽章数据访问
├── UserBadgeRepository.java             # 用户徽章数据访问
├── CustomRewardRepository.java          # 自定义奖励数据访问
└── SystemConfigRepository.java          # 系统配置数据访问
5. model/ 实体模型（对应数据库表）
model/
├── entity/                              # JPA实体类
│   ├── User.java                        # 用户实体
│   ├── Task.java                        # 任务实体
│   ├── Pomodoro.java                    # 番茄钟实体
│   ├── Friendship.java                  # 好友关系实体
│   ├── Team.java                        # 团队实体
│   ├── TeamMember.java                  # 团队成员实体
│   ├── Item.java                        # 道具实体
│   ├── UserInventory.java               # 用户背包实体
│   ├── Badge.java                       # 徽章实体
│   ├── UserBadge.java                   # 用户徽章实体
│   ├── CustomReward.java                # 自定义奖励实体
│   └── SystemConfig.java                # 系统配置实体
└── enums/                               # 枚举类
    ├── TaskPriority.java                # 任务优先级枚举
    ├── TaskStatus.java                  # 任务状态枚举
    ├── PomodoroType.java                # 番茄钟类型枚举
    ├── FriendshipStatus.java            # 好友状态枚举
    ├── TeamRole.java                    # 团队角色枚举
    ├── ItemRarity.java                  # 道具稀有度枚举
    ├── BadgeRarity.java                 # 徽章稀有度枚举
    └── NotificationType.java            # 通知类型枚举
6. dto/ 数据传输对象
dto/
├── request/                             # 请求DTO
│   ├── auth/
│   │   ├── WechatLoginRequest.java      # 微信登录请求
│   │   └── RefreshTokenRequest.java     # Token刷新请求
│   ├── user/
│   │   ├── UpdateProfileRequest.java    # 更新资料请求
│   │   └── UpdateSettingsRequest.java   # 更新设置请求
│   ├── task/
│   │   ├── CreateTaskRequest.java       # 创建任务请求
│   │   └── UpdateTaskRequest.java       # 更新任务请求
│   ├── pomodoro/
│   │   ├── StartPomodoroRequest.java    # 开始番茄钟请求
│   │   └── EndPomodoroRequest.java      # 结束番茄钟请求
│   ├── ai/
│   │   ├── EvaluateTasksRequest.java    # AI评估请求
│   │   └── BreakdownTaskRequest.java    # 任务拆解请求
│   └── reward/
│       ├── GachaDrawRequest.java        # 抽卡请求
│       └── UseItemRequest.java          # 使用道具请求
└── response/                            # 响应DTO
    ├── ApiResponse.java                  # 统一API响应
    ├── auth/
    │   ├── LoginResponse.java           # 登录响应
    │   └── TokenResponse.java           # Token响应
    ├── user/
    │   └── UserProfileResponse.java     # 用户资料响应
    ├── task/
    │   └── TaskListResponse.java        # 任务列表响应
    ├── pomodoro/
    │   └── PomodoroListResponse.java    # 番茄钟列表响应
    ├── ai/
    │   └── TaskEvaluationResponse.java  # AI评估响应
    └── reward/
        └── GachaResultResponse.java     # 抽卡结果响应
7. 关键文件示例
application.yml (主配置文件)
spring:
  application:
    name: timemaster-backend
  datasource:
    url: jdbc:mysql://localhost:3306/timemaster?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: your-jwt-secret-key
  expiration: 7200

wechat:
  app-id: ${WECHAT_APPID}
  app-secret: ${WECHAT_SECRET}
  login-url: https://api.weixin.qq.com/sns/jscode2session

server:
  port: 8080
  servlet:
    context-path: /api/v1
ApiResponse.java (统一API响应)
@Data
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("success");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
}
pom.xml (关键依赖)
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
</dependencies>
￼
关键文件说明
1. 主配置文件 (application.yml)
spring:
  application:
    name: timemaster-backend
  datasource:
    url: jdbc:mysql://localhost:3306/timemaster_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

server:
  port: 8080
  servlet:
    context-path: /api/v1

jwt:
  secret: your-jwt-secret-key-here
  expiration: 7200  # 2小时

wechat:
  appid: ${WECHAT_APPID}
  secret: ${WECHAT_SECRET}

ai:
  service:
    type: tencent-hunyuan  # 腾讯混元大模型
    api-key: ${AI_API_KEY}
2. 统一API响应格式 (ApiResponse.java)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "success", data, System.currentTimeMillis());
    }
    
    public static <T> ApiResponse<T> error(int code, String message) {
        return new ApiResponse<>(code, message, null, System.currentTimeMillis());
    }
}
3. 与前端API的映射关系
前端API端点 (API.md)
后端Controller
主要实体类
/auth/wechat-login
AuthController.wechatLogin()
User, AuthRequest
/user/profile
UserController.getProfile()
User, UserResponse
/tasks
TaskController.*
Task, TaskRequest
/pomodoro/records
PomodoroController.*
PomodoroRecord
/ai/plan
AIPlanningController.*
AIPlan
/rewards
RewardController.*
RewardItem, UserReward
/statistics
StatisticsController.*
Statistics
4. 数据库实体关系
基于DATA_MODEL.md，核心实体包括：
• User：用户表（主表）
• Task：任务表（与User多对一）
• PomodoroRecord：番茄钟记录（与Task多对一）
• AIPlan：AI规划结果（与User多对一）
• RewardItem：奖励物品表
• UserReward：用户奖励关联表
• Statistics：统计表（与User一对一）
￼
实施步骤
阶段1：项目初始化
1. 在 D:\java code\todolist\TODOLIST\ 下创建 backend/ 目录
2. 使用Spring Initializr生成项目骨架
3. 配置Maven依赖（Spring Boot, Spring Security, JPA, MySQL, JWT等）
4. 设置项目基础结构
阶段2：数据库与实体
1. 根据DATA_MODEL.md创建MySQL数据库
2. 实现JPA实体类（12个表）
3. 创建Repository接口
4. 编写数据库迁移脚本
阶段3：核心功能
1. 实现JWT认证和安全配置
2. 实现微信登录集成
3. 逐模块开发Controller、Service、DTO
4. 实现AI服务集成（腾讯混元大模型）
阶段4：测试与部署
1. 编写单元测试和集成测试
2. 配置多环境部署
3. 编写Dockerfile和docker-compose
4. 部署到服务器（微信云托管推荐）
￼
依赖配置 (pom.xml关键依赖)
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- 数据库 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- 工具类 -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    
    <!-- API文档 -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-ui</artifactId>
        <version>1.7.0</version>
    </dependency>
</dependencies>