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
  },
  waitingComment(dto) {
    return request({
      url: '/order/waiting/comment',
      method: 'post',
      data: dto
    })
  },
  refund(dto) {
    return request({
      url: '/order/refund',
      method: 'post',
      data: dto
    })
  },
  afterSalesApply(dto) {
    return request({
      url: '/issue/order/apply',
      method: 'post',
      data: dto
    })
  },
  afterSalesQuery(dto) {
    return request({
      url: '/issue/order/query',
      method: 'post',
      data: dto
    })
  },
  afterSalesCancel(dto) {
    return request({
      url: '/issue/order/cancel',
      method: 'post',
      data: dto
    })
  },
  afterSalesRemove(dto) {
    return request({
      url: '/issue/order/remove',
      method: 'post',
      data: dto
    })
  },
  afterSalesInfo(dto) {
    return request({
      url: '/issue/order/info',
      method: 'post',
      data: dto
    })
  }
}
