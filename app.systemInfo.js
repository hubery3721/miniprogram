/**
 * 程序配置信息
 */
class SystemInfo {
  static sInstance;

  static getInstance() {
    if (!this.sInstance) {
      this.sInstance = new SystemInfo();
    }
    return this.sInstance;
  }

  constructor() {
    this.systemInfo = wx.getSystemInfoSync();
    this.init();
  }

  init() {
    this.headerInfo = {
      Device: this.getBrand(), // 手机品牌
      DeviceModel: this.getModel(), // 手机型号
      AppLang: this.getLanguage(), // 设置的语言
      PixelRatio: this.getPixelRatio(), // 设备像素比
      Screen: `${this.getWindowWidth()}*${this.getWindowHeight()}`, // 可使用窗口宽 高
      DeviceScreen: `${this.getScreenWidth()}*${this.getScreenHeight()}`, // 设备屏幕宽高
      Width: this.getWindowWidth(),
      Height: this.getWindowHeight(),
      // statusBarHeight: this.getStatusBarHeight(),//todo 钉钉不支持
      OSVer: this.getSystem(), // 操作系统版本
      PT: this.getPlatform(), // 客户端平台 Android、iOS
      Version: this.getVersion(), // 钉钉版本号
      // SdkVer: this.getSDKVersion(), // 小程序客户端基础库版本
      OSType: this.getOSType(),
      Net: 0, // 网络类型，监听后更新
    };

    this.getNetworkTypeAsync().then(netType => {
      this.headerInfo.Net = netType;
      getApp().globalData.isWifi = netType == 1;
    });
  }

  /**
   * 系统信息（头部专用）
   */
  getHeaderInfo() {
    return this.headerInfo;
  }

  getSystemInfo() {
    return this.systemInfo;
  }

  setSystemInfo(systemInfo) {
    this.systemInfo = systemInfo;
    this.init();
  }

  /**
   * 获取当前手机品牌
   *
   * @returns
   * @memberof SystemInfo
   */
  getBrand() {
    return this.getSystemInfo().brand;
  }

  /**
   * 获取当前设备型号
   *
   * @returns
   * @memberof SystemInfo
   */
  getModel() {
    return this.getSystemInfo().model;
  }

  /**
   * 是否iPhoneX系列
   *
   * @returns
   * @memberof SystemInfo
   */
  isIPhoneX() {
    const model = this.getModel()
    return (model.indexOf('iPhone X') > -1 || model.indexOf('iPhone 11') > -1);
  }
  /**
   * 获取当前用户使用语言环境
   *
   * @returns
   * @memberof SystemInfo
   */
  getLanguage() {
    return this.getSystemInfo().language;
  }

  /**
   * 获取用户设备像素比
   *
   * @returns
   * @memberof SystemInfo
   */
  getPixelRatio() {
    return this.getSystemInfo().pixelRatio;
  }

  /**
   * 设备宽
   *
   * @returns
   * @memberof SystemInfo
   */
  getWindowWidth() {
    return this.getSystemInfo().windowWidth;
  }

  /**
   * 设备高
   *
   * @returns
   * @memberof SystemInfo
   */
  getWindowHeight() {
    return this.getSystemInfo().windowHeight;
  }

  /**
   * 屏幕宽
   *
   * @returns
   * @memberof SystemInfo
   */
  getScreenWidth() {
    return this.getSystemInfo().screenWidth;
  }

  /**
   * 屏幕高
   *
   * @returns
   * @memberof SystemInfo
   */
  getScreenHeight() {
    return this.getSystemInfo().screenHeight;
  }

  /**
   * 当前电量百分比
   *
   * @returns
   * @memberof SystemInfo
   */
  getCurrentBattery() {
    return this.getSystemInfo().currentBattery;
  }

  /**
   * 设备操作系统版本
   *
   * @returns
   * @memberof SystemInfo
   */
  getSystem() {
    return this.getSystemInfo().system;
  }

  /**
   * 设备使用操作系统平台类型
   *
   * @returns
   * @memberof SystemInfo
   */
  getPlatform() {
    return this.getSystemInfo().platform;
  }

  /**
   * 钉钉版本号
   *
   * @returns
   * @memberof SystemInfo
   */
  getVersion() {
    return this.getSystemInfo().version;
  }

  /**
   * 小程序基础库版本
   *
   * @returns
   * @memberof SystemInfo
   */
  getSDKVersion() {
    return wx.SDKVersion || '';
  }

  getStatusBarHeight() {
    return this.getSystemInfo().statusBarHeight; //todo 钉钉暂不支持
  }

  /**
   * 获取系统类型
   *
   * @returns
   * @memberof SystemInfo
   */
  getOSType() {
    // const device = this.getModel().toLocaleLowerCase();
    // if (device.indexOf('iphone') > -1 || device.indexOf('ipad') > -1 || device.indexOf('itouch') > -1 || device.indexOf('iwatch') > -1) {
    //   return 1; // iOS
    // }
    const pt = this.getPlatform();
    return pt.toLocaleLowerCase() == 'android' ? 2 : 1;
  }

  /**
   * 获取当前网络类型
   *
   * @returns
   * @memberof SystemInfo
   */
  getNetworkTypeAsync() {
    let that = this;
    return new Promise((resolve, reject) => {
      let netType = 1;
      wx.getNetworkType({
        success(res) {
          const { networkType } = res; // 返回网络类型2g，3g，4g，wifi
          that.switchNetworkType(networkType);

          resolve(netType);
        },
        fail(res) {
          resolve(1);
        }
      });
    });
  }



  switchNetworkType(networkType) {
    let netType;
    networkType = networkType.toLowerCase();
    switch (networkType) {
      case 'wifi':
        netType = 1;
        break;
      case '2g':
        netType = 2;
        break;
      case '3g':
        netType = 3;
        break;
      case '4g':
        netType = 4;
        break;
      case '5g':
        netType = 5;
        break;
      case 'none':
      case 'notreachable':
        netType = 0;
        break;
      case 'unknown':
        netType = 2;
        break;
      default:
        netType = 1;
        console.error('未知网络类型');
        break;
    }
    this.headerInfo.Net = netType; //改变http请求头网络状态
    return netType;
  }
}

module.exports = {
  SystemInfo
};