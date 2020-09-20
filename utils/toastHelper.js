const showSecond = 1500; //毫秒
module.exports = {

  //成功提示
  showSuccess: (title, sec) => {
    wx.showToast({
      title: title,
      mask: true,
      duration: sec > 0 ? sec : showSecond,
    });
  },
  //警告提示
  showWarning: (title) => {
    wx.showToast({
      title: title,
      mask: true,
      duration: showSecond,
      image: '/resources/images/img_tip_error.png'
    });
  },
  //错误提示
  showError: (title) => {
    wx.showToast({
      title: title,
      mask: true,
      duration: showSecond,
      image: '/resources/images/img_tip_error.png'
    });
  },
  //无icon提示
  showInfo: (title, mask = true) => {
    wx.showToast({
      title: title,
      icon: 'none',
      mask: mask,
      duration: showSecond,
    });
  },
  showLoading: (title, sec) => {
    wx.showLoading({
      title: title,
      mask: true,
      duration: sec > 0 ? sec : showSecond,
    })
  },
  hideLoading: () => {
    wx.hideLoading();
  },
}