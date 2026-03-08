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
    // 检查本地是否有 token
    const token = wx.getStorageSync('token')
    if (token) {
      // 已登录，从后端获取用户信息
      this.fetchUserInfo()
    }
  },

  // 从后端获取用户信息
  async fetchUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${config.apiBaseUrl}/auth/wechat-login`,
          method: 'POST',
          data: { code: 'check' },
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: resolve,
          fail: reject
        })
      })

      if (res.data.token) {
        // 登录成功，更新用户信息
        app.globalData.token = res.data.token
        app.globalData.userInfo = res.data.user
        app.globalData.isLoggedIn = true
        
        // 跳转到点餐页
        wx.switchTab({
          url: '/pages/index/index'
        })
      } else {
        // token 无效，清除并显示登录页
        wx.removeStorageSync('token')
        this.setData({ isLoggedIn: false })
      }
    } catch (err) {
      console.error('获取用户信息失败', err)
      this.setData({ isLoggedIn: false })
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
