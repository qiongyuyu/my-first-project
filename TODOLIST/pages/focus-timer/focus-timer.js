"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/focus-timer/focus-timer.ts
const api_1 = require("../../utils/api");
const appInstance = getApp();
// 励志语录库
const QUOTES = [
    '专注是通往成功最短的路',
    '每一分钟的专注，都是对未来最好的投资',
    '做好眼前的事，未来自然会到来',
    '积跬步以至千里，积小流以成江海',
    '坚持是最好的天赋',
    '专注当下，把握此刻',
    '成功源于日积月累的努力',
    '心无旁骛，方能成大事',
    '一次只做一件事，把它做好',
    '今天的坚持，是明天的骄傲',
    '不积跬步，无以至千里',
    '越努力，越幸运',
    '梦想不会逃跑，逃跑的只会是自己',
    '没有比脚更长的路，没有比人更高的山',
    '行动是治愈恐惧的良药',
];
// 计时器状态枚举
var TimerState;
(function (TimerState) {
    TimerState["IDLE"] = "idle";
    TimerState["RUNNING"] = "running";
    TimerState["PAUSED"] = "paused";
    TimerState["BREAK"] = "break";
})(TimerState || (TimerState = {}));
// 中断原因枚举
var InterruptReason;
(function (InterruptReason) {
    InterruptReason["EMERGENCY"] = "emergency";
    InterruptReason["FATIGUE"] = "fatigue";
    InterruptReason["TASK_COMPLETED"] = "task_completed";
    InterruptReason["OTHER"] = "other";
})(InterruptReason || (InterruptReason = {}));
Page({
    data: {
        // 页面视图模式：'list' 任务列表 | 'timer' 番茄钟计时
        viewMode: 'list',
        // 计时器相关
        timerState: TimerState.IDLE,
        timerStateText: '准备开始',
        currentTime: 25 * 60,
        totalDuration: 25 * 60,
        progressDeg: 0,
        timerRunning: false,
        startTimestamp: 0,
        pausedTimestamp: 0,
        timerInterval: null,
        // 当前显示的励志语录
        currentQuote: '',
        // 任务相关
        tasks: [],
        selectedTaskId: null,
        currentTaskTitle: '',
        estimatedPomos: 1,
        noTask: false,
        // 模态框可见性
        taskModalVisible: false,
        interruptModalVisible: false,
        // 表单数据
        taskForm: {
            id: '',
            title: '',
            estimatedPomoIndex: 1,
            priorityIndex: 1,
            durationIndex: 0,
            deadline: '',
            description: '',
        },
        isEditing: false,
        // 选择器选项
        pomoOptions: ['1', '2', '3', '4', '5'],
        priorityOptions: ['低', '中', '高'],
        durationOptions: ['25', '45', '60', '90'],
        // 中断原因
        interruptReasons: [
            { name: '紧急事务', value: InterruptReason.EMERGENCY },
            { name: '疲劳需要休息', value: InterruptReason.FATIGUE },
            { name: '任务已完成', value: InterruptReason.TASK_COMPLETED },
            { name: '其他原因', value: InterruptReason.OTHER }
        ],
        interruptReason: InterruptReason.EMERGENCY,
        // 网络状态
        isConnected: true,
        // 状态栏高度（自定义导航栏适配）
        statusBarHeight: 0,
    },
    onLoad() {
        this.loadTasks();
        this.setData({ isConnected: appInstance.globalData.isConnected });
        const windowInfo = wx.getWindowInfo();
        this.setData({ statusBarHeight: windowInfo.statusBarHeight });
    },
    onShow() {
        this.restoreTimerState();
    },
    onHide() {
        this.saveTimerState();
    },
    onUnload() {
        this.clearTimerInterval();
        this.saveTimerState();
    },
    async loadTasks() {
        try {
            const result = await api_1.api.getTasks();
            const list = result.tasks || result.items || [];
            const tasks = list.map((t) => this.mapToTask(t));
            this.setData({ tasks: tasks });
            wx.setStorageSync('tasks', tasks);
        }
        catch (_a) {
            const tasks = wx.getStorageSync('tasks') || [];
            this.setData({ tasks });
        }
    },
    mapToTask(t) {
        const priorityMap = { low: '低', medium: '中', high: '高' };
        return {
            id: t.taskId || t.id,
            title: t.title,
            estimatedPomos: t.estimatedPomos || 1,
            completedPomos: t.completedPomos || 0,
            progress: t.progress || 0,
            priority: t.priority || 'medium',
            priorityText: priorityMap[t.priority] || '中',
            duration: t.duration || 25,
            status: t.status || 'pending',
            createdAt: typeof t.createdAt === 'string' ? new Date(t.createdAt).getTime() : (t.createdAt || Date.now()),
            deadline: t.deadline || undefined,
            description: t.description || undefined,
        };
    },
    saveTasks() {
        wx.setStorageSync('tasks', this.data.tasks);
    },
    restoreTimerState() {
        const timerState = wx.getStorageSync('timerState');
        if (timerState && timerState.state === TimerState.RUNNING) {
            const now = Date.now();
            const elapsed = Math.floor((now - timerState.startTimestamp) / 1000);
            const remaining = timerState.duration - elapsed;
            if (remaining > 0) {
                const progressDeg = Math.round((1 - remaining / timerState.duration) * 360);
                this.setData({
                    timerState: TimerState.RUNNING,
                    timerStateText: '专注中',
                    currentTime: remaining,
                    totalDuration: timerState.duration,
                    progressDeg,
                    startTimestamp: timerState.startTimestamp,
                    selectedTaskId: timerState.selectedTaskId,
                    currentTaskTitle: timerState.currentTaskTitle,
                    estimatedPomos: timerState.estimatedPomos,
                    timerRunning: true,
                    viewMode: 'timer',
                    currentQuote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
                });
                this.startTimerInterval();
            }
            else {
                this.completeTimer();
            }
        }
    },
    saveTimerState() {
        if (this.data.timerState === TimerState.RUNNING) {
            wx.setStorageSync('timerState', {
                state: this.data.timerState,
                startTimestamp: this.data.startTimestamp,
                duration: this.data.totalDuration,
                selectedTaskId: this.data.selectedTaskId,
                currentTaskTitle: this.data.currentTaskTitle,
                estimatedPomos: this.data.estimatedPomos
            });
        }
        else {
            wx.removeStorageSync('timerState');
        }
    },
    startTimer() {
        if (this.data.timerRunning)
            return;
        const startTimestamp = Date.now();
        this.setData({
            timerState: TimerState.RUNNING,
            timerStateText: '专注中',
            startTimestamp,
            timerRunning: true,
            viewMode: 'timer',
            currentQuote: QUOTES[Math.floor(Math.random() * QUOTES.length)],
        });
        this.startTimerInterval();
        this.saveTimerState();
        this.reportTimerStart();
    },
    startTimerInterval() {
        this.clearTimerInterval();
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - this.data.startTimestamp) / 1000);
            const remaining = this.data.totalDuration - elapsed;
            const progressDeg = Math.round((1 - Math.max(0, remaining) / this.data.totalDuration) * 360);
            if (remaining <= 0) {
                this.completeTimer();
            }
            else {
                this.setData({ currentTime: remaining, progressDeg });
            }
        }, 1000);
        this.setData({ timerInterval: interval });
    },
    clearTimerInterval() {
        if (this.data.timerInterval) {
            clearInterval(this.data.timerInterval);
            this.setData({ timerInterval: null });
        }
    },
    pauseTimer() {
        if (!this.data.timerRunning)
            return;
        this.clearTimerInterval();
        this.setData({
            timerState: TimerState.PAUSED,
            timerStateText: '已暂停',
            timerRunning: false,
            pausedTimestamp: Date.now()
        });
    },
    resumeTimer() {
        if (this.data.timerState !== TimerState.PAUSED)
            return;
        const pauseDuration = Date.now() - this.data.pausedTimestamp;
        const adjustedStartTimestamp = this.data.startTimestamp + pauseDuration;
        this.setData({
            timerState: TimerState.RUNNING,
            timerStateText: '专注中',
            startTimestamp: adjustedStartTimestamp,
            timerRunning: true
        });
        this.startTimerInterval();
    },
    stopTimer() {
        this.setData({ interruptModalVisible: true });
    },
    confirmInterrupt() {
        this.completeTimer(true);
        this.setData({ interruptModalVisible: false });
    },
    completeTimer(isInterrupted = false) {
        this.clearTimerInterval();
        const endTimestamp = Date.now();
        const duration = Math.floor((endTimestamp - this.data.startTimestamp) / 1000);
        this.savePomodoroRecord(duration, isInterrupted);
        if (this.data.selectedTaskId && !isInterrupted) {
            this.updateTaskProgress(this.data.selectedTaskId);
        }
        this.setData({
            timerState: TimerState.IDLE,
            timerStateText: '准备开始',
            currentTime: this.data.totalDuration,
            progressDeg: 0,
            timerRunning: false,
            startTimestamp: 0,
            selectedTaskId: null,
            currentTaskTitle: '',
            estimatedPomos: 1,
            viewMode: 'list',
        });
        wx.removeStorageSync('timerState');
        if (!isInterrupted) {
            wx.showModal({
                title: '专注完成 🎉',
                content: '太棒了！完成了一个番茄钟，建议休息一下。',
                showCancel: false
            });
        }
        this.reportTimerComplete(duration, isInterrupted);
    },
    savePomodoroRecord(duration, isInterrupted) {
        const record = {
            id: Date.now().toString(),
            userId: 'current',
            taskId: this.data.selectedTaskId,
            startTime: this.data.startTimestamp,
            endTime: Date.now(),
            duration,
            isInterrupted,
            interruptReason: isInterrupted ? this.data.interruptReason : null,
            syncStatus: this.data.isConnected ? 'synced' : 'pending'
        };
        let records = wx.getStorageSync('pomodoroRecords') || [];
        records.push(record);
        wx.setStorageSync('pomodoroRecords', records);
        if (!this.data.isConnected) {
            appInstance.addOfflineOperation({ type: 'pomodoro', data: record });
        }
    },
    updateTaskProgress(taskId) {
        const tasks = this.data.tasks.map((task) => {
            if (task.id === taskId) {
                const completedPomos = (task.completedPomos || 0) + 1;
                const progress = Math.min(100, Math.floor((completedPomos / task.estimatedPomos) * 100));
                const status = progress >= 100 ? 'completed' : task.status;
                api_1.api.updateTask(taskId, { completedPomos, progress, status }).catch(function (e) { console.error('updateTaskProgress fail:', e.message); });
                return Object.assign(Object.assign({}, task), { completedPomos, progress, status });
            }
            return task;
        });
        this.setData({ tasks });
        this.saveTasks();
    },
    reportTimerStart() { },
    reportTimerComplete(_duration, _isInterrupted) { },
    /**
     * 选中任务并立即开始计时（从任务卡片"开始"按钮触发）
     */
    selectAndStart(e) {
        if (this.data.timerRunning || this.data.timerState === TimerState.PAUSED) {
            wx.showToast({ title: '当前有专注进行中', icon: 'none' });
            return;
        }
        const taskId = e.currentTarget.dataset.id;
        const task = this.data.tasks.find((t) => t.id === taskId);
        if (!task)
            return;
        this.setData({
            selectedTaskId: taskId,
            currentTaskTitle: task.title,
            estimatedPomos: task.estimatedPomos,
            totalDuration: (task.duration || 25) * 60,
            noTask: false
        });
        this.startTimer();
    },
    selectTask(e) {
        const taskId = e.currentTarget.dataset.id;
        const task = this.data.tasks.find((t) => t.id === taskId);
        if (!task)
            return;
        this.setData({
            selectedTaskId: taskId,
            currentTaskTitle: task.title,
            estimatedPomos: task.estimatedPomos,
            noTask: false
        });
        wx.showToast({ title: `已选择: ${task.title}`, icon: 'success' });
    },
    showTaskModal(e) {
        if (e && e.currentTarget.dataset.id) {
            const taskId = e.currentTarget.dataset.id;
            const task = this.data.tasks.find((t) => t.id === taskId);
            if (task) {
                const estimatedPomoIndex = this.data.pomoOptions.findIndex((opt) => opt === task.estimatedPomos.toString());
                const priorityIndex = this.data.priorityOptions.findIndex((opt) => opt === task.priorityText);
                const durationIndex = this.data.durationOptions.findIndex((opt) => opt === String(task.duration || 25));
                this.setData({
                    taskForm: {
                        id: task.id,
                        title: task.title,
                        estimatedPomoIndex: estimatedPomoIndex >= 0 ? estimatedPomoIndex : 1,
                        priorityIndex: priorityIndex >= 0 ? priorityIndex : 1,
                        durationIndex: durationIndex >= 0 ? durationIndex : 0,
                        deadline: task.deadline || '',
                        description: task.description || '',
                    },
                    isEditing: true
                });
            }
        }
        else {
            this.setData({
                taskForm: { id: '', title: '', estimatedPomoIndex: 1, priorityIndex: 1, durationIndex: 0, deadline: '', description: '' },
                isEditing: false
            });
        }
        this.setData({ taskModalVisible: true });
    },
    hideTaskModal() {
        this.setData({ taskModalVisible: false });
    },
    /**
     * 保存任务：
     * - 编辑模式：仅保存，留在列表页
     * - 新建模式：保存并立即开始番茄钟
     */
    saveTask() {
        var _this = this;
        const { title, estimatedPomoIndex, priorityIndex, durationIndex, id } = this.data.taskForm;
        if (!title.trim()) {
            wx.showToast({ title: '请输入任务名称', icon: 'none' });
            return;
        }
        const estimatedPomos = parseInt(this.data.pomoOptions[estimatedPomoIndex]);
        const priority = ['low', 'medium', 'high'][priorityIndex];
        const priorityText = this.data.priorityOptions[priorityIndex];
        const duration = parseInt(this.data.durationOptions[durationIndex]);
        if (this.data.isEditing && id) {
            const apiData = {
                title, priority, estimatedPomos,
                description: this.data.taskForm.description || undefined,
                deadline: this.data.taskForm.deadline || undefined,
            };
            let tasks = this.data.tasks.map(task => task.id === id ? Object.assign(Object.assign({}, task), { title, estimatedPomos, priority, priorityText, duration, deadline: this.data.taskForm.deadline || undefined, description: this.data.taskForm.description || undefined }) : task);
            this.setData({ tasks });
            this.saveTasks();
            this.hideTaskModal();
            api_1.api.updateTask(id, apiData).catch(function (e) { console.error('updateTask fail:', e.message); });
        }
        else {
            if (this.data.timerRunning || this.data.timerState === TimerState.PAUSED) {
                wx.showToast({ title: '当前有专注进行中', icon: 'none' });
                return;
            }
            const localId = Date.now().toString();
            const newTask = {
                id: localId, title, estimatedPomos,
                completedPomos: 0, progress: 0, priority, priorityText,
                duration, status: 'pending', createdAt: Date.now(),
                deadline: this.data.taskForm.deadline || undefined,
                description: this.data.taskForm.description || undefined,
            };
            const tasks = [newTask, ...this.data.tasks];
            this.setData({
                tasks, selectedTaskId: newTask.id,
                currentTaskTitle: newTask.title,
                estimatedPomos: newTask.estimatedPomos,
                totalDuration: duration * 60, noTask: false
            });
            this.saveTasks();
            this.hideTaskModal();
            const apiData = { title, priority, estimatedPomos };
            api_1.api.createTask(apiData).then(function (created) {
                if (created && created.taskId) {
                    const synced = _this.data.tasks.map(function (t) { return t.id === localId ? Object.assign(Object.assign({}, t), { id: created.taskId }) : t; });
                    _this.setData({ tasks: synced, selectedTaskId: created.taskId });
                    _this.saveTasks();
                }
            }).catch(function (e) {
                console.error('createTask fail:', e.message);
                wx.showToast({ title: '任务已本地保存', icon: 'none' });
            });
            this.startTimer();
        }
    },
    deleteTask(e) {
        const taskId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确认删除',
            content: '删除后无法恢复，确定删除吗？',
            success: (res) => {
                if (res.confirm) {
                    const tasks = this.data.tasks.filter((task) => task.id !== taskId);
                    this.setData({ tasks });
                    this.saveTasks();
                    if (this.data.selectedTaskId === taskId) {
                        this.setData({ selectedTaskId: null, currentTaskTitle: '', estimatedPomos: 1 });
                    }
                    api_1.api.deleteTask(taskId).catch(function (e) { console.error('deleteTask fail:', e.message); });
                }
            }
        });
    },
    editTask(e) {
        this.showTaskModal(e);
    },
    onTaskTitleInput(e) {
        this.setData({ 'taskForm.title': e.detail.value });
    },
    onPomoChange(e) {
        this.setData({ 'taskForm.estimatedPomoIndex': e.detail.value });
    },
    onPriorityChange(e) {
        this.setData({ 'taskForm.priorityIndex': e.detail.value });
    },
    onDurationChange(e) {
        this.setData({ 'taskForm.durationIndex': e.detail.value });
    },
    onDeadlineChange(e) {
        this.setData({ 'taskForm.deadline': e.detail.value });
    },
    onDescriptionInput(e) {
        this.setData({ 'taskForm.description': e.detail.value });
    },
    onInterruptReasonChange(e) {
        this.setData({ interruptReason: e.detail.value });
    },
    hideInterruptModal() {
        this.setData({ interruptModalVisible: false });
    },
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
});
