// pages/home/home.js
const app = getApp()
const config = require('../../utils/config')

Page({
  data: {
    loading: false,
    isLoggedIn: false,
    avatarUrl: '',
    nickname: ''
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

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({ avatarUrl })
  },

  // 输入昵称
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onNicknameBlur(e) {
    this.setData({ nickname: e.detail.value })
  },

  // 登录
  async handleLogin() {
    const { avatarUrl, nickname } = this.data
    
    if (!nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })
    
    try {
      // 获取微信登录 code
      const loginRes = await this.wxLogin()
      
      // 发送到后端
      await this.loginToServer(loginRes.code, nickname, avatarUrl)
      
      this.setData({ loading: false, isLoggedIn: true })
      
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      console.error('登录失败', err)
      this.setData({ loading: false })
    }
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
  loginToServer(code, nickname, avatar) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.apiBaseUrl}/auth/wechat-login`,
        method: 'POST',
        data: {
          code: code,
          nickname: nickname,
          avatar: avatar
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
