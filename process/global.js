import {
  HTTP
} from './http.js'

class Global extends HTTP {
  constructor() {
    super()
  }
  // 获取登录信息
  getUnionId(params) {
    return this.request('v1.0.0/weixin/getUnionId', params)
  }
}

export {
  Global
};