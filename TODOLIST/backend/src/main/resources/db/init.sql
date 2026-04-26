-- ============================================================
-- 时光元 (TimeMaster) 数据库初始化脚本
-- MySQL 8.0+
-- 字符集: utf8mb4, 引擎: InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS timemaster
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE timemaster;

-- ============================================================
-- 1. 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id      VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '用户ID',
    open_id      VARCHAR(64)  NOT NULL UNIQUE COMMENT '微信OpenID',
    union_id     VARCHAR(64)  NULL UNIQUE COMMENT '微信UnionID',
    nick_name    VARCHAR(64)  NOT NULL COMMENT '用户昵称',
    avatar_url   VARCHAR(512) NULL COMMENT '头像URL',
    gender       TINYINT      NOT NULL DEFAULT 0 COMMENT '性别: 0未知 1男 2女',
    points       INT          NOT NULL DEFAULT 0 COMMENT '积分',
    experience   INT          NOT NULL DEFAULT 0 COMMENT '经验值',
    level        INT          NOT NULL DEFAULT 1 COMMENT '用户等级',
    theme        VARCHAR(20)  NOT NULL DEFAULT 'light' COMMENT '主题: light/dark/auto',
    font_size    INT          NOT NULL DEFAULT 16 COMMENT '字体大小',
    notifications JSON        NULL COMMENT '通知设置',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_open_id (open_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================================
-- 2. 任务表
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
    task_id         VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '任务ID',
    user_id         VARCHAR(32)  NOT NULL COMMENT '用户ID',
    title           VARCHAR(128) NOT NULL COMMENT '任务标题',
    description     TEXT         NULL COMMENT '任务描述',
    deadline        DATETIME     NULL COMMENT '截止时间',
    priority        VARCHAR(20)  NOT NULL DEFAULT 'medium' COMMENT '优先级: low/medium/high',
    quadrant        VARCHAR(30)  NULL COMMENT '四象限',
    breakdown       JSON         NULL COMMENT '任务拆解步骤JSON数组',
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT '状态: pending/completed/cancelled',
    estimated_pomos INT          NOT NULL DEFAULT 1 COMMENT '预计番茄数',
    completed_pomos INT          NOT NULL DEFAULT 0 COMMENT '已完成番茄数',
    progress        INT          NOT NULL DEFAULT 0 COMMENT '进度百分比0-100',
    tags            JSON         NULL COMMENT '标签JSON数组',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_deadline (deadline),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ============================================================
-- 3. 番茄钟记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS pomodoros (
    pomodoro_id       VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '番茄钟ID',
    user_id           VARCHAR(32)  NOT NULL COMMENT '用户ID',
    task_id           VARCHAR(32)  NULL COMMENT '关联任务ID',
    type              VARCHAR(20)  NOT NULL DEFAULT 'focus' COMMENT '类型: focus/break',
    start_time        DATETIME     NOT NULL COMMENT '开始时间',
    end_time          DATETIME     NULL COMMENT '结束时间',
    duration          INT          NOT NULL DEFAULT 0 COMMENT '实际时长(秒)',
    is_interrupted    BOOLEAN      NOT NULL DEFAULT FALSE COMMENT '是否中断',
    interrupt_reason  VARCHAR(50)  NULL COMMENT '中断原因',
    expected_duration INT          NOT NULL DEFAULT 1500 COMMENT '预计时长(秒)',
    sync_status       VARCHAR(20)  NOT NULL DEFAULT 'synced' COMMENT '同步状态: synced/pending',
    device_info       JSON         NULL COMMENT '设备信息',
    created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_user_start_time (user_id, start_time),
    INDEX idx_task_id (task_id),
    INDEX idx_sync_status (sync_status),
    CONSTRAINT fk_pomodoros_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_pomodoros_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='番茄钟记录表';

-- ============================================================
-- 4. 好友关系表
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
    friendship_id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '关系ID',
    user_id       VARCHAR(32) NOT NULL COMMENT '用户ID',
    friend_id     VARCHAR(32) NOT NULL COMMENT '好友用户ID',
    status        VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending/accepted/rejected/blocked',
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id),
    UNIQUE INDEX idx_user_friend (user_id, friend_id),
    INDEX idx_status (status),
    CONSTRAINT fk_friendships_user   FOREIGN KEY (user_id)   REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_friend FOREIGN KEY (friend_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表';

-- ============================================================
-- 5. 团队表
-- ============================================================
CREATE TABLE IF NOT EXISTS teams (
    team_id      VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '团队ID',
    creator_id   VARCHAR(32)  NOT NULL COMMENT '创建者用户ID',
    name         VARCHAR(128) NOT NULL COMMENT '团队名称',
    description  TEXT         NULL COMMENT '团队描述',
    goal         VARCHAR(512) NULL COMMENT '团队目标',
    member_count INT          NOT NULL DEFAULT 1 COMMENT '成员数量',
    is_public    BOOLEAN      NOT NULL DEFAULT TRUE COMMENT '是否公开',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_creator_id (creator_id),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_teams_creator FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队表';

-- ============================================================
-- 6. 团队成员表
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
    team_member_id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '成员关系ID',
    team_id        VARCHAR(32) NOT NULL COMMENT '团队ID',
    user_id        VARCHAR(32) NOT NULL COMMENT '用户ID',
    role           VARCHAR(20) NOT NULL DEFAULT 'member' COMMENT '角色: owner/admin/member',
    joined_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    UNIQUE INDEX idx_team_user (team_id, user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表';

-- ============================================================
-- 7. 道具表
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
    item_id      VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '道具ID',
    name         VARCHAR(64)  NOT NULL COMMENT '道具名称',
    description  TEXT         NULL COMMENT '道具描述',
    icon_url     VARCHAR(512) NULL COMMENT '图标URL',
    rarity       VARCHAR(20)  NOT NULL DEFAULT 'common' COMMENT '稀有度: common/rare/epic/legendary',
    effect_type  VARCHAR(50)  NULL COMMENT '效果类型',
    effect_value JSON         NULL COMMENT '效果参数JSON',
    price        INT          NOT NULL DEFAULT 0 COMMENT '兑换所需积分',
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE COMMENT '是否可用',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_rarity (rarity),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='道具表';

-- ============================================================
-- 8. 用户背包表
-- ============================================================
CREATE TABLE IF NOT EXISTS user_inventory (
    inventory_id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '背包记录ID',
    user_id      VARCHAR(32) NOT NULL COMMENT '用户ID',
    item_id      VARCHAR(32) NOT NULL COMMENT '道具ID',
    count        INT         NOT NULL DEFAULT 1 COMMENT '数量',
    acquired_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
    expires_at   DATETIME    NULL COMMENT '过期时间(NULL=永久)',
    INDEX idx_user_id (user_id),
    UNIQUE INDEX idx_user_item (user_id, item_id),
    INDEX idx_expires_at (expires_at),
    CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户背包表';

-- ============================================================
-- 9. 成就徽章表
-- ============================================================
CREATE TABLE IF NOT EXISTS badges (
    badge_id        VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '徽章ID',
    name            VARCHAR(64)  NOT NULL COMMENT '徽章名称',
    description     TEXT         NULL COMMENT '徽章描述',
    icon_url        VARCHAR(512) NULL COMMENT '图标URL',
    condition_type  VARCHAR(50)  NOT NULL COMMENT '解锁条件类型',
    condition_value JSON         NOT NULL COMMENT '解锁条件值JSON',
    rarity          VARCHAR(20)  NOT NULL DEFAULT 'common' COMMENT '稀有度',
    reward_points   INT          NOT NULL DEFAULT 0 COMMENT '解锁奖励积分',
    reward_exp      INT          NOT NULL DEFAULT 0 COMMENT '解锁奖励经验',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_condition_type (condition_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成就徽章表';

-- ============================================================
-- 10. 用户徽章表
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
    user_badge_id VARCHAR(32) NOT NULL PRIMARY KEY COMMENT '用户徽章记录ID',
    user_id       VARCHAR(32) NOT NULL COMMENT '用户ID',
    badge_id      VARCHAR(32) NOT NULL COMMENT '徽章ID',
    progress      INT         NOT NULL DEFAULT 0 COMMENT '当前进度',
    is_unlocked   BOOLEAN     NOT NULL DEFAULT FALSE COMMENT '是否已解锁',
    unlocked_at   DATETIME    NULL COMMENT '解锁时间',
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    UNIQUE INDEX idx_user_badge (user_id, badge_id),
    INDEX idx_is_unlocked (is_unlocked),
    CONSTRAINT fk_user_badges_user  FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges(badge_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户徽章表';

-- ============================================================
-- 11. 自定义奖励表
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_rewards (
    reward_id       VARCHAR(32)  NOT NULL PRIMARY KEY COMMENT '奖励ID',
    user_id         VARCHAR(32)  NOT NULL COMMENT '用户ID',
    title           VARCHAR(128) NOT NULL COMMENT '奖励标题',
    description     TEXT         NULL COMMENT '奖励描述',
    condition_type  VARCHAR(50)  NOT NULL COMMENT '条件类型',
    condition_value JSON         NOT NULL COMMENT '条件值JSON',
    is_completed    BOOLEAN      NOT NULL DEFAULT FALSE COMMENT '是否已完成',
    completed_at    DATETIME     NULL COMMENT '完成时间',
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_user_completed (user_id, is_completed),
    CONSTRAINT fk_custom_rewards_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自定义奖励表';

-- ============================================================
-- 12. 系统配置表
-- ============================================================
CREATE TABLE IF NOT EXISTS system_configs (
    config_key   VARCHAR(64) NOT NULL PRIMARY KEY COMMENT '配置键',
    config_value JSON        NOT NULL COMMENT '配置值JSON',
    description  TEXT        NULL COMMENT '配置描述',
    updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================================
-- 种子数据 - 成就徽章
-- ============================================================
INSERT INTO badges (badge_id, name, description, icon_url, condition_type, condition_value, rarity, reward_points, reward_exp) VALUES
('badge_001', '初窥门径', '完成第一个番茄钟', '/images/badges/first-pomo.png',
 'pomodoro_count', '{"count": 1}', 'common', 50, 10),
('badge_002', '持之以恒', '连续7天专注', '/images/badges/streak-7.png',
 'consecutive_days', '{"days": 7}', 'rare', 100, 30),
('badge_003', '效率达人', '单日完成8个番茄钟', '/images/badges/daily-8.png',
 'daily_pomodoros', '{"count": 8}', 'rare', 150, 40),
('badge_004', '任务大师', '完成50个任务', '/images/badges/task-50.png',
 'task_count', '{"count": 50}', 'epic', 200, 60),
('badge_005', '早起鸟儿', '早上6点前开始专注', '/images/badges/early-bird.png',
 'early_start', '{"before_hour": 6}', 'common', 50, 10),
('badge_006', '深夜工作者', '晚上11点后仍在专注', '/images/badges/night-owl.png',
 'late_work', '{"after_hour": 23}', 'common', 50, 10),
('badge_007', '时间大师', '累计专注100小时', '/images/badges/total-100h.png',
 'total_hours', '{"hours": 100}', 'epic', 300, 100),
('badge_008', '社交达人', '添加5个好友', '/images/badges/friends-5.png',
 'friend_count', '{"count": 5}', 'rare', 100, 20),
('badge_009', '团队协作者', '加入一个团队', '/images/badges/team-join.png',
 'join_team', '{"count": 1}', 'common', 50, 10),
('badge_010', '周冠军', '一周专注时长排名团队第一', '/images/badges/weekly-champion.png',
 'team_rank', '{"rank": 1, "period": "week"}', 'legendary', 500, 150);

-- ============================================================
-- 种子数据 - 抽卡道具
-- ============================================================
INSERT INTO items (item_id, name, description, icon_url, rarity, effect_type, effect_value, price, is_active) VALUES
('item_001', '专注药剂', '使用后下次专注效率提升10%', '/images/items/potion.png',
 'common', 'focus_boost', '{"boost_percent": 10}', 50, TRUE),
('item_002', '能量咖啡', '使用后专注25分钟可获得额外5积分', '/images/items/coffee.png',
 'common', 'points_boost', '{"extra_points": 5}', 50, TRUE),
('item_003', '时间沙漏', '使用后可跳过当前休息时间', '/images/items/hourglass.png',
 'rare', 'skip_break', '{}', 100, TRUE),
('item_004', '星辰主题', '解锁星空调色板主题', '/images/items/starry-theme.png',
 'rare', 'unlock_theme', '{"theme": "starry"}', 120, TRUE),
('item_005', 'AI规划助手', '使用后获得一次高级AI任务拆解', '/images/items/ai-assist.png',
 'epic', 'ai_breakdown', '{"level": "advanced"}', 200, TRUE),
('item_006', '双倍积分卡', '使用后1小时内积分获取翻倍', '/images/items/double-points.png',
 'epic', 'double_points', '{"duration_hours": 1}', 200, TRUE),
('item_007', '时光罗盘', '获得一次免费的十连抽机会', '/images/items/compass.png',
 'legendary', 'free_draw', '{"draw_type": "multi"}', 500, TRUE),
('item_008', '重置之书', '重置一个任务的进度并返还番茄数', '/images/items/reset-book.png',
 'legendary', 'reset_task', '{}', 500, TRUE);

-- ============================================================
-- 种子数据 - 系统配置
-- ============================================================
INSERT INTO system_configs (config_key, config_value, description) VALUES
('gacha_probabilities', '{"single": {"common": 50, "rare": 30, "epic": 15, "legendary": 5}, "multi": {"common": 45, "rare": 35, "epic": 15, "legendary": 5}, "multi_guarantee_rarity": "rare"}',
 '抽卡概率配置: single=单抽 multi=十连抽 multi_guarantee_rarity=十连保底稀有度'),
('level_formula', '{"base_exp": 100, "exp_multiplier": 1.0, "level_ceiling": 100, "focus_hour_exp": 10, "task_complete_exp": 20, "badge_unlock_exp": 0}',
 '等级公式: level=floor(experience/base_exp)+1, 经验来源: 专注1h=10exp, 完成任务=20exp'),
('pomodoro_defaults', '{"focus_duration": 1500, "short_break": 300, "long_break": 900, "pomos_until_long": 4, "focus_points": 10, "task_complete_points": 50, "badge_points": 100}',
 '番茄钟默认配置: 专注25min, 短休5min, 长休15min, 4个番茄后长休');
