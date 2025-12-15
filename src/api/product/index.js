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
  productCommentCreate(dto) {
    return request({
      url: '/product/comment/create',
      method: 'post',
      data: dto,
    })
  },
  productCommentQuery(dto) {
    return request({
      url: '/product/comment/query',
      method: 'post',
      data: dto,
    })
  },
  productCommentRemove(dto) {
    return request({
      url: '/product/comment/remove',
      method: 'post',
      data: dto,
    })
  },
}
