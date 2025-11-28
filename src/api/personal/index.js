import request from '@/utils/request'

export default {
  login(dto) {
    return request({
      url: '/user/login',
      data: dto,
      method: 'post',
    })
  },
  register(dto) {
    return request({
      url: '/user/register',
      data: dto,
      method: 'post',
    })
  },
  info() {
    return request({
      url: '/user/info',
      method: 'get',
    })
  }
}