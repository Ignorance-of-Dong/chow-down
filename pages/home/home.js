// pages/home/home.js
const app = getApp()
const config = require('../../utils/config')

Page({
  data: {
    loading: true,
    needRegister: false,
    avatarUrl: '',
    nickname: ''
  },

  onLoad() {
    this.autoLogin()
  },

  // 自动登录
  async autoLogin() {
    try {
      // 获取微信登录 code
      const loginRes = await this.wxLogin()
      
      // 用 code 换取用户信息
      const result = await this.loginToServer(loginRes.code)
      
      if (result.user && result.user.nickname) {
        // 用户已存在，直接跳转
        this.setData({ loading: false })
        wx.switchTab({
          url: '/pages/index/index'
        })
      } else {
        // 用户不存在，需要填写昵称头像
        this.setData({ 
          loading: false, 
          needRegister: true 
        })
      }
    } catch (err) {
      console.error('自动登录失败', err)
      this.setData({ loading: false, needRegister: true })
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
  loginToServer(code, nickname = '', avatar = '') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.apiBaseUrl}/auth/wechat-login`,
        method: 'POST',
        data: { code, nickname, avatar },
        success: (response) => {
          console.log('登录响应:', response.data)
          if (response.data.token) {
            const { token, user } = response.data
            app.globalData.token = token
            app.globalData.userInfo = user
            app.globalData.isAdmin = user.role === 'admin'
            app.globalData.isLoggedIn = true
            wx.setStorageSync('token', token)
            resolve({ token, user })
          } else if (response.data.error) {
            reject(new Error(response.data.error))
          } else {
            reject(new Error('登录失败，请稍后重试'))
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
          reject(new Error('网络请求失败'))
        }
      })
    })
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

  // 提交注册
  async handleRegister() {
    const { avatarUrl, nickname } = this.data
    
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    
    try {
      const loginRes = await this.wxLogin()
      await this.loginToServer(loginRes.code, nickname, avatarUrl)
      
      this.setData({ loading: false })
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (err) {
      console.error('注册失败', err)
      this.setData({ loading: false })
      wx.showToast({ 
        title: err.message || '注册失败', 
        icon: 'none',
        duration: 3000
      })
    }
  }
})
