// utils/offline-cache.ts
/**
 * 离线缓存管理器
 * 处理网络断开时的数据缓存和恢复
 */

interface OfflineOperation {
  id: string;
  type: 'task' | 'pomodoro' | 'reward' | 'user';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineCache {
  private static instance: OfflineCache;
  private queueKey = 'offlineQueue';
  private maxRetryCount = 3;

  private constructor() {}

  static getInstance(): OfflineCache {
    if (!OfflineCache.instance) {
      OfflineCache.instance = new OfflineCache();
    }
    return OfflineCache.instance;
  }

  /**
   * 检查网络状态
   */
  async checkNetwork(): Promise<boolean> {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => {
          resolve(res.networkType !== 'none');
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }

  /**
   * 添加操作到离线队列
   */
  addOperation(type: OfflineOperation['type'], action: OfflineOperation['action'], data: any): void {
    const operation: OfflineOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    const queue = this.getQueue();
    queue.push(operation);
    this.saveQueue(queue);

    console.log(`[离线缓存] 添加操作: ${type}.${action}`, operation);
  }

  /**
   * 获取离线队列
   */
  getQueue(): OfflineOperation[] {
    return wx.getStorageSync(this.queueKey) || [];
  }

  /**
   * 保存离线队列
   */
  saveQueue(queue: OfflineOperation[]): void {
    wx.setStorageSync(this.queueKey, queue);
  }

  /**
   * 同步离线数据
   */
  async sync(): Promise<{ success: number; failed: number }> {
    const isOnline = await this.checkNetwork();
    if (!isOnline) {
      console.log('[离线缓存] 网络未连接，跳过同步');
      return { success: 0, failed: 0 };
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    console.log(`[离线缓存] 开始同步 ${queue.length} 条数据`);

    const results = { success: 0, failed: 0 };
    const failedOperations: OfflineOperation[] = [];

    for (const operation of queue) {
      try {
        const success = await this.processOperation(operation);
        if (success) {
          results.success++;
        } else {
          results.failed++;
          if (operation.retryCount < this.maxRetryCount) {
            operation.retryCount++;
            failedOperations.push(operation);
          } else {
            console.warn(`[离线缓存] 操作重试次数超限，丢弃:`, operation);
          }
        }
      } catch (error) {
        console.error(`[离线缓存] 处理操作失败:`, error);
        results.failed++;
        if (operation.retryCount < this.maxRetryCount) {
          operation.retryCount++;
          failedOperations.push(operation);
        }
      }
    }

    // 保存失败的操作（用于重试）
    this.saveQueue(failedOperations);

    console.log(`[离线缓存] 同步完成: 成功 ${results.success} 条，失败 ${results.failed} 条`);

    // 显示同步结果
    if (results.success > 0) {
      wx.showToast({
        title: `已同步 ${results.success} 条数据`,
        icon: 'success'
      });
    }

    return results;
  }

  /**
   * 处理单个操作
   */
  private async processOperation(operation: OfflineOperation): Promise<boolean> {
    console.log(`[离线缓存] 处理操作: ${operation.type}.${operation.action}`);

    // 模拟API调用
    // 实际项目中应该调用真实的后端API
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟90%的成功率
        const success = Math.random() > 0.1;
        if (success) {
          console.log(`[离线缓存] 操作成功: ${operation.id}`);
        } else {
          console.warn(`[离线缓存] 操作失败: ${operation.id}`);
        }
        resolve(success);
      }, 500);
    });
  }

  /**
   * 清除已同步的数据
   */
  clearSynced(): void {
    const queue = this.getQueue();
    const pendingOperations = queue.filter(op => op.retryCount < this.maxRetryCount);
    this.saveQueue(pendingOperations);
  }

  /**
   * 获取队列大小
   */
  getQueueSize(): number {
    return this.getQueue().length;
  }

  /**
   * 清除所有离线数据
   */
  clearAll(): void {
    wx.removeStorageSync(this.queueKey);
  }
}

// 导出单例
export const offlineCache = OfflineCache.getInstance();

/**
 * 网络状态监听器
 */
export class NetworkListener {
  private isOnline = true;

  constructor() {
    this.init();
  }

  private init(): void {
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.isOnline = res.isConnected;
      console.log(`[网络状态] ${this.isOnline ? '已连接' : '已断开'}`);

      if (this.isOnline) {
        // 网络恢复，自动同步
        offlineCache.sync();
      } else {
        wx.showToast({
          title: '网络已断开，数据将保存到本地',
          icon: 'none',
          duration: 2000
        });
      }
    });

    // 获取初始网络状态
    wx.getNetworkType({
      success: (res) => {
        this.isOnline = res.networkType !== 'none';
      }
    });
  }

  /**
   * 检查是否在线
   */
  isConnected(): boolean {
    return this.isOnline;
  }
}

// 全局网络监听器实例
export const networkListener = new NetworkListener();