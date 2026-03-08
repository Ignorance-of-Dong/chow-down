// api/index.js - API 接口定义
const { get, post, put, del } = require('./request')

// ==================== 认证相关 ====================
const authApi = {
  // 微信登录
  login: (code) => post('/auth/wechat-login', { code }),

  // 检查登录状态
  check: () => get('/auth/me')
}

// ==================== 菜品相关 ====================
const dishApi = {
  // 获取菜品列表
  getList: (params) => get('/dishes', params),

  // 获取菜品详情
  getDetail: (id) => get(`/dishes/${id}`)
}

// ==================== 订单相关 ====================
const orderApi = {
  // 创建订单
  create: (data) => post('/orders', data),

  // 获取订单列表
  getList: (params) => get('/orders', params),

  // 获取我的订单
  getMyOrders: () => get('/orders/my'),

  // 获取订单详情
  getDetail: (id) => get(`/orders/${id}`),

  // 更新订单状态（管理员）
  updateStatus: (id, status) => put(`/orders/${id}/status`, { status })
}

// ==================== 用户相关 ====================
const userApi = {
  // 获取所有成员（管理员）
  getMembers: () => get('/users'),

  // 获取单个成员
  getMember: (id) => get(`/users/${id}`),

  // 更新成员（管理员）
  updateMember: (id, data) => put(`/users/${id}`, data),

  // 更新自己的资料
  updateProfile: (data) => put('/users/profile', data)
}

// ==================== 统计相关 ====================
const statsApi = {
  // 获取菜品点单统计
  getDishStats: (params) => get('/stats/dishes', params)
}

module.exports = {
  authApi,
  dishApi,
  orderApi,
  userApi,
  statsApi
}
