import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/layout',
    },
    {
      path: '/login',
      component: () => import('@/pages/login/index.vue'),
    },
    {
      path: '/layout',
      component: () => import('@/pages/layout/index.vue'),
      redirect: '/layout/home',
      children: [
        {
          path: 'home',
          component: () => import('@/pages/home/index.vue'),
        },
        {
          path: 'search',
          component: () => import('@/pages/search/index.vue'),
        },
        {
          path: 'product/:id',
          component: () => import('@/pages/product/index.vue'),
        },
        {
          path: 'cart',
          component: () => import('@/pages/cart/index.vue'),
        },
        {
          path: 'personal',
          component: () => import('@/pages/personal/index.vue'),
          redirect: '/layout/personal/info',
          children: [
            {
              path: 'info',
              component: () => import('@/pages/userinfo/index.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/404',
      component: () => import('@/pages/404/index.vue'),
    },
    {
      path: '*',
      redirect: '/404'
    }
  ],
})

const whiteList = ['/login'] // 不重定向白名单

router.beforeEach(async (to, from, next) => {
  const tk = store.getters.getToken
  const isLogin = !!tk && tk !== ''

  if (isLogin) {
    console.log(to.path)
    if (to.path === '/login') {
      next({ path: '/layout' })
    } else {
      // 初始化用户信息（如果尚未初始化）
      if (!Object.keys(store.state.userInfo).length) {
        try {
          await store.dispatch('getUserInfo')
        } catch (error) {
          //  token无效时清除并跳转登录
          await store.dispatch('delToken')
          next('/login')
          return
        }
        next()
      } else {
        next()
      }
    }
  } else {
    // 精确匹配白名单
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router