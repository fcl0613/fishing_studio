import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'

const BASE_URL = '/api'

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config) => {
    // if (store.getters.getToken) {
    //   config.headers['Authorization'] = getToken()
    // }
    config.headers['Authorization'] = store.getters.getToken
    return config
  },
  (error) => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 0) {
      Message({
        message: res.message,
        type: 'error',
        duration: 3 * 1000,
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 40100) {
        // to re-login
        // MessageBox.confirm(
        //   'You have been logged out, you can cancel to stay on this page, or log in again',
        //   'Confirm logout',
        //   {
        //     confirmButtonText: 'Re-Login',
        //     cancelButtonText: 'Cancel',
        //     type: 'warning',
        //   }
        // ).then(() => {
        //   store.dispatch('delToken')
        //   window.location.reload()
        // })
        store.dispatch('delToken')
        window.location.reload()
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  (error) => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  }
)

export default service
