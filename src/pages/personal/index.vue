<template>
  <div class="container">
    <div class="personal-box">
      <div class="menu-box">
        <el-menu default-active="2" >
          <el-menu-item index="2">
            <span slot="title">个人中心</span>
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
        menuList:[

        ]
    }
  },
  created() {},
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
