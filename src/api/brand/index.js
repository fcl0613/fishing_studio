import request from '@/utils/request'

export default {
  all() {
    return request({
      url: '/brand/all',
      method: 'get',
    })
  },
}
