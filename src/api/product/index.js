import request from '@/utils/request'

export default {
  queryProduct(dto) {
    return request({
      url: '/product/query',
      method: 'post',
      data: dto,
    })
  },
  infoProduct(dto) {
    return request({
      url: '/product/info',
      method: 'post',
      data: dto,
    })
  },
}
