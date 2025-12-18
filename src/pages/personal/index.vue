<template>
  <div class="container">
    <div class="personal-box">
      <div class="menu-box">
        <el-menu :default-active="activeIndex" router>
          <el-menu-item v-for="item in menuList" :key="item.index" :index="item.index">
            <span slot="title">{{item.title}}</span>
          </el-menu-item>
          
        </el-menu>
      </div>
      <div class="content-box">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
        activeIndex: '',
        menuList:[
          {
            index: '/layout/personal/info',
            title: '个人中心'
          },
          {
            index: '/layout/personal/order/list',
            title: '我的订单'
          },
          {
            index: '/layout/personal/order/afterSales',
            title: '退款售后'
          },
          {
            index: '/layout/personal/order/waiting/comment',
            title: '待评价商品'
          },
          {
            index: '/layout/personal/post/list',
            title: '我的文章'
          },
          {
            index: '/layout/personal/updatepsd',
            title: '修改密码'
          },
          {
            index: '/layout/personal/address',
            title: '我的地址'
          },
        ]
    }
  },
  watch: {
    $route(to, from) {
      console.log(to.path)
      this.activeIndex = to.path
    }
  },
  created() {
      this.activeIndex = this.$route.path
  },
  methods: {},
}
</script>

<style scoped lang="less">
.container{
    .personal-box{
        display: flex;
        // justify-content: space-between;
        .menu-box{
           width: 240px;
        }
        .content-box {
            width: calc(100% - 240px);
        }
    }
}
</style>
