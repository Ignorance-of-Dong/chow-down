// pages/orders/orders.js
const { orderApi } = require('../../api/index')
const { formatDate, getStatusName, getMealTypeName } = require('../../utils/util')

Page({
  data: {
    loading: true,
    orders: [],
    isAdmin: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ isAdmin: app.globalData.isAdmin })
  },

  onShow() {
    this.loadOrders()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  // 加载订单列表
  async loadOrders() {
    try {
      this.setData({ loading: true })
      let res
      if (this.data.isAdmin) {
        // 管理员看所有订单
        res = await orderApi.getList({})
      } else {
        // 普通成员看自己的订单
        res = await orderApi.getMyOrders()
      }

      // 转换字段名适配前端
      const orders = (res.data || []).map(order => ({
        ...order,
        createdAt: order.created_at,
        formattedTime: formatDate(order.created_at, 'MM-DD HH:mm'),
        items: (order.items || []).map(item => ({
          ...item,
          dishName: item.dish_name || item.name
        }))
      }))

      this.setData({
        orders,
        loading: false
      })
    } catch (err) {
      console.error('加载订单失败', err)
      this.setData({ loading: false })
    }
  },

  // 格式化日期
  formatDate(date) {
    return formatDate(date, 'MM-DD HH:mm')
  },

  // 获取状态名称
  getStatusName,

  // 获取餐次名称
  getMealTypeName,

  // 获取状态样式类
  getStatusClass(status) {
    const classes = {
      pending: 'status-pending',
      preparing: 'status-cooking',
      ready: 'status-cooking',
      completed: 'status-completed'
    }
    return classes[status] || ''
  },

  // 更新订单状态（管理员）
  async updateStatus(e) {
    const { id, status } = e.currentTarget.dataset

    try {
      await orderApi.updateStatus(id, status)
      wx.showToast({
        title: '状态已更新',
        icon: 'success'
      })
      this.loadOrders()
    } catch (err) {
      console.error('更新状态失败', err)
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
