# 时光元后端API接口文档

## 基础信息
- 基础URL：`https://api.shiguangyuan.com/v1`
- 认证方式：Bearer Token，在请求头中携带 `Authorization: Bearer {token}`
- 数据格式：JSON
- 字符编码：UTF-8

## 响应格式
```json
{
  "code": 200,           // 状态码：200成功，400客户端错误，500服务器错误
  "message": "success",  // 响应消息
  "data": {},            // 响应数据
  "timestamp": 1672502400000 // 时间戳
}
```

## 错误码
| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 1001 | 用户不存在 |
| 1002 | 密码错误 |
| 1003 | token过期 |
| 2001 | 任务不存在 |
| 3001 | AI服务不可用 |

---

## 用户认证

### 1. 微信登录
```
POST /auth/wechat-login
```

请求参数：
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 0
  }
}
```

响应数据：
```json
{
  "token": "JWT令牌",
  "user": {
    "userId": "用户ID",
    "openId": "微信OpenID",
    "nickName": "昵称",
    "avatarUrl": "头像",
    "points": 1000,
    "experience": 500,
    "level": 5,
    "settings": {}
  }
}
```

### 2. 刷新Token
```
POST /auth/refresh-token
```

请求头：`Authorization: Bearer {token}`

响应数据：
```json
{
  "token": "新的JWT令牌",
  "expiresIn": 7200
}
```

---

## 用户信息

### 1. 获取用户信息
```
GET /user/profile
```

响应数据：
```json
{
  "userId": "用户ID",
  "nickName": "昵称",
  "avatarUrl": "头像",
  "points": 1000,
  "experience": 500,
  "level": 5,
  "createdAt": "2026-01-01T00:00:00Z",
  "settings": {
    "theme": "light",
    "fontSize": 16,
    "notifications": {
      "focus": true,
      "taskDue": true,
      "friend": true,
      "team": false
    }
  }
}
```

### 2. 更新用户信息
```
PUT /user/profile
```

请求参数：
```json
{
  "nickName": "新昵称",
  "avatarUrl": "新头像URL",
  "settings": {
    "theme": "dark",
    "fontSize": 18
  }
}
```

### 3. 更新用户设置
```
PUT /user/settings
```

请求参数：
```json
{
  "theme": "dark",
  "fontSize": 18,
  "notifications": {
    "focus": true,
    "taskDue": false
  }
}
```

---

## 任务管理

### 1. 获取任务列表
```
GET /tasks
```

查询参数：
- `status` (可选): pending/completed
- `priority` (可选): low/medium/high
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20

响应数据：
```json
{
  "tasks": [
    {
      "taskId": "任务ID",
      "userId": "用户ID",
      "title": "任务标题",
      "description": "任务描述",
      "deadline": "2026-12-31T23:59:59Z",
      "priority": "high",
      "quadrant": "important-urgent",
      "breakdown": ["步骤1", "步骤2"],
      "status": "pending",
      "estimatedPomos": 5,
      "completedPomos": 2,
      "progress": 40,
      "createdAt": "2026-04-01T10:00:00Z",
      "updatedAt": "2026-04-01T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 2. 创建任务
```
POST /tasks
```

请求参数：
```json
{
  "title": "任务标题",
  "description": "任务描述",
  "deadline": "2026-12-31T23:59:59Z",
  "priority": "medium",
  "estimatedPomos": 3
}
```

### 3. 更新任务
```
PUT /tasks/{taskId}
```

请求参数：
```json
{
  "title": "新标题",
  "description": "新描述",
  "priority": "high",
  "status": "completed",
  "completedPomos": 5
}
```

### 4. 删除任务
```
DELETE /tasks/{taskId}
```

### 5. 获取任务详情
```
GET /tasks/{taskId}
```

---

## 番茄钟记录

### 1. 开始番茄钟
```
POST /pomodoros/start
```

请求参数：
```json
{
  "taskId": "关联任务ID", // 可选，无任务专注时为空
  "type": "focus", // focus/break
  "duration": 1500 // 预计时长（秒），默认1500（25分钟）
}
```

响应数据：
```json
{
  "pomodoroId": "番茄钟ID",
  "startTime": "2026-04-17T10:00:00Z",
  "expectedEndTime": "2026-04-17T10:25:00Z"
}
```

### 2. 结束番茄钟
```
POST /pomodoros/{pomodoroId}/end
```

请求参数：
```json
{
  "endTime": "2026-04-17T10:20:00Z", // 实际结束时间
  "duration": 1200, // 实际专注时长（秒）
  "isInterrupted": false,
  "interruptReason": "emergency" // emergency/fatigue/task_completed/other
}
```

### 3. 获取番茄钟记录
```
GET /pomodoros
```

查询参数：
- `startDate`: 开始日期，格式YYYY-MM-DD
- `endDate`: 结束日期，格式YYYY-MM-DD
- `taskId`: 关联任务ID
- `page`: 页码
- `limit`: 每页数量

响应数据：
```json
{
  "pomodoros": [
    {
      "pomodoroId": "番茄钟ID",
      "userId": "用户ID",
      "taskId": "任务ID",
      "startTime": "2026-04-17T10:00:00Z",
      "endTime": "2026-04-17T10:25:00Z",
      "duration": 1500,
      "isInterrupted": false,
      "interruptReason": null,
      "type": "focus",
      "createdAt": "2026-04-17T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### 4. 批量同步离线记录
```
POST /pomodoros/batch-sync
```

请求参数：
```json
{
  "records": [
    {
      "pomodoroId": "本地生成的ID",
      "taskId": "任务ID",
      "startTime": "2026-04-17T10:00:00Z",
      "endTime": "2026-04-17T10:25:00Z",
      "duration": 1500,
      "isInterrupted": false,
      "interruptReason": null,
      "type": "focus"
    }
  ]
}
```

响应数据：
```json
{
  "successCount": 10,
  "failedCount": 0,
  "failedRecords": []
}
```

---

## AI智能规划

### 1. AI任务评估
```
POST /ai/evaluate-tasks
```

请求参数：
```json
{
  "tasks": [
    {
      "taskId": "任务ID",
      "title": "任务标题",
      "description": "任务描述",
      "deadline": "2026-12-31T23:59:59Z"
    }
  ],
  "weights": {
    "urgency": 0.6,
    "importance": 0.4
  }
}
```

响应数据：
```json
{
  "evaluations": [
    {
      "taskId": "任务ID",
      "urgencyScore": 80,
      "importanceScore": 90,
      "quadrant": "important-urgent",
      "recommendedOrder": 1
    }
  ]
}
```

### 2. AI任务拆解
```
POST /ai/breakdown-task
```

请求参数：
```json
{
  "taskId": "任务ID",
  "title": "任务标题",
  "description": "任务描述",
  "complexity": "medium" // low/medium/high
}
```

响应数据：
```json
{
  "taskId": "任务ID",
  "breakdown": [
    "明确任务目标和范围",
    "收集必要资料和信息",
    "制定详细执行步骤",
    "分配时间和资源",
    "设置检查点和反馈机制"
  ]
}
```

---

## 激励系统

### 1. 获取用户激励数据
```
GET /rewards/user-stats
```

响应数据：
```json
{
  "points": 1500,
  "experience": 320,
  "level": 5,
  "nextLevelExp": 500,
  "levelProgress": 64,
  "totalRewards": 12,
  "badges": [
    {
      "badgeId": "徽章ID",
      "name": "初窥门径",
      "description": "完成第一个番茄钟",
      "iconUrl": "徽章图标URL",
      "unlocked": true,
      "unlockedAt": "2026-04-01T10:00:00Z"
    }
  ]
}
```

### 2. 抽卡
```
POST /rewards/gacha/draw
```

请求参数：
```json
{
  "type": "single" // single/multi
}
```

响应数据：
```json
{
  "success": true,
  "cost": 100,
  "item": {
    "itemId": "道具ID",
    "name": "道具名称",
    "iconUrl": "道具图标URL",
    "rarity": "rare",
    "description": "道具描述"
  },
  "remainingPoints": 1400
}
```

### 3. 获取背包道具
```
GET /rewards/inventory
```

响应数据：
```json
{
  "items": [
    {
      "itemId": "道具ID",
      "name": "道具名称",
      "iconUrl": "道具图标URL",
      "rarity": "rare",
      "count": 3,
      "description": "道具描述"
    }
  ],
  "total": 20
}
```

### 4. 使用道具
```
POST /rewards/inventory/{itemId}/use
```

请求参数：
```json
{
  "count": 1 // 使用数量
}
```

### 5. 自定义奖励管理
```
GET /rewards/custom-rewards
POST /rewards/custom-rewards
PUT /rewards/custom-rewards/{rewardId}
DELETE /rewards/custom-rewards/{rewardId}
```

---

## 数据统计

### 1. 专注时长统计
```
GET /statistics/focus-time
```

查询参数：
- `period`: day/week/month/year
- `startDate`: 开始日期
- `endDate`: 结束日期

响应数据：
```json
{
  "period": "week",
  "data": [
    {
      "date": "2026-04-11",
      "duration": 7200, // 秒
      "pomoCount": 3
    }
  ],
  "totalDuration": 50400,
  "totalPomos": 21,
  "averageDaily": 7200
}
```

### 2. 任务类别分布
```
GET /statistics/task-categories
```

响应数据：
```json
{
  "categories": [
    {
      "category": "学习",
      "count": 10,
      "duration": 18000,
      "percentage": 40
    }
  ]
}
```

### 3. 成就徽章
```
GET /statistics/badges
```

响应数据：
```json
{
  "unlockedCount": 5,
  "totalCount": 20,
  "badges": [
    {
      "badgeId": "徽章ID",
      "name": "持之以恒",
      "description": "连续7天专注",
      "iconUrl": "徽章图标URL",
      "unlocked": true,
      "progress": 100,
      "requirement": "连续专注7天"
    }
  ]
}
```

---

## 好友与社交

### 1. 好友列表
```
GET /friends
```

响应数据：
```json
{
  "friends": [
    {
      "friendId": "好友用户ID",
      "nickName": "好友昵称",
      "avatarUrl": "好友头像",
      "status": "accepted", // pending/accepted/rejected
      "createdAt": "2026-04-01T10:00:00Z"
    }
  ]
}
```

### 2. 添加好友
```
POST /friends
```

请求参数：
```json
{
  "friendId": "好友用户ID或分享码"
}
```

### 3. 好友动态
```
GET /friends/activities
```

查询参数：
- `page`: 页码
- `limit`: 每页数量

响应数据：
```json
{
  "activities": [
    {
      "userId": "用户ID",
      "nickName": "用户昵称",
      "avatarUrl": "用户头像",
      "type": "pomodoro_completed",
      "content": "完成了2个番茄钟",
      "timestamp": "2026-04-17T10:30:00Z"
    }
  ]
}
```

---

## 团队功能

### 1. 团队列表
```
GET /teams
```

### 2. 创建团队
```
POST /teams
```

### 3. 团队详情
```
GET /teams/{teamId}
```

### 4. 团队专注排名
```
GET /teams/{teamId}/ranking
```

查询参数：
- `period`: week/month

---

## 系统状态

### 1. 健康检查
```
GET /health
```

响应数据：
```json
{
  "status": "healthy",
  "timestamp": "2026-04-17T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "ai": "healthy"
  }
}
```

### 2. AI服务状态
```
GET /ai/status
```

响应数据：
```json
{
  "available": true,
  "responseTime": 150,
  "model": "Tencent-Hunyuan",
  "rateLimit": {
    "remaining": 950,
    "limit": 1000,
    "resetAt": "2026-04-17T11:00:00Z"
  }
}
```