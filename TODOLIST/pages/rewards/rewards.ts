// pages/rewards/rewards.ts
import { api } from '../../utils/api';

interface GachaItem {
  itemId: string;
  name: string;
  iconUrl: string;
  rarity: string;
  description: string;
}

Page({
  data: {
    // 用户信息
    userInfo: { nickName: '', avatarUrl: '' } as any,
    userLevel: 1,
    points: 0,
    experience: 0,
    nextLevelExp: 100,
    levelProgress: 0,
    totalRewards: 0,

    // 抽卡系统
    recentItems: [] as any[],
    gachaResultVisible: false,
    gachaResults: [] as any[],
    gachaLoading: false,
    gachaCost: 0,
    gachaRemainingPoints: 0,

    // 背包/道具
    inventory: [] as any[],
    inventoryLoading: false,

    // 自定义奖励
    customRewards: [] as any[],
    rewardEditorVisible: false,
    rewardEditorMode: 'create' as 'create' | 'edit',
    rewardEditingId: '',
    rewardSaving: false,
    rewardForm: {
      title: '',
      conditionType: 'focus' as string,
      conditionValue: '',
      description: '',
    },
    conditionTypeOptions: [
      { value: 'focus', label: '专注时长达到 (小时)', icon: '⏱' },
      { value: 'tasks', label: '完成任务数达到', icon: '✅' },
      { value: 'streak', label: '连续打卡天数', icon: '🔥' },
      { value: 'points', label: '积分达到', icon: '⭐' },
    ],
    conditionTypeIndex: 0,

    // 页面加载
    pageLoading: true,
  },

  onLoad() {
    this.loadUserInfo();
    this.loadAllData();
  },

  onShow() {
    this.loadAllData();
  },

  async loadAllData() {
    this.setData({ pageLoading: true });
    try {
      const [userStats, inventory] = await Promise.all([
        api.getUserStats(),
        api.getInventory(),
      ]);
      this.setData({
        points: userStats.points,
        experience: userStats.experience,
        userLevel: userStats.level,
        nextLevelExp: userStats.nextLevelExp,
        levelProgress: userStats.levelProgress,
        totalRewards: userStats.totalRewards,
        inventory: inventory.items || [],
        pageLoading: false,
      });
      wx.setStorageSync('inventory', inventory.items || []);
    } catch {
      this.loadFromLocalFallback();
      this.setData({ pageLoading: false });
    }
    this.loadCustomRewards();
  },

  loadFromLocalFallback() {
    const records = wx.getStorageSync('pomodoroRecords') || [];
    const inventory = wx.getStorageSync('inventory') || [];
    const totalSeconds = records.reduce((s: number, r: any) => s + (r.duration || 0), 0);
    const exp = Math.floor(totalSeconds / 3600) * 10;
    const lv = Math.floor(exp / 100) + 1;
    this.setData({
      experience: exp,
      userLevel: lv,
      nextLevelExp: lv * 100,
      levelProgress: Math.min(((exp % 100) / 100) * 100, 100),
      totalRewards: inventory.length,
      inventory,
    });
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) this.setData({ userInfo });
  },

  // ─── 抽卡 ───

  drawGacha(e: any) {
    if (this.data.gachaLoading) return;
    const type: 'single' | 'multi' = e.currentTarget.dataset.type;
    const cost = type === 'multi' ? 900 : 100;

    if (this.data.points < cost) {
      wx.showToast({ title: '积分不足，去完成番茄钟赚积分吧', icon: 'none' });
      return;
    }

    this.setData({ gachaLoading: true, gachaCost: cost });

    api.drawGacha(type)
      .then((res: any) => {
        const item = res.item as GachaItem;
        const results = type === 'multi'
          ? this.generateMultiResults(item)
          : [item];

        // 更新积分
        this.setData({
          points: res.remainingPoints,
          gachaResults: results,
          gachaResultVisible: true,
          gachaRemainingPoints: res.remainingPoints,
          gachaLoading: false,
        });

        // 更新背包
        this.updateInventoryAfterGacha(item, type);
        // 更新最近获得
        this.addToRecentItems(item);
      })
      .catch((err: any) => {
        this.setData({ gachaLoading: false });
        wx.showToast({ title: err.message || '抽卡失败', icon: 'none' });
      });
  },

  generateMultiResults(mainItem: GachaItem): any[] {
    const results: any[] = [];
    // 主奖品 + 9个随机填充
    results.push({ ...mainItem, isMain: true });
    const fillerPool = [
      { name: '经验碎片', rarity: 'common', description: '微小的经验碎片' },
      { name: '专注药水', rarity: 'common', description: '使用后下次专注效率+10%' },
      { name: '时间沙漏', rarity: 'rare', description: '重置每日任务冷却时间' },
      { name: '星辰主题', rarity: 'epic', description: '解锁星空主题界面' },
    ];
    for (let i = 0; i < 9; i++) {
      const f = fillerPool[Math.floor(Math.random() * fillerPool.length)];
      results.push({ itemId: `filler-${Date.now()}-${i}`, ...f, iconUrl: '' });
    }
    // 随机打乱
    for (let i = results.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [results[i], results[j]] = [results[j], results[i]];
    }
    return results;
  },

  updateInventoryAfterGacha(item: GachaItem, type: string) {
    const count = type === 'multi' ? 10 : 1;
    const inventory = [...this.data.inventory];
    const existing = inventory.find((i: any) => i.itemId === item.itemId);
    if (existing) {
      existing.count += 1;
    } else {
      inventory.push({
        itemId: item.itemId,
        name: item.name,
        iconUrl: item.iconUrl,
        rarity: item.rarity,
        count: 1,
        description: item.description,
      });
    }
    // multi pulls: update filler items too (simplified)
    this.setData({ inventory });
    wx.setStorageSync('inventory', inventory);
  },

  addToRecentItems(item: GachaItem) {
    const recent = [...this.data.recentItems];
    recent.unshift({ itemId: item.itemId, name: item.name, iconUrl: item.iconUrl, rarity: item.rarity });
    if (recent.length > 8) recent.pop();
    this.setData({ recentItems: recent });
  },

  hideGachaResult() {
    this.setData({ gachaResultVisible: false, gachaResults: [] });
  },

  // ─── 背包道具 ───

  useItem(e: any) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.inventory[idx];
    if (!item) return;

    wx.showModal({
      title: `使用 ${item.name}`,
      content: item.description || '确定使用该道具吗？',
      success: (res) => {
        if (!res.confirm) return;

        api.useItem(item.itemId, 1)
          .then(() => {
            const inventory = [...this.data.inventory];
            if (item.count > 1) {
              inventory[idx].count -= 1;
            } else {
              inventory.splice(idx, 1);
            }
            this.setData({ inventory });
            wx.setStorageSync('inventory', inventory);
            wx.showToast({ title: `已使用 ${item.name}`, icon: 'success' });
          })
          .catch((err: any) => {
            wx.showToast({ title: err.message || '使用失败', icon: 'none' });
          });
      },
    });
  },

  // ─── 自定义奖励 ───

  async loadCustomRewards() {
    try {
      const res = await api.getCustomRewards();
      const list = Array.isArray(res) ? res : (res.data || res.items || []);
      if (list.length > 0) {
        const enriched = list.map((r: any) => this.enrichReward(r));
        this.setData({ customRewards: enriched });
        wx.setStorageSync('customRewards', enriched);
        return;
      }
    } catch { /* fallback to local */ }
    const local = wx.getStorageSync('customRewards') || [];
    if (local.length > 0) {
      this.setData({ customRewards: local });
      return;
    }
    // 首次使用：预设模板
    const defaults = [
      { rewardId: 'default-1', title: '一杯奶茶', conditionType: 'focus', conditionValue: 5, description: '奖励自己一杯最喜欢的奶茶', isCompleted: false },
      { rewardId: 'default-2', title: '看一场电影', conditionType: 'tasks', conditionValue: 10, description: '周末去看一场期待已久的电影', isCompleted: false },
      { rewardId: 'default-3', title: '买一本新书', conditionType: 'streak', conditionValue: 7, description: '购买一本感兴趣的新书', isCompleted: false },
    ];
    this.setData({ customRewards: defaults.map((r: any) => this.enrichReward(r)) });
  },

  /** 给奖励项补充进度信息 */
  enrichReward(r: any): any {
    const current = this.calcRewardProgress(r.conditionType);
    const target = typeof r.conditionValue === 'object' ? (r.conditionValue?.value || 0) : (r.conditionValue || 0);
    return {
      ...r,
      conditionValue: target,
      conditionLabel: this.getConditionLabel(r.conditionType, target),
      currentProgress: current,
      progressPct: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
    };
  },

  getConditionLabel(type: string, value: number): string {
    switch (type) {
      case 'focus': return `专注 ${value} 小时`;
      case 'tasks': return `完成 ${value} 个任务`;
      case 'streak': return `连续 ${value} 天`;
      case 'points': return `积分达到 ${value}`;
      default: return `${type}: ${value}`;
    }
  },

  calcRewardProgress(type: string): number {
    const records = wx.getStorageSync('pomodoroRecords') || [];
    const tasks = wx.getStorageSync('tasks') || [];
    const totalSeconds = records.reduce((s: number, r: any) => s + (r.duration || 0), 0);
    switch (type) {
      case 'focus': return Math.floor(totalSeconds / 3600);
      case 'tasks': return tasks.filter((t: any) => t.status === 'completed').length;
      case 'streak': return this.calcStreakDays();
      case 'points': return this.data.points;
      default: return 0;
    }
  },

  calcStreakDays(): number {
    const records: any[] = wx.getStorageSync('pomodoroRecords') || [];
    const dates = new Set<string>();
    records.forEach((r: any) => {
      const d = (r.startTime || r.createdAt || '').slice(0, 10);
      if (d) dates.add(d);
    });
    const sorted = [...dates].sort().reverse();
    if (sorted.length === 0) return 0;
    const today = new Date().toISOString().slice(0, 10);
    let streak = 0;
    const checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().slice(0, 10);
      if (sorted.includes(ds)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // 今天还没完成，检查昨天
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return streak;
  },

  // ─── 编辑器 ───

  showRewardEditor() {
    this.setData({
      rewardEditorVisible: true,
      rewardEditorMode: 'create',
      rewardEditingId: '',
      conditionTypeIndex: 0,
      rewardForm: { title: '', conditionType: 'focus', conditionValue: '', description: '' },
    });
  },

  editReward(e: any) {
    const rewardId = e.currentTarget.dataset.id;
    const reward = this.data.customRewards.find((r: any) => r.rewardId === rewardId);
    if (!reward) return;
    const typeIdx = this.data.conditionTypeOptions.findIndex((o: any) => o.value === reward.conditionType);
    this.setData({
      rewardEditorVisible: true,
      rewardEditorMode: 'edit',
      rewardEditingId: rewardId,
      conditionTypeIndex: typeIdx >= 0 ? typeIdx : 0,
      rewardForm: {
        title: reward.title || '',
        conditionType: reward.conditionType || 'focus',
        conditionValue: String(reward.conditionValue || ''),
        description: reward.description || '',
      },
    });
  },

  hideRewardEditor() {
    this.setData({ rewardEditorVisible: false });
  },

  onConditionTypeChange(e: any) {
    const idx = parseInt(e.detail.value);
    const ct = this.data.conditionTypeOptions[idx];
    this.setData({
      conditionTypeIndex: idx,
      'rewardForm.conditionType': ct.value,
    });
  },

  async saveReward() {
    const { title, conditionType, conditionValue, description } = this.data.rewardForm;
    if (!title.trim()) { wx.showToast({ title: '请输入奖励标题', icon: 'none' }); return; }
    if (!conditionValue || isNaN(Number(conditionValue)) || Number(conditionValue) <= 0) {
      wx.showToast({ title: '请输入有效的目标值', icon: 'none' }); return;
    }

    this.setData({ rewardSaving: true });
    const data = {
      title: title.trim(),
      conditionType,
      conditionValue: Number(conditionValue),
      description: description.trim(),
    };

    try {
      if (this.data.rewardEditorMode === 'edit') {
        await api.updateCustomReward(this.data.rewardEditingId, data);
        const list = this.data.customRewards.map((r: any) =>
          r.rewardId === this.data.rewardEditingId
            ? this.enrichReward({ ...r, ...data })
            : r
        );
        this.setData({ customRewards: list });
        wx.setStorageSync('customRewards', list);
        wx.showToast({ title: '奖励已更新', icon: 'success' });
      } else {
        const created = await api.createCustomReward(data);
        const list = [this.enrichReward(created), ...this.data.customRewards];
        this.setData({ customRewards: list });
        wx.setStorageSync('customRewards', list);
        wx.showToast({ title: '奖励已添加', icon: 'success' });
      }
      this.hideRewardEditor();
    } catch (err: any) {
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    } finally {
      this.setData({ rewardSaving: false });
    }
  },

  deleteReward(e: any) {
    const rewardId = e.currentTarget.dataset.id;
    const reward = this.data.customRewards.find((r: any) => r.rewardId === rewardId);
    if (!reward) return;
    wx.showModal({
      title: '删除奖励',
      content: `确定要删除「${reward.title}」吗？`,
      confirmColor: '#FA5151',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await api.deleteCustomReward(rewardId);
        } catch { /* 后端删除失败也继续前端删除 */ }
        const list = this.data.customRewards.filter((r: any) => r.rewardId !== rewardId);
        this.setData({ customRewards: list });
        wx.setStorageSync('customRewards', list);
        wx.showToast({ title: '已删除', icon: 'success' });
      },
    });
  },

  claimReward(e: any) {
    const rewardId = e.currentTarget.dataset.id;
    const reward = this.data.customRewards.find((r: any) => r.rewardId === rewardId);
    if (!reward || reward.isCompleted) return;

    if (reward.progressPct < 100) {
      wx.showToast({ title: `还差一点！进度 ${reward.progressPct}%`, icon: 'none' });
      return;
    }

    const list = this.data.customRewards.map((r: any) =>
      r.rewardId === rewardId ? { ...r, isCompleted: true, completedAt: new Date().toISOString() } : r
    );
    const bonusPoints = 100;
    this.setData({
      customRewards: list,
      points: this.data.points + bonusPoints,
    });
    wx.setStorageSync('customRewards', list);
    wx.showModal({
      title: '奖励领取成功！',
      content: `恭喜达成「${reward.title}」！\n积分 +${bonusPoints}`,
      showCancel: false,
    });
  },

  // ─── 表单输入 ───

  onRewardTitleInput(e: any) { this.setData({ 'rewardForm.title': e.detail.value }); },
  onRewardValueInput(e: any) { this.setData({ 'rewardForm.conditionValue': e.detail.value }); },
  onRewardDescInput(e: any) { this.setData({ 'rewardForm.description': e.detail.value }); },
});
