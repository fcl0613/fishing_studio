import request from '@/utils/request'

export default {
  checkCart(dto) {
    return request({
      url: '/order/check/cart',
      method: 'post',
      data: dto,
    })
  },
  checkDirect(dto) {
    return request({
      url: '/order/check/direct',
      method: 'post',
      data: dto,
    })
  },
  create(dto) {
    return request({
      url: '/order/create',
      method: 'post',
      data: dto,
    })
  },
  query(dto) {
    return request({
      url: '/order/query',
      method: 'post',
      data: dto,
    })
  },
  pay(id) {
    return request({
      url: '/order/pay/' + id,
      method: 'post',
    })
  },
  cancel(dto) {
    return request({
      url: '/order/cancel',
      method: 'post',
      data: dto,
    })
  },
  confirmReceive(dto) {
    return request({
      url: '/order/confirm/receive',
      method: 'post',
      data: dto,
    })
  },
  listenPay(id) {
    return request({
      url: '/order/listen/pay/' + id,
      method: 'post',
    })
  },
  orderInfo(dto) {
    return request({
      url: '/order/info',
      method: 'post',
      data: dto
    })
  }
}
