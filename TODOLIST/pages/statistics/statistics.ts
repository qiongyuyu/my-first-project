// pages/statistics/statistics.ts
import { api } from '../../utils/api';
import { drawBarChart, drawPieChart } from '../../utils/chart-helper';

Page({
  data: {
    dateRanges: ['今日', '本周', '本月', '今年'],
    dateRangeIndex: 0,

    totalFocusTime: '0小时',
    totalPomos: 0,
    completionRate: 0,

    badges: [
      { id: '1', name: '初窥门径', description: '完成第一个番茄钟', icon: '', unlocked: true },
      { id: '2', name: '持之以恒', description: '连续7天专注', icon: '', unlocked: false },
      { id: '3', name: '效率达人', description: '单日完成10个番茄', icon: '', unlocked: false },
      { id: '4', name: '任务大师', description: '完成100个任务', icon: '', unlocked: false },
      { id: '5', name: '深夜工作者', description: '在凌晨专注学习', icon: '', unlocked: false },
      { id: '6', name: '周末战士', description: '周末完成20个番茄', icon: '', unlocked: false },
    ],
    unlockedCount: 1,
    totalCount: 6,

    chartsInited: false,
  },

  _durCanvas: null as any,
  _durW: 0,
  _durH: 0,
  _catCanvas: null as any,
  _catW: 0,
  _catH: 0,
  _chartData: null as { focusStats: any; categories: any } | null,

  onLoad() {
    this.loadStatistics();
  },

  onShow() {
    this.loadStatistics();
  },

  async loadStatistics() {
    this.initChartCanvases();

    const periods = ['day', 'week', 'month', 'year'];
    const period = periods[this.data.dateRangeIndex];

    try {
      const [focusStats, taskResult, categories] = await Promise.all([
        api.getFocusStats({ period }),
        api.getTasks(),
        api.getTaskCategories(),
      ]);

      const totalHours = (focusStats.totalDuration / 3600).toFixed(1);
      const completedTasks = taskResult.tasks.filter((t: any) => t.status === 'completed').length;
      const completionRate = taskResult.tasks.length > 0
        ? Math.round((completedTasks / taskResult.tasks.length) * 100) : 0;

      this.setData({
        totalFocusTime: `${totalHours}小时`,
        totalPomos: focusStats.totalPomos,
        completionRate,
      });

      // 数据就绪，尝试绘制
      this._chartData = { focusStats, categories };
      this.tryDrawCharts();
    } catch {
      const records = wx.getStorageSync('pomodoroRecords') || [];
      const tasks = wx.getStorageSync('tasks') || [];
      // 降级路径：也按时间范围筛选本地数据
      const filtered = this.filterRecordsByPeriod(records, period);
      const totalSeconds = filtered.reduce((sum: number, r: any) => sum + (r.duration || 0), 0);
      const totalHours = (totalSeconds / 3600).toFixed(1);
      const totalPomos = filtered.filter((r: any) => !r.isInterrupted).length;
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
      const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      this.setData({ totalFocusTime: `${totalHours}小时`, totalPomos, completionRate });
    }
  },

  filterRecordsByPeriod(records: any[], period: string): any[] {
    if (!records.length) return records;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    let start: Date;

    switch (period) {
      case 'day':
        start = new Date(today);
        break;
      case 'week': {
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return records;
    }
    const startTime = start.getTime();
    return records.filter((r: any) => {
      const t = r.startTime || r.createdAt;
      return t && new Date(t).getTime() >= startTime;
    });
  },

  initChartCanvases() {
    if (this.data.chartsInited) return;
    this.data.chartsInited = true;

    let durationReady = false;
    let categoryReady = false;

    const tryDraw = () => {
      if (durationReady && categoryReady) {
        this.tryDrawCharts();
      }
    };

    const durQuery = wx.createSelectorQuery();
    durQuery.select('#duration-canvas')
      .fields({ node: true, size: true })
      .exec((res: any) => {
        if (res && res[0] && res[0].node) {
          this._durCanvas = res[0].node;
          this._durW = res[0].width;
          this._durH = res[0].height;
        }
        durationReady = true;
        tryDraw();
      });

    const catQuery = wx.createSelectorQuery();
    catQuery.select('#category-canvas')
      .fields({ node: true, size: true })
      .exec((res: any) => {
        if (res && res[0] && res[0].node) {
          this._catCanvas = res[0].node;
          this._catW = res[0].width;
          this._catH = res[0].height;
        }
        categoryReady = true;
        tryDraw();
      });
  },

  /**
   * canvas 和数据都就绪后才真正绘制
   */
  tryDrawCharts() {
    if (!this._durCanvas || !this._catCanvas || !this._chartData) return;

    const { focusStats, categories } = this._chartData;

    // 柱状图 - 专注时长（使用后端返回的 label）
    if (focusStats.data) {
      const barData = focusStats.data.map((d: any) => ({
        label: d.label || d.date.slice(5),
        value: Math.round(d.duration / 60),
      }));
      drawBarChart(this._durCanvas, this._durW, this._durH, { data: barData, unit: ' 分钟' });
    }

    // 饼图 - 任务类别分布（来自 api.getTaskCategories）
    if (categories && categories.categories) {
      const pieData = categories.categories.map((c: any) => ({
        name: c.category,
        value: c.percentage,
      }));
      drawPieChart(this._catCanvas, this._catW, this._catH, { data: pieData });
    }

  },

  onDateRangeChange(e: any) {
    const idx = parseInt(e.detail.value);
    this.setData({ dateRangeIndex: idx });
    this.loadStatistics();
  },

  viewBadgeDetail(e: any) {
    const index = e.currentTarget.dataset.index;
    const badge = this.data.badges[index];
    wx.showModal({
      title: badge.name,
      content: badge.description,
      showCancel: false,
      confirmText: badge.unlocked ? '已解锁' : '未解锁',
    });
  },
});
