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
        dragStartY: 0,
        // AI 对话相关
        chatVisible: false,
        chatLoading: false,
        chatInput: '',
        chatMessages: [],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.loadTasks();
        this.generateAIPlan();
    },
    /**
     * 生命周期函数--监听页面显示（从其他页面返回时刷新数据）
     */
    onShow() {
        this.loadTasks();
        if (this.data.aiEnabled) {
            this.generateAIPlan();
        }
        else {
            this.generateManualPlan();
        }
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
            // 基于优先级的基础分
            let urgencyBase, importanceBase, urgencyRange, importanceRange;
            switch (task.priority) {
                case 'high':
                    urgencyBase = 75;
                    urgencyRange = 20;
                    importanceBase = 75;
                    importanceRange = 20;
                    break;
                case 'medium':
                    urgencyBase = 40;
                    urgencyRange = 30;
                    importanceBase = 55;
                    importanceRange = 30;
                    break;
                case 'low':
                    urgencyBase = 15;
                    urgencyRange = 25;
                    importanceBase = 15;
                    importanceRange = 25;
                    break;
                default:
                    urgencyBase = 40;
                    urgencyRange = 30;
                    importanceBase = 40;
                    importanceRange = 30;
            }
            // 根据任务时长微调：较长的任务通常更重要
            const durationBonus = (task.duration || 25) > 45 ? 10 : 0;
            // 根据已完成的番茄数微调：完成越多越不紧急
            const pomoDecay = (task.completedPomos || 0) * 5;
            const urgency = Math.min(99, Math.max(1, urgencyBase + Math.floor(Math.random() * urgencyRange) - pomoDecay));
            const importance = Math.min(99, Math.max(1, importanceBase + Math.floor(Math.random() * importanceRange) + durationBonus));
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
    },

    // ═══════════════════════════════════════
    //  AI 智能对话
    // ═══════════════════════════════════════

    toggleChat() {
        this.setData({ chatVisible: !this.data.chatVisible });
        if (this.data.chatVisible && this.data.chatMessages.length === 0) {
            this.addChatMessage('ai', '你好！我是你的AI规划助手。我可以帮你分析任务优先级、提供时间管理建议、拆解复杂任务。你有什么需要帮助的吗？');
        }
    },

    onChatInput(e) {
        this.setData({ chatInput: e.detail.value });
    },

    sendMessage() {
        const content = this.data.chatInput.trim();
        if (!content || this.data.chatLoading)
            return;
        this.addChatMessage('user', content);
        this.setData({ chatInput: '' });
        this.callAIApi(content);
    },

    addChatMessage(role, content) {
        const messages = [...this.data.chatMessages, {
            id: Date.now().toString(),
            role,
            content,
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }];
        this.setData({ chatMessages: messages });
    },

    callAIApi(userMessage) {
        this.setData({ chatLoading: true });
        // === 替换为真实 API 调用 ===
        setTimeout(() => {
            let reply = '';
            if (userMessage.includes('紧急') || userMessage.includes('优先级')) {
                const tasks = this.loadTasks();
                const urgentTasks = tasks.filter((t) => t.priority === 'high' || t.priority === 'medium');
                if (urgentTasks.length > 0) {
                    reply = `根据你的任务列表，优先级较高的任务有：\n${urgentTasks.map((t) => `• ${t.title}（${t.priorityText}优先级）`).join('\n')}\n\n建议先完成高优先级任务，再处理其他事项。`;
                }
                else {
                    reply = '目前你的任务都处于较低优先级。建议你可以利用这段时间学习新技能或处理长期项目。';
                }
            }
            else if (userMessage.includes('拆解') || userMessage.includes('步骤')) {
                const task = this.data.selectedTask;
                if (task) {
                    reply = `针对「${task.title}」的拆解建议：\n1. 明确最终目标\n2. 收集所需资料\n3. 制定执行计划\n4. 分配时间资源\n5. 设置检查节点\n\n需要我详细展开某个步骤吗？`;
                }
                else {
                    reply = '请先在四象限中点击一个任务，我可以帮你拆解执行步骤。';
                }
            }
            else if (userMessage.includes('时间') || userMessage.includes('计划')) {
                reply = '高效时间管理建议：\n1. 使用番茄工作法，25分钟专注+5分钟休息\n2. 优先处理重要且紧急的任务\n3. 每天早晨规划当天的三件要事\n4. 定期回顾和调整计划\n\n有什么具体问题想了解的吗？';
            }
            else if (userMessage.includes('描述') || userMessage.includes('详情')) {
                const tasks = this.loadTasks();
                const hasDesc = tasks.filter((t) => t.description);
                if (hasDesc.length > 0) {
                    reply = `以下是有详细描述的任务：\n${hasDesc.map((t) => `• ${t.title}：${t.description}`).join('\n')}`;
                }
                else {
                    reply = '目前还没有任务添加描述。你可以在添加任务时填写描述，方便AI更好地理解和规划。';
                }
            }
            else if (userMessage.includes('截止') || userMessage.includes('deadline')) {
                const tasks = this.loadTasks();
                const hasDeadline = tasks.filter((t) => t.deadline);
                if (hasDeadline.length > 0) {
                    const sorted = hasDeadline.sort((a, b) => a.deadline.localeCompare(b.deadline));
                    reply = `按截止日期排序的任务：\n${sorted.map((t) => `• ${t.title}（截止：${t.deadline}）`).join('\n')}\n\n请确保在截止日期前完成这些任务！`;
                }
                else {
                    reply = '当前任务都没有设置截止日期。建议在添加任务时设定截止日期，AI可以帮你合理安排时间。';
                }
            }
            else {
                reply = '我是AI规划助手，可以帮你：\n• 分析任务优先级\n• 拆解复杂任务\n• 提供时间管理建议\n• 查看任务详情\n\n请告诉我你需要什么帮助？';
            }
            this.addChatMessage('ai', reply);
            this.setData({ chatLoading: false });
        }, 1000);
    }
});
