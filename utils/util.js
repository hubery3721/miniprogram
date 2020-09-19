function isEmpty(obj) {
  if (
    typeof obj == "undefined" ||
    (!obj && typeof obj != "undefined" && obj != 0) ||
    obj == null
  ) {
    return true;
  }
  for (let i in obj) {
    return false;
  }
  if (typeof obj === "number") {
    return false;
  }
  return true;
}

function isNotEmpty(obj) {
  return !isEmpty(obj);
}

/**
 * 浅拷贝
 * ps:小程序内=等于号赋值都是深拷贝
 */
function copy(src) {
  if (isEmpty(src)) {
    return src;
  }
  var dst = src.constructor === Array ? [] : {};
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      dst[prop] = src[prop];
    }
  }
  return dst;
}

/**
 * 移除字符串最后一个，符合的字符
 */
function trimEndSymbol(symbolStr, str) {
  if (
    this.isEmpty(symbolStr) ||
    symbolStr == "" ||
    this.isEmpty(str) ||
    str == ""
  ) {
    return str;
  } else {
    let i = str.length;
    if (str[i - 1] == symbolStr) {
      return str.slice(0, i - 1);
    }
    return str;
  }
}

/**
 * 验证电话号码正确性
 */
function checkValidatePhone(value) {
  if (this.isEmpty(value) || value == "") {
    return false;
  }
  let pattern = /(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
  return pattern.test(value);
}

/**
 * 获取url参数
 */
function getUrlParameterByName(name, url) {
  if (!url) {
    return "";
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * 拼接url参数
 */
function urlParamCombine(arr) {
  let param = "?";
  for (let key in arr) {
    if (typeof arr[key] == "array" || typeof arr[key] == "object") {
      for (let k in arr[key]) {
        param += k + "=" + arr[key][k] + "&";
      }
    } else {
      param += key + "=" + arr[key] + "&";
    }
  }
  return param.substr(0, param.length - 1);
}

/** 
 * json 字符串转换为 object 实体
 */
function stringToObject(str) {
  if (isEmpty(str)) {
    return {};
  }
  return JSON.parse(decodeURIComponent(str));
}

function objectToString(obj) {
  if (isEmpty(obj)) {
    return "";
  }
  return encodeURIComponent(JSON.stringify(obj));
}

function generateUUID() {
  // Public Domain/MIT
  let d = new Date().getTime();
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    d += performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = ((d + Math.random() * 16) % 16) | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Compares two software version numbers (e.g. "1.7.1" or "1.2b").
 *
 * This function was born in http://stackoverflow.com/a/6832721.
 *
 * @param {string} v1 The first version to be compared.
 * @param {string} v2 The second version to be compared.
 * @param {object} [options] Optional flags that affect comparison behavior:
 */
function versionCompare(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  var len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (var i = 0; i < len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

/**
 * 计算字符串内 中文字节数量
 * @param {string} str
 */
function calculateChineseStringLength(str) {
  if (isEmpty(str)) {
    return 0;
  }
  let strLength = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) {
      strLength += 2;
    }
  }
  return strLength;
}

function calculateInputMaxLength(inputValue, maxLength) {
  //中文字符算两个字符
  let chineseLength = calculateChineseStringLength(inputValue);
  let max = maxLength - chineseLength / 2;
  if (max <= maxLength / 2) {
    max = maxLength / 2;
  }
  return max;
}

/**
 * 深拷贝（假定不存在undefine和函数对象）
 * @param {string} str
 */
function deepCopy(src) {
  return JSON.parse(JSON.stringify(src));
}


/**
 * 获取随机数；
 * start:开始范围;
 * end:结束范围;
 *
 * 如:获取1~10里面的随机数, random(1,10);
 *
 * */
function randomRange(min, max) {
  if ('number' !== typeof min || 'number' !== typeof max) return;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function groupBy(objectArray, property) {
  return objectArray.reduce(function(acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

module.exports = {
  isEmpty: isEmpty,
  isNotEmpty: isNotEmpty,
  getUrlParameterByName: getUrlParameterByName,
  generateUUID: generateUUID,
  checkValidatePhone: checkValidatePhone,
  trimEndSymbol: trimEndSymbol,
  urlParamCombine: urlParamCombine,
  objectToString: objectToString,
  stringToObject: stringToObject,
  copy: copy, //浅复制
  versionCompare: versionCompare, //版本比较
  calculateInputMaxLength: calculateInputMaxLength,
  deepCopy: deepCopy, //深复制
  randomRange: randomRange,
  groupBy: groupBy,
};