import Vue from 'vue'
import Vuex from 'vuex'
import { setToken, getToken, removeToken, setYyUserInfo, getYyUserInfo } from '@/utils/token'
import personalApi from '@/api/personal'

Vue.use(Vuex)
// 用Vuex.Store对象用来记录token
const store = new Vuex.Store({
  state: {
    // 存储token
    token: '',
    userInfo: {},
  },

  getters: {
    getToken(state) {
      return state.token || getToken() || ''
    },
    getAvatar(state) {
      if (state.userInfo) {
        return state.userInfo.avatar
      } else {
        state.userInfo = getYyUserInfo()
      }
      return state.userInfo.avatar ? state.userInfo.avatar : ''
    },
  },

  mutations: {
    // 修改token，并将token存入localStorage
    setToken(state, token) {
      state.token = token
      setToken(token)
      console.log('store、localstorage保存token成功！')
    },
    delToken(state) {
      state.token = ''
      removeToken()
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
      setYyUserInfo(userInfo)
    },
    updateAvatarUrl(state, url) {
      const userInfoTemp = getYyUserInfo()
      userInfoTemp.avatar = url
      state.userInfo = userInfoTemp
      setYyUserInfo(userInfoTemp)
    },
    initUserInfo(state) {
      console.log(22)
      state.userInfo = getYyUserInfo()
    },
  },

  actions: {
    async login({ commit }, loginParam) {
      const res = await personalApi.login(loginParam)
      commit('setToken', res.data)
      return res.data
    },
    async getUserInfo({ commit }) {
      const res = await personalApi.info()
      commit('setUserInfo', res.data)
      return res.data
    },
    delToken({commit}) {
      commit('delToken')
    }
  },
})

export default store
