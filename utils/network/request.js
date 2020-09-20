import Util from '../util'; // 工具
import ToastHelper from '../toastHelper';
import Config from '../../app.config'; // 签名

let currentRequestArray = [];
let isConnected = true;

/**
 *  - 请求封装 -
 * 注意：同时只能发起 5 个网络请求
 */
export class Request {
  /**
   * 构造函数
   * @param {Object} apiInfo 保护请求地址、接口名称
   * @param {Object} requestType 请求配置（包含：signature和 userAgent）
   */
  constructor(apiInfo, requestType = Config.businessRequest) {
    this.name = apiInfo.name;
    this.url = apiInfo.url;
    this.isQuiet = !!apiInfo.isQuiet;
  }

  /**
   * 请求  --  所有请求，都是默认post，不必区分，统一调用get方法
   * @param {Object} params 请求参数
   * @param {Boolean} isAllowMultipleRequest 是否过滤重复请求，比如，过快点击导致的重复请求。一个请求，只有当返回resolve/reject之后，才可以再次发起请求
   */
  get(params = {}, isAllowMultipleRequest = false) {
    return new Promise((resolve, reject) => {
      let app = getApp();
      //请求限制重复
      let requestStr = (app && app.globalData.currentRoute ? app.globalData.currentRoute : '') + this.url + Util.objectToString(params); //添加 页面路径原因是，比如当前页面有请求，另一个页面也有相同请求，不应该放弃
      let requestID = "";
      let index = currentRequestArray.indexOf(requestID);
      if (!isAllowMultipleRequest) {
        if (Util.isNotEmpty(currentRequestArray) && index > -1) {
          console.warn('阻止重复请求ID：' + requestID);
          console.warn('重复url:' + requestStr);
          return reject(Config.requestRejectType.multipleRequest);
        }
        currentRequestArray.push(requestID);
      }
      let name = this.name;
      //这里统一用post
      this._post(params).then(
        result => {
          if (!isAllowMultipleRequest) {
            let indexInArr = currentRequestArray.indexOf(requestID); //重新获取，因为，异步导致获取index不一定是
            indexInArr > -1 && currentRequestArray.splice(indexInArr, 1);
          }
          //获取成功
          if (result.resultCode != '0') {
            console.error(`       【${name}】 获取数据失败:${result.resultCode}\n${result.resultMessage}`);
            if (!this.isQuiet && result.resultCode != '-2') {
              ToastHelper.showInfo(result.resultMessage);
            }
            reject(result);
            if (result.resultCode == 'Login' || result.resultCode == 'Register') {
              wx.removeStorageSync('user.accountID');
            }
            return;
          }

          resolve(result.data);
        },
        err => {
          if (!isAllowMultipleRequest) {
            let indexInArr = currentRequestArray.indexOf(requestID); //重新获取，因为，异步导致获取index不一定是
            indexInArr > -1 && currentRequestArray.splice(indexInArr, 1);
          }
          //异常
          console.error(`       【${name}】 请求异常！`, err);
          reject(Config.requestRejectType.netError);
        }
      );
    });
  }

  /**
   * Request Post方法
   * @param {Object} params 请求数据
   */
  _post(params = {}) {
    return new Promise((resolve, reject) => {
      if (!isConnected) {
        if (!this.isQuiet) {
          ToastHelper.showInfo('当前网络已断开，请检查网络设置！');
        }
        return reject(Config.requestRejectType.netError);
      }
      this._request(params, 'POST', 'json', resolve, reject);
    });
  }

  /**
   * 基于wx.request 封装的 request
   *
   * @param {Object} params 请求数据
   * @param {String} method 请求方式
   * @param {String} dataType 请求数据格式
   * @param {Function} successCbk 成功回调
   * @param {Function} errorCbk 失败回调
   *
   * @returns   wx.request 实例返回的控制对象 requestTask
   */
  _request(params, method, dataType = 'json', successCbk, errorCbk) {
    let url = this.url;
    console.log('');
    console.log(`       【${this.name}】头部信息：`);
    console.log(`       【${this.name}】${url}  开始请求...`);
    console.log(`       【${this.name}】Post 参数`, params);
    console.log('');

    let start = +new Date();

    return wx.request({
      url: url,
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method,
      dataType,
      success: res => console.log(`       【${this.name}】请求返回数据：`, res),
      fail: error => {
        console.error(`       【${this.name}】${url}  请求失败：`, error);
        errorCbk && errorCbk(Config.requestRejectType.netError);
      },
      complete: () => {
        let mileSec = +new Date() - start;
        //超过1.5s，就警告颜色
        if (mileSec > 1500) {
          console.warn(`       【${this.name}】${url}  请求完成！，耗时${mileSec}ms`);
        } else {
          console.log(`       【${this.name}】${url}  请求完成！，耗时${mileSec}ms`);
        }
        console.log('');
      }
    });
  }

  /**
   * 设置网络状态监听，启用时，会将网络连接状态，同步用于控制接口请求。
   * 若网络断开连接，接口直接返回。
   */
  static setupNetworkStatusChangeListener(app) {
    wx.onNetworkStatusChange(res => {
      if (Util.isEmpty(res) || Util.isEmpty(app)) {
        console.warn('【setupNetworkStatusChangeListener】参数不存在 res or app', res, app)
        return;
      }
      let net = res.networkType;

      let oldNetType = app.userAgentInfo.userAgent.Net;
      let uaNetType = app.systemInfo.switchNetworkType(net);
      app.userAgentInfo.setUserAgent('Net', uaNetType);

      isConnected = !!res.isConnected;

      if (!res.isConnected) {
        if (Config.isShowNetChangeToast) {
          ToastHelper.showInfo('当前网络已断开');
        }
        app.globalData.isOffLine = true;
      } else {
        app.globalData.isOffLine = false;
        if ('2g, 3g, 4g'.indexOf(net) > -1) {
          if (oldNetType > 0 && oldNetType != uaNetType && Config.isShowNetChangeToast) {
            ToastHelper.showInfo(`已切到蜂窝网络`);
          }
          app.globalData.isWifi = false;
        } else {
          app.globalData.isWifi = true;
        }
      }
    });
  }
}