// app.js
const config = require('./utils/config')

App({
  globalData: {
    userInfo: null,
    token: null,
    isAdmin: false,
    isLoggedIn: false
  },

  onLaunch() {
    // 自动登录
    this.login()
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
                  this.globalData.isLoggedIn = true
                  wx.setStorageSync('token', token)
                  resolve({ token, user })
                } else {
                  // 登录失败，提示用户
                  this.showLoginError()
                  reject(response.data)
                }
              },
              fail: (err) => {
                this.showLoginError()
                reject(err)
              }
            })
          } else {
            this.showLoginError()
            reject(new Error('wx.login failed'))
          }
        },
        fail: (err) => {
          this.showLoginError()
          reject(err)
        }
      })
    })
  },

  // 显示登录失败提示
  showLoginError() {
    wx.showModal({
      title: '登录失败',
      content: '请检查网络连接后重试',
      showCancel: false,
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          this.login()
        }
      }
    })
  }
})
