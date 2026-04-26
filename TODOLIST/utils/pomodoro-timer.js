"use strict";
// utils/pomodoro-timer.ts
/**
 * 番茄钟计时器核心算法
 * 基于时间戳差值计算，解决切后台时间不准问题
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pomodoroTimer = exports.PomodoroTimer = exports.TimerType = exports.TimerState = void 0;
var TimerState;
(function (TimerState) {
    TimerState["IDLE"] = "idle";
    TimerState["RUNNING"] = "running";
    TimerState["PAUSED"] = "paused";
    TimerState["BREAK"] = "break";
    TimerState["COMPLETED"] = "completed";
})(TimerState || (exports.TimerState = TimerState = {}));
var TimerType;
(function (TimerType) {
    TimerType["FOCUS"] = "focus";
    TimerType["SHORT_BREAK"] = "short_break";
    TimerType["LONG_BREAK"] = "long_break";
})(TimerType || (exports.TimerType = TimerType = {}));
const DEFAULT_CONFIG = {
    focusDuration: 25 * 60, // 25分钟
    shortBreakDuration: 5 * 60, // 5分钟
    longBreakDuration: 15 * 60, // 15分钟
    pomodorosUntilLongBreak: 4
};
class PomodoroTimer {
    constructor(config = {}) {
        this.intervalId = null;
        this.listeners = new Map();
        this.config = Object.assign(Object.assign({}, DEFAULT_CONFIG), config);
        this.status = {
            state: TimerState.IDLE,
            type: TimerType.FOCUS,
            remainingTime: this.config.focusDuration,
            elapsedTime: 0,
            totalDuration: this.config.focusDuration,
            completedPomodoros: 0
        };
    }
    /**
     * 开始计时
     */
    start() {
        if (this.status.state === TimerState.RUNNING) {
            console.warn('[计时器] 已经在运行中');
            return;
        }
        const now = Date.now();
        if (this.status.state === TimerState.PAUSED && this.status.pauseTimestamp) {
            // 从暂停状态恢复
            const pauseDuration = now - this.status.pauseTimestamp;
            this.status.accumulatedTime = (this.status.accumulatedTime || 0) + pauseDuration;
            this.status.pauseTimestamp = undefined;
        }
        else {
            // 全新开始
            this.status.startTimestamp = now;
            this.status.accumulatedTime = 0;
        }
        this.status.state = TimerState.RUNNING;
        this.startInterval();
        this.emit('start', this.status);
        console.log(`[计时器] 开始 ${this.status.type} 计时`);
    }
    /**
     * 暂停计时
     */
    pause() {
        if (this.status.state !== TimerState.RUNNING) {
            console.warn('[计时器] 当前不是运行状态，无法暂停');
            return;
        }
        this.clearInterval();
        this.status.state = TimerState.PAUSED;
        this.status.pauseTimestamp = Date.now();
        this.emit('pause', this.status);
        console.log('[计时器] 已暂停');
    }
    /**
     * 继续计时
     */
    resume() {
        if (this.status.state !== TimerState.PAUSED) {
            console.warn('[计时器] 当前不是暂停状态，无法继续');
            return;
        }
        this.start();
    }
    /**
     * 停止计时
     */
    stop(isInterrupted = false) {
        this.clearInterval();
        const endTimestamp = Date.now();
        const finalStatus = this.calculateCurrentStatus(endTimestamp);
        // 如果不是中断，且计时器自然结束，增加已完成番茄数
        if (!isInterrupted && finalStatus.remainingTime <= 0) {
            if (this.status.type === TimerType.FOCUS) {
                this.status.completedPomodoros++;
            }
        }
        // 重置状态
        this.status.state = TimerState.IDLE;
        this.status.startTimestamp = undefined;
        this.status.pauseTimestamp = undefined;
        this.status.accumulatedTime = undefined;
        this.emit('stop', Object.assign(Object.assign({}, finalStatus), { isInterrupted }));
        console.log(`[计时器] 停止，是否中断: ${isInterrupted}`);
        return finalStatus;
    }
    /**
     * 跳过当前阶段
     */
    skip() {
        this.clearInterval();
        if (this.status.type === TimerType.FOCUS) {
            this.status.completedPomodoros++;
        }
        // 决定下一个阶段类型
        const nextType = this.getNextTimerType();
        this.setTimerType(nextType);
        this.status.state = TimerState.IDLE;
        this.status.startTimestamp = undefined;
        this.status.pauseTimestamp = undefined;
        this.status.accumulatedTime = undefined;
        this.emit('skip', this.status);
        console.log(`[计时器] 跳过，下一阶段: ${nextType}`);
    }
    /**
     * 重置计时器
     */
    reset() {
        this.clearInterval();
        this.status = {
            state: TimerState.IDLE,
            type: TimerType.FOCUS,
            remainingTime: this.config.focusDuration,
            elapsedTime: 0,
            totalDuration: this.config.focusDuration,
            completedPomodoros: 0,
            startTimestamp: undefined,
            pauseTimestamp: undefined,
            accumulatedTime: undefined
        };
        this.emit('reset', this.status);
        console.log('[计时器] 已重置');
    }
    /**
     * 设置计时器类型
     */
    setTimerType(type) {
        this.clearInterval();
        let duration;
        switch (type) {
            case TimerType.FOCUS:
                duration = this.config.focusDuration;
                break;
            case TimerType.SHORT_BREAK:
                duration = this.config.shortBreakDuration;
                break;
            case TimerType.LONG_BREAK:
                duration = this.config.longBreakDuration;
                break;
            default:
                duration = this.config.focusDuration;
        }
        this.status.type = type;
        this.status.remainingTime = duration;
        this.status.elapsedTime = 0;
        this.status.totalDuration = duration;
        this.status.state = TimerState.IDLE;
        this.status.startTimestamp = undefined;
        this.status.pauseTimestamp = undefined;
        this.status.accumulatedTime = undefined;
        this.emit('typeChange', this.status);
        console.log(`[计时器] 设置为 ${type} 模式`);
    }
    /**
     * 获取下一个计时器类型
     */
    getNextTimerType() {
        if (this.status.type === TimerType.FOCUS) {
            // 专注完成后，根据已完成番茄数决定休息类型
            const shouldTakeLongBreak = this.status.completedPomodoros % this.config.pomodorosUntilLongBreak === 0;
            return shouldTakeLongBreak ? TimerType.LONG_BREAK : TimerType.SHORT_BREAK;
        }
        else {
            // 休息完成后，返回专注
            return TimerType.FOCUS;
        }
    }
    /**
     * 获取当前状态
     */
    getStatus() {
        if (this.status.state === TimerState.RUNNING) {
            return this.calculateCurrentStatus(Date.now());
        }
        return Object.assign({}, this.status);
    }
    /**
     * 计算当前状态（基于时间戳差值）
     */
    calculateCurrentStatus(now) {
        if (!this.status.startTimestamp) {
            return Object.assign({}, this.status);
        }
        let elapsedMilliseconds = now - this.status.startTimestamp;
        // 减去累计暂停时间
        if (this.status.accumulatedTime) {
            elapsedMilliseconds -= this.status.accumulatedTime;
        }
        const elapsedTime = Math.floor(elapsedMilliseconds / 1000);
        const remainingTime = Math.max(0, this.status.totalDuration - elapsedTime);
        return Object.assign(Object.assign({}, this.status), { elapsedTime,
            remainingTime });
    }
    /**
     * 开始定时器
     */
    startInterval() {
        this.clearInterval();
        this.intervalId = setInterval(() => {
            const now = Date.now();
            const status = this.calculateCurrentStatus(now);
            // 更新状态
            this.status.elapsedTime = status.elapsedTime;
            this.status.remainingTime = status.remainingTime;
            // 触发每秒更新事件
            this.emit('tick', status);
            // 检查是否完成
            if (status.remainingTime <= 0) {
                this.complete();
            }
        }, 1000);
    }
    /**
     * 清除定时器
     */
    clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * 完成当前阶段
     */
    complete() {
        this.clearInterval();
        const completedType = this.status.type;
        if (this.status.type === TimerType.FOCUS) {
            this.status.completedPomodoros++;
        }
        // 自动切换到下一阶段
        const nextType = this.getNextTimerType();
        this.setTimerType(nextType);
        this.status.state = TimerState.COMPLETED;
        this.emit('complete', {
            completedType,
            nextType,
            status: Object.assign({}, this.status)
        });
        console.log(`[计时器] ${completedType} 完成，下一阶段: ${nextType}`);
    }
    /**
     * 添加事件监听
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    /**
     * 移除事件监听
     */
    off(event, callback) {
        if (!this.listeners.has(event))
            return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }
    /**
     * 触发事件
     */
    emit(event, data) {
        if (!this.listeners.has(event))
            return;
        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`[计时器] 事件监听器错误: ${event}`, error);
            }
        });
    }
    /**
     * 保存状态到本地存储
     */
    saveToStorage(key = 'pomodoroTimerState') {
        const state = {
            config: this.config,
            status: this.getStatus(),
            savedAt: Date.now()
        };
        wx.setStorageSync(key, state);
        console.log('[计时器] 状态已保存到本地存储');
    }
    /**
     * 从本地存储恢复状态
     */
    restoreFromStorage(key = 'pomodoroTimerState') {
        try {
            const state = wx.getStorageSync(key);
            if (!state)
                return false;
            const { config, status, savedAt } = state;
            // 检查是否过期（超过24小时）
            const now = Date.now();
            if (now - savedAt > 24 * 60 * 60 * 1000) {
                console.warn('[计时器] 保存的状态已过期');
                return false;
            }
            // 恢复配置和状态
            this.config = Object.assign(Object.assign({}, this.config), config);
            this.status = Object.assign({}, status);
            // 如果之前是运行状态，重新计算时间
            if (this.status.state === TimerState.RUNNING && this.status.startTimestamp) {
                const elapsed = Math.floor((now - this.status.startTimestamp) / 1000);
                if (elapsed > this.status.totalDuration) {
                    // 时间已过，标记为完成
                    this.status.state = TimerState.COMPLETED;
                    this.complete();
                }
                else {
                    // 恢复运行
                    this.start();
                }
            }
            console.log('[计时器] 状态已从本地存储恢复');
            return true;
        }
        catch (error) {
            console.error('[计时器] 恢复状态失败:', error);
            return false;
        }
    }
    /**
     * 清除本地存储的状态
     */
    clearStorage(key = 'pomodoroTimerState') {
        wx.removeStorageSync(key);
        console.log('[计时器] 本地存储状态已清除');
    }
}
exports.PomodoroTimer = PomodoroTimer;
// 导出默认实例
exports.pomodoroTimer = new PomodoroTimer();
