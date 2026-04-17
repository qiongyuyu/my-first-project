// pages/focus-timer/focus-timer.ts
const appInstance = getApp<IAppOption>();

// 计时器状态枚举
enum TimerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  BREAK = 'break'
}

// 中断原因枚举
enum InterruptReason {
  EMERGENCY = 'emergency',
  FATIGUE = 'fatigue',
  TASK_COMPLETED = 'task_completed',
  OTHER = 'other'
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 计时器相关
    timerState: TimerState.IDLE,
    timerStateText: '准备开始',
    currentTime: 25 * 60, // 默认25分钟，单位秒
    timerRunning: false,
    startTimestamp: 0, // 开始时间戳（毫秒）
    pausedTimestamp: 0, // 暂停时的时间戳
    accumulatedTime: 0, // 累计已计时时间（秒）
    timerInterval: null as number | null,

    // 任务相关
    tasks: [] as Task[],
    selectedTaskId: null as string | null,
    currentTaskTitle: '',
    estimatedPomos: 1,
    noTask: false, // 是否无任务专注

    // 模态框可见性
    taskModalVisible: false,
    interruptModalVisible: false,

    // 表单数据
    taskForm: {
      id: '',
      title: '',
      description: '',
      estimatedPomoIndex: 2, // 默认3个番茄
      priorityIndex: 1, // 默认中优先级
    },
    isEditing: false,

    // 选择器选项
    pomoOptions: ['1', '2', '3', '4', '5'],
    priorityOptions: ['低', '中', '高'],

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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadTasks();
    this.setData({
      isConnected: appInstance.globalData.isConnected
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 恢复计时器状态（处理页面切换）
    this.restoreTimerState();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 保存计时器状态到本地
    this.saveTimerState();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.clearTimerInterval();
    this.saveTimerState();
  },

  /**
   * 加载任务列表
   */
  loadTasks() {
    const tasks = wx.getStorageSync('tasks') || [];
    this.setData({ tasks });
  },

  /**
   * 保存任务列表
   */
  saveTasks() {
    wx.setStorageSync('tasks', this.data.tasks);
  },

  /**
   * 恢复计时器状态
   */
  restoreTimerState() {
    const timerState = wx.getStorageSync('timerState');
    if (timerState && timerState.state === TimerState.RUNNING) {
      // 计算经过的时间
      const now = Date.now();
      const elapsed = Math.floor((now - timerState.startTimestamp) / 1000);
      const remaining = timerState.duration - elapsed;

      if (remaining > 0) {
        // 恢复计时
        this.setData({
          timerState: TimerState.RUNNING,
          timerStateText: '专注中',
          currentTime: remaining,
          startTimestamp: timerState.startTimestamp,
          selectedTaskId: timerState.selectedTaskId,
          currentTaskTitle: timerState.currentTaskTitle,
          estimatedPomos: timerState.estimatedPomos,
          timerRunning: true
        });
        this.startTimerInterval();
      } else {
        // 时间已到，自动完成
        this.completeTimer();
      }
    }
  },

  /**
   * 保存计时器状态
   */
  saveTimerState() {
    if (this.data.timerState === TimerState.RUNNING) {
      const timerState = {
        state: this.data.timerState,
        startTimestamp: this.data.startTimestamp,
        duration: 25 * 60, // 默认25分钟
        selectedTaskId: this.data.selectedTaskId,
        currentTaskTitle: this.data.currentTaskTitle,
        estimatedPomos: this.data.estimatedPomos
      };
      wx.setStorageSync('timerState', timerState);
    } else {
      wx.removeStorageSync('timerState');
    }
  },

  /**
   * 启动计时器
   */
  startTimer() {
    if (this.data.timerRunning) return;

    const startTimestamp = Date.now();
    this.setData({
      timerState: TimerState.RUNNING,
      timerStateText: '专注中',
      startTimestamp,
      timerRunning: true
    });

    this.startTimerInterval();

    // 保存状态
    this.saveTimerState();

    // 通知后端开始计时
    this.reportTimerStart();
  },

  /**
   * 启动计时器间隔
   */
  startTimerInterval() {
    this.clearTimerInterval();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - this.data.startTimestamp) / 1000);
      const remaining = 25 * 60 - elapsed; // 25分钟专注

      if (remaining <= 0) {
        this.completeTimer();
      } else {
        this.setData({
          currentTime: remaining
        });
      }
    }, 1000);

    this.setData({
      timerInterval: interval
    });
  },

  /**
   * 清除计时器间隔
   */
  clearTimerInterval() {
    if (this.data.timerInterval) {
      clearInterval(this.data.timerInterval);
      this.setData({ timerInterval: null });
    }
  },

  /**
   * 暂停计时器
   */
  pauseTimer() {
    if (!this.data.timerRunning) return;

    this.clearTimerInterval();
    this.setData({
      timerState: TimerState.PAUSED,
      timerStateText: '已暂停',
      timerRunning: false,
      pausedTimestamp: Date.now()
    });
  },

  /**
   * 继续计时器
   */
  resumeTimer() {
    if (this.data.timerState !== TimerState.PAUSED) return;

    // 调整开始时间戳，减去暂停时间
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

  /**
   * 停止计时器（提前结束）
   */
  stopTimer() {
    this.setData({
      interruptModalVisible: true
    });
  },

  /**
   * 确认中断
   */
  confirmInterrupt() {
    this.completeTimer(true);
    this.setData({
      interruptModalVisible: false
    });
  },

  /**
   * 完成计时器（正常结束或中断）
   */
  completeTimer(isInterrupted = false) {
    this.clearTimerInterval();

    const endTimestamp = Date.now();
    const duration = Math.floor((endTimestamp - this.data.startTimestamp) / 1000);

    // 保存番茄钟记录
    this.savePomodoroRecord(duration, isInterrupted);

    // 更新任务进度
    if (this.data.selectedTaskId && !isInterrupted) {
      this.updateTaskProgress(this.data.selectedTaskId);
    }

    // 重置计时器
    this.setData({
      timerState: TimerState.IDLE,
      timerStateText: '准备开始',
      currentTime: 25 * 60,
      timerRunning: false,
      startTimestamp: 0,
      selectedTaskId: null,
      currentTaskTitle: '',
      estimatedPomos: 1
    });

    wx.removeStorageSync('timerState');

    // 显示休息提醒
    if (!isInterrupted) {
      wx.showModal({
        title: '专注完成',
        content: '恭喜完成一个番茄钟！建议休息5分钟。',
        showCancel: false
      });
    }

    // 上报数据到后端
    this.reportTimerComplete(duration, isInterrupted);
  },

  /**
   * 保存番茄钟记录
   */
  savePomodoroRecord(duration: number, isInterrupted: boolean) {
    const record = {
      id: Date.now().toString(),
      userId: 'current', // 实际应从全局获取
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

    // 如果离线，加入离线队列
    if (!this.data.isConnected) {
      appInstance.addOfflineOperation({
        type: 'pomodoro',
        data: record
      });
    }
  },

  /**
   * 更新任务进度
   */
  updateTaskProgress(taskId: string) {
    const tasks = this.data.tasks.map((task: Task) => {
      if (task.id === taskId) {
        const completedPomos = (task.completedPomos || 0) + 1;
        const progress = Math.min(100, Math.floor((completedPomos / task.estimatedPomos) * 100));
        return {
          ...task,
          completedPomos,
          progress,
          status: progress >= 100 ? 'completed' : task.status
        };
      }
      return task;
    });

    this.setData({ tasks });
    this.saveTasks();

    // 同步到后端
    // TODO: 调用API更新任务
  },

  /**
   * 上报计时开始
   */
  reportTimerStart() {
    // TODO: 调用后端API
  },

  /**
   * 上报计时完成
   */
  reportTimerComplete(_duration: number, _isInterrupted: boolean) {
    // TODO: 调用后端API
  },

  /**
   * 选择任务
   */
  selectTask(e: any) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find((t: Task) => t.id === taskId);
    if (!task) return;

    this.setData({
      selectedTaskId: taskId,
      currentTaskTitle: task.title,
      estimatedPomos: task.estimatedPomos,
      noTask: false
    });

    wx.showToast({
      title: `已选择任务: ${task.title}`,
      icon: 'success'
    });
  },

  /**
   * 显示任务模态框
   */
  showTaskModal(e?: any) {
    if (e && e.currentTarget.dataset.id) {
      // 编辑任务
      const taskId = e.currentTarget.dataset.id;
      const task = this.data.tasks.find((t: Task) => t.id === taskId);
      if (task) {
        const estimatedPomoIndex = this.data.pomoOptions.findIndex((opt: string) => opt === task.estimatedPomos.toString());
        const priorityIndex = this.data.priorityOptions.findIndex((opt: string) => opt === task.priorityText);

        this.setData({
          taskForm: {
            id: task.id,
            title: task.title,
            description: task.description,
            estimatedPomoIndex: estimatedPomoIndex >= 0 ? estimatedPomoIndex : 2,
            priorityIndex: priorityIndex >= 0 ? priorityIndex : 1
          },
          isEditing: true
        });
      }
    } else {
      // 新建任务
      this.setData({
        taskForm: {
          id: '',
          title: '',
          description: '',
          estimatedPomoIndex: 2,
          priorityIndex: 1
        },
        isEditing: false
      });
    }

    this.setData({ taskModalVisible: true });
  },

  /**
   * 隐藏任务模态框
   */
  hideTaskModal() {
    this.setData({ taskModalVisible: false });
  },

  /**
   * 保存任务
   */
  saveTask() {
    const { title, description, estimatedPomoIndex, priorityIndex, id } = this.data.taskForm;

    if (!title.trim()) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' });
      return;
    }

    const estimatedPomos = parseInt(this.data.pomoOptions[estimatedPomoIndex]);
    const priority = (['low', 'medium', 'high'] as const)[priorityIndex] as 'low' | 'medium' | 'high';
    const priorityText = this.data.priorityOptions[priorityIndex];

    let tasks = [...this.data.tasks];

    if (this.data.isEditing && id) {
      // 更新任务
      tasks = tasks.map(task =>
        task.id === id ? {
          ...task,
          title,
          description,
          estimatedPomos,
          priority,
          priorityText
        } : task
      );
    } else {
      // 新建任务
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        description,
        estimatedPomos,
        completedPomos: 0,
        progress: 0,
        priority,
        priorityText,
        status: 'pending',
        createdAt: Date.now()
      };
      tasks.unshift(newTask);
    }

    this.setData({ tasks });
    this.saveTasks();
    this.hideTaskModal();

    // 同步到后端
    // TODO: 调用API
  },

  /**
   * 删除任务
   */
  deleteTask(e: any) {
    const taskId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，确定删除吗？',
      success: (res: any) => {
        if (res.confirm) {
          const tasks = this.data.tasks.filter((task: Task) => task.id !== taskId);
          this.setData({ tasks });
          this.saveTasks();

          // 如果删除的是当前选中的任务，清空选中
          if (this.data.selectedTaskId === taskId) {
            this.setData({
              selectedTaskId: null,
              currentTaskTitle: '',
              estimatedPomos: 1
            });
          }
        }
      }
    });
  },

  /**
   * 编辑任务
   */
  editTask(e: any) {
    this.showTaskModal(e);
  },

  /**
   * 表单输入处理
   */
  onTaskTitleInput(e: any) {
    this.setData({
      'taskForm.title': e.detail.value
    });
  },

  onTaskDescInput(e: any) {
    this.setData({
      'taskForm.description': e.detail.value
    });
  },

  onPomoChange(e: any) {
    this.setData({
      'taskForm.estimatedPomoIndex': e.detail.value
    });
  },

  onPriorityChange(e: any) {
    this.setData({
      'taskForm.priorityIndex': e.detail.value
    });
  },

  onInterruptReasonChange(e: any) {
    this.setData({
      interruptReason: e.detail.value
    });
  },

  hideInterruptModal() {
    this.setData({ interruptModalVisible: false });
  },

  /**
   * 格式化时间显示
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
});

// 任务类型定义
interface Task {
  id: string;
  title: string;
  description: string;
  estimatedPomos: number;
  completedPomos: number;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  priorityText: string;
  status: 'pending' | 'completed';
  createdAt: number;
}