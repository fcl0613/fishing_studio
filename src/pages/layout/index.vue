<template>
  <div class="layout-container">
    <!-- 顶部用户栏 -->
    <div class="user-bar">
      <div class="user-bar-content">
        <span v-if="!$store.getters.getToken" @click="$router.push('/login')">你好，请登录</span>
        <span v-if="!$store.getters.getToken" class="separator">|</span>
        <span v-if="!$store.getters.getToken" @click="$router.push('/login')">欢迎注册</span>
        <span v-if="$store.getters.getToken" @click="$router.push('/layout/user')">会员中心</span>
        <span v-if="$store.getters.getToken" class="separator">|</span>
        <span v-if="$store.getters.getToken" @click="$router.push('/layout/message')">我的消息</span>
      </div>
    </div>

    <!-- 头部LOGO和搜索区 -->
    <div class="header">
      <div class="header-content">
        <h1 class="logo" @click="$router.push({ path: '/layout/home' }, () => {})">钓鱼佬商城</h1>
        <div class="search-box">
          <el-input v-model="searchText" placeholder="搜索商品..." class="search-input"></el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <el-button icon="el-icon-shopping-cart" @click="$router.push('/layout/cart')" class="cart-btn">
          购物车
        </el-button>
      </div>
    </div>

    <!-- 分类菜单 -->
    <div class="category-menu">
      <div class="category-content">
        <span :class="{ active: activeCategory === 'homePage' }" @click="changeCategory('homePage', 0)">
          商城首页
        </span>
        <span :class="{ active: activeCategory === 'all' }" @click="changeCategory('all', 0)"> 全部商品 </span>
        <!-- <span
          v-for="item in categoryList"
          :key="item.id"
          :class="{ active: activeCategory === item.categoryName }"
          @click="changeCategory(item.categoryName, item.id)"
        >
          {{ item.categoryName }}
        </span> -->
        <!-- <span :class="{ active: activeCategory === 'platform' }" @click="changeCategory('platform')"> 台钓 </span> -->
        <!-- <span :class="{ active: activeCategory === 'brand' }" @click="changeCategory('brand', 0)"> 品牌 </span> -->
      </div>
    </div>

    <!-- 主内容区 -->
    <div style="background-color: #f5f5f5">
      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>

    <footer class="footer">
      <div class="footer-content">
        <p>
          Copyright © 2015-2023 xxxx.com All Rights Reserved. xxxxxx集团股份有限公司 177xxxx7897 xxxxx技术开发区xxx路116
          浙ICP备xxx号-1
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import frontAPI from '@/api/front'
import { EventBus } from '@/utils/event-bus'
export default {
  data() {
    return {
      searchText: '',
      activeCategory: '', // 当前激活的分类
      categoryList: [],
    }
  },
  watch: {
    $route(to, _from) {
      if (to.path === '/layout/home') {
        this.activeCategory = 'homePage'
      } else if (to.path === '/layout/search') {
        this.activeCategory = 'all'
      } else {
        this.activeCategory = ''
      }
    },
  },
  mounted() {
    // 监听搜索事件
    EventBus.$on('clearSearchText', () => {
      this.searchText = ''
    })
  },
  created() {
    // 初始化用户信息
    this.$store.dispatch('getUserInfo')
    this.initCategory()
    this.initActiveCategory()
  },
  methods: {
    initActiveCategory() {
      if (this.$route.path === '/layout/home') {
        this.activeCategory = 'homePage'
      } else if (this.$route.path === '/layout/search') {
        this.activeCategory = 'all'
      } else {
        this.activeCategory = ''
      }
    },
    handleSearch() {
      if (this.searchText) {
        if (this.$route.path === '/layout/search') {
          EventBus.$emit('search', this.searchText)
          return
        }
        this.$router.push({
          path: '/layout/search',
          query: { productName: this.searchText, timestamp: new Date().getTime() },
        })
        this.activeCategory = 'all'
      }
    },
    changeCategory(category, categoryId) {
      this.activeCategory = category
      this.searchText = ''
      if (category === 'homePage') {
        if (this.$route.path !== '/layout/home') {
          this.$router.push({ path: '/layout/home' })
          return
        } else {
          return
        }
      }
      if (category === 'all') {
        // TODO 路由跳转到商品搜索页面 参数 catq=all catId=0
        this.$router.push({
          path: '/layout/search',
          query: { catq: 'all', catId: 0 },
        })
      } else if (category === 'brand') {
        // TODO 路由跳转到商品搜索页面 参数 catq=brand catId=0
        this.$router.push({
          path: '/layout/search',
          query: { catq: 'brand', catId: 0 },
        })
      } else {
        // TODO 路由跳转到商品搜索页面 参数 catq=ot catId=父级分类id
        this.$router.push({
          path: '/layout/search',
          query: { catq: 'ot', catId: categoryId },
        })
      }
    },
    async initCategory() {
      const res = await frontAPI.category()
      this.categoryList = res.data
    },
  },
  beforeDestroy() {
    EventBus.$off('clearSearchText')
  },
}
</script>

<style scoped lang="less">
.layout-container {
  width: 100%;
  min-width: 1200px;
}

// 顶部用户栏样式
.user-bar {
  background-color: #f5f5f5;
  height: 36px;
  line-height: 36px;

  .user-bar-content {
    width: 1200px;
    margin: 0 auto; // 水平居中
    text-align: right; // 内容右对齐
    padding: 0 15px;

    .separator {
      margin: 0 10px;
      color: #ccc;
    }

    span {
      cursor: pointer;
      color: #666;
      &:hover {
        color: #1f6bbb;
      }
    }
  }
}

// 头部LOGO和搜索区
.header {
  border-bottom: 1px solid #eee;

  .header-content {
    width: 1200px;
    margin: 0 auto; // 水平居中
    padding: 20px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between; // 三部分均匀分布

    .logo {
      font-size: 28px;
      color: #1f6bbb;
      font-weight: bold;
      cursor: pointer;
    }

    .search-box {
      display: flex;
      width: 500px; // 搜索框宽度

      .search-input {
        flex: 1;
        border-right: none;
      }
    }

    .cart-btn {
      background-color: #f8f8f8;
      color: #1f6bbb;
      border-color: #1f6bbb;
      &:hover {
        background-color: #f0f0f0;
      }
    }
  }
}

// 分类菜单
.category-menu {
  background-color: #1f6bbb;

  .category-content {
    width: 1200px;
    margin: 0 auto; // 水平居中
    padding: 0 15px;

    span {
      display: inline-block;
      padding: 12px 20px;
      color: #fff;
      cursor: pointer;
      &.active {
        background-color: #185694;
      }
      &:hover {
        background-color: #185694;
      }
    }
  }
}

// 主内容区
.main-content {
  flex: 1;
  width: 1200px;
  margin: 0 auto; // 水平居中
  padding: 20px 15px;
  min-height: calc(100vh - 240px); // 自适应高度
  background-color: #fff;
}

/* 页脚样式 */
.footer {
  background-color: #f5f5f5;
  border-top: 1px solid #e5e5e5;
  padding: 4px 0;
  // margin-top: 50px;
}

.footer-content {
  width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.8;
}
</style>
