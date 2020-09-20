/**
 * 请求接口配置
 */
import Config from '../../app.config';

/**
 * 请求类型定义
 */
export default {
  /** -----------------  UserApi  ----------------- */
  GetSession: { url: `${Config.host.userCenter}/OAuthApi/WxAppSessionKey`, name: 'getSessionKey', isQuiet: true },
  SendSms: { url: `${Config.host.userCenter}/OAuthApi/SendSmsCaptcha`, name: '发送短信验证' },
  PhoneRegister: { url: `${Config.host.userCenter}/OAuthApi/PhoneLoginRegister`, name: '电话注册' },
  PhoneRegisterWeApp: { url: `${Config.host.userCenter}/OAuthApi/PhoneLoginRegisterWeApp`, name: '微信快速绑定' },
  LoginPhone: { url: `${Config.host.userCenter}/OAuthApi/LoginPhone`, name: '手机登录' },
}