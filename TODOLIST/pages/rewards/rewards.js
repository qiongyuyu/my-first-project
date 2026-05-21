"use strict";
// pages/rewards/rewards.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../utils/api");
Page({
    data: {
        userInfo: { nickName: '', avatarUrl: '' },
        userLevel: 1,
        points: 0,
        experience: 0,
        nextLevelExp: 100,
        levelProgress: 0,
        totalRewards: 0,
        recentItems: [],
        gachaResultVisible: false,
        gachaResults: [],
        gachaLoading: false,
        gachaCost: 0,
        gachaRemainingPoints: 0,
        inventory: [],
        inventoryLoading: false,
        customRewards: [],
        rewardEditorVisible: false,
        rewardEditorMode: 'create',
        rewardEditingId: '',
        rewardSaving: false,
        rewardForm: {
            title: '',
            conditionType: 'focus',
            conditionValue: '',
            description: '',
        },
        conditionTypeOptions: [
            { value: 'focus', label: '专注时长达到 (小时)', icon: '⏱' },
            { value: 'tasks', label: '完成任务数达到', icon: '✅' },
            { value: 'streak', label: '连续打卡天数', icon: '🔥' },
            { value: 'points', label: '积分达到', icon: '⭐' },
        ],
        conditionTypeIndex: 0,
        pageLoading: true,
    },
    onLoad: function () {
        this.loadUserInfo();
        this.loadAllData();
    },
    onShow: function () {
        this.loadAllData();
    },
    loadAllData: function () {
        var _this = this;
        this.setData({ pageLoading: true });
        Promise.all([
            api_1.api.getUserStats(),
            api_1.api.getInventory(),
        ]).then(function (results) {
            var userStats = results[0];
            var inventory = results[1];
            _this.setData({
                points: userStats.points,
                experience: userStats.experience,
                userLevel: userStats.level,
                nextLevelExp: userStats.nextLevelExp,
                levelProgress: userStats.levelProgress,
                totalRewards: userStats.totalRewards,
                inventory: inventory.items || [],
                pageLoading: false,
            });
            wx.setStorageSync('inventory', inventory.items || []);
        }).catch(function () {
            _this.loadFromLocalFallback();
            _this.setData({ pageLoading: false });
        });
        this.loadCustomRewards();
    },
    loadFromLocalFallback: function () {
        var records = wx.getStorageSync('pomodoroRecords') || [];
        var inventory = wx.getStorageSync('inventory') || [];
        var totalSeconds = records.reduce(function (s, r) { return s + (r.duration || 0); }, 0);
        var exp = Math.floor(totalSeconds / 3600) * 10;
        var lv = Math.floor(exp / 100) + 1;
        this.setData({
            experience: exp,
            userLevel: lv,
            nextLevelExp: lv * 100,
            levelProgress: Math.min(((exp % 100) / 100) * 100, 100),
            totalRewards: inventory.length,
            inventory: inventory,
        });
    },
    loadUserInfo: function () {
        var userInfo = wx.getStorageSync('userInfo');
        if (userInfo)
            this.setData({ userInfo: userInfo });
    },
    // ─── 抽卡 ───
    drawGacha: function (e) {
        var _this = this;
        if (this.data.gachaLoading)
            return;
        var type = e.currentTarget.dataset.type;
        var cost = type === 'multi' ? 900 : 100;
        if (this.data.points < cost) {
            wx.showToast({ title: '积分不足，去完成番茄钟赚积分吧', icon: 'none' });
            return;
        }
        this.setData({ gachaLoading: true, gachaCost: cost });
        api_1.api.drawGacha(type)
            .then(function (res) {
            var item = res.item;
            var results = type === 'multi'
                ? _this.generateMultiResults(item)
                : [item];
            _this.setData({
                points: res.remainingPoints,
                gachaResults: results,
                gachaResultVisible: true,
                gachaRemainingPoints: res.remainingPoints,
                gachaLoading: false,
            });
            _this.updateInventoryAfterGacha(item, type);
            _this.addToRecentItems(item);
        })
            .catch(function (err) {
            _this.setData({ gachaLoading: false });
            wx.showToast({ title: err.message || '抽卡失败', icon: 'none' });
        });
    },
    generateMultiResults: function (mainItem) {
        var results = [];
        results.push(Object.assign(Object.assign({}, mainItem), { isMain: true }));
        var fillerPool = [
            { name: '经验碎片', rarity: 'common', description: '微小的经验碎片' },
            { name: '专注药水', rarity: 'common', description: '使用后下次专注效率+10%' },
            { name: '时间沙漏', rarity: 'rare', description: '重置每日任务冷却时间' },
            { name: '星辰主题', rarity: 'epic', description: '解锁星空主题界面' },
        ];
        for (var i = 0; i < 9; i++) {
            var f = fillerPool[Math.floor(Math.random() * fillerPool.length)];
            results.push({ itemId: 'filler-' + Date.now() + '-' + i, name: f.name, rarity: f.rarity, iconUrl: '', description: f.description });
        }
        for (var i = results.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = results[i];
            results[i] = results[j];
            results[j] = tmp;
        }
        return results;
    },
    updateInventoryAfterGacha: function (item, type) {
        var inventory = this.data.inventory.slice();
        var existing = inventory.find(function (i) { return i.itemId === item.itemId; });
        if (existing) {
            existing.count += 1;
        }
        else {
            inventory.push({
                itemId: item.itemId,
                name: item.name,
                iconUrl: item.iconUrl,
                rarity: item.rarity,
                count: 1,
                description: item.description,
            });
        }
        this.setData({ inventory: inventory });
        wx.setStorageSync('inventory', inventory);
    },
    addToRecentItems: function (item) {
        var recent = this.data.recentItems.slice();
        recent.unshift({ itemId: item.itemId, name: item.name, iconUrl: item.iconUrl, rarity: item.rarity });
        if (recent.length > 8)
            recent.pop();
        this.setData({ recentItems: recent });
    },
    hideGachaResult: function () {
        this.setData({ gachaResultVisible: false, gachaResults: [] });
    },
    // ─── 背包道具 ───
    useItem: function (e) {
        var _this = this;
        var idx = e.currentTarget.dataset.index;
        var item = this.data.inventory[idx];
        if (!item)
            return;
        wx.showModal({
            title: '使用 ' + item.name,
            content: item.description || '确定使用该道具吗？',
            success: function (res) {
                if (!res.confirm)
                    return;
                api_1.api.useItem(item.itemId, 1)
                    .then(function () {
                    var inventory = _this.data.inventory.slice();
                    if (item.count > 1) {
                        inventory[idx].count -= 1;
                    }
                    else {
                        inventory.splice(idx, 1);
                    }
                    _this.setData({ inventory: inventory });
                    wx.setStorageSync('inventory', inventory);
                    wx.showToast({ title: '已使用 ' + item.name, icon: 'success' });
                })
                    .catch(function (err) {
                    wx.showToast({ title: err.message || '使用失败', icon: 'none' });
                });
            },
        });
    },
    // ─── 自定义奖励 ───
    loadCustomRewards: function () {
        var _this = this;
        api_1.api.getCustomRewards().then(function (res) {
            var list = Array.isArray(res) ? res : (res.data || res.items || []);
            if (list.length > 0) {
                var enriched = list.map(function (r) { return _this.enrichReward(r); });
                _this.setData({ customRewards: enriched });
                wx.setStorageSync('customRewards', enriched);
                return;
            }
        }).catch(function () {
            var local = wx.getStorageSync('customRewards') || [];
            if (local.length > 0) {
                _this.setData({ customRewards: local });
            } else {
                var defaults = [
                    { rewardId: 'default-1', title: '一杯奶茶', conditionType: 'focus', conditionValue: 5, description: '奖励自己一杯最喜欢的奶茶', isCompleted: false },
                    { rewardId: 'default-2', title: '看一场电影', conditionType: 'tasks', conditionValue: 10, description: '周末去看一场期待已久的电影', isCompleted: false },
                    { rewardId: 'default-3', title: '买一本新书', conditionType: 'streak', conditionValue: 7, description: '购买一本感兴趣的新书', isCompleted: false },
                ];
                _this.setData({ customRewards: defaults.map(function (r) { return _this.enrichReward(r); }) });
            }
        });
    },
    enrichReward: function (r) {
        var current = this.calcRewardProgress(r.conditionType);
        var target = typeof r.conditionValue === 'object' ? (r.conditionValue.value || 0) : (r.conditionValue || 0);
        return Object.assign({}, r, {
            conditionValue: target,
            conditionLabel: this.getConditionLabel(r.conditionType, target),
            currentProgress: current,
            progressPct: target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0,
        });
    },
    getConditionLabel: function (type, value) {
        switch (type) {
            case 'focus': return '专注 ' + value + ' 小时';
            case 'tasks': return '完成 ' + value + ' 个任务';
            case 'streak': return '连续 ' + value + ' 天';
            case 'points': return '积分达到 ' + value;
            default: return type + ': ' + value;
        }
    },
    calcRewardProgress: function (type) {
        var records = wx.getStorageSync('pomodoroRecords') || [];
        var tasks = wx.getStorageSync('tasks') || [];
        var totalSeconds = records.reduce(function (s, r) { return s + (r.duration || 0); }, 0);
        switch (type) {
            case 'focus': return Math.floor(totalSeconds / 3600);
            case 'tasks': return tasks.filter(function (t) { return t.status === 'completed'; }).length;
            case 'streak': return this.calcStreakDays();
            case 'points': return this.data.points;
            default: return 0;
        }
    },
    calcStreakDays: function () {
        var records = wx.getStorageSync('pomodoroRecords') || [];
        var dates = {};
        records.forEach(function (r) {
            var d = (r.startTime || r.createdAt || '').slice(0, 10);
            if (d) dates[d] = true;
        });
        var sorted = Object.keys(dates).sort().reverse();
        if (sorted.length === 0) return 0;
        var today = new Date().toISOString().slice(0, 10);
        var streak = 0;
        var checkDate = new Date(today);
        for (var i = 0; i < 365; i++) {
            var ds = checkDate.toISOString().slice(0, 10);
            if (dates[ds]) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (i === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            } else {
                break;
            }
        }
        return streak;
    },
    showRewardEditor: function () {
        this.setData({
            rewardEditorVisible: true,
            rewardEditorMode: 'create',
            rewardEditingId: '',
            conditionTypeIndex: 0,
            rewardForm: { title: '', conditionType: 'focus', conditionValue: '', description: '' },
        });
    },
    editReward: function (e) {
        var rewardId = e.currentTarget.dataset.id;
        var reward = this.data.customRewards.find(function (r) { return r.rewardId === rewardId; });
        if (!reward) return;
        var typeIdx = -1;
        for (var i = 0; i < this.data.conditionTypeOptions.length; i++) {
            if (this.data.conditionTypeOptions[i].value === reward.conditionType) { typeIdx = i; break; }
        }
        this.setData({
            rewardEditorVisible: true,
            rewardEditorMode: 'edit',
            rewardEditingId: rewardId,
            conditionTypeIndex: typeIdx >= 0 ? typeIdx : 0,
            rewardForm: {
                title: reward.title || '',
                conditionType: reward.conditionType || 'focus',
                conditionValue: String(reward.conditionValue || ''),
                description: reward.description || '',
            },
        });
    },
    hideRewardEditor: function () {
        this.setData({ rewardEditorVisible: false });
    },
    onConditionTypeChange: function (e) {
        var idx = parseInt(e.detail.value);
        var ct = this.data.conditionTypeOptions[idx];
        this.setData({ conditionTypeIndex: idx, 'rewardForm.conditionType': ct.value });
    },
    saveReward: function () {
        var _this = this;
        var _a = this.data.rewardForm, title = _a.title, conditionType = _a.conditionType, conditionValue = _a.conditionValue, description = _a.description;
        if (!title.trim()) { wx.showToast({ title: '请输入奖励标题', icon: 'none' }); return; }
        if (!conditionValue || isNaN(Number(conditionValue)) || Number(conditionValue) <= 0) {
            wx.showToast({ title: '请输入有效的目标值', icon: 'none' }); return;
        }
        this.setData({ rewardSaving: true });
        var data = { title: title.trim(), conditionType: conditionType, conditionValue: Number(conditionValue), description: description.trim() };
        if (this.data.rewardEditorMode === 'edit') {
            api_1.api.updateCustomReward(this.data.rewardEditingId, data).then(function () {
                var list = _this.data.customRewards.map(function (r) {
                    return r.rewardId === _this.data.rewardEditingId ? _this.enrichReward(Object.assign({}, r, data)) : r;
                });
                _this.setData({ customRewards: list, rewardSaving: false });
                wx.setStorageSync('customRewards', list);
                wx.showToast({ title: '奖励已更新', icon: 'success' });
                _this.hideRewardEditor();
            }).catch(function (err) {
                _this.setData({ rewardSaving: false });
                wx.showToast({ title: err.message || '保存失败', icon: 'none' });
            });
        } else {
            api_1.api.createCustomReward(data).then(function (created) {
                var list = [_this.enrichReward(created)].concat(_this.data.customRewards);
                _this.setData({ customRewards: list, rewardSaving: false });
                wx.setStorageSync('customRewards', list);
                wx.showToast({ title: '奖励已添加', icon: 'success' });
                _this.hideRewardEditor();
            }).catch(function (err) {
                _this.setData({ rewardSaving: false });
                wx.showToast({ title: err.message || '保存失败', icon: 'none' });
            });
        }
    },
    deleteReward: function (e) {
        var _this = this;
        var rewardId = e.currentTarget.dataset.id;
        var reward = this.data.customRewards.find(function (r) { return r.rewardId === rewardId; });
        if (!reward) return;
        wx.showModal({
            title: '删除奖励',
            content: '确定要删除「' + reward.title + '」吗？',
            confirmColor: '#FA5151',
            success: function (res) {
                if (!res.confirm) return;
                api_1.api.deleteCustomReward(rewardId).catch(function () { });
                var list = _this.data.customRewards.filter(function (r) { return r.rewardId !== rewardId; });
                _this.setData({ customRewards: list });
                wx.setStorageSync('customRewards', list);
                wx.showToast({ title: '已删除', icon: 'success' });
            },
        });
    },
    claimReward: function (e) {
        var rewardId = e.currentTarget.dataset.id;
        var reward = this.data.customRewards.find(function (r) { return r.rewardId === rewardId; });
        if (!reward || reward.isCompleted) return;
        if (reward.progressPct < 100) {
            wx.showToast({ title: '还差一点！进度 ' + reward.progressPct + '%', icon: 'none' });
            return;
        }
        var list = this.data.customRewards.map(function (r) {
            return r.rewardId === rewardId ? Object.assign({}, r, { isCompleted: true, completedAt: new Date().toISOString() }) : r;
        });
        var bonusPoints = 100;
        this.setData({ customRewards: list, points: this.data.points + bonusPoints });
        wx.setStorageSync('customRewards', list);
        wx.showModal({
            title: '奖励领取成功！',
            content: '恭喜达成「' + reward.title + '」！\n积分 +' + bonusPoints,
            showCancel: false,
        });
    },
    onRewardTitleInput: function (e) { this.setData({ 'rewardForm.title': e.detail.value }); },
    onRewardValueInput: function (e) { this.setData({ 'rewardForm.conditionValue': e.detail.value }); },
    onRewardDescInput: function (e) { this.setData({ 'rewardForm.description': e.detail.value }); },
});
