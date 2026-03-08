// pages/home/home.js
const app = getApp()
const config = require('../../utils/config')

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
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 获取用户信息并登录
  async handleLogin() {
    this.setData({ loading: true })
    
    try {
      // 先获取用户信息
      const userProfile = await this.getUserProfile()
      
      // 再调用微信登录
      const loginRes = await this.wxLogin()
      
      // 发送到后端
      await this.loginToServer(loginRes.code, userProfile)
      
      this.setData({ loading: false, isLoggedIn: true })
      
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      console.error('登录失败', err)
      this.setData({ loading: false })
    }
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve({
            nickname: res.userInfo.nickName,
            avatar: res.userInfo.avatarUrl
          })
        },
        fail: (err) => {
          // 用户拒绝授权，使用默认信息
          resolve({
            nickname: '微信用户',
            avatar: ''
          })
        }
      })
    })
  },

  // 微信登录获取 code
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res)
          } else {
            reject(new Error('wx.login failed'))
          }
        },
        fail: reject
      })
    })
  },

  // 登录到服务器
  loginToServer(code, userProfile) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.apiBaseUrl}/auth/wechat-login`,
        method: 'POST',
        data: {
          code: code,
          nickname: userProfile.nickname,
          avatar: userProfile.avatar
        },
        success: (response) => {
          if (response.data.token) {
            const { token, user } = response.data
            app.globalData.token = token
            app.globalData.userInfo = user
            app.globalData.isAdmin = user.role === 'admin'
            app.globalData.isLoggedIn = true
            wx.setStorageSync('token', token)
            resolve({ token, user })
          } else {
            wx.showToast({
              title: response.data.message || '登录失败',
              icon: 'none'
            })
            reject(response.data)
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }
})
