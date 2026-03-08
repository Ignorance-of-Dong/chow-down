// pages/index/index.js
const { dishApi } = require('../../api/index')

Page({
  data: {
    loading: true,
    selectedDate: '',
    selectedMeal: 'lunch',
    meals: [
      { value: 'breakfast', label: '早餐', time: '07:00-09:00' },
      { value: 'lunch', label: '午餐', time: '11:00-13:00' },
      { value: 'dinner', label: '晚餐', time: '17:00-19:00' },
      { value: 'supper', label: '夜宵', time: '21:00-23:00' }
    ],
    categories: ['热菜', '素菜', '汤类', '主食'],
    currentCategory: '热菜',
    dishesByCategory: {},
    categoryCounts: {},
    hasDishes: false,
    cart: [],
    cartMap: {},
    cartCount: 0,
    totalPrice: 0,
    showCartPopup: false,
    scrollToView: '',
    scrollTop: 0
  },

  onLoad() {
    this.initDate()
    this.loadDishes()
  },

  onShow() {
    this.updateCartDisplay()
  },

  initDate() {
    const today = new Date()
    const dateStr = this.formatDate(today)
    this.setData({ selectedDate: dateStr })
  },

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  async loadDishes() {
    try {
      this.setData({ loading: true })
      const res = await dishApi.getList({ date: this.data.selectedDate })
      const dishes = res.data || []

      const dishesByCategory = {}
      const categoryCounts = {}
      let hasDishes = false

      this.data.categories.forEach(cat => {
        const categoryDishes = dishes.filter(d => d.category === cat && d.status === 'available')
        dishesByCategory[cat] = categoryDishes
        categoryCounts[cat] = 0
        if (categoryDishes.length > 0) hasDishes = true
      })

      this.setData({
        dishesByCategory,
        categoryCounts,
        hasDishes,
        loading: false
      })
    } catch (err) {
      console.error('加载菜品失败', err)
      this.setData({ loading: false, hasDishes: false })
    }
  },

  onMealSelect(e) {
    const meal = e.currentTarget.dataset.meal
    this.setData({ selectedMeal: meal })
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    // 计算分类对应的scrollTop值
    let scrollTop = 0
    const categories = this.data.categories
    for (let i = 0; i < categories.length; i++) {
      if (categories[i] === category) break
      // 每个分类区块的高度估算：标题40 + 菜品数量 * 230
      const dishes = this.data.dishesByCategory[categories[i]] || []
      scrollTop += 40 + dishes.length * 230
    }
    
    this.setData({
      currentCategory: category,
      scrollTop: scrollTop
    })
  },

  onScroll(e) {
    // 根据滚动位置更新当前分类
    const scrollTop = e.detail.scrollTop
    const categories = this.data.categories
    let currentCategory = categories[0]
    let height = 0
    
    for (let i = 0; i < categories.length; i++) {
      const dishes = this.data.dishesByCategory[categories[i]] || []
      const sectionHeight = 40 + dishes.length * 230
      if (scrollTop >= height) {
        currentCategory = categories[i]
      }
      height += sectionHeight
    }
    
    if (currentCategory !== this.data.currentCategory) {
      this.setData({ currentCategory })
    }
  },

  addToCart(e) {
    const dish = e.currentTarget.dataset.dish
    const cart = [...this.data.cart]
    const cartMap = { ...this.data.cartMap }
    
    if (cartMap[dish.id]) {
      cartMap[dish.id]++
      const item = cart.find(c => c.id === dish.id)
      if (item) item.quantity = cartMap[dish.id]
    } else {
      cartMap[dish.id] = 1
      cart.push({ ...dish, quantity: 1 })
    }

    this.setData({ cart, cartMap })
    this.updateCartDisplay()
  },

  removeFromCart(e) {
    const dish = e.currentTarget.dataset.dish
    const cart = [...this.data.cart]
    const cartMap = { ...this.data.cartMap }

    if (cartMap[dish.id] > 1) {
      cartMap[dish.id]--
      const item = cart.find(c => c.id === dish.id)
      if (item) item.quantity = cartMap[dish.id]
    } else {
      delete cartMap[dish.id]
      const index = cart.findIndex(item => item.id === dish.id)
      if (index > -1) cart.splice(index, 1)
    }

    this.setData({ cart, cartMap })
    this.updateCartDisplay()
  },

  updateCartDisplay() {
    const cartCount = this.data.cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = this.data.cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.price || 0), 0)
    
    // 更新分类角标
    const categoryCounts = { ...this.data.categoryCounts }
    this.data.categories.forEach(cat => {
      categoryCounts[cat] = this.data.cart
        .filter(item => {
          const dish = this.data.dishesByCategory[cat]?.find(d => d.id === item.id)
          return dish
        })
        .reduce((sum, item) => sum + item.quantity, 0)
    })

    this.setData({ 
      cartCount, 
      totalPrice: totalPrice.toFixed(2),
      categoryCounts
    })
  },

  toggleCartPopup() {
    if (this.data.cartCount === 0) return
    this.setData({ showCartPopup: !this.data.showCartPopup })
  },

  clearCart() {
    // 清空分类角标
    const categoryCounts = {}
    this.data.categories.forEach(cat => {
      categoryCounts[cat] = 0
    })
    
    this.setData({ 
      cart: [], 
      cartMap: {}, 
      cartCount: 0, 
      totalPrice: '0.00',
      categoryCounts,
      showCartPopup: false
    })
  },

  goToConfirm() {
    if (this.data.cart.length === 0) {
      wx.showToast({ title: '请先选择菜品', icon: 'none' })
      return
    }

    const app = getApp()
    app.globalData.tempCart = {
      date: this.data.selectedDate,
      meal: this.data.selectedMeal,
      items: this.data.cart
    }

    wx.navigateTo({ url: '/pages/confirm/confirm' })
  }
})
