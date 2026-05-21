"use strict";
/**
 * API 服务层
 * - MODE='mock'：内存模拟数据，不依赖后端
 * - MODE='remote'：wx.request 连接 Spring Boot 后端
 * - 切换方式：改下面这行
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// ★ 联调时把这行改为 'remote'
let MODE = 'remote';
// 后端基础地址（联调时改成你的实际地址）
const BASE_URL = 'http://localhost:8080/api/v1';
// ============================================================
// 远程请求封装
// ============================================================
function remoteRequest(url, method = 'GET', data) {
    const app = getApp();
    const token = app.globalData.token;
    const headers = { 'Content-Type': 'application/json' };
    if (token)
        headers['Authorization'] = 'Bearer ' + token;
    return new Promise((resolve, reject) => {
        wx.request({
            url: BASE_URL + url,
            method: method,
            data,
            header: headers,
            success(res) {
                var _a;
                if (res.statusCode === 200 && res.data.code === 200) {
                    resolve(res.data.data);
                }
                else {
                    reject(new Error(((_a = res.data) === null || _a === void 0 ? void 0 : _a.message) || '请求失败'));
                }
            },
            fail(err) {
                reject(new Error(err.errMsg || '网络错误'));
            },
        });
    });
}
// ============================================================
// 模拟网络延迟
// ============================================================
function delay(ms = 300) {
    return new Promise(r => setTimeout(r, ms));
}
// ============================================================
// 内存数据库
// ============================================================
let mockTasks = [
    {
        taskId: 'mock-001',
        title: '完成项目需求文档',
        description: '编写PRD和功能规格说明',
        deadline: '2026-05-15T23:59:59Z',
        priority: 'high',
        category: '工作',
        quadrant: 'important-urgent',
        breakdown: ['梳理功能点', '画原型图', '写文档'],
        status: 'pending',
        estimatedPomos: 4,
        completedPomos: 1,
        progress: 25,
        createdAt: '2026-05-01T10:00:00Z',
        updatedAt: '2026-05-01T10:00:00Z',
    },
    {
        taskId: 'mock-002',
        title: '学习Spring Boot',
        description: '完成官方教程前5章',
        deadline: '2026-05-20T23:59:59Z',
        priority: 'medium',
        category: '学习',
        quadrant: 'important-not-urgent',
        breakdown: ['环境搭建', 'Hello World', '数据库连接'],
        status: 'pending',
        estimatedPomos: 3,
        completedPomos: 0,
        progress: 0,
        createdAt: '2026-05-02T10:00:00Z',
        updatedAt: '2026-05-02T10:00:00Z',
    },
    {
        taskId: 'mock-003',
        title: '设计数据库表结构',
        description: '完成ER图和建表语句',
        deadline: '2026-05-12T23:59:59Z',
        priority: 'high',
        category: '工作',
        quadrant: 'important-urgent',
        breakdown: ['分析实体关系', '画ER图', '写建表SQL'],
        status: 'completed',
        estimatedPomos: 2,
        completedPomos: 2,
        progress: 100,
        createdAt: '2026-05-02T14:00:00Z',
        updatedAt: '2026-05-07T10:00:00Z',
    },
];
var todayStr = new Date().toISOString().slice(0, 10);
let mockPomodoros = [
    { pomodoroId: 'mock-pomo-today', taskId: 'mock-001', startTime: todayStr + 'T09:00:00Z', endTime: todayStr + 'T09:25:00Z', duration: 1500, isInterrupted: false, interruptReason: null, type: 'focus', createdAt: todayStr + 'T09:00:00Z' },
    { pomodoroId: 'mock-pomo-001', taskId: 'mock-001', startTime: '2026-05-08T09:00:00Z', endTime: '2026-05-08T09:25:00Z', duration: 1500, isInterrupted: false, interruptReason: null, type: 'focus', createdAt: '2026-05-08T09:00:00Z' },
    { pomodoroId: 'mock-pomo-002', taskId: 'mock-001', startTime: '2026-05-08T09:30:00Z', endTime: '2026-05-08T09:55:00Z', duration: 1500, isInterrupted: false, interruptReason: null, type: 'focus', createdAt: '2026-05-08T09:30:00Z' },
    { pomodoroId: 'mock-pomo-003', taskId: null, startTime: '2026-05-08T10:00:00Z', endTime: '2026-05-08T10:25:00Z', duration: 1500, isInterrupted: false, interruptReason: null, type: 'focus', createdAt: '2026-05-08T10:00:00Z' },
];
const mockUser = {
    userId: 'mock-user-001',
    nickName: '测试用户',
    avatarUrl: '/images/default-avatar.png',
    points: 1500,
    experience: 520,
    level: 8,
    createdAt: '2026-05-01T00:00:00Z',
    settings: {
        theme: 'light',
        fontSize: 16,
        notifications: { focus: true, taskDue: true, friend: true, team: false },
    },
};
const mockUserStats = {
    points: 1500,
    experience: 520,
    level: 8,
    nextLevelExp: 800,
    levelProgress: 65,
    totalRewards: 15,
    badges: [
        { badgeId: 'b1', name: '初窥门径', description: '完成第一个番茄钟', iconUrl: '', unlocked: true, unlockedAt: '2026-05-01T10:00:00Z' },
        { badgeId: 'b2', name: '持之以恒', description: '连续7天专注', iconUrl: '', unlocked: false, progress: 57, requirement: '连续专注7天' },
        { badgeId: 'b3', name: '效率达人', description: '单日完成8个番茄钟', iconUrl: '', unlocked: false, progress: 50, requirement: '单日完成8个番茄钟' },
    ],
};
let mockInventory = [
    { itemId: 'item-001', name: '专注药水', iconUrl: '', rarity: 'rare', count: 3, description: '使用后下次专注效率+20%' },
    { itemId: 'item-002', name: '时间沙漏', iconUrl: '', rarity: 'epic', count: 1, description: '重置每日任务冷却时间' },
];
// ============================================================
// API 方法
// ============================================================
exports.api = {
    // ---- 任务 ----
    getTasks(params) {
        if (MODE === 'remote') {
            const parts = [];
            if (params === null || params === void 0 ? void 0 : params.status)
                parts.push('status=' + params.status);
            if (params === null || params === void 0 ? void 0 : params.priority)
                parts.push('priority=' + params.priority);
            if (params === null || params === void 0 ? void 0 : params.page)
                parts.push('page=' + params.page);
            if (params === null || params === void 0 ? void 0 : params.limit)
                parts.push('limit=' + params.limit);
            const q = parts.length > 0 ? '?' + parts.join('&') : '';
            return remoteRequest('/tasks' + q);
        }
        const filtered = (params === null || params === void 0 ? void 0 : params.status)
            ? mockTasks.filter(t => t.status === params.status)
            : mockTasks;
        return delay().then(() => ({
            tasks: filtered,
            total: filtered.length,
            page: (params === null || params === void 0 ? void 0 : params.page) || 1,
            limit: (params === null || params === void 0 ? void 0 : params.limit) || 20,
        }));
    },
    createTask(data) {
        if (MODE === 'remote')
            return remoteRequest('/tasks', 'POST', data);
        const task = Object.assign({ taskId: 'mock-' + Date.now(), status: 'pending', progress: 0, completedPomos: 0, category: '其他', quadrant: 'important-not-urgent', breakdown: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, data);
        mockTasks.unshift(task);
        return delay().then(() => task);
    },
    updateTask(taskId, data) {
        if (MODE === 'remote')
            return remoteRequest('/tasks/' + taskId, 'PUT', data);
        const idx = mockTasks.findIndex(t => t.taskId === taskId);
        if (idx >= 0)
            Object.assign(mockTasks[idx], data, { updatedAt: new Date().toISOString() });
        return delay().then(() => mockTasks[idx] || null);
    },
    deleteTask(taskId) {
        if (MODE === 'remote')
            return remoteRequest('/tasks/' + taskId, 'DELETE');
        mockTasks = mockTasks.filter(t => t.taskId !== taskId);
        return delay();
    },
    getTaskDetail(taskId) {
        if (MODE === 'remote')
            return remoteRequest('/tasks/' + taskId);
        return delay().then(() => mockTasks.find(t => t.taskId === taskId) || null);
    },
    // ---- 番茄钟 ----
    startPomodoro(data) {
        if (MODE === 'remote')
            return remoteRequest('/pomodoros/start', 'POST', data);
        return delay().then(() => ({
            pomodoroId: 'mock-pomo-' + Date.now(),
            startTime: new Date().toISOString(),
            expectedEndTime: new Date(Date.now() + (data.duration || 1500) * 1000).toISOString(),
        }));
    },
    endPomodoro(pomodoroId, data) {
        if (MODE === 'remote')
            return remoteRequest('/pomodoros/' + pomodoroId + '/end', 'POST', data);
        const record = Object.assign(Object.assign({ pomodoroId }, data), { type: 'focus', createdAt: new Date().toISOString() });
        mockPomodoros.unshift(record);
        // 自动更新关联任务的进度
        if (data.taskId && !data.isInterrupted) {
            const task = mockTasks.find(t => t.taskId === data.taskId);
            if (task) {
                task.completedPomos = (task.completedPomos || 0) + 1;
                task.progress = Math.min(100, Math.floor((task.completedPomos / task.estimatedPomos) * 100));
                if (task.progress >= 100)
                    task.status = 'completed';
            }
        }
        return delay().then(() => record);
    },
    getPomodoros(params) {
        if (MODE === 'remote') {
            const parts = [];
            if (params === null || params === void 0 ? void 0 : params.startDate)
                parts.push('startDate=' + params.startDate);
            if (params === null || params === void 0 ? void 0 : params.endDate)
                parts.push('endDate=' + params.endDate);
            if (params === null || params === void 0 ? void 0 : params.taskId)
                parts.push('taskId=' + params.taskId);
            if (params === null || params === void 0 ? void 0 : params.page)
                parts.push('page=' + params.page);
            if (params === null || params === void 0 ? void 0 : params.limit)
                parts.push('limit=' + params.limit);
            const q = parts.length > 0 ? '?' + parts.join('&') : '';
            return remoteRequest('/pomodoros' + q);
        }
        let list = mockPomodoros;
        if (params === null || params === void 0 ? void 0 : params.taskId)
            list = list.filter(p => p.taskId === params.taskId);
        return delay().then(() => ({
            pomodoros: list,
            total: list.length,
            page: (params === null || params === void 0 ? void 0 : params.page) || 1,
            limit: (params === null || params === void 0 ? void 0 : params.limit) || 20,
        }));
    },
    batchSyncPomodoros(records) {
        if (MODE === 'remote')
            return remoteRequest('/pomodoros/batch-sync', 'POST', { records });
        mockPomodoros.unshift(...records);
        return delay().then(() => ({
            successCount: records.length,
            failedCount: 0,
            failedRecords: [],
        }));
    },
    // ---- 用户 ----
    getUserProfile() {
        if (MODE === 'remote')
            return remoteRequest('/user/profile');
        return delay().then(() => (Object.assign({}, mockUser)));
    },
    updateUserProfile(data) {
        if (MODE === 'remote')
            return remoteRequest('/user/profile', 'PUT', data);
        Object.assign(mockUser, data);
        return delay().then(() => (Object.assign({}, mockUser)));
    },
    updateUserSettings(data) {
        if (MODE === 'remote')
            return remoteRequest('/user/settings', 'PUT', data);
        mockUser.settings = Object.assign(Object.assign({}, mockUser.settings), data);
        return delay().then(() => (Object.assign({}, mockUser.settings)));
    },
    // ---- 认证（模拟微信登录） ----
    wechatLogin(_code, userInfo) {
        if (MODE === 'remote')
            return remoteRequest('/auth/wechat-login', 'POST', { code: _code, userInfo });
        if (userInfo === null || userInfo === void 0 ? void 0 : userInfo.nickName)
            mockUser.nickName = userInfo.nickName;
        if (userInfo === null || userInfo === void 0 ? void 0 : userInfo.avatarUrl)
            mockUser.avatarUrl = userInfo.avatarUrl;
        return delay().then(() => ({
            token: 'mock-jwt-token-' + Date.now(),
            user: Object.assign({}, mockUser),
        }));
    },
    passwordLogin(code, nickName, avatarUrl, password) {
        if (MODE === 'remote')
            return remoteRequest('/auth/password-login', 'POST', { code, nickName, avatarUrl, password });
        if (!password) {
            return delay().then(() => { throw new Error('密码不能为空'); });
        }
        if (nickName)
            mockUser.nickName = nickName;
        if (avatarUrl)
            mockUser.avatarUrl = avatarUrl;
        return delay().then(() => ({
            token: 'mock-jwt-token-' + Date.now(),
            user: Object.assign({}, mockUser),
        }));
    },
    passwordRegister(code, nickName, avatarUrl, password) {
        if (MODE === 'remote')
            return remoteRequest('/auth/password-register', 'POST', { code, nickName, avatarUrl, password });
        if (!nickName) {
            return delay().then(() => { throw new Error('昵称不能为空'); });
        }
        if (!password || password.length < 6) {
            return delay().then(() => { throw new Error('密码至少6个字符'); });
        }
        mockUser.nickName = nickName;
        if (avatarUrl)
            mockUser.avatarUrl = avatarUrl;
        return delay(500).then(() => ({
            token: 'mock-jwt-token-' + Date.now(),
            user: Object.assign({}, mockUser),
        }));
    },
    refreshToken() {
        if (MODE === 'remote')
            return remoteRequest('/auth/refresh-token', 'POST');
        return delay().then(() => ({
            token: 'mock-jwt-token-' + Date.now(),
            expiresIn: 7200,
        }));
    },
    // ---- 统计 ----
    getFocusStats(_params) {
        if (MODE === 'remote') {
            const parts = [];
            if (_params === null || _params === void 0 ? void 0 : _params.period)
                parts.push('period=' + _params.period);
            if (_params === null || _params === void 0 ? void 0 : _params.startDate)
                parts.push('startDate=' + _params.startDate);
            if (_params === null || _params === void 0 ? void 0 : _params.endDate)
                parts.push('endDate=' + _params.endDate);
            const q = parts.length > 0 ? '?' + parts.join('&') : '';
            return remoteRequest('/statistics/focus-time' + q);
        }
        // 按 period 筛选 + 聚合
        var p = (_params === null || _params === void 0 ? void 0 : _params.period) || 'week';
        var now = new Date();
        var today = now.toISOString().slice(0, 10);
        var todayDate = new Date(today);
        var data = [];

        if (p === 'day') {
            var dayStart = todayDate.getTime();
            var dayEnd = dayStart + 86400000;
            var dayFiltered = mockPomodoros.filter(function (r) {
                var t = r.startTime || r.createdAt;
                return t && new Date(t).getTime() >= dayStart && new Date(t).getTime() < dayEnd;
            });
            var dur = dayFiltered.reduce(function (s, r) { return s + (r.duration || 0); }, 0);
            var cnt = dayFiltered.length;
            data = [{ date: today, label: '今日', duration: dur, pomoCount: cnt }];
        } else if (p === 'week') {
            var day = todayDate.getDay();
            var offset = day === 0 ? -6 : 1 - day;
            var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
            var weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            var byDay = {};
            mockPomodoros.forEach(function (r) {
                var t = r.startTime || r.createdAt;
                if (!t) return;
                var d = new Date(t);
                if (d >= monday) {
                    var diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
                    if (diff >= 0 && diff < 7) {
                        if (!byDay[diff]) byDay[diff] = { duration: 0, pomoCount: 0 };
                        byDay[diff].duration += r.duration || 0;
                        byDay[diff].pomoCount += 1;
                    }
                }
            });
            for (var i = 0; i < 7; i++) {
                var s = byDay[i] || { duration: 0, pomoCount: 0 };
                var d = new Date(monday.getTime() + i * 86400000);
                data.push({ date: d.toISOString().slice(0, 10), label: weekLabels[i], duration: s.duration, pomoCount: s.pomoCount });
            }
        } else if (p === 'month') {
            var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            var totalWeeks = Math.ceil((monthStart.getDay() + daysInMonth) / 7);
            var weeks = [];
            for (var wi = 0; wi < totalWeeks; wi++) { weeks.push({ duration: 0, pomoCount: 0 }); }
            mockPomodoros.forEach(function (r) {
                var t = r.startTime || r.createdAt;
                if (!t) return;
                var d = new Date(t);
                if (d >= monthStart && d.getMonth() === now.getMonth()) {
                    var dom = d.getDate();
                    var wi2 = Math.min(Math.floor((dom - 1) / 7), totalWeeks - 1);
                    weeks[wi2].duration += r.duration || 0;
                    weeks[wi2].pomoCount += 1;
                }
            });
            weeks.forEach(function (w, i) {
                data.push({ date: '', label: '第' + (i + 1) + '周', duration: w.duration, pomoCount: w.pomoCount });
            });
        } else if (p === 'year') {
            var yearStart = new Date(now.getFullYear(), 0, 1);
            var monthLabels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
            var months = [];
            for (var mi = 0; mi < 12; mi++) { months.push({ duration: 0, pomoCount: 0 }); }
            mockPomodoros.forEach(function (r) {
                var t = r.startTime || r.createdAt;
                if (!t) return;
                var d = new Date(t);
                if (d >= yearStart) {
                    months[d.getMonth()].duration += r.duration || 0;
                    months[d.getMonth()].pomoCount += 1;
                }
            });
            months.forEach(function (m, i) {
                data.push({ date: '', label: monthLabels[i], duration: m.duration, pomoCount: m.pomoCount });
            });
        }

        var totalDuration = data.reduce(function (s, d) { return s + d.duration; }, 0);
        var totalPomos = data.reduce(function (s, d) { return s + d.pomoCount; }, 0);
        var uniqueDays = data.length || 1;
        return delay().then(function () { return ({
            period: p,
            data: data,
            totalDuration: totalDuration,
            totalPomos: totalPomos,
            averageDaily: Math.round(totalDuration / uniqueDays),
        }); });
    },
    getBadges() {
        if (MODE === 'remote')
            return remoteRequest('/statistics/badges');
        return delay().then(() => ({
            unlockedCount: mockUserStats.badges.filter((b) => b.unlocked).length,
            totalCount: mockUserStats.badges.length,
            badges: mockUserStats.badges,
        }));
    },
    getTaskCategories() {
        if (MODE === 'remote')
            return remoteRequest('/statistics/task-categories');
        // 根据实际任务按 category 字段分组统计
        const map = {};
        mockTasks.forEach((t) => {
            const cat = t.category || '其他';
            if (!map[cat])
                map[cat] = { count: 0, duration: 0 };
            map[cat].count += 1;
            map[cat].duration += (t.completedPomos || 0) * 1500; // 每个番茄 25 分钟
        });
        const total = Object.values(map).reduce((s, v) => s + v.count, 0) || 1;
        const categories = Object.entries(map).map(([category, v]) => ({
            category, count: v.count, duration: v.duration, percentage: Math.round((v.count / total) * 100),
        }));
        return delay().then(() => ({ categories }));
    },
    // ---- 激励 ----
    getUserStats() {
        if (MODE === 'remote')
            return remoteRequest('/rewards/user-stats');
        return delay().then(() => (Object.assign({}, mockUserStats)));
    },
    getInventory() {
        if (MODE === 'remote')
            return remoteRequest('/rewards/inventory');
        return delay().then(() => ({
            items: mockInventory,
            total: mockInventory.length,
        }));
    },
    drawGacha(type) {
        if (MODE === 'remote')
            return remoteRequest('/rewards/gacha/draw', 'POST', { type });
        const rarities = ['common', 'common', 'common', 'rare', 'rare', 'epic'];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];
        const item = {
            itemId: 'item-gacha-' + Date.now(),
            name: rarity === 'epic' ? '传说专注符文' : rarity === 'rare' ? '专注药水' : '经验碎片',
            iconUrl: '',
            rarity,
            description: `随机抽卡获得的${rarity}道具`,
        };
        const existing = mockInventory.find(i => i.name === item.name);
        if (existing) {
            existing.count += 1;
        }
        else {
            mockInventory.push(Object.assign(Object.assign({}, item), { count: 1 }));
        }
        const cost = type === 'multi' ? 500 : 100;
        mockUser.points -= cost;
        return delay(400).then(() => ({
            success: true,
            cost,
            item,
            remainingPoints: mockUser.points,
        }));
    },
    useItem(itemId, count = 1) {
        if (MODE === 'remote')
            return remoteRequest('/rewards/inventory/' + itemId + '/use', 'POST', { count });
        const item = mockInventory.find(i => i.itemId === itemId);
        if (!item || item.count < count) {
            return delay().then(() => ({ success: false, message: '道具数量不足' }));
        }
        item.count -= count;
        if (item.count <= 0)
            mockInventory = mockInventory.filter(i => i.itemId !== itemId);
        return delay().then(() => ({ success: true, remaining: item.count }));
    },
    // ---- 自定义奖励 ----
    customRewards: [],
    getCustomRewards: function () {
        var _this = this;
        if (MODE === 'remote')
            return remoteRequest('/rewards/custom-rewards');
        return delay().then(function () { return ({ data: _this.customRewards || [] }); });
    },
    createCustomReward: function (data) {
        var _this = this;
        if (MODE === 'remote')
            return remoteRequest('/rewards/custom-rewards', 'POST', data);
        var reward = { rewardId: 'cr-' + Date.now(), title: data.title, description: data.description, conditionType: data.conditionType, conditionValue: data.conditionValue, isCompleted: false, createdAt: new Date().toISOString() };
        if (!_this.customRewards)
            _this.customRewards = [];
        _this.customRewards.unshift(reward);
        return delay().then(function () { return reward; });
    },
    updateCustomReward: function (rewardId, data) {
        var _this = this;
        if (MODE === 'remote')
            return remoteRequest('/rewards/custom-rewards/' + rewardId, 'PUT', data);
        var idx = (_this.customRewards || []).findIndex(function (r) { return r.rewardId === rewardId; });
        if (idx >= 0)
            Object.assign(_this.customRewards[idx], data);
        return delay().then(function () { return _this.customRewards[idx] || null; });
    },
    deleteCustomReward: function (rewardId) {
        var _this = this;
        if (MODE === 'remote')
            return remoteRequest('/rewards/custom-rewards/' + rewardId, 'DELETE');
        if (_this.customRewards)
            _this.customRewards = _this.customRewards.filter(function (r) { return r.rewardId !== rewardId; });
        return delay();
    },
    // ---- AI ----
    evaluateTasks(tasks, weights) {
        var _a, _b;
        if (MODE === 'remote')
            return remoteRequest('/ai/evaluate-tasks', 'POST', { tasks, weights });
        // 根据任务属性确定性计算，不再随机
        const now = Date.now();
        const urgencyWeight = (_a = weights === null || weights === void 0 ? void 0 : weights.urgency) !== null && _a !== void 0 ? _a : 0.6;
        const importanceWeight = (_b = weights === null || weights === void 0 ? void 0 : weights.importance) !== null && _b !== void 0 ? _b : 0.4;
        const evaluations = tasks.map((t, i) => {
            // 紧急度：基于截止日期距离（越快到期越紧急）
            let urgencyScore = 50;
            if (t.deadline) {
                const deadline = new Date(t.deadline).getTime();
                const daysLeft = (deadline - now) / 86400000;
                if (daysLeft <= 0)
                    urgencyScore = 100;
                else if (daysLeft <= 1)
                    urgencyScore = 95;
                else if (daysLeft <= 3)
                    urgencyScore = 85;
                else if (daysLeft <= 7)
                    urgencyScore = 70;
                else if (daysLeft <= 14)
                    urgencyScore = 55;
                else
                    urgencyScore = 40;
            }
            // 重要度：基于优先级
            let importanceScore = 50;
            if (t.priority === 'high')
                importanceScore = 85;
            else if (t.priority === 'medium')
                importanceScore = 60;
            else
                importanceScore = 40;
            // 四象限判定
            const urgent = urgencyScore >= 60;
            const important = importanceScore >= 60;
            let quadrant = 'important-not-urgent';
            if (urgent && important)
                quadrant = 'important-urgent';
            else if (urgent && !important)
                quadrant = 'not-important-urgent';
            else if (!urgent && !important)
                quadrant = 'not-important-not-urgent';
            return { taskId: t.taskId || t.id, urgencyScore, importanceScore, quadrant, recommendedOrder: i + 1 };
        });
        // 按综合得分排序
        evaluations.sort((a, b) => {
            const sa = a.urgencyScore * urgencyWeight + a.importanceScore * importanceWeight;
            const sb = b.urgencyScore * urgencyWeight + b.importanceScore * importanceWeight;
            return sb - sa;
        });
        evaluations.forEach((e, i) => { e.recommendedOrder = i + 1; });
        return delay(500).then(() => ({ evaluations }));
    },
    breakdownTask(task) {
        if (MODE === 'remote')
            return remoteRequest('/ai/breakdown-task', 'POST', task);
        const templates = {
            low: ['确认任务内容', '开始执行'],
            medium: ['明确任务目标和范围', '收集必要资料', '制定执行步骤', '分配时间', '设置检查点'],
            high: ['需求分析', '方案设计', '详细拆解为3-5个子任务', '评估每个子任务工时', '排优先级', '制定里程碑', '设置检查点和反馈机制'],
        };
        const steps = templates[task.complexity || 'medium'] || templates.medium;
        return delay(600).then(() => ({
            taskId: task.taskId || 'mock-breakdown-' + Date.now(),
            breakdown: steps,
        }));
    },
    getAIStatus() {
        if (MODE === 'remote')
            return remoteRequest('/ai/status');
        return delay().then(() => ({
            available: true, responseTime: 150, model: 'Mock-AI-Model',
            rateLimit: { remaining: 950, limit: 1000, resetAt: new Date(Date.now() + 3600000).toISOString() },
        }));
    },
    // ---- 好友 ----
    getFriends() {
        if (MODE === 'remote')
            return remoteRequest('/friends');
        return delay().then(() => ({
            friends: [
                { friendId: 'friend-001', nickName: '学习搭子小王', avatarUrl: '', status: 'accepted', createdAt: '2026-05-01T10:00:00Z' },
                { friendId: 'friend-002', nickName: '项目经理老李', avatarUrl: '', status: 'accepted', createdAt: '2026-05-03T10:00:00Z' },
                { friendId: 'friend-003', nickName: '前端小张', avatarUrl: '', status: 'pending', createdAt: '2026-05-07T10:00:00Z' },
            ],
        }));
    },
    addFriend(friendId) {
        if (MODE === 'remote')
            return remoteRequest('/friends', 'POST', { friendId });
        return delay().then(() => ({ success: true, friendId }));
    },
    getFriendActivities(_params) {
        if (MODE === 'remote')
            return remoteRequest('/friends/activities');
        return delay().then(() => ({
            activities: [
                { userId: 'friend-001', nickName: '学习搭子小王', avatarUrl: '', type: 'pomodoro_completed', content: '完成了2个番茄钟', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { userId: 'friend-002', nickName: '项目经理老李', avatarUrl: '', type: 'task_completed', content: '完成了「需求评审」任务', timestamp: new Date(Date.now() - 7200000).toISOString() },
            ],
        }));
    },
    // ---- 健康检查 ----
    healthCheck() {
        return remoteRequest('/health');
    },
};
