import {
  Global
} from './process/global.js'
import {
  SystemInfo
} from './app.systemInfo';
import {
  StorageHelper
} from './utils/storageHelper';
const GlobalModel = new Global()

//app.js
App({
  systemInfo: null,
  onLaunch: function() {
    this.systemInfo = SystemInfo.getInstance();

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        GlobalModel.getUnionId({
          'jscode': res.code
        }).then(res => {
          console.log("RES", res)
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})