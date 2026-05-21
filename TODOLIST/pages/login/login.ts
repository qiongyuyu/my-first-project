// pages/login/login.ts
import { api } from '../../utils/api';

Page({
  data: {
    mode: 'login' as 'login' | 'register',
    avatarUrl: '',
    nickName: '',
    password: '',
    showPassword: false,
    loading: false,
  },

  onLoad() {
    const app = getApp<IAppOption>();
    const token = wx.getStorageSync('token');
    if (token) {
      app.globalData.token = token;
      this.goToMain();
    }
  },

  onChooseAvatar(e: any) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({ avatarUrl });
  },

  onNicknameBlur(e: any) {
    this.setData({ nickName: e.detail.value });
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value });
  },

  togglePasswordVisible() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  switchMode() {
    this.setData({
      mode: this.data.mode === 'login' ? 'register' : 'login',
      password: '',
    });
  },

  handleSubmit() {
    if (this.data.loading) return;

    const { mode, nickName, password } = this.data;
    if (mode === 'register' && !nickName) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (mode === 'register' && password.length < 6) {
      wx.showToast({ title: '密码至少6个字符', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    wx.login({
      success: (loginRes) => {
        const code = loginRes.code;
        const promise = mode === 'login'
          ? api.passwordLogin(code, this.data.nickName, this.data.avatarUrl, password)
          : api.passwordRegister(code, nickName, this.data.avatarUrl, password);

        promise
          .then((res: any) => {
            this.loginSuccess(res);
          })
          .catch((err: any) => {
            this.loginFail(err);
          });
      },
      fail: (err) => {
        this.loginFail(err);
      },
    });
  },

  loginSuccess(res: any) {
    const app = getApp<IAppOption>();
    const token = res.token;
    const user = res.user;

    app.globalData.token = token;
    app.globalData.userInfo = user;
    wx.setStorageSync('token', token);
    wx.setStorageSync('userInfo', user);

    wx.showToast({
      title: this.data.mode === 'login' ? '登录成功' : '注册成功',
      icon: 'success',
      duration: 1500,
    });

    setTimeout(() => {
      this.goToMain();
    }, 1500);
  },

  loginFail(err: any) {
    this.setData({ loading: false });
    console.error('登录失败:', err);
    wx.showToast({
      title: err.message || '操作失败，请重试',
      icon: 'none',
      duration: 2000,
    });
  },

  handleSkip() {
    wx.showToast({
      title: '已进入体验模式',
      icon: 'none',
      duration: 1500,
    });
    setTimeout(() => {
      this.goToMain();
    }, 1500);
  },

  goToMain() {
    wx.switchTab({
      url: '/pages/focus-timer/focus-timer',
    });
  },
});
