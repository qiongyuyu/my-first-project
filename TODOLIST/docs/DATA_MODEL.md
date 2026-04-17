# 时光元数据模型设计

## 数据库概述
- 数据库：MySQL 8.0+
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci
- 存储引擎：InnoDB

## 表结构设计

### 1. 用户表 (users)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| user_id | VARCHAR(32) | PRIMARY KEY | 用户ID，使用UUID |
| open_id | VARCHAR(64) | UNIQUE NOT NULL | 微信OpenID |
| union_id | VARCHAR(64) | UNIQUE | 微信UnionID |
| nick_name | VARCHAR(64) | NOT NULL | 用户昵称 |
| avatar_url | VARCHAR(512) | | 头像URL |
| gender | TINYINT | DEFAULT 0 | 性别：0未知，1男，2女 |
| points | INT | DEFAULT 0 | 积分 |
| experience | INT | DEFAULT 0 | 经验值 |
| level | INT | DEFAULT 1 | 用户等级 |
| theme | VARCHAR(20) | DEFAULT 'light' | 主题：light/dark/auto |
| font_size | INT | DEFAULT 16 | 字体大小 |
| notifications | JSON | | 通知设置JSON |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- `idx_open_id` (open_id)
- `idx_created_at` (created_at)

### 2. 任务表 (tasks)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| task_id | VARCHAR(32) | PRIMARY KEY | 任务ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| title | VARCHAR(128) | NOT NULL | 任务标题 |
| description | TEXT | | 任务描述 |
| deadline | DATETIME | | 截止时间 |
| priority | VARCHAR(20) | DEFAULT 'medium' | 优先级：low/medium/high |
| quadrant | VARCHAR(20) | | 四象限：important-urgent/important-not-urgent/urgent-not-important/not-urgent-not-important |
| breakdown | JSON | | 任务拆解步骤JSON数组 |
| status | VARCHAR(20) | DEFAULT 'pending' | 状态：pending/completed/cancelled |
| estimated_pomos | INT | DEFAULT 1 | 预计番茄数 |
| completed_pomos | INT | DEFAULT 0 | 已完成番茄数 |
| progress | INT | DEFAULT 0 | 进度百分比0-100 |
| tags | JSON | | 标签JSON数组 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- `idx_user_id` (user_id)
- `idx_user_status` (user_id, status)
- `idx_deadline` (deadline)
- `idx_created_at` (created_at)

### 3. 番茄钟记录表 (pomodoros)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| pomodoro_id | VARCHAR(32) | PRIMARY KEY | 番茄钟ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| task_id | VARCHAR(32) | FOREIGN KEY | 关联任务ID，可为空 |
| type | VARCHAR(20) | DEFAULT 'focus' | 类型：focus/break |
| start_time | DATETIME | NOT NULL | 开始时间 |
| end_time | DATETIME | | 结束时间 |
| duration | INT | NOT NULL | 实际时长（秒） |
| is_interrupted | BOOLEAN | DEFAULT FALSE | 是否中断 |
| interrupt_reason | VARCHAR(50) | | 中断原因：emergency/fatigue/task_completed/other |
| expected_duration | INT | DEFAULT 1500 | 预计时长（秒） |
| sync_status | VARCHAR(20) | DEFAULT 'synced' | 同步状态：synced/pending |
| device_info | JSON | | 设备信息JSON |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- `idx_user_id` (user_id)
- `idx_user_start_time` (user_id, start_time)
- `idx_task_id` (task_id)
- `idx_sync_status` (sync_status)

### 4. 好友关系表 (friendships)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| friendship_id | VARCHAR(32) | PRIMARY KEY | 关系ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| friend_id | VARCHAR(32) | FOREIGN KEY | 好友用户ID |
| status | VARCHAR(20) | DEFAULT 'pending' | 状态：pending/accepted/rejected/blocked |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- `idx_user_id` (user_id)
- `idx_friend_id` (friend_id)
- `idx_user_friend` (user_id, friend_id) UNIQUE
- `idx_status` (status)

### 5. 团队表 (teams)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| team_id | VARCHAR(32) | PRIMARY KEY | 团队ID |
| creator_id | VARCHAR(32) | FOREIGN KEY | 创建者用户ID |
| name | VARCHAR(128) | NOT NULL | 团队名称 |
| description | TEXT | | 团队描述 |
| goal | VARCHAR(512) | | 团队目标 |
| member_count | INT | DEFAULT 1 | 成员数量 |
| is_public | BOOLEAN | DEFAULT TRUE | 是否公开 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- `idx_creator_id` (creator_id)
- `idx_created_at` (created_at)

### 6. 团队成员表 (team_members)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| team_member_id | VARCHAR(32) | PRIMARY KEY | 成员关系ID |
| team_id | VARCHAR(32) | FOREIGN KEY | 团队ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| role | VARCHAR(20) | DEFAULT 'member' | 角色：owner/admin/member |
| joined_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 加入时间 |

**索引：**
- `idx_team_id` (team_id)
- `idx_user_id` (user_id)
- `idx_team_user` (team_id, user_id) UNIQUE

### 7. 道具表 (items)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| item_id | VARCHAR(32) | PRIMARY KEY | 道具ID |
| name | VARCHAR(64) | NOT NULL | 道具名称 |
| description | TEXT | | 道具描述 |
| icon_url | VARCHAR(512) | | 图标URL |
| rarity | VARCHAR(20) | DEFAULT 'common' | 稀有度：common/rare/epic/legendary |
| effect_type | VARCHAR(50) | | 效果类型 |
| effect_value | JSON | | 效果参数JSON |
| price | INT | DEFAULT 0 | 兑换所需积分 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否可用 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- `idx_rarity` (rarity)
- `idx_is_active` (is_active)

### 8. 用户背包表 (user_inventory)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| inventory_id | VARCHAR(32) | PRIMARY KEY | 背包记录ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| item_id | VARCHAR(32) | FOREIGN KEY | 道具ID |
| count | INT | DEFAULT 1 | 数量 |
| acquired_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 获得时间 |
| expires_at | DATETIME | | 过期时间，为空表示永久 |

**索引：**
- `idx_user_id` (user_id)
- `idx_user_item` (user_id, item_id) UNIQUE
- `idx_expires_at` (expires_at)

### 9. 成就徽章表 (badges)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| badge_id | VARCHAR(32) | PRIMARY KEY | 徽章ID |
| name | VARCHAR(64) | NOT NULL | 徽章名称 |
| description | TEXT | | 徽章描述 |
| icon_url | VARCHAR(512) | | 图标URL |
| condition_type | VARCHAR(50) | NOT NULL | 解锁条件类型 |
| condition_value | JSON | NOT NULL | 解锁条件值JSON |
| rarity | VARCHAR(20) | DEFAULT 'common' | 稀有度 |
| reward_points | INT | DEFAULT 0 | 解锁奖励积分 |
| reward_exp | INT | DEFAULT 0 | 解锁奖励经验 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- `idx_condition_type` (condition_type)

### 10. 用户徽章表 (user_badges)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| user_badge_id | VARCHAR(32) | PRIMARY KEY | 用户徽章记录ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| badge_id | VARCHAR(32) | FOREIGN KEY | 徽章ID |
| progress | INT | DEFAULT 0 | 当前进度 |
| is_unlocked | BOOLEAN | DEFAULT FALSE | 是否已解锁 |
| unlocked_at | DATETIME | | 解锁时间 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引：**
- `idx_user_id` (user_id)
- `idx_user_badge` (user_id, badge_id) UNIQUE
- `idx_is_unlocked` (is_unlocked)

### 11. 自定义奖励表 (custom_rewards)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| reward_id | VARCHAR(32) | PRIMARY KEY | 奖励ID |
| user_id | VARCHAR(32) | FOREIGN KEY | 用户ID |
| title | VARCHAR(128) | NOT NULL | 奖励标题 |
| description | TEXT | | 奖励描述 |
| condition_type | VARCHAR(50) | NOT NULL | 条件类型 |
| condition_value | JSON | NOT NULL | 条件值JSON |
| is_completed | BOOLEAN | DEFAULT FALSE | 是否已完成 |
| completed_at | DATETIME | | 完成时间 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引：**
- `idx_user_id` (user_id)
- `idx_user_completed` (user_id, is_completed)

### 12. 系统配置表 (system_configs)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| config_key | VARCHAR(64) | PRIMARY KEY | 配置键 |
| config_value | JSON | NOT NULL | 配置值JSON |
| description | TEXT | | 配置描述 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 实体关系图 (ER Diagram)

```
users
├── tasks (1:N)
├── pomodoros (1:N)
├── friendships (1:N, 自关联)
├── team_members (1:N)
├── user_inventory (1:N)
├── user_badges (1:N)
└── custom_rewards (1:N)

teams
└── team_members (1:N)

items
└── user_inventory (1:N)

badges
└── user_badges (1:N)
```

## 关键业务逻辑

### 1. 经验与等级计算
- 经验值来源：专注时长（1小时=10经验）、完成任务、解锁成就
- 等级公式：`level = floor(experience / 100) + 1`
- 每级所需经验：`next_level_exp = level * 100`

### 2. 积分获取
- 完成番茄钟：+10积分
- 完成任务：+50积分
- 解锁成就：+100积分
- 连续打卡奖励：每日递增

### 3. 番茄钟计时
- 专注时长：25分钟（可配置）
- 短休息：5分钟
- 长休息（每4个番茄后）：15分钟
- 中断处理：记录中断原因，不扣除积分

### 4. AI评估算法
- 紧急度评分：基于截止时间、任务类型、历史数据
- 重要性评分：基于用户标签、任务权重、关联性
- 四象限划分：基于加权分数阈值

### 5. 数据同步
- 离线优先：所有操作先存本地
- 增量同步：仅同步未同步记录
- 冲突解决：时间戳最新优先
- 断点续传：支持批量重试