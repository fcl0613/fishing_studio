import request from '@/utils/request'

export default {
  create(dto) {
    return request({
      url: '/cart/create',
      method: 'post',
      data: dto,
    })
  },
  query() {
    return request({
      url: '/cart/query',
      method: 'post',
    })
  },
  remove(dto) {
    return request({
      url: '/cart/remove',
      method: 'post',
      data: dto,
    })
  },
  update(dto) {
    return request({
      url: '/cart/update',
      method: 'post',
      data: dto,
    })
  },
}
