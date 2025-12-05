import request from '@/utils/request'

export default {
  create(dto) {
    return request({
      url: '/address/create',
      data: dto,
      method: 'post',
    })
  },
  update(dto) {
    return request({
      url: '/address/update',
      data: dto,
      method: 'post',
    })
  },
  query() {
    return request({
      url: '/address/query',
      method: 'get',
    })
  },
  remove(dto) {
    return request({
      url: '/address/remove',
      data: dto,
      method: 'post',
    })
  },
}
