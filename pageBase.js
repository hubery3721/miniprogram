/**
 * 页面基类
 */
import Util from './utils/util';
// import ToastHelper from './utils/toastHelper';
import Config from './app.config';

const MAX_RETRY = 2;
const MAX_REFRESH = 15; //最大刷新次数(激活的时候)
const INTERVAL = 5000; //时间间隔
let currentTimes = 0; //当前刷新次数
let refreshTimer = null; //刷新定时器

class PageBase {
  constructor(obj, ...args) {
    this.obj = obj;

    this.initLifeCircle();
    this.initPlugins();

    Page(obj, ...args);
  }

  /**
   * 注入页面的生命周期
   */
  initLifeCircle() {
    const list = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onReachBottom', 'onUserInfoReady', 'sendMessageLastPageAsync']; //需要重写的事件  其他需要时加入
    const _self = this;
    for (let fn of list) {
      let tempFn = this.obj[fn];
      this.obj[fn] = function(...args) {
        if (_self[fn]) args = _self[fn].apply(this, args) || args;

        if (tempFn) tempFn.apply(this, args);
      };
    }
  }

  /**
   * 为页面添加一些常用方法
   */
  initPlugins() {
    this.obj._events = {};
    // 新增一个方法，这里绑定到页面
    let funcList = ['processPageLoginHandler', 'processPageError', 'processPageEmpty', 'processPageDone', 'processSinglePageError', 'processSinglePageEmpty', '_setDeviceInfo', '_requestUserInfo', '_loginFailCallback', 'redirectMiniAppEvent', 'sendMessageAsync', '_refreshAsync', 'isFastClick']; //'on', 'emit','reportSingleEvent',
    for (let fn of funcList) {
      this.obj[fn] = this[fn];
    }
  }

  /**
   * 页面公共的 onLoad 方法，会在页面 onLoad 前执行
   *
   * @param {Object} options 传入 onLoad 的参数
   * @return {Any} 返回值会替换原来的参数成传给单个页面的 onLoad 方法
   */
  onLoad(options) {
    // 页面加载
    console.log('Page onLoad...');
    console.warn('页面参数options: ', options);
    this.onLoadOptions = options //临时解决钉钉小程序onLoad中使用promise立即返回数据会出现setData异常的问题
  }

  /**
   * 页面公共的 onReady 方法，会在页面 onReady 前执行
   *
   */
  onReady() {
    // 页面加载完成
    console.log('Page onReady...');
    this._setDeviceInfo();

    this.retryLoginCount = 0;

    // this._requestUserInfo();
  }

  _requestUserInfo() {
    const app = getApp();
    console.log('this.retryLoginCount: ', this.retryLoginCount);

    app.user.requestUserInfoAsync().then(
      res => {
        // console.log('requestUserInfoAsync res:');
        // console.log(JSON.stringify(res));
        if (app.isLogin() || this.retryLoginCount >= MAX_RETRY) {
          this.onUserInfoReady(this.onLoadOptions);
        } else {
          this.retryLoginCount++;
          console.warn(`登录信息为空，重试登录 第${this.retryLoginCount} 次...`);
          this._requestUserInfo();
        }
      },
      err => {
        console.error('onReady requestUserInfoError ', err);
        if (this.retryLoginCount >= MAX_RETRY) {
          console.error(`连续 ${MAX_RETRY} 次重试登录失败，不重试`);

          this._loginFailCallback(err);

          this.onUserInfoReady(this.onLoadOptions);
        } else {
          this.retryLoginCount++;
          console.warn(`登录失败，重试登录 第${this.retryLoginCount} 次...`);
          this._requestUserInfo();
        }
      }
    );
  }

  /**
   * 页面出错重新进行一次是否登录判断
   * @param isReloadUserInfo 是否刷新用户身份信息
   * @param success  成功回调
   * @param fail     失败回调
   */
  processPageLoginHandler({
    isReloadUserInfo = false,
    success,
    fail
  }) {
    this.setData({
      pageState: 'loading'
    });
    const app = getApp();
    if (!isReloadUserInfo && app.isLogin()) {
      typeof success === 'function' && success();
    } else {
      app.user.requestUserInfoAsync(isReloadUserInfo).then(
        res => {
          typeof success === 'function' && success(res);
        },
        err => {
          console.error('requestUserInfoError ', err);
          this._loginFailCallback(err);

          typeof fail === 'function' && fail(err);
        }
      );
    }
  }

  _loginFailCallback(err) {
    if (err.resultCode !== 'Error_UnAuthorized' && err.resultCode !== 'Error_Authorization') {
      if (err.resultMessage) {
        this.processPageError(err, true, undefined, `${err.resultMessage}\n点击重新尝试`);
      } else {
        this.processPageError(err);
      }
    } else {
      this.setData({
        loginErrorCode: err.resultCode,
        isCustomizeHeader: true,
      });
      //激活状态
      err.pageState = 'activating';
      //清空定时器
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      //刷新次数
      if (currentTimes < MAX_REFRESH) {
        refreshTimer = setTimeout(() => {
          this.onPageErrorHandler();
          currentTimes++;
          console.log(currentTimes)
        }, INTERVAL)
      }
      this.processPageError(err, true);
    }
  }

  _setDeviceInfo() {
    const app = getApp();
    if (Util.isEmpty(app)) {
      console.warn('getApp()，实例不存在');
      return;
    }
    const isIPhoneX = app.systemInfo.isIPhoneX();
    const platform = app.systemInfo.getPlatform();
    this.setData({
      isIPhoneX,
      platform,
    });
  }

  /**
   * 页面公共的 onUnload 方法
   */
  onUnload() {
    // console.log('-----> onUnload....');
    //TODO: 待封装联动 如：收藏，外面列表也变动
  }

  onShow() {
    console.log('Page onShow...');
  }

  onHide() {
    console.log('Page onHide...');
  }

  onReachBottom() {}

  // 场景 当用户点多次，较深页面层级，快速点返回，这时不统计低于500毫秒的页面停留统计 解决：快速点返回的时候，
  isFastClick() {
    // 注：组件内不可调用页面内的方法（包含this），因为this会随着页面的变化而变化
    // 判断是否快速重复点击
    let current = Date.now();
    if (!this.clickTime) {
      this.clickTime = current;
    } else {
      let timeDiff = current - this.clickTime;
      if (timeDiff < 1000) {
        console.warn('监测到快速点击！');
        return true;
      } else {
        this.clickTime = current;
      }
    }
    return false;
  }

  /**
   * 错误界面统一处理
   * @param {Number} code
   */
  processPageError(code = {}, isReload = true, pageTitle = '数据加载失败', pageDesc = '点击重新尝试') {
    if (code == Config.requestRejectType.multipleRequest) {
      console.warn('重复请求，不做处理');
      return;
    }
    // ToastHelper.hideLoading();
    const data = {
      isLoading: false,
      isLastPage: true,
    };

    if (isReload) {
      wx.stopPullDownRefresh();
      if (code.resultCode == '-2') {
        this.setData({
          ...data,
          pageState: 'netError',
          pageTitle: '网络连接已断开，\n请检查网络设置哦～',
          pageDesc: '点击重新尝试'
        });
      } else if (code.resultCode == '-1') {
        this.setData({
          ...data,
          pageState: 'error',
          pageTitle: '服务器出错',
          pageDesc: '请稍后尝试'
        });
      } else if (code.resultCode == '-3') {
        console.error(code.resultMessage);
        console.error('------ 不做处理 ---------- ');
        this.setData({
          pageState: '',
          isLoading: false
        });
      } else if (typeof code.pageState != 'undefined') {
        this.setData({
          pageState: code.pageState,
        });
      } else {
        this.setData({
          ...data,
          pageState: 'error',
          pageTitle,
          pageDesc
        });
      }
    } else {
      this.setData({
        isLoading: false,
        showMoreError: true
      });
    }
  }

  /**
   * 空界面统一处理
   * @param {Boolean} isReload
   */
  processPageEmpty(isReload, pageTitle = '这里是空的哦', pageDesc = '') { //pageDesc = '请稍后再尝试'
    // ToastHelper.hideLoading();
    const data = {
      isLoading: false,
      isLastPage: true,
      showMoreError: false,
      pageState: 'nodata',
      pageTitle,
      pageDesc,
    };

    if (isReload) {
      this.setData({
        ...data,
        pageList: []
      });
    } else {
      this.setData({
        ...data
      });
    }
  }

  /**
   * 请求成功处理
   * @param {isLastPage} Boolean
   */
  processPageDone(isReload, isLastPage, pageList = []) {
    const data = {
      isLoading: false,
      isLastPage,
      showMoreError: false,
      pageState: 'over',
    };

    if (isReload) {
      this.setData({
        ...data,
        pageList
      });
    } else {
      this.setData({
        ...data,
      });
      this.$spliceData({
        pageList: [this.data.pageList.length, 0, ...pageList]
      });
    }
  }

  /**
   * 分页页面出错 界面处理
   * @param {Boolean} isReload
   */
  processSinglePageError(index, code, isReload) {
    if (code == Config.requestRejectType.multipleRequest) {
      console.warn('重复请求，不做处理');
      return;
    }

    let info;
    if (isReload) {
      wx.stopPullDownRefresh();
      if (code.resultCode == -2) {
        info = {
          isLoading: false,
          isLastPage: true,
          pageState: 'netError',
          pageTitle: '网络连接已断开，\n请检查网络设置哦～',
          pageDesc: '点击重新尝试'
        };
      } else {
        info = {
          isLoading: false,
          isLastPage: true,
          pageState: 'error',
          pageTitle: '数据加载失败',
          pageDesc: '点击重新尝试'
        };
      }
    } else {
      info = this.data.pagesInfo[index];
      info.isLoading = false;
      info.showMoreError = true;
    }
    this.setData({
      [`pagesInfo[${index}]`]: info
    });
  }

  /**
   * 分页页面为空 界面处理
   * @param {Boolean} isReload
   */
  processSinglePageEmpty(index, isReload, pageTitle = '这里是空的哦', pageDesc = '') { //pageDesc = '请稍后再尝试'
    let info;
    if (isReload) {
      info = {
        isLoading: false,
        isLastPage: true,
        showMoreError: false,
        pageState: 'nodata',
        pageTitle: pageTitle,
        pageDesc: pageDesc,
        pageList: []
      };
    } else {
      info = this.data.pagesInfo[index];
      info.isLoading = false;
      info.isLastPage = true;
      info.showMoreError = false;
      // info.pageState = 'over';
    }
    this.setData({
      [`pagesInfo[${index}]`]: info
    });
  }

  /**
   * 更新方法，⚠️ 该方法需异步，提高性能
   */
  _refreshAsync() {
    return new Promise((resolve, reject) => {
      console.error("this,:", this)
      // debugger
      if (Reflect.has(this, 'initData')) {
        console.log('[_refreshAsync] 触发 -------- 当前 route:', this.route);
        this.initData();
      } else {
        console.warn('[_refreshAsync] 未能执行，请检查方法 initData 是否在 page.js 内声明');
      }
      resolve();
    });
  }

  /**
   * 通知 上个页面
   * @param {Object} sendData 传递的数据，没传 默认刷新上个页面initData数据
   */
  sendMessageLastPageAsync(sendData = {}) {
    return new Promise((resolve, reject) => {
      let pages = getCurrentPages(); //当前页面
      let index = pages.length - 2;
      if (index < 0) {
        console.error('[sendMessageLastPageAsync] 不存在上一个页面，或请确认 路径 是否正确');
        return reject();
      }

      let prePage = pages[index]; //上一页面
      if (Util.isEmpty(sendData) || Util.isEmpty(Object.keys(sendData))) {
        prePage._refreshAsync().then(() => {
          return resolve();
        }, () => {
          return reject();
        });
      } else {
        if (getApp().systemInfo.getOSType() === 2) {
          console.log('[sendMessageLastPageAsync] sendData:');
          console.log(JSON.stringify(sendData));
        } else {
          console.log('[sendMessageLastPageAsync] sendData:', sendData);
        }
        if (Reflect.has(prePage, 'receiveMessageAsync')) {
          prePage.receiveMessageAsync(sendData).then(() => {
            // 页面内声明 该方法
            return resolve();
          }, () => {
            return reject();
          });
        } else {
          console.warn('[sendMessageLastPageAsync] - receiveMessageAsync 未能执行，请检查方法 receiveMessageAsync 是否在 page.js 内声明');
          return reject();
        }
      }
    });
  }

  /**
   * 通知 ⚠️ 类型 - init ，刷新数据方法名必须是 'initData'
   * ps：后期再支持，针对不同页面，传递不同数据
   * @param {String} refreshType 通知类型，默认：all - 刷新数据；part - 部分数据刷新
   * @param {Object} sendData 传递的数据
   * @param {Array} pagePathArray 通知更新的页面路径，默认 没传 为上一个页面
   */
  sendMessageAsync([{
    refreshType = 'init',
    path = '',
    sendData = {}
  }]) {
    return new Promise((resolve, reject) => {
      let sendList = arguments[0];
      if (Util.isEmpty(sendList)) {
        console.error('[sendMessage] 参数传递错误');
        return reject();
      }

      let pages = getCurrentPages(); //当前页面
      for (var page of pages) {
        let i = sendList.length;
        if (i < 1) {
          // splice 完如果已经没有数据 break
          break;
        }

        while (i--) {
          let sendObj = sendList[i];
          let pageUrl = sendObj.path[0] == '/' ? sendObj.path : '/' + sendObj.path;
          if ((page.route[0] == '/' ? page.route : '/' + page.route) == pageUrl) {
            if (sendObj.refreshType == 'init') {
              page._refreshAsync().then(() => {}, () => {
                console.warn('[sendMessage] - _refreshAsync 执行失败，page route:', page.route);
              });
            } else {
              console.log('[sendMessage] sendObj.sendData:', sendObj.sendData);
              if (Reflect.has(page, 'receiveMessageAsync')) {
                page.receiveMessageAsync(sendObj.sendData).then(() => {}, () => {
                  console.warn('[sendMessage] - receiveMessageAsync 执行失败，page route:', page.route);
                });
              }
            }
            sendList.splice(i, 1);
          }
        }
      }

      resolve();
    });
  }
}

const pageBase = options => new PageBase(options);
module.exports = {
  PageBase: pageBase
};