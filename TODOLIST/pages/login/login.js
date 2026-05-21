"use strict";
// pages/login/login.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../utils/api");
Page({
    data: {
        mode: 'login',
        avatarUrl: '',
        nickName: '',
        password: '',
        showPassword: false,
        loading: false,
    },
    onLoad: function () {
        var app = getApp();
        var token = wx.getStorageSync('token');
        if (token) {
            app.globalData.token = token;
            this.goToMain();
        }
    },
    onChooseAvatar: function (e) {
        var avatarUrl = e.detail.avatarUrl;
        this.setData({ avatarUrl: avatarUrl });
    },
    onNicknameBlur: function (e) {
        this.setData({ nickName: e.detail.value });
    },
    onPasswordInput: function (e) {
        this.setData({ password: e.detail.value });
    },
    togglePasswordVisible: function () {
        this.setData({ showPassword: !this.data.showPassword });
    },
    switchMode: function () {
        this.setData({
            mode: this.data.mode === 'login' ? 'register' : 'login',
            password: '',
        });
    },
    handleSubmit: function () {
        var _this = this;
        if (this.data.loading)
            return;
        var mode = this.data.mode;
        var nickName = this.data.nickName;
        var password = this.data.password;
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
            success: function (loginRes) {
                var code = loginRes.code;
                var promise = mode === 'login'
                    ? api_1.api.passwordLogin(code, _this.data.nickName, _this.data.avatarUrl, password)
                    : api_1.api.passwordRegister(code, nickName, _this.data.avatarUrl, password);
                promise
                    .then(function (res) {
                    _this.loginSuccess(res);
                })
                    .catch(function (err) {
                    _this.loginFail(err);
                });
            },
            fail: function (err) {
                _this.loginFail(err);
            },
        });
    },
    loginSuccess: function (res) {
        var app = getApp();
        var token = res.token;
        var user = res.user;
        app.globalData.token = token;
        app.globalData.userInfo = user;
        wx.setStorageSync('token', token);
        wx.setStorageSync('userInfo', user);
        wx.showToast({
            title: this.data.mode === 'login' ? '登录成功' : '注册成功',
            icon: 'success',
            duration: 1500,
        });
        var that = this;
        setTimeout(function () {
            that.goToMain();
        }, 1500);
    },
    loginFail: function (err) {
        this.setData({ loading: false });
        console.error('登录失败:', err);
        wx.showToast({
            title: err.message || '操作失败，请重试',
            icon: 'none',
            duration: 2000,
        });
    },
    handleSkip: function () {
        var that = this;
        wx.showToast({
            title: '已进入体验模式',
            icon: 'none',
            duration: 1500,
        });
        setTimeout(function () {
            that.goToMain();
        }, 1500);
    },
    goToMain: function () {
        wx.switchTab({
            url: '/pages/focus-timer/focus-timer',
        });
    },
});
