/**
 * API 服务层
 * - MODE='mock'：内存模拟数据，不依赖后端
 * - MODE='remote'：wx.request 连接 Spring Boot 后端
 * - 切换方式：改下面这行
 */

// ★ 联调时把这行改为 'remote'
let MODE = 'mock' as 'mock' | 'remote';

// 后端基础地址（联调时改成你的实际地址）
const BASE_URL = 'http://192.168.1.101:8080/api/v1';

// ============================================================
// 远程请求封装
// ============================================================

function remoteRequest<T>(url: string, method: string = 'GET', data?: any): Promise<T> {
  const app = getApp<IAppOption>();
  const token = app.globalData.token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method: method as any,
      data,
      header: headers,
      success(res: any) {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data);
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail(err: any) {
        reject(new Error(err.errMsg || '网络错误'));
      },
    });
  });
}

// ============================================================
// 模拟网络延迟
// ============================================================

function delay(ms = 300): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ============================================================
// 内存数据库
// ============================================================

let mockTasks: any[] = [
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

const todayStr = new Date().toISOString().slice(0, 10);
let mockPomodoros: any[] = [
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

let mockInventory: any[] = [
  { itemId: 'item-001', name: '专注药水', iconUrl: '', rarity: 'rare', count: 3, description: '使用后下次专注效率+20%' },
  { itemId: 'item-002', name: '时间沙漏', iconUrl: '', rarity: 'epic', count: 1, description: '重置每日任务冷却时间' },
];

// ============================================================
// API 方法
// ============================================================

export const api = {

  // ---- 任务 ----

  getTasks(params?: { status?: string; priority?: string; page?: number; limit?: number }): Promise<any> {
    if (MODE === 'remote') {
      const parts: string[] = [];
      if (params?.status) parts.push('status=' + params.status);
      if (params?.priority) parts.push('priority=' + params.priority);
      if (params?.page) parts.push('page=' + params.page);
      if (params?.limit) parts.push('limit=' + params.limit);
      const q = parts.length > 0 ? '?' + parts.join('&') : '';
      return remoteRequest('/tasks' + q);
    }
    const filtered = params?.status
      ? mockTasks.filter(t => t.status === params.status)
      : mockTasks;
    return delay().then(() => ({
      tasks: filtered,
      total: filtered.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    }));
  },

  createTask(data: {
    title: string;
    description?: string;
    deadline?: string;
    priority?: string;
    estimatedPomos?: number;
  }): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/tasks', 'POST', data);
    const task = {
      taskId: 'mock-' + Date.now(),
      status: 'pending',
      progress: 0,
      completedPomos: 0,
      category: '其他',
      quadrant: 'important-not-urgent',
      breakdown: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockTasks.unshift(task);
    return delay().then(() => task);
  },

  updateTask(taskId: string, data: any): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/tasks/' + taskId, 'PUT', data);
    const idx = mockTasks.findIndex(t => t.taskId === taskId);
    if (idx >= 0) Object.assign(mockTasks[idx], data, { updatedAt: new Date().toISOString() });
    return delay().then(() => mockTasks[idx] || null);
  },

  deleteTask(taskId: string): Promise<void> {
    if (MODE === 'remote') return remoteRequest('/tasks/' + taskId, 'DELETE');
    mockTasks = mockTasks.filter(t => t.taskId !== taskId);
    return delay();
  },

  getTaskDetail(taskId: string): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/tasks/' + taskId);
    return delay().then(() => mockTasks.find(t => t.taskId === taskId) || null);
  },

  // ---- 番茄钟 ----

  startPomodoro(data: {
    taskId?: string;
    type?: string;
    duration?: number;
  }): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/pomodoros/start', 'POST', data);
    return delay().then(() => ({
      pomodoroId: 'mock-pomo-' + Date.now(),
      startTime: new Date().toISOString(),
      expectedEndTime: new Date(Date.now() + (data.duration || 1500) * 1000).toISOString(),
    }));
  },

  endPomodoro(
    pomodoroId: string,
    data: {
      endTime: string;
      duration: number;
      isInterrupted: boolean;
      interruptReason?: string;
      taskId?: string;
    },
  ): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/pomodoros/' + pomodoroId + '/end', 'POST', data);
    const record = {
      pomodoroId,
      ...data,
      type: 'focus',
      createdAt: new Date().toISOString(),
    };
    mockPomodoros.unshift(record);

    // 自动更新关联任务的进度
    if (data.taskId && !data.isInterrupted) {
      const task = mockTasks.find(t => t.taskId === data.taskId);
      if (task) {
        task.completedPomos = (task.completedPomos || 0) + 1;
        task.progress = Math.min(100, Math.floor((task.completedPomos / task.estimatedPomos) * 100));
        if (task.progress >= 100) task.status = 'completed';
      }
    }
    return delay().then(() => record);
  },

  getPomodoros(params?: {
    startDate?: string;
    endDate?: string;
    taskId?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    if (MODE === 'remote') {
      const parts: string[] = [];
      if (params?.startDate) parts.push('startDate=' + params.startDate);
      if (params?.endDate) parts.push('endDate=' + params.endDate);
      if (params?.taskId) parts.push('taskId=' + params.taskId);
      if (params?.page) parts.push('page=' + params.page);
      if (params?.limit) parts.push('limit=' + params.limit);
      const q = parts.length > 0 ? '?' + parts.join('&') : '';
      return remoteRequest('/pomodoros' + q);
    }
    let list = mockPomodoros;
    if (params?.taskId) list = list.filter(p => p.taskId === params.taskId);
    return delay().then(() => ({
      pomodoros: list,
      total: list.length,
      page: params?.page || 1,
      limit: params?.limit || 20,
    }));
  },

  batchSyncPomodoros(records: any[]): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/pomodoros/batch-sync', 'POST', { records });
    mockPomodoros.unshift(...records);
    return delay().then(() => ({
      successCount: records.length,
      failedCount: 0,
      failedRecords: [],
    }));
  },

  // ---- 用户 ----

  getUserProfile(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/user/profile');
    return delay().then(() => ({ ...mockUser }));
  },

  updateUserProfile(data: any): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/user/profile', 'PUT', data);
    Object.assign(mockUser, data);
    return delay().then(() => ({ ...mockUser }));
  },

  updateUserSettings(data: any): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/user/settings', 'PUT', data);
    mockUser.settings = { ...mockUser.settings, ...data };
    return delay().then(() => ({ ...mockUser.settings }));
  },

  // ---- 认证（模拟微信登录） ----

  wechatLogin(_code: string, userInfo: any): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/auth/wechat-login', 'POST', { code: _code, userInfo });
    if (userInfo?.nickName) mockUser.nickName = userInfo.nickName;
    if (userInfo?.avatarUrl) mockUser.avatarUrl = userInfo.avatarUrl;
    return delay().then(() => ({
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...mockUser },
    }));
  },

  // 密码登录
  passwordLogin(code: string, nickName: string, avatarUrl: string, password: string): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/auth/password-login', 'POST', {
      code, nickName, avatarUrl, password,
    });
    if (!password) {
      return delay().then(() => { throw new Error('密码不能为空'); });
    }
    if (nickName) mockUser.nickName = nickName;
    if (avatarUrl) mockUser.avatarUrl = avatarUrl;
    return delay().then(() => ({
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...mockUser },
    }));
  },

  // 密码注册
  passwordRegister(code: string, nickName: string, avatarUrl: string, password: string): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/auth/password-register', 'POST', {
      code, nickName, avatarUrl, password,
    });
    if (!nickName) {
      return delay().then(() => { throw new Error('昵称不能为空'); });
    }
    if (!password || password.length < 6) {
      return delay().then(() => { throw new Error('密码至少6个字符'); });
    }
    mockUser.nickName = nickName;
    if (avatarUrl) mockUser.avatarUrl = avatarUrl;
    return delay(500).then(() => ({
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...mockUser },
    }));
  },

  refreshToken(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/auth/refresh-token', 'POST');
    return delay().then(() => ({
      token: 'mock-jwt-token-' + Date.now(),
      expiresIn: 7200,
    }));
  },

  // ---- 统计 ----

  getFocusStats(_params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    if (MODE === 'remote') {
      const parts: string[] = [];
      if (_params?.period) parts.push('period=' + _params.period);
      if (_params?.startDate) parts.push('startDate=' + _params.startDate);
      if (_params?.endDate) parts.push('endDate=' + _params.endDate);
      const q = parts.length > 0 ? '?' + parts.join('&') : '';
      return remoteRequest('/statistics/focus-time' + q);
    }
    // 按 period 筛选 + 聚合
    const p = _params?.period || 'week';
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const todayDate = new Date(today);

    let data: { date: string; label: string; duration: number; pomoCount: number }[] = [];

    if (p === 'day') {
      const start = todayDate.getTime();
      const end = start + 86400000;
      const filtered = mockPomodoros.filter((r: any) => {
        const t = r.startTime || r.createdAt;
        return t && new Date(t).getTime() >= start && new Date(t).getTime() < end;
      });
      const dur = filtered.reduce((s: number, r: any) => s + (r.duration || 0), 0);
      const cnt = filtered.length;
      data = [{ date: today, label: '今日', duration: dur, pomoCount: cnt }];
    } else if (p === 'week') {
      const day = todayDate.getDay();
      const offset = day === 0 ? -6 : 1 - day;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      const byDay: Record<number, { duration: number; pomoCount: number }> = {};
      mockPomodoros.forEach((r: any) => {
        const t = r.startTime || r.createdAt;
        if (!t) return;
        const d = new Date(t);
        if (d >= monday) {
          const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
          if (diff >= 0 && diff < 7) {
            if (!byDay[diff]) byDay[diff] = { duration: 0, pomoCount: 0 };
            byDay[diff].duration += r.duration || 0;
            byDay[diff].pomoCount += 1;
          }
        }
      });
      for (let i = 0; i < 7; i++) {
        const s = byDay[i] || { duration: 0, pomoCount: 0 };
        const d = new Date(monday.getTime() + i * 86400000);
        data.push({ date: d.toISOString().slice(0, 10), label: weekLabels[i], ...s });
      }
    } else if (p === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const totalWeeks = Math.ceil((monthStart.getDay() + daysInMonth) / 7);
      const weeks: { duration: number; pomoCount: number }[] = Array.from({ length: totalWeeks }, () => ({ duration: 0, pomoCount: 0 }));
      mockPomodoros.forEach((r: any) => {
        const t = r.startTime || r.createdAt;
        if (!t) return;
        const d = new Date(t);
        if (d >= monthStart && d.getMonth() === now.getMonth()) {
          const dom = d.getDate();
          const wi = Math.min(Math.floor((dom - 1) / 7), totalWeeks - 1);
          weeks[wi].duration += r.duration || 0;
          weeks[wi].pomoCount += 1;
        }
      });
      weeks.forEach((w, i) => {
        data.push({ date: '', label: '第' + (i + 1) + '周', ...w });
      });
    } else if (p === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const monthLabels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      const months: { duration: number; pomoCount: number }[] = Array.from({ length: 12 }, () => ({ duration: 0, pomoCount: 0 }));
      mockPomodoros.forEach((r: any) => {
        const t = r.startTime || r.createdAt;
        if (!t) return;
        const d = new Date(t);
        if (d >= yearStart) {
          months[d.getMonth()].duration += r.duration || 0;
          months[d.getMonth()].pomoCount += 1;
        }
      });
      months.forEach((m, i) => {
        data.push({ date: '', label: monthLabels[i], ...m });
      });
    }

    const totalDuration = data.reduce((s, d) => s + d.duration, 0);
    const totalPomos = data.reduce((s, d) => s + d.pomoCount, 0);
    const uniqueDays = data.length || 1;
    return delay().then(() => ({
      period: p,
      data,
      totalDuration,
      totalPomos,
      averageDaily: Math.round(totalDuration / uniqueDays),
    }));
  },

  getBadges(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/statistics/badges');
    return delay().then(() => ({
      unlockedCount: mockUserStats.badges.filter((b: any) => b.unlocked).length,
      totalCount: mockUserStats.badges.length,
      badges: mockUserStats.badges,
    }));
  },

  getTaskCategories(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/statistics/task-categories');
    // 根据实际任务按 category 字段分组统计
    const map: Record<string, { count: number; duration: number }> = {};
    mockTasks.forEach((t: any) => {
      const cat = t.category || '其他';
      if (!map[cat]) map[cat] = { count: 0, duration: 0 };
      map[cat].count += 1;
      map[cat].duration += (t.completedPomos || 0) * 1500; // 每个番茄 25 分钟
    });
    const total = Object.values(map).reduce((s: number, v: any) => s + v.count, 0) || 1;
    const categories = Object.entries(map).map(([category, v]) => ({
      category, count: v.count, duration: v.duration, percentage: Math.round((v.count / total) * 100),
    }));
    return delay().then(() => ({ categories }));
  },

  // ---- 激励 ----

  getUserStats(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/user-stats');
    return delay().then(() => ({ ...mockUserStats }));
  },

  getInventory(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/inventory');
    return delay().then(() => ({
      items: mockInventory,
      total: mockInventory.length,
    }));
  },

  drawGacha(type: 'single' | 'multi'): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/gacha/draw', 'POST', { type });
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
    } else {
      mockInventory.push({ ...item, count: 1 });
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

  useItem(itemId: string, count: number = 1): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/inventory/' + itemId + '/use', 'POST', { count });
    const item = mockInventory.find(i => i.itemId === itemId);
    if (!item || item.count < count) {
      return delay().then(() => ({ success: false, message: '道具数量不足' }));
    }
    item.count -= count;
    if (item.count <= 0) mockInventory = mockInventory.filter(i => i.itemId !== itemId);
    return delay().then(() => ({ success: true, remaining: item.count }));
  },

  // ---- 自定义奖励 ----

  /** 用户自定义奖励列表 */
  customRewards: [] as any[],

  getCustomRewards(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/custom-rewards');
    return delay().then(() => ({ data: this.customRewards || [] }));
  },

  createCustomReward(data: { title: string; description?: string; conditionType: string; conditionValue: any }): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/custom-rewards', 'POST', data);
    const reward = { rewardId: 'cr-' + Date.now(), ...data, isCompleted: false, createdAt: new Date().toISOString() };
    if (!this.customRewards) this.customRewards = [];
    this.customRewards.unshift(reward);
    return delay().then(() => reward);
  },

  updateCustomReward(rewardId: string, data: { title?: string; description?: string; conditionType?: string; conditionValue?: any }): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/rewards/custom-rewards/' + rewardId, 'PUT', data);
    const idx = (this.customRewards || []).findIndex((r: any) => r.rewardId === rewardId);
    if (idx >= 0) Object.assign(this.customRewards[idx], data);
    return delay().then(() => this.customRewards[idx] || null);
  },

  deleteCustomReward(rewardId: string): Promise<void> {
    if (MODE === 'remote') return remoteRequest('/rewards/custom-rewards/' + rewardId, 'DELETE');
    if (this.customRewards) this.customRewards = this.customRewards.filter((r: any) => r.rewardId !== rewardId);
    return delay();
  },

  // ---- AI ----

  evaluateTasks(tasks: any[], weights?: any): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/ai/evaluate-tasks', 'POST', { tasks, weights });
    // 根据任务属性确定性计算，不再随机
    const now = Date.now();
    const urgencyWeight = weights?.urgency ?? 0.6;
    const importanceWeight = weights?.importance ?? 0.4;
    const evaluations = tasks.map((t: any, i: number) => {
      // 紧急度：基于截止日期距离（越快到期越紧急）
      let urgencyScore = 50;
      if (t.deadline) {
        const deadline = new Date(t.deadline).getTime();
        const daysLeft = (deadline - now) / 86400000;
        if (daysLeft <= 0) urgencyScore = 100;
        else if (daysLeft <= 1) urgencyScore = 95;
        else if (daysLeft <= 3) urgencyScore = 85;
        else if (daysLeft <= 7) urgencyScore = 70;
        else if (daysLeft <= 14) urgencyScore = 55;
        else urgencyScore = 40;
      }
      // 重要度：基于优先级
      let importanceScore = 50;
      if (t.priority === 'high') importanceScore = 85;
      else if (t.priority === 'medium') importanceScore = 60;
      else importanceScore = 40;

      // 四象限判定
      const urgent = urgencyScore >= 60;
      const important = importanceScore >= 60;
      let quadrant = 'important-not-urgent';
      if (urgent && important) quadrant = 'important-urgent';
      else if (urgent && !important) quadrant = 'not-important-urgent';
      else if (!urgent && !important) quadrant = 'not-important-not-urgent';

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

  breakdownTask(task: {
    taskId?: string;
    title: string;
    description?: string;
    complexity?: string;
  }): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/ai/breakdown-task', 'POST', task);
    const templates: Record<string, string[]> = {
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

  getAIStatus(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/ai/status');
    return delay().then(() => ({
      available: true, responseTime: 150, model: 'Mock-AI-Model',
      rateLimit: { remaining: 950, limit: 1000, resetAt: new Date(Date.now() + 3600000).toISOString() },
    }));
  },

  // ---- 好友 ----

  getFriends(): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/friends');
    return delay().then(() => ({
      friends: [
        { friendId: 'friend-001', nickName: '学习搭子小王', avatarUrl: '', status: 'accepted', createdAt: '2026-05-01T10:00:00Z' },
        { friendId: 'friend-002', nickName: '项目经理老李', avatarUrl: '', status: 'accepted', createdAt: '2026-05-03T10:00:00Z' },
        { friendId: 'friend-003', nickName: '前端小张', avatarUrl: '', status: 'pending', createdAt: '2026-05-07T10:00:00Z' },
      ],
    }));
  },

  addFriend(friendId: string): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/friends', 'POST', { friendId });
    return delay().then(() => ({ success: true, friendId }));
  },

  getFriendActivities(_params?: { page?: number; limit?: number }): Promise<any> {
    if (MODE === 'remote') return remoteRequest('/friends/activities');
    return delay().then(() => ({
      activities: [
        { userId: 'friend-001', nickName: '学习搭子小王', avatarUrl: '', type: 'pomodoro_completed', content: '完成了2个番茄钟', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { userId: 'friend-002', nickName: '项目经理老李', avatarUrl: '', type: 'task_completed', content: '完成了「需求评审」任务', timestamp: new Date(Date.now() - 7200000).toISOString() },
      ],
    }));
  },

  // ---- 健康检查 ----

  healthCheck(): Promise<any> {
    return remoteRequest('/health');
  },
};
