import request from '@/utils/request'

export default {
  create(dto) {
    return request({
      url: '/product/comment/create',
      method: 'post',
      data: dto,
    })
  },
  query(dto) {
    return request({
      url: '/product/comment/query',
      method: 'post',
      data: dto,
    })
  },
  remove(dto) {
    return request({
      url: '/product/comment/remove',
      method: 'post',
      data: dto,
    })
  },
}
