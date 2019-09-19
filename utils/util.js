import config from './config.js'

/**
 * 格式化时间
 */
const formatTime = (date, fmt = "yyyy/MM/dd hh:mm:ss")=> {
    if (!date) return "";
    date = typeof date == "number" ? new Date(date) : date;
    var o = {

        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒

    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ?
                (o[k]) :
                (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

/**
 * 转换称两位数
 * 0 => 00
 */
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

/**
 * 封装上传函数
 */
const uploadFile = (url, params) => {
    return new Promise((resolve, reject) => {
        const app = getApp();
        wx.uploadFile({
            url: config.api_blink_url + url,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success(result) {
                console.log(result);
                const res = JSON.parse(result.data);
                res.status === -1 ? reject(res) : resolve(res);
            },
            fail(error) {
                const err = JSON.parse(error.data);
                reject(err);
            },
            ...params,
        })
    })
}

module.exports = {
    formatTime: formatTime,
    formatNumber: formatNumber,
    uploadFile: uploadFile
}