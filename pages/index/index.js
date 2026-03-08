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
    totalPrice: '0.00',
    showCartPopup: false,
    scrollTop: 0,
    intoView: ''
  },

  onLoad() {
    this.initDate()
    this.loadDishes()
  },

  onShow() {
    this.updateCartDisplay()
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
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
      let currentCategory = ''

      this.data.categories.forEach(cat => {
        const categoryDishes = dishes.filter(d => d.category === cat && d.status === 'available')
        dishesByCategory[cat] = categoryDishes
        categoryCounts[cat] = 0
        if (categoryDishes.length > 0 && !currentCategory) {
          currentCategory = cat
          hasDishes = true
        }
      })

      this.setData({
        dishesByCategory,
        categoryCounts,
        hasDishes,
        currentCategory: currentCategory || this.data.categories[0],
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

  // 点击分类 - 使用 scroll-into-view
  onCategoryTap(e) {
    const index = e.currentTarget.dataset.index
    const category = this.data.categories[index]
    this.setData({
      currentCategory: category,
      intoView: 'cat-' + index
    })
  },

  // 滚动监听 - 更新当前分类
  onScroll(e) {
    if (this.data.intoView) return
    
    const scrollTop = e.detail.scrollTop
    const categories = this.data.categories
    const dishesByCategory = this.data.dishesByCategory
    
    let currentCategory = categories[0]
    let accumulatedHeight = 0
    
    for (let i = 0; i < categories.length; i++) {
      const dishes = dishesByCategory[categories[i]] || []
      const sectionHeight = 50 + dishes.length * 230
      if (scrollTop >= accumulatedHeight - 50) {
        currentCategory = categories[i]
      }
      accumulatedHeight += sectionHeight
    }
    
    if (currentCategory !== this.data.currentCategory) {
      this.setData({ currentCategory })
    }
  },

  onScrollEnd() {
    this.setData({ intoView: '' })
  },

  // 添加到购物车
  addToCart(e) {
    const dish = e.currentTarget.dataset.dish
    if (!dish || !dish.id) return

    const cartMap = { ...this.data.cartMap }
    const cart = [...this.data.cart]
    
    if (cartMap[dish.id]) {
      cartMap[dish.id]++
      const item = cart.find(c => c.id === dish.id)
      if (item) item.quantity++
    } else {
      cartMap[dish.id] = 1
      cart.push({ 
        id: dish.id, 
        name: dish.name, 
        price: dish.price,
        image: dish.image,
        quantity: 1 
      })
    }

    this.setData({ cart, cartMap })
    this.updateCartDisplay()
  },

  // 从购物车移除
  removeFromCart(e) {
    const dish = e.currentTarget.dataset.dish
    if (!dish || !dish.id) return

    const cartMap = { ...this.data.cartMap }
    const cart = [...this.data.cart]

    if (cartMap[dish.id] && cartMap[dish.id] > 1) {
      cartMap[dish.id]--
      const item = cart.find(c => c.id === dish.id)
      if (item) item.quantity--
    } else if (cartMap[dish.id] === 1) {
      delete cartMap[dish.id]
      const index = cart.findIndex(item => item.id === dish.id)
      if (index > -1) cart.splice(index, 1)
    }

    this.setData({ cart, cartMap })
    this.updateCartDisplay()
  },

  // 更新购物车显示
  updateCartDisplay() {
    const { cart, cartMap, categories, dishesByCategory } = this.data
    
    // 计算总数量和总价
    let cartCount = 0
    let totalPrice = 0
    cart.forEach(item => {
      cartCount += item.quantity
      totalPrice += item.quantity * parseFloat(item.price || 0)
    })
    
    // 更新分类角标
    const categoryCounts = {}
    categories.forEach(cat => {
      const catDishes = dishesByCategory[cat] || []
      let count = 0
      cart.forEach(item => {
        if (catDishes.find(d => d.id === item.id)) {
          count += item.quantity
        }
      })
      categoryCounts[cat] = count
    })

    this.setData({ 
      cartCount, 
      totalPrice: totalPrice.toFixed(2),
      categoryCounts
    })
  },

  // 切换购物车弹窗
  toggleCartPopup() {
    if (this.data.cartCount === 0) return
    this.setData({ showCartPopup: !this.data.showCartPopup })
  },

  // 清空购物车
  clearCart() {
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

  // 去结算
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
