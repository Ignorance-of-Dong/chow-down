// app.js
const config = require('./utils/config')

App({
  globalData: {
    userInfo: null,
    token: null,
    isAdmin: false
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.checkLoginStatus()
    } else {
      // 自动登录
      this.login()
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.apiBaseUrl}/auth/me`,
        header: {
          'Authorization': `Bearer ${this.globalData.token}`
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.user) {
            this.globalData.userInfo = res.data.user
            this.globalData.isAdmin = res.data.user.role === 'admin'
            resolve(res.data)
          } else {
            // token 无效，重新登录
            this.login().then(resolve).catch(reject)
          }
        },
        fail: () => {
          this.login().then(resolve).catch(reject)
        }
      })
    })
  },

  // 登录
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: `${config.apiBaseUrl}/auth/wechat-login`,
              method: 'POST',
              data: { code: res.code },
              success: (response) => {
                if (response.data.token) {
                  const { token, user } = response.data
                  this.globalData.token = token
                  this.globalData.userInfo = user
                  this.globalData.isAdmin = user.role === 'admin'
                  wx.setStorageSync('token', token)
                  resolve({ token, user })
                } else {
                  reject(response.data)
                }
              },
              fail: reject
            })
          } else {
            reject(new Error('wx.login failed'))
          }
        },
        fail: reject
      })
    })
  },

  // 登出
  logout() {
    this.globalData.token = null
    this.globalData.userInfo = null
    this.globalData.isAdmin = false
    wx.removeStorageSync('token')
  }
})
