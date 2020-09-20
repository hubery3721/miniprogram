import { Request } from '../utils/network/request';
import Api from '../utils/network/api';

class GlobalBiz {
  constructor() {}
  // 获取登录信息
  getUnionId(params) {
    return new Request(Api.GetSession).get(params).then(res => {
      return res;
    }, err => {
      Promise.reject(err);
    });
  }
}
const globalBiz = new GlobalBiz()

module.exports = {
  GlobalBiz: globalBiz
}