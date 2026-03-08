// utils/util.js - 工具函数

/**
 * 格式化日期
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 获取餐次名称
 */
const getMealTypeName = (type) => {
  const types = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    supper: '夜宵'
  }
  return types[type] || type
}

/**
 * 获取订单状态名称
 */
const getStatusName = (status) => {
  const statuses = {
    pending: '待处理',
    cooking: '制作中',
    completed: '已完成'
  }
  return statuses[status] || status
}

/**
 * 获取菜品分类名称
 */
const getCategoryName = (category) => {
  const categories = {
    meat: '荤菜',
    vegetable: '素菜',
    soup: '汤',
    staple: '主食'
  }
  return categories[category] || category
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

module.exports = {
  formatDate,
  getMealTypeName,
  getStatusName,
  getCategoryName,
  debounce
}
