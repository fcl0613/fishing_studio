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
            index: '/layout/personal/updatepsd',
            title: '修改密码'
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
