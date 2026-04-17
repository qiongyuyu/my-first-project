"use strict";
// pages/ai-planning/ai-planning.ts
Page({
    /**
     * 页面的初始数据
     */
    data: {
        aiEnabled: true,
        urgencyWeight: 50,
        importanceWeight: 50,
        // 四象限数据
        quadrants: [
            {
                id: 0,
                name: '重要且紧急',
                tasks: []
            },
            {
                id: 1,
                name: '重要不紧急',
                tasks: []
            },
            {
                id: 2,
                name: '紧急不重要',
                tasks: []
            },
            {
                id: 3,
                name: '不紧急不重要',
                tasks: []
            }
        ],
        // 当前选中的任务
        selectedTask: null,
        // 拖拽相关
        draggingTask: null,
        dragStartX: 0,
        dragStartY: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.loadTasks();
        this.generateAIPlan();
    },
    /**
     * 加载任务数据
     */
    loadTasks() {
        const tasks = wx.getStorageSync('tasks') || [];
        return tasks;
    },
    /**
     * 生成AI规划
     */
    generateAIPlan() {
        if (!this.data.aiEnabled) {
            this.generateManualPlan();
            return;
        }
        // 模拟AI规划
        const tasks = this.loadTasks();
        const urgencyWeight = this.data.urgencyWeight / 100;
        const importanceWeight = this.data.importanceWeight / 100;
        // 为每个任务计算紧急度和重要性分数
        const scoredTasks = tasks.map((task) => {
            // 模拟AI评分
            const urgency = Math.floor(Math.random() * 100); // 0-100
            const importance = Math.floor(Math.random() * 100);
            // 加权综合分
            const score = urgency * urgencyWeight + importance * importanceWeight;
            return Object.assign(Object.assign({}, task), { urgency,
                importance,
                score, x: Math.random() * 150, y: Math.random() * 150, dragging: false });
        });
        // 根据分数分配到四象限
        const quadrants = this.data.quadrants.map(() => []);
        scoredTasks.forEach((task) => {
            let quadrantIndex = 3; // 默认第四象限
            if (task.urgency >= 70 && task.importance >= 70) {
                quadrantIndex = 0; // 第一象限
            }
            else if (task.urgency < 70 && task.importance >= 70) {
                quadrantIndex = 1; // 第二象限
            }
            else if (task.urgency >= 70 && task.importance < 70) {
                quadrantIndex = 2; // 第三象限
            }
            quadrants[quadrantIndex].push(task);
        });
        // 更新数据
        this.setData({
            quadrants: this.data.quadrants.map((quadrant, index) => (Object.assign(Object.assign({}, quadrant), { tasks: quadrants[index] })))
        });
    },
    /**
     * 生成手动规划
     */
    generateManualPlan() {
        const tasks = this.loadTasks();
        const quadrants = this.data.quadrants.map(() => []);
        // 简单按优先级分配
        tasks.forEach((task) => {
            let quadrantIndex = 3;
            if (task.priority === 'high') {
                quadrantIndex = 0; // 假设高优先级为重要紧急
            }
            else if (task.priority === 'medium') {
                quadrantIndex = 1; // 中优先级为重要不紧急
            }
            else if (task.priority === 'low') {
                quadrantIndex = 2; // 低优先级为紧急不重要
            }
            quadrants[quadrantIndex].push(Object.assign(Object.assign({}, task), { urgency: task.priority === 'high' ? 80 : task.priority === 'medium' ? 50 : 30, importance: task.priority === 'high' ? 90 : task.priority === 'medium' ? 70 : 40, x: Math.random() * 150, y: Math.random() * 150, dragging: false }));
        });
        this.setData({
            quadrants: this.data.quadrants.map((quadrant, index) => (Object.assign(Object.assign({}, quadrant), { tasks: quadrants[index] })))
        });
    },
    /**
     * 切换AI开关
     */
    toggleAI(e) {
        const aiEnabled = e.detail.value;
        this.setData({ aiEnabled });
        if (aiEnabled) {
            this.generateAIPlan();
        }
        else {
            wx.showToast({
                title: '已切换至自主规划模式',
                icon: 'none'
            });
            this.generateManualPlan();
        }
    },
    /**
     * 紧急度权重变化
     */
    onUrgencyWeightChange(e) {
        this.setData({
            urgencyWeight: e.detail.value
        });
    },
    /**
     * 重要性权重变化
     */
    onImportanceWeightChange(e) {
        this.setData({
            importanceWeight: e.detail.value
        });
    },
    /**
     * 任务移动处理
     */
    onTaskMove(e) {
        const { quadrant, index } = e.currentTarget.dataset;
        const x = e.detail.x;
        const y = e.detail.y;
        // 更新任务位置
        const key = `quadrants[${quadrant}].tasks[${index}]`;
        this.setData({
            [key + '.x']: x,
            [key + '.y']: y,
            [key + '.dragging']: true
        });
        this.setData({
            draggingTask: { quadrant, index }
        });
    },
    /**
     * 任务拖拽结束
     */
    onTaskDrop(e) {
        const { quadrant, index } = e.currentTarget.dataset;
        // 清除拖拽状态
        const key = `quadrants[${quadrant}].tasks[${index}]`;
        this.setData({
            [key + '.dragging']: false
        });
        // 判断是否移动到其他象限
        // 这里应该计算任务是否移出了当前象限
        // 简化处理：不实现跨象限移动
        this.setData({
            draggingTask: null
        });
    },
    /**
     * 获取象限的矩形区域
     */
    getQuadrantRect(_quadrantIndex) {
        // 实际应该通过选择器获取元素位置
        // 简化返回固定值
        return {
            left: 0,
            top: 0,
            width: 375,
            height: 300
        };
    },
    /**
     * 选择任务查看拆解
     */
    selectTask(e) {
        const { quadrant, index } = e.currentTarget.dataset;
        const task = this.data.quadrants[quadrant].tasks[index];
        // 如果任务没有拆解建议，生成模拟数据
        if (!task.breakdown) {
            task.breakdown = [
                '明确任务目标和最终成果',
                '收集所需资料和信息',
                '制定详细执行步骤',
                '分配时间和资源',
                '设置检查点和反馈机制'
            ];
        }
        this.setData({
            selectedTask: task
        });
    },
    /**
     * 生成任务拆解建议
     */
    generateBreakdown() {
        if (!this.data.selectedTask)
            return;
        // 模拟AI生成拆解建议
        const breakdown = [
            `明确${this.data.selectedTask.title}的具体目标`,
            '收集相关参考资料和工具',
            '制定详细的时间安排表',
            '分解为可执行的小步骤',
            '设置每个步骤的完成标准',
            '预留调整和优化的时间',
            '制定验收和总结环节'
        ];
        const selectedTask = Object.assign(Object.assign({}, this.data.selectedTask), { breakdown });
        this.setData({
            selectedTask
        });
        wx.showToast({
            title: '已生成拆解建议',
            icon: 'success'
        });
    }
});
