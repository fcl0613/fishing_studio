import request from '@/utils/request'

export default {
  all() {
    return request({
      url: '/category/all',
      method: 'get',
    })
  },
}
