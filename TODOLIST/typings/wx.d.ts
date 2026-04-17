// typings/wx.d.ts
/// <reference types="miniprogram-api-typings" />

// 扩展全局类型
declare const Page: WechatMiniprogram.Page.Constructor;
declare const Component: WechatMiniprogram.Component.Constructor;
declare const App: WechatMiniprogram.App.Constructor;
declare const getApp: WechatMiniprogram.App.GetApp;
declare const getCurrentPages: WechatMiniprogram.Page.GetCurrentPages;

// 为wx提供类型
declare const wx: WechatMiniprogram.Wx;

// NodeJS全局类型
declare namespace NodeJS {
  interface Timeout {}
  interface Timer {}
}

// 全局定时器函数
declare function setTimeout(callback: () => void, ms: number): number;
declare function clearTimeout(timeoutId: number): void;
declare function setInterval(callback: () => void, ms: number): number;
declare function clearInterval(intervalId: number): void;

// 全局类型扩展
interface IAppOption {
  globalData: {
    userInfo: WechatMiniprogram.UserInfo | null;
    token: string | null;
    isConnected: boolean;
    offlineQueue: any[];
  };
  initNetworkListener: () => void;
  initStorage: () => void;
  syncOfflineData: () => void;
  addOfflineOperation: (operation: any) => void;
}

// 扩展Page和Component的选项类型
declare namespace WechatMiniprogram {
  namespace Page {
    interface InstanceMethods {
      [key: string]: any;
    }
  }

  namespace Component {
    interface InstanceMethods {
      [key: string]: any;
    }
  }
}