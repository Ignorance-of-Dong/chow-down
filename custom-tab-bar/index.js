Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/index/index', text: '点餐' },
      { pagePath: '/pages/orders/orders', text: '订单' },
      { pagePath: '/pages/profile/profile', text: '我的' }
    ]
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index
      const url = this.data.list[index].pagePath
      wx.switchTab({ url })
      this.setData({ selected: index })
    }
  }
})
