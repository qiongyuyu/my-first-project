"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// pages/statistics/statistics.ts
const echarts_1 = __importDefault(require("../../components/ec-canvas/echarts"));
Page({
    /**
     * 页面的初始数据
     */
    data: {
        dateRanges: ['今日', '本周', '本月', '今年'],
        dateRangeIndex: 0,
        // ECharts 实例
        ecDuration: {
            lazyLoad: true
        },
        ecCategory: {
            lazyLoad: true
        },
        // 统计数据
        totalFocusTime: '0小时',
        totalPomos: 0,
        completionRate: 0,
        // 成就徽章
        badges: [
            {
                id: '1',
                name: '初窥门径',
                description: '完成第一个番茄钟',
                icon: '',
                unlocked: true
            },
            {
                id: '2',
                name: '持之以恒',
                description: '连续7天专注',
                icon: '',
                unlocked: false
            },
            {
                id: '3',
                name: '效率达人',
                description: '单日完成10个番茄',
                icon: '',
                unlocked: false
            },
            {
                id: '4',
                name: '任务大师',
                description: '完成100个任务',
                icon: '',
                unlocked: false
            },
            {
                id: '5',
                name: '深夜工作者',
                description: '在凌晨专注学习',
                icon: '',
                unlocked: false
            },
            {
                id: '6',
                name: '周末战士',
                description: '周末完成20个番茄',
                icon: '',
                unlocked: false
            }
        ],
        unlockedCount: 1,
        totalCount: 6,
        // 图表实例
        durationChart: null,
        categoryChart: null
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.loadStatistics();
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.loadStatistics();
    },
    /**
     * 加载统计数据
     */
    loadStatistics() {
        // 从本地存储加载番茄钟记录
        const records = wx.getStorageSync('pomodoroRecords') || [];
        const tasks = wx.getStorageSync('tasks') || [];
        // 计算总专注时间（小时）
        const totalSeconds = records.reduce((sum, record) => sum + (record.duration || 0), 0);
        const totalHours = (totalSeconds / 3600).toFixed(1);
        // 计算总番茄数
        const totalPomos = records.filter((r) => !r.isInterrupted).length;
        // 计算任务完成率
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        this.setData({
            totalFocusTime: `${totalHours}小时`,
            totalPomos,
            completionRate
        });
        // 初始化图表
        this.initCharts();
    },
    /**
     * 初始化图表
     */
    initCharts() {
        // 获取图表组件
        this.selectComponent('#duration-chart').init((canvas, width, height) => {
            const chart = echarts_1.default.init(canvas, null, {
                width,
                height
            });
            this.setDurationChartOption(chart);
            this.data.durationChart = chart;
            return chart;
        });
        this.selectComponent('#category-chart').init((canvas, width, height) => {
            const chart = echarts_1.default.init(canvas, null, {
                width,
                height
            });
            this.setCategoryChartOption(chart);
            this.data.categoryChart = chart;
            return chart;
        });
    },
    /**
     * 设置专注时长图表选项
     */
    setDurationChartOption(chart) {
        // 模拟数据
        const data = [
            { date: '04-11', duration: 120 },
            { date: '04-12', duration: 180 },
            { date: '04-13', duration: 90 },
            { date: '04-14', duration: 210 },
            { date: '04-15', duration: 150 },
            { date: '04-16', duration: 240 },
            { date: '04-17', duration: 180 }
        ];
        const option = {
            backgroundColor: '#ffffff',
            tooltip: {
                trigger: 'axis',
                formatter: '{b}<br/>{a}: {c}分钟'
            },
            xAxis: {
                type: 'category',
                data: data.map(item => item.date),
                axisLine: {
                    lineStyle: {
                        color: '#eeeeee'
                    }
                },
                axisLabel: {
                    color: '#666666'
                }
            },
            yAxis: {
                type: 'value',
                name: '分钟',
                axisLine: {
                    lineStyle: {
                        color: '#eeeeee'
                    }
                },
                axisLabel: {
                    color: '#666666'
                },
                splitLine: {
                    lineStyle: {
                        color: '#f5f5f5'
                    }
                }
            },
            series: [
                {
                    name: '专注时长',
                    type: 'bar',
                    data: data.map(item => item.duration),
                    itemStyle: {
                        color: '#1aad19'
                    },
                    label: {
                        show: true,
                        position: 'top',
                        color: '#333333'
                    }
                }
            ]
        };
        chart.setOption(option);
    },
    /**
     * 设置任务类别图表选项
     */
    setCategoryChartOption(chart) {
        // 模拟数据
        const data = [
            { name: '学习', value: 40 },
            { name: '工作', value: 30 },
            { name: '健身', value: 15 },
            { name: '阅读', value: 10 },
            { name: '其他', value: 5 }
        ];
        const option = {
            backgroundColor: '#ffffff',
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}%'
            },
            series: [
                {
                    name: '任务类别',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '50%'],
                    data: data,
                    label: {
                        color: '#333333'
                    },
                    itemStyle: {
                        color: (params) => {
                            const colors = ['#1aad19', '#07c160', '#10aeff', '#ffc300', '#fa5151'];
                            return colors[params.dataIndex % colors.length];
                        }
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        chart.setOption(option);
    },
    /**
     * 日期范围变化
     */
    onDateRangeChange(e) {
        this.setData({
            dateRangeIndex: e.detail.value
        });
        // 重新加载对应范围的数据
        this.loadStatistics();
    },
    /**
     * 查看徽章详情
     */
    viewBadgeDetail(e) {
        const index = e.currentTarget.dataset.index;
        const badge = this.data.badges[index];
        wx.showModal({
            title: badge.name,
            content: badge.description,
            showCancel: false,
            confirmText: badge.unlocked ? '已解锁' : '未解锁'
        });
    }
});
