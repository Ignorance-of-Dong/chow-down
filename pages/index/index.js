// pages/index/index.js
const { dishApi } = require('../../api/index')
const { getCategoryName } = require('../../utils/util')

Page({
  data: {
    loading: true,
    selectedDate: '',
    selectedMeal: 'lunch',
    meals: [
      { value: 'breakfast', label: '早餐' },
      { value: 'lunch', label: '午餐' },
      { value: 'dinner', label: '晚餐' },
      { value: 'supper', label: '夜宵' }
    ],
    categories: ['热菜', '素菜', '汤类', '主食'],
    dishesByCategory: {},
    cart: [],
    cartCount: 0
  },

  onLoad() {
    this.initDate()
    this.loadDishes()
  },

  onShow() {
    // 从确认页返回时刷新购物车显示
    this.updateCartDisplay()
  },

  // 初始化日期
  initDate() {
    const today = new Date()
    const dateStr = this.formatDate(today)
    this.setData({ selectedDate: dateStr })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 加载菜品
  async loadDishes() {
    try {
      this.setData({ loading: true })
      const res = await dishApi.getList({ date: this.data.selectedDate })

      console.log('菜品数据:', res)

      // 后端返回的菜品数据
      const dishes = res.data || []

      // 按分类分组，只显示可用的菜品
      const dishesByCategory = {}
      this.data.categories.forEach(cat => {
        dishesByCategory[cat] = dishes.filter(d => d.category === cat && d.status === 'available')
      })

      this.setData({
        dishesByCategory,
        loading: false
      })
    } catch (err) {
      console.error('加载菜品失败', err)
      this.setData({ loading: false })
    }
  },

  // 选择日期
  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value })
    this.loadDishes()
  },

  // 选择餐次
  onMealSelect(e) {
    const meal = e.currentTarget.dataset.meal
    this.setData({ selectedMeal: meal })
  },

  // 获取分类名称
  getCategoryName,

  // 添加到购物车
  addToCart(e) {
    const dish = e.currentTarget.dataset.dish
    const cart = [...this.data.cart]
    const existIndex = cart.findIndex(item => item.id === dish.id)

    if (existIndex > -1) {
      cart[existIndex].quantity += 1
    } else {
      cart.push({ ...dish, quantity: 1, remark: '' })
    }

    this.setData({ cart })
    this.updateCartDisplay()

    wx.showToast({
      title: '已加入购物车',
      icon: 'success',
      duration: 1000
    })
  },

  // 更新购物车显示
  updateCartDisplay() {
    const cartCount = this.data.cart.reduce((sum, item) => sum + item.quantity, 0)
    this.setData({ cartCount })
  },

  // 去确认订单页
  goToConfirm() {
    if (this.data.cart.length === 0) {
      wx.showToast({
        title: '请先选择菜品',
        icon: 'none'
      })
      return
    }

    // 存储购物车数据到全局
    const app = getApp()
    app.globalData.tempCart = {
      date: this.data.selectedDate,
      meal: this.data.selectedMeal,
      items: this.data.cart
    }

    wx.navigateTo({
      url: '/pages/confirm/confirm'
    })
  },

  // 清空购物车
  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ cart: [], cartCount: 0 })
        }
      }
    })
  }
})
