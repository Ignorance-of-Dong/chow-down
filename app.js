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
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.globalData.isLoggedIn = true
    }
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
          } else {
            wx.showToast({
              title: '微信登录失败',
              icon: 'none'
            })
            reject(new Error('wx.login failed'))
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          })
          reject(err)
        }
      })
    })
  }
})
