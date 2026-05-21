"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// pages/settings/settings.ts
const api_1 = require("../../utils/api");
Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 用户信息
        userInfo: {
            nickName: '',
            avatarUrl: ''
        },
        userId: '',
        // 外观设置
        theme: 'light',
        fontSize: 16,
        // 通知设置
        notifications: {
            focus: true,
            taskDue: true,
            friend: true,
            team: false
        },
        // 数据管理
        cacheSize: '0.0 MB',
        syncStatus: 'success',
        syncStatusText: '已同步',
        syncLoading: false,
        // 关于
        version: '1.0.0',
        // 按钮状态
        saving: false,
        loggingOut: false,
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        this.loadSettings();
    },
    /**
     * 加载设置
     */
    async loadSettings() {
        var _a, _b, _c;
        try {
            const user = await api_1.api.getUserProfile();
            this.setData({
                userId: user.userId,
                userInfo: { nickName: user.nickName, avatarUrl: user.avatarUrl },
                theme: ((_a = user.settings) === null || _a === void 0 ? void 0 : _a.theme) || 'light',
                fontSize: ((_b = user.settings) === null || _b === void 0 ? void 0 : _b.fontSize) || 16,
                notifications: ((_c = user.settings) === null || _c === void 0 ? void 0 : _c.notifications) || this.data.notifications,
            });
            wx.setStorageSync('userInfo', { nickName: user.nickName, avatarUrl: user.avatarUrl });
            wx.setStorageSync('settings', user.settings || {});
        }
        catch (_d) {
            const userInfo = wx.getStorageSync('userInfo') || {};
            const settings = wx.getStorageSync('settings') || {};
            this.setData({
                userId: settings.userId || 'unknown',
                userInfo,
                theme: settings.theme || 'light',
                fontSize: settings.fontSize || 16,
                notifications: settings.notifications || this.data.notifications,
            });
        }
        this.calculateCacheSize();
        this.checkSyncStatus();
    },
    /**
     * 计算缓存大小
     */
    calculateCacheSize() {
        try {
            const { currentSize } = wx.getStorageInfoSync();
            const sizeMB = (currentSize / 1024 / 1024).toFixed(1);
            this.setData({
                cacheSize: `${sizeMB} MB`
            });
        }
        catch (err) {
            console.error('获取存储信息失败:', err);
        }
    },
    /**
     * 检查同步状态
     */
    checkSyncStatus() {
        const offlineQueue = wx.getStorageSync('offlineQueue') || [];
        if (offlineQueue.length === 0) {
            this.setData({
                syncStatus: 'success',
                syncStatusText: '已同步'
            });
        }
        else {
            this.setData({
                syncStatus: 'pending',
                syncStatusText: `${offlineQueue.length}条待同步`
            });
        }
    },
    /**
     * 昵称输入处理
     */
    onNickNameInput(e) {
        this.setData({
            'userInfo.nickName': e.detail.value
        });
    },
    /**
     * 保存用户信息
     */
    saveUserInfo() {
        wx.setStorageSync('userInfo', this.data.userInfo);
        wx.showToast({
            title: '已保存',
            icon: 'success'
        });
    },
    /**
     * 更换头像
     */
    changeAvatar() {
        var _this = this;
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var tempFilePath = res.tempFiles[0].tempFilePath;
                var userInfo = Object.assign(Object.assign({}, _this.data.userInfo), { avatarUrl: tempFilePath });
                _this.setData({ userInfo: userInfo });
                wx.setStorageSync('userInfo', userInfo);
                api_1.api.updateUserProfile({ avatarUrl: tempFilePath }).catch(function () { });
                wx.showToast({ title: '头像已更新', icon: 'success' });
            }
        });
    },
    /**
     * 主题切换
     */
    onThemeChange(e) {
        const theme = e.detail.value;
        this.setData({ theme });
        // 保存到设置
        const settings = wx.getStorageSync('settings') || {};
        settings.theme = theme;
        wx.setStorageSync('settings', settings);
        // 应用主题（这里需要实际实现主题切换逻辑）
        this.applyTheme(theme);
    },
    /**
     * 应用主题
     */
    applyTheme(theme) {
        // 实际项目中应该更新CSS变量或重新渲染页面
        // 这里只是示例
        if (theme === 'dark') {
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#000000'
            });
        }
        else {
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            });
        }
        wx.showToast({
            title: `已切换至${theme === 'dark' ? '深色' : '浅色'}主题`,
            icon: 'success'
        });
    },
    /**
     * 字体大小变化
     */
    onFontSizeChange(e) {
        const fontSize = e.detail.value;
        this.setData({ fontSize });
        const settings = wx.getStorageSync('settings') || {};
        settings.fontSize = fontSize;
        wx.setStorageSync('settings', settings);
    },
    /**
     * 通知设置变化
     */
    onFocusNotificationChange(e) {
        this.setData({
            'notifications.focus': e.detail.value
        });
        this.saveNotifications();
    },
    onTaskDueNotificationChange(e) {
        this.setData({
            'notifications.taskDue': e.detail.value
        });
        this.saveNotifications();
    },
    onFriendNotificationChange(e) {
        this.setData({
            'notifications.friend': e.detail.value
        });
        this.saveNotifications();
    },
    onTeamNotificationChange(e) {
        this.setData({
            'notifications.team': e.detail.value
        });
        this.saveNotifications();
    },
    /**
     * 保存通知设置
     */
    saveNotifications() {
        const settings = wx.getStorageSync('settings') || {};
        settings.notifications = this.data.notifications;
        wx.setStorageSync('settings', settings);
    },
    /**
     * 清理缓存
     */
    clearCache() {
        wx.showModal({
            title: '清理缓存',
            content: '确定要清理所有缓存数据吗？这不会删除您的个人数据。',
            success: (res) => {
                if (res.confirm) {
                    wx.clearStorageSync();
                    this.calculateCacheSize();
                    wx.showToast({
                        title: '缓存已清理',
                        icon: 'success'
                    });
                }
            }
        });
    },
    /**
     * 导出数据
     */
    exportData() {
        const data = {
            tasks: wx.getStorageSync('tasks') || [],
            pomodoroRecords: wx.getStorageSync('pomodoroRecords') || [],
            rewards: wx.getStorageSync('rewards') || [],
            settings: wx.getStorageSync('settings') || {},
            userInfo: wx.getStorageSync('userInfo') || {}
        };
        const content = JSON.stringify(data, null, 2);
        const filePath = `${wx.env.USER_DATA_PATH}/时光元备份_${Date.now()}.json`;
        // 保存文件
        wx.getFileSystemManager().writeFileSync(filePath, content, 'utf8');
        // 分享或保存到相册
        // 使用类型断言，因为某些版本的类型定义可能不包含saveFile
        wx.saveFile({
            tempFilePath: filePath,
            success: (res) => {
                wx.showModal({
                    title: '导出成功',
                    content: `数据已导出到：${res.savedFilePath}`,
                    showCancel: false
                });
            }
        });
    },
    /**
     * 导入数据
     */
    importData() {
        wx.chooseMessageFile({
            count: 1,
            type: 'file',
            extension: ['json'],
            success: (res) => {
                const tempFilePath = res.tempFiles[0].path;
                wx.getFileSystemManager().readFile({
                    filePath: tempFilePath,
                    encoding: 'utf8',
                    success: (res) => {
                        try {
                            const data = JSON.parse(res.data);
                            // 验证数据格式
                            if (data.tasks && data.pomodoroRecords) {
                                // 导入数据
                                wx.setStorageSync('tasks', data.tasks);
                                wx.setStorageSync('pomodoroRecords', data.pomodoroRecords);
                                wx.setStorageSync('rewards', data.rewards || []);
                                wx.setStorageSync('settings', data.settings || {});
                                wx.setStorageSync('userInfo', data.userInfo || {});
                                wx.showModal({
                                    title: '导入成功',
                                    content: '数据已成功导入，请重启小程序生效',
                                    showCancel: false
                                });
                            }
                            else {
                                wx.showToast({
                                    title: '数据格式不正确',
                                    icon: 'none'
                                });
                            }
                        }
                        catch (err) {
                            wx.showToast({
                                title: '文件解析失败',
                                icon: 'none'
                            });
                        }
                    }
                });
            }
        });
    },
    /**
     * 立即同步
     */
    syncData() {
        var _this = this;
        if (this.data.syncLoading) return;
        this.setData({ syncLoading: true, syncStatus: 'pending', syncStatusText: '同步中...' });
        try {
            var offlineQueue = wx.getStorageSync('offlineQueue') || [];
            var pomodoroRecords = offlineQueue.filter(function (op) { return op.type === 'pomodoro'; });
            var promises = [];
            if (pomodoroRecords.length > 0) {
                promises.push(api_1.api.batchSyncPomodoros(pomodoroRecords.map(function (op) { return op.data; })));
            }
            promises.push(api_1.api.updateUserProfile({ nickName: _this.data.userInfo.nickName, avatarUrl: _this.data.userInfo.avatarUrl }).catch(function () { }));
            promises.push(api_1.api.updateUserSettings({ theme: _this.data.theme, fontSize: _this.data.fontSize, notifications: _this.data.notifications }).catch(function () { }));
            Promise.all(promises).then(function () {
                wx.setStorageSync('offlineQueue', []);
                _this.setData({ syncStatus: 'success', syncStatusText: '已同步', syncLoading: false });
                wx.showToast({ title: '已同步', icon: 'success' });
            }).catch(function () {
                _this.setData({ syncStatus: 'failed', syncStatusText: '失败', syncLoading: false });
                wx.showToast({ title: '同步失败', icon: 'none' });
            });
        } catch (_e) {
            this.setData({ syncStatus: 'failed', syncStatusText: '同步失败', syncLoading: false });
        }
    },
    /**
     * 查看版本
     */
    viewVersion() {
        wx.showModal({
            title: '版本信息',
            content: `时光元 v${this.data.version}\n© 2026 时光元团队`,
            showCancel: false
        });
    },
    /**
     * 查看隐私政策
     */
    viewPrivacy() {
        wx.navigateTo({
            url: '/pages/webview/webview?url=https://example.com/privacy&title=隐私政策'
        });
    },
    /**
     * 查看用户协议
     */
    viewTerms() {
        wx.navigateTo({
            url: '/pages/webview/webview?url=https://example.com/terms&title=用户协议'
        });
    },
    /**
     * 联系客服
     */
    contactSupport() {
        wx.showModal({
            title: '联系客服',
            content: '客服微信：shiguangyuan\n客服电话：400-123-4567\n工作时间：9:00-18:00',
            showCancel: false
        });
    },
    /**
     * 保存所有设置
     */
    saveAllSettings() {
        var _this = this;
        if (this.data.saving) return;
        this.setData({ saving: true });
        var settings = wx.getStorageSync('settings') || {};
        settings.theme = this.data.theme;
        settings.fontSize = this.data.fontSize;
        settings.notifications = this.data.notifications;
        wx.setStorageSync('settings', settings);
        wx.setStorageSync('userInfo', this.data.userInfo);
        Promise.all([
            api_1.api.updateUserProfile({ nickName: this.data.userInfo.nickName, avatarUrl: this.data.userInfo.avatarUrl }),
            api_1.api.updateUserSettings({ theme: this.data.theme, fontSize: this.data.fontSize, notifications: this.data.notifications }),
        ]).then(function () {
            _this.setData({ saving: false });
            wx.showToast({ title: '已保存', icon: 'success' });
        }).catch(function () {
            _this.setData({ saving: false });
            wx.showToast({ title: '已保存', icon: 'success' });
        });
    },
    /**
     * 退出登录
     */
    logout() {
        var _this = this;
        if (this.data.loggingOut) return;
        wx.showModal({
            title: '退出登录',
            content: '确定退出登录？',
            confirmText: '退出',
            confirmColor: '#FA5151',
            success: function (res) {
                if (!res.confirm) return;
                _this.setData({ loggingOut: true });
                var app = getApp();
                app.globalData.token = null;
                app.globalData.userInfo = null;
                wx.removeStorageSync('token');
                wx.removeStorageSync('userInfo');
                _this.setData({ loggingOut: false });
                wx.reLaunch({ url: '/pages/login/login' });
            }
        });
    }
});
