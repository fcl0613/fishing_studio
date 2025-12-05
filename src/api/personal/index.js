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
  },
  update(dto) {
    return request({
      url: '/user/update',
      data: dto,
      method: 'post',
    })
  },
  updatepsd(dto) {
    return request({
      url: '/user/updatepsd',
      data: dto,
      method: 'post',
    })
  },
  updateAvatar(formData) {
    return request({
      url: '/user/updateAvatar',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
