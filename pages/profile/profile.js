// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isAdmin: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo,
      isAdmin: app.globalData.isAdmin
    })
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res.userInfo)
        // 这里可以调用后端更新用户信息
      }
    })
  },

  // 跳转到管理后台
  goToAdmin() {
    wx.showToast({
      title: '请在电脑端打开后台管理系统',
      icon: 'none'
    })
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout()
          this.setData({
            userInfo: null,
            isAdmin: false
          })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  }
})
