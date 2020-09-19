import config from '../app.config.js'

class HTTP {
  constructor() {
    this.baseRestUrl = config.api_blink_url
  }

  //http 请求类, 当noRefech为true时，不做未授权重试机制
  /*
   * url    请求地址
   * data   请求参数
   * method 请求类型，默认为POST
   */
  request(url, data, method) {
    let _this = this;

    if (!method) {
      method = 'POST';
    }
    return new Promise((resolve, reject) => {
      wx.request({
        url: _this.baseRestUrl + url,
        data: data,
        method: method,
        header: {
          'content-type': 'application/json',
          'appkey': config.appkey
        },
        success: function(res) {
          // 判断以2（2xx)开头的状态码为正确
          // 异常不要返回到回调中，就在request中处理，记录日志并showToast一个统一的错误即可
          var code = res.statusCode.toString();
          var startChar = code.charAt(0);
          if (startChar == '2') {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: function(err) {
          reject(err)
          _this._showToast('请求出错，请稍后重试')
        }
      });
    });
  }

  _showToast(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 2000
    })
  }
};

export {
  HTTP
};