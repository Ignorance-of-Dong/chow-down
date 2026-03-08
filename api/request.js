// api/request.js - 请求封装
const config = require('../utils/config')

/**
 * 封装请求方法
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const app = getApp()
    const { url, method = 'GET', data = {}, header = {} } = options

    // 添加 token
    if (app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`
    }

    wx.request({
      url: `${config.apiBaseUrl}${url}`,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          // 兼容后端返回格式：{dishes: [...]} 或 {success: true, data: ...}
          if (res.data.dishes || res.data.users || res.data.orders || res.data.order || res.data.message === '登录成功' || res.data.message === '下单成功') {
            // 将后端返回的数据包装成统一格式
            const data = res.data.dishes || res.data.users || res.data.orders || res.data.order || res.data
            resolve({ success: true, data })
          } else if (res.data.success === false) {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          } else {
            resolve({ success: true, data: res.data })
          }
        } else if (res.statusCode === 401) {
          // 未授权，重新登录
          app.login()
          wx.showToast({
            title: '正在重新登录',
            icon: 'none'
          })
          reject(res)
        } else {
          wx.showToast({
            title: '网络错误',
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

// GET 请求
const get = (url, data) => request({ url, method: 'GET', data })

// POST 请求
const post = (url, data) => request({ url, method: 'POST', data })

// PUT 请求
const put = (url, data) => request({ url, method: 'PUT', data })

// DELETE 请求
const del = (url, data) => request({ url, method: 'DELETE', data })

module.exports = {
  request,
  get,
  post,
  put,
  del
}
