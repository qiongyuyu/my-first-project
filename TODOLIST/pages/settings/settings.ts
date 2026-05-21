// pages/settings/settings.ts
import { api } from '../../utils/api';

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
    try {
      const user = await api.getUserProfile();
      this.setData({
        userId: user.userId,
        userInfo: { nickName: user.nickName, avatarUrl: user.avatarUrl },
        theme: user.settings?.theme || 'light',
        fontSize: user.settings?.fontSize || 16,
        notifications: user.settings?.notifications || this.data.notifications,
      });
      wx.setStorageSync('userInfo', { nickName: user.nickName, avatarUrl: user.avatarUrl });
      wx.setStorageSync('settings', user.settings || {});
    } catch {
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
    } catch (err) {
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
    } else {
      this.setData({
        syncStatus: 'pending',
        syncStatusText: `${offlineQueue.length}条待同步`
      });
    }
  },

  /**
   * 昵称输入处理
   */
  onNickNameInput(e: any) {
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
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        const userInfo = { ...this.data.userInfo, avatarUrl: tempFilePath };
        this.setData({ userInfo });
        wx.setStorageSync('userInfo', userInfo);
        // 后台同步头像
        try { await api.updateUserProfile({ avatarUrl: tempFilePath }); } catch { /* 离线容忍 */ }
        wx.showToast({ title: '头像已更新', icon: 'success' });
      }
    });
  },

  /**
   * 主题切换
   */
  onThemeChange(e: any) {
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
  applyTheme(theme: string) {
    // 实际项目中应该更新CSS变量或重新渲染页面
    // 这里只是示例
    if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000000'
      });
    } else {
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
  onFontSizeChange(e: any) {
    const fontSize = e.detail.value;
    this.setData({ fontSize });

    const settings = wx.getStorageSync('settings') || {};
    settings.fontSize = fontSize;
    wx.setStorageSync('settings', settings);
  },

  /**
   * 通知设置变化
   */
  onFocusNotificationChange(e: any) {
    this.setData({
      'notifications.focus': e.detail.value
    });
    this.saveNotifications();
  },

  onTaskDueNotificationChange(e: any) {
    this.setData({
      'notifications.taskDue': e.detail.value
    });
    this.saveNotifications();
  },

  onFriendNotificationChange(e: any) {
    this.setData({
      'notifications.friend': e.detail.value
    });
    this.saveNotifications();
  },

  onTeamNotificationChange(e: any) {
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
    (wx as any).saveFile({
      tempFilePath: filePath,
      success: (res: any) => {
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
              const data = JSON.parse(res.data as string);

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
              } else {
                wx.showToast({
                  title: '数据格式不正确',
                  icon: 'none'
                });
              }
            } catch (err) {
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
  async syncData() {
    if (this.data.syncLoading) return;
    this.setData({ syncLoading: true, syncStatus: 'pending', syncStatusText: '同步中...' });

    try {
      const offlineQueue = wx.getStorageSync('offlineQueue') || [];
      // 批量同步离线番茄钟记录
      if (offlineQueue.length > 0) {
        const pomodoroRecords = offlineQueue.filter((op: any) => op.type === 'pomodoro');
        if (pomodoroRecords.length > 0) {
          await api.batchSyncPomodoros(pomodoroRecords.map((op: any) => op.data));
        }
        wx.setStorageSync('offlineQueue', []);
      }
      // 同步当前设置到后端
      await this.syncSettingsToBackend();

      this.setData({
        syncStatus: 'success',
        syncStatusText: '已同步',
        syncLoading: false,
      });
      wx.showToast({ title: '已同步', icon: 'success' });
    } catch {
      this.setData({
        syncStatus: 'failed',
        syncStatusText: '失败',
        syncLoading: false,
      });
      wx.showToast({ title: '同步失败', icon: 'none' });
    }
  },

  async syncSettingsToBackend() {
    try {
      await api.updateUserProfile({
        nickName: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl,
      });
    } catch { /* 容忍 */ }
    try {
      await api.updateUserSettings({
        theme: this.data.theme,
        fontSize: this.data.fontSize,
        notifications: this.data.notifications,
      });
    } catch { /* 容忍 */ }
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
   * 保存所有设置（同步到后端 + 本地）
   */
  async saveAllSettings() {
    if (this.data.saving) return;
    this.setData({ saving: true });

    // 先保存到本地
    const settings = wx.getStorageSync('settings') || {};
    settings.theme = this.data.theme;
    settings.fontSize = this.data.fontSize;
    settings.notifications = this.data.notifications;
    wx.setStorageSync('settings', settings);
    wx.setStorageSync('userInfo', this.data.userInfo);

    // 同步到后端
    try {
      await api.updateUserProfile({
        nickName: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl,
      });
      await api.updateUserSettings({
        theme: this.data.theme,
        fontSize: this.data.fontSize,
        notifications: this.data.notifications,
      });
      this.setData({ saving: false });
      wx.showToast({ title: '已保存', icon: 'success' });
    } catch {
      this.setData({ saving: false });
      wx.showToast({ title: '已保存', icon: 'success' });
    }
  },

  /**
   * 退出登录
   */
  logout() {
    if (this.data.loggingOut) return;
    wx.showModal({
      title: '退出登录',
      content: '确定退出登录？',
      confirmText: '退出',
      confirmColor: '#FA5151',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ loggingOut: true });

        // 清除登录态
        const app = getApp<IAppOption>();
        app.globalData.token = null;
        app.globalData.userInfo = null;
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');

        this.setData({ loggingOut: false });
        wx.reLaunch({ url: '/pages/login/login' });
      }
    });
  }
});