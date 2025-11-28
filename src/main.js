import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element-ui.js'
import store from './store'
import '@/assets/style/global.css'
import * as echarts from 'echarts'
Vue.config.productionTip = false
Vue.prototype.$echarts = echarts
new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount('#app')
