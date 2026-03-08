// pages/home/home.js
const app = getApp()

Page({
  data: {
    loading: false,
    isLoggedIn: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
  },

  checkLogin() {
    const isLoggedIn = !!app.globalData.token
    this.setData({ isLoggedIn })
    
    if (isLoggedIn) {
      // 已登录，跳转到点餐页
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  async handleLogin() {
    this.setData({ loading: true })
    
    try {
      await app.login()
      this.setData({ loading: false, isLoggedIn: true })
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      console.error('登录失败', err)
      this.setData({ loading: false })
    }
  }
})
