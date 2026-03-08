// pages/confirm/confirm.js
const { orderApi } = require('../../api/index')
const { getMealTypeName } = require('../../utils/util')

Page({
  data: {
    loading: false,
    date: '',
    meal: '',
    mealName: '',
    items: [],
    totalQuantity: 0
  },

  onLoad() {
    const app = getApp()
    const cart = app.globalData.tempCart

    if (!cart || !cart.items || cart.items.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }

    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    this.setData({
      date: cart.date,
      meal: cart.meal,
      mealName: getMealTypeName(cart.meal),
      items: cart.items,
      totalQuantity
    })
  },

  // 增加数量
  increaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items[index].quantity += 1
    this.setData({ items })
    this.updateTotal()
  },

  // 减少数量
  decreaseQuantity(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    if (items[index].quantity > 1) {
      items[index].quantity -= 1
      this.setData({ items })
      this.updateTotal()
    }
  },

  // 删除菜品
  removeItem(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items.splice(index, 1)

    if (items.length === 0) {
      wx.navigateBack()
      return
    }

    this.setData({ items })
    this.updateTotal()
  },

  // 更新总数
  updateTotal() {
    const totalQuantity = this.data.items.reduce((sum, item) => sum + item.quantity, 0)
    this.setData({ totalQuantity })
  },

  // 输入备注
  onRemarkInput(e) {
    const index = e.currentTarget.dataset.index
    const items = [...this.data.items]
    items[index].remark = e.detail.value
    this.setData({ items })
  },

  // 提交订单
  async submitOrder() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const orderData = {
        date: this.data.date,
        meal: this.data.meal,
        items: this.data.items.map(item => ({
          dishId: item.id,
          quantity: item.quantity,
          remark: item.remark || ''
        }))
      }

      await orderApi.create(orderData)

      // 清空购物车
      const app = getApp()
      app.globalData.tempCart = null

      wx.showToast({
        title: '下单成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/orders/orders'
        })
      }, 1500)
    } catch (err) {
      console.error('下单失败', err)
    } finally {
      this.setData({ loading: false })
    }
  }
})
