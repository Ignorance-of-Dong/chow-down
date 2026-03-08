// pages/profile/profile.js
const app = getApp()
const { userApi } = require('../../api/index')

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    hasUserInfo: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    this.setData({
      userInfo,
      isAdmin: app.globalData.isAdmin,
      hasUserInfo: !!userInfo
    })
  },

  // 获取微信用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res.userInfo)
        const { nickName, avatarUrl } = res.userInfo
        
        // 更新到后端
        this.updateUserInfo(nickName, avatarUrl)
      },
      fail: (err) => {
        console.log('获取用户信息失败', err)
      }
    })
  },

  // 更新用户信息到后端
  async updateUserInfo(nickname, avatar) {
    try {
      // 调用后端更新用户信息
      await userApi.updateProfile({
        nickname,
        avatar
      })
      
      // 更新本地数据
      app.globalData.userInfo = {
        ...app.globalData.userInfo,
        nickname,
        avatar
      }
      
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('更新用户信息失败', err)
    }
  },

  // 跳转到管理后台
  goToAdmin() {
    wx.showToast({
      title: '请在电脑端打开后台管理系统',
      icon: 'none'
    })
  }
})
