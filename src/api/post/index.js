import request from '@/utils/request'

export default {
  postTopicAll() {
    return request({
      url: '/post/topic/all',
      method: 'get',
    })
  },
  postCreate(data) {
    return request({
      url: '/post/create',
      method: 'post',
      data,
    })
  },
  postQuery(data) {
    return request({
      url: '/post/query',
      method: 'post',
      data,
    })
  },
  postSearch(data) {
    return request({
      url: '/post/search',
      method: 'post',
      data,
    })
  },
  postInfo(data) {
    return request({
      url: '/post/info',
      method: 'post',
      data,
    })
  },
  postDelete(data) {
    return request({
      url: '/post/delete',
      method: 'post',
      data,
    })
  },
  postRemove(data) {
    return request({
      url: '/post/remove',
      method: 'post',
      data,
    })
  },
  postUpdate(data) {
    return request({
      url: '/post/update',
      method: 'post',
      data,
    })
  },
  postLike(data) {
    return request({
      url: '/post/like',
      method: 'post',
      data,
    })
  },
  postUnlike(data) {
    return request({
      url: '/post/unlike',
      method: 'post',
      data,
    })
  },
  postCommentCreate(data) {
    return request({
      url: '/post/comment/create',
      method: 'post',
      data,
    })
  },
  postCommentQuery(data) {
    return request({
      url: '/post/comment/query',
      method: 'post',
      data,
    })
  },
  postCommentRemove(data) {
    return request({
      url: '/post/comment/remove',
      method: 'post',
      data,
    })
  },
}
