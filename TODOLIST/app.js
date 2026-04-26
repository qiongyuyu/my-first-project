"use strict";
// app.ts
App({
    globalData: {
        userInfo: null,
        token: null,
        isConnected: true, // 网络状态
        offlineQueue: [], // 离线操作队列
    },
    onLaunch() {
        // 初始化网络状态监听
        this.initNetworkListener();
        // 初始化本地存储
        this.initStorage();
        // 尝试同步离线数据
        this.syncOfflineData();
    },
    initNetworkListener() {
        const that = this;
        wx.onNetworkStatusChange(function (res) {
            that.globalData.isConnected = res.isConnected;
            if (res.isConnected) {
                // 网络恢复，尝试同步离线数据
                that.syncOfflineData();
            }
            else {
                wx.showToast({
                    title: '网络已断开，数据将保存到本地',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
        // 获取当前网络状态
        wx.getNetworkType({
            success(res) {
                that.globalData.isConnected = res.networkType !== 'none';
            }
        });
    },
    initStorage() {
        // 初始化本地存储数据格式
        const keys = ['userInfo', 'settings', 'tasks', 'pomodoroRecords', 'rewards'];
        keys.forEach(key => {
            const value = wx.getStorageSync(key);
            if (!value) {
                wx.setStorageSync(key, key === 'tasks' ? [] : key === 'pomodoroRecords' ? [] : key === 'rewards' ? [] : {});
            }
        });
    },
    syncOfflineData() {
        // 同步离线数据到服务器
        const offlineQueue = wx.getStorageSync('offlineQueue') || [];
        if (offlineQueue.length === 0)
            return;
        // 这里调用后端API同步数据
        // 模拟同步
        setTimeout(() => {
            wx.showToast({
                title: `已同步${offlineQueue.length}条数据`,
                icon: 'success'
            });
            wx.setStorageSync('offlineQueue', []);
        }, 1000);
    },
    addOfflineOperation(operation) {
        const queue = wx.getStorageSync('offlineQueue') || [];
        queue.push(operation);
        wx.setStorageSync('offlineQueue', queue);
    }
});
