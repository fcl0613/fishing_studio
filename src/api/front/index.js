import request from '@/utils/request'

export default {
  banner() {
    return request({
      url: '/front/banner',
      method: 'get',
    })
  },
  newProduct() {
    return request({
      url: '/front/new/product',
      method: 'get',
    })
  },
  recommendProduct() {
    return request({
      url: '/front/recommend/product',
      method: 'get',
    })
  },
  category() {
    return request({
      url: '/front/category',
      method: 'get',
    })
  },
  hotProduct() {
    return request({
      url: '/front/recommend/hot',
      method: 'get',
    })
  },
}
