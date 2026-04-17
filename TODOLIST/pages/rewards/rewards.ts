// pages/rewards/rewards.ts
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
    userLevel: 5,
    points: 1500,
    experience: 320,
    nextLevelExp: 500,
    levelProgress: 64,
    totalRewards: 12,

    // 抽卡系统
    recentItems: [] as any[],
    gachaResultVisible: false,
    gachaResult: null as any,

    // 背包/道具
    inventory: [] as any[],

    // 自定义奖励
    customRewards: [] as any[],
    rewardModalVisible: false,
    rewardForm: {
      id: '',
      title: '',
      conditionIndex: 0,
      conditionValue: '',
      description: ''
    },
    conditionOptions: ['专注时长达到', '完成任务数达到', '连续打卡天数', '积分达到'],

    // 模态框相关
    modalVisible: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserInfo();
    this.loadInventory();
    this.loadCustomRewards();
    this.loadRecentItems();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.updateUserStats();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  /**
   * 更新用户统计数据
   */
  updateUserStats() {
    // 从本地存储计算统计数据
    const records = wx.getStorageSync('pomodoroRecords') || [];
    // const tasks = wx.getStorageSync('tasks') || []; // 未使用
    const rewards = wx.getStorageSync('rewards') || [];

    // 模拟计算
    const totalFocusSeconds = records.reduce((sum: number, r: any) => sum + (r.duration || 0), 0);
    const totalFocusHours = Math.floor(totalFocusSeconds / 3600);

    // 经验值基于专注时长
    const experience = totalFocusHours * 10;
    const userLevel = Math.floor(experience / 100) + 1;
    const nextLevelExp = userLevel * 100;
    const levelProgress = ((experience % 100) / 100) * 100;

    this.setData({
      experience,
      userLevel,
      nextLevelExp,
      levelProgress,
      totalRewards: rewards.length
    });
  },

  /**
   * 加载背包道具
   */
  loadInventory() {
    // 模拟数据
    const inventory = [
      {
        id: '1',
        name: '专注药剂',
        icon: '/images/items/potion.png',
        rarity: 'common',
        rarityText: '普通',
        count: 3,
        description: '使用后下次专注时间+5分钟'
      },
      {
        id: '2',
        name: '时间沙漏',
        icon: '/images/items/hourglass.png',
        rarity: 'rare',
        rarityText: '稀有',
        count: 1,
        description: '暂停时间，获得额外休息时间'
      },
      {
        id: '3',
        name: '星辰主题',
        icon: '/images/items/theme.png',
        rarity: 'epic',
        rarityText: '史诗',
        count: 1,
        description: '解锁星空主题界面'
      },
      {
        id: '4',
        name: 'AI规划助手',
        icon: '/images/items/ai.png',
        rarity: 'legendary',
        rarityText: '传奇',
        count: 1,
        description: 'AI规划准确度提升20%'
      }
    ];

    this.setData({ inventory });
  },

  /**
   * 加载最近获得的道具
   */
  loadRecentItems() {
    const recentItems = [
      {
        id: '1',
        name: '专注药剂',
        icon: '/images/items/potion.png'
      },
      {
        id: '2',
        name: '金币',
        icon: '/images/items/coin.png'
      },
      {
        id: '3',
        name: '经验书',
        icon: '/images/items/book.png'
      }
    ];

    this.setData({ recentItems });
  },

  /**
   * 加载自定义奖励
   */
  loadCustomRewards() {
    const customRewards = [
      {
        id: '1',
        title: '一杯奶茶',
        condition: '专注时长达到5小时',
        description: '奖励自己一杯最喜欢的奶茶',
        completed: false,
        conditionType: 'focus',
        conditionValue: 5
      },
      {
        id: '2',
        title: '看一场电影',
        condition: '完成10个任务',
        description: '周末去看一场期待已久的电影',
        completed: true,
        conditionType: 'tasks',
        conditionValue: 10
      },
      {
        id: '3',
        title: '买一本新书',
        condition: '连续打卡7天',
        description: '购买一本感兴趣的新书',
        completed: false,
        conditionType: 'streak',
        conditionValue: 7
      }
    ];

    this.setData({ customRewards });
  },

  /**
   * 抽卡
   */
  drawGacha(e: any) {
    const type = e.currentTarget.dataset.type;
    const cost = type === 'single' ? 100 : 900;

    if (this.data.points < cost) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      });
      return;
    }

    // 消耗积分
    const newPoints = this.data.points - cost;
    this.setData({ points: newPoints });

    // 模拟抽卡结果
    const items = [
      {
        id: '1',
        name: '专注药剂',
        icon: '/images/items/potion.png',
        rarity: 'common',
        rarityText: '普通',
        description: '使用后下次专注时间+5分钟'
      },
      {
        id: '2',
        name: '时间沙漏',
        icon: '/images/items/hourglass.png',
        rarity: 'rare',
        rarityText: '稀有',
        description: '暂停时间，获得额外休息时间'
      },
      {
        id: '3',
        name: '星辰主题',
        icon: '/images/items/theme.png',
        rarity: 'epic',
        rarityText: '史诗',
        description: '解锁星空主题界面'
      },
      {
        id: '4',
        name: 'AI规划助手',
        icon: '/images/items/ai.png',
        rarity: 'legendary',
        rarityText: '传奇',
        description: 'AI规划准确度提升20%'
      }
    ];

    // 根据抽卡类型决定概率
    let result: any = items[0]; // 默认第一个道具
    if (type === 'multi') {
      // 十连抽必得稀有以上
      const rareItems = items.filter(item => item.rarity !== 'common');
      result = rareItems[Math.floor(Math.random() * rareItems.length)];
    } else {
      // 单抽普通概率
      const weights = [0.5, 0.3, 0.15, 0.05]; // 普通、稀有、史诗、传奇
      const rand = Math.random();
      let cumulative = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          result = items[i];
          break;
        }
      }
    }

    // 添加到背包
    const inventory = [...this.data.inventory];
    const existingItem = inventory.find(item => item.id === result.id);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      inventory.push({
        ...result,
        count: 1
      });
    }

    // 添加到最近获得
    const recentItems = [...this.data.recentItems];
    recentItems.unshift({
      id: result.id,
      name: result.name,
      icon: result.icon
    });
    if (recentItems.length > 5) recentItems.pop();

    this.setData({
      inventory,
      recentItems,
      gachaResult: result,
      gachaResultVisible: true
    });

    // 保存到本地存储
    wx.setStorageSync('inventory', inventory);
  },

  /**
   * 隐藏抽卡结果
   */
  hideGachaResult() {
    this.setData({ gachaResultVisible: false });
  },

  /**
   * 使用道具
   */
  useItem(e: any) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.inventory[index];

    wx.showModal({
      title: `使用 ${item.name}`,
      content: item.description,
      success: (res) => {
        if (res.confirm) {
          // 减少道具数量
          const inventory = [...this.data.inventory];
          if (item.count > 1) {
            inventory[index].count -= 1;
          } else {
            inventory.splice(index, 1);
          }

          this.setData({ inventory });
          wx.setStorageSync('inventory', inventory);

          wx.showToast({
            title: `已使用 ${item.name}`,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 显示新增奖励模态框
   */
  showRewardModal() {
    this.setData({
      rewardModalVisible: true,
      rewardForm: {
        id: '',
        title: '',
        conditionIndex: 0,
        conditionValue: '',
        description: ''
      }
    });
  },

  /**
   * 隐藏奖励模态框
   */
  hideRewardModal() {
    this.setData({ rewardModalVisible: false });
  },

  /**
   * 保存自定义奖励
   */
  saveReward() {
    const { title, conditionIndex, conditionValue, description } = this.data.rewardForm;

    if (!title.trim()) {
      wx.showToast({ title: '请输入奖励标题', icon: 'none' });
      return;
    }

    if (!conditionValue.trim()) {
      wx.showToast({ title: '请输入条件参数', icon: 'none' });
      return;
    }

    const conditionType = ['focus', 'tasks', 'streak', 'points'][conditionIndex];
    const conditionText = `${this.data.conditionOptions[conditionIndex]} ${conditionValue}`;

    const newReward = {
      id: Date.now().toString(),
      title,
      condition: conditionText,
      description,
      completed: false,
      conditionType,
      conditionValue: parseInt(conditionValue) || 0
    };

    const customRewards = [...this.data.customRewards, newReward];
    this.setData({ customRewards });

    wx.setStorageSync('customRewards', customRewards);
    this.hideRewardModal();

    wx.showToast({
      title: '奖励已添加',
      icon: 'success'
    });
  },

  /**
   * 领取奖励
   */
  claimReward(e: any) {
    const id = e.currentTarget.dataset.id;
    const reward = this.data.customRewards.find(r => r.id === id);

    if (!reward) return;

    // 检查条件是否满足
    const isCompleted = this.checkRewardCondition(reward);
    if (!isCompleted) {
      wx.showToast({
        title: '条件尚未满足',
        icon: 'none'
      });
      return;
    }

    // 标记为已完成
    const customRewards = this.data.customRewards.map(r =>
      r.id === id ? { ...r, completed: true } : r
    );

    this.setData({ customRewards });

    // 发放奖励（这里可以增加积分等）
    const newPoints = this.data.points + 100; // 示例奖励100积分
    this.setData({ points: newPoints });

    wx.setStorageSync('customRewards', customRewards);

    wx.showModal({
      title: '奖励领取成功',
      content: `恭喜获得 "${reward.title}"！\n积分+100`,
      showCancel: false
    });
  },

  /**
   * 检查奖励条件是否满足
   */
  checkRewardCondition(_reward: any) {
    // 简化：随机返回是否满足
    // 实际应该根据用户数据判断
    return Math.random() > 0.5;
  },

  /**
   * 表单输入处理
   */
  onRewardTitleInput(e: any) {
    this.setData({
      'rewardForm.title': e.detail.value
    });
  },

  onConditionChange(e: any) {
    this.setData({
      'rewardForm.conditionIndex': e.detail.value
    });
  },

  onConditionValueInput(e: any) {
    this.setData({
      'rewardForm.conditionValue': e.detail.value
    });
  },

  onRewardDescInput(e: any) {
    this.setData({
      'rewardForm.description': e.detail.value
    });
  }
});