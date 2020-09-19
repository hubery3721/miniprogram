import Util from 'util';
const CacheKey = 'AllCacheKey';

/**
 * 本地缓存
 */
export class StorageHelper {
  static getCache(key) {
    if (Util.isEmpty(key)) {
      throw '[getCache]key参数不能为空！';
    }
    let expireObj = this.getExpireObj(key); //wx.getStorageSync(key + '_sec');

    if (Util.isEmpty(expireObj) || Util.isEmpty(expireObj.expireSeconds) || expireObj.expireSeconds < 1) {
      return wx.getStorageSync(key);
    }
    let difMileSeconds = Math.abs(new Date() - Date.parse(expireObj.setDate)); //相差毫秒

    if (difMileSeconds > expireObj.expireSeconds * 1000) {
      this.removeCache(key); //只有取的时候，才会移除过期缓存，不过，只要不存大量数据，就没问题
      return null;
    }
    return wx.getStorageSync(key);
  }

  static removeCache(key) {
    if (Util.isEmpty(key)) {
      throw '[removeCache]key参数不能为空！';
    }
    this.removeExpireCacheKey(key);
    return wx.removeStorageSync(key);
  }

  static removeAllCache() {
    return wx.clearStorageSync();
  }

  static setCache(key, data, expireSeconds) {
    if (Util.isEmpty(key)) {
      throw '[setCache]key参数不能为空！';
    }
    let expireObj = { expireSeconds: expireSeconds ? expireSeconds : 0, setDate: new Date() };

    this.updateExpireCacheKey(key, expireObj);
    wx.setStorage({ key, data });
  }

  static setCacheToList(key, dataId, data, expireSeconds) {
    if (Util.isEmpty(key)) {
      throw '[setCache]key参数不能为空！';
    }
    if (Util.isEmpty(data)) {
      throw '[setCache]data参数不能为空！';
    }
    if (Util.isEmpty(dataId)) {
      throw '[setCache]dataId参数不能为空！';
    }
    if (!(expireSeconds > 0)) {
      throw '[setCache]expireSeconds参数不能为空！';
    }
    let expireObj = { expireSeconds: expireSeconds ? expireSeconds : 0, setDate: new Date() };
    this.updateExpireCacheKey(key, expireObj);
    let list = this.getCache(key);

    if (!data.hasOwnProperty('dataId')) {
      data.dataId = dataId;
    }

    if (Util.isEmpty(list)) {
      list = [];
      list.push(data);
    } else {
      let index = list.findIndex(o => o.dataId == dataId);
      if (index == -1) {
        list.push(data);
      } else {
        list[index] = data;
      }
    }

    wx.setStorage({ key, data: list });
  }

  static getCacheFromList(key, dataId) {
    if (Util.isEmpty(key)) {
      throw '[getCacheFromList]key参数不能为空！';
    }
    if (Util.isEmpty(dataId)) {
      throw '[getCacheFromList]dataId参数不能为空！';
    }

    let list = this.getCache(key);
    if (Util.isEmpty(list)) {
      return null;
    }
    return list.find(o => o.dataId == dataId);
  }

  static updateExpireCacheKey(key, expireObj) {
    let allCacheKey = this.getAllCacheKey();
    if (Util.isEmpty(allCacheKey)) {
      allCacheKey = {};
      allCacheKey[key] = expireObj;
    } else {
      allCacheKey[key] = expireObj;
    }

    wx.setStorage({ key: CacheKey, data: allCacheKey });
  }

  static removeContainsCacheKey(containsKey, notContainsKey) {
    let allCacheKey = this.getAllCacheKey();
    if (Util.isEmpty(allCacheKey)) {
      return;
    }
    Object.keys(allCacheKey).forEach(o => {
      if (o.indexOf(containsKey) > -1 && (Util.isNotEmpty(notContainsKey) && o.indexOf(notContainsKey) == -1)) {
        this.removeCache(o);
      }
    });
  }

  static removeExpireCacheKey(key) {
    let allCacheKey = this.getAllCacheKey();
    if (Util.isEmpty(allCacheKey)) {
      return;
    }
    allCacheKey[key] = null;
    wx.setStorage({ key: CacheKey, data: allCacheKey });
  }

  static getExpireObj(key) {
    let allCacheKey = this.getAllCacheKey();
    if (Util.isEmpty(allCacheKey)) {
      return null;
    }
    return allCacheKey[key];
  }

  static getAllCacheKey() {
    if (Util.isEmpty(this._getAllCacheKeyArray)) {
      this._getAllCacheKeyArray = wx.getStorageSync(CacheKey);
    }
    return this._getAllCacheKeyArray;
  }
}