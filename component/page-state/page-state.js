// 通用 页面状态

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //状态 :loading、nodata、error
    state: {
      type: String,
      value: "",
      observer: function (newVal, oldVal) {
        if (newVal == 'error') {
          this._setNetwork();
        }
      }
    },
    //定位 margin-top位置
    loadingTop: {
      type: Number,
      value: 40
    },
    loadingBottom: {
      type: Number,
      value: 0
    },
    errorTop: {
      type: Number,
      value: 20
    },
    nodataTop: {
      type: Number,
      value: 30
    },
    nodataBottom: {
      type: Number,
      value: 40
    },
    //标题
    title: {
      type: String,
      value: ""
    },
    //描述
    desc: {
      type: String,
      value: ""
    },
    imageUrl: {
      type: String,
      value: ""
    },
    isNoImage: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    _setNetwork: function () {
      getApp().systemInfo.getNetworkTypeAsync().then(netType => {
        if (netType == 0) {
          this.setData({
            isOffLine: true
          });
        } else {
          this.setData({
            isOffLine: false
          });
        }
      }, () => {
        this.setData({
          isOffLine: false
        });
      });
    },
    _bindPageErrorHandler: function () {
      this.triggerEvent("onErrorClick", {});
    }
  }
});
