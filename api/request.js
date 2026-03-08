// api/request.js - 请求封装
const config = require('../utils/config')

const request = (options) => {
  return new Promise((resolve, reject) => {
    const app = getApp()
    const { url, method = 'GET', data = {}, header = {} } = options

    // 检查登录状态
    if (!app.globalData.token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/home/home'
        })
      }, 1000)
      reject(new Error('未登录'))
      return
    }

    // 添加 token
    header['Authorization'] = `Bearer ${app.globalData.token}`

    wx.request({
      url: `${config.apiBaseUrl}${url}`,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (res.data.dishes || res.data.users || res.data.orders || res.data.order || res.data.message) {
            const data = res.data.dishes || res.data.users || res.data.orders || res.data.order || res.data
            resolve({ success: true, data })
          } else {
            resolve({ success: true, data: res.data })
          }
        } else if (res.statusCode === 401) {
          app.globalData.token = null
          app.globalData.isLoggedIn = false
          wx.removeStorageSync('token')
          wx.showToast({
            title: '登录已过期',
            icon: 'none'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/home/home'
            })
          }, 1000)
          reject(res)
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

const get = (url, data) => request({ url, method: 'GET', data })
const post = (url, data) => request({ url, method: 'POST', data })
const put = (url, data) => request({ url, method: 'PUT', data })
const del = (url, data) => request({ url, method: 'DELETE', data })

module.exports = {
  request,
  get,
  post,
  put,
  del
}
