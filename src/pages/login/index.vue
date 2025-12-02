<template>
  <div class="login-container">
    <!-- 背景图容器 -->
    <div class="bg-container">
      <!-- 背景图使用渔具相关主题图 -->
      <div class="bg-overlay"></div>
    </div>

    <!-- 登录注册表单卡片 -->
    <div class="login-card">
      <div class="title-container">
        <h2 class="main-title">钓鱼佬</h2>
        <p class="sub-title">开启您的钓鱼之旅</p>
      </div>

      <!-- 切换标签 -->
      <div class="tab-container">
        <div class="tab-item" :class="{ active: isLogin }" @click="handleTabChange(true)">登录</div>
        <div class="tab-item" :class="{ active: !isLogin }" @click="handleTabChange(false)">注册</div>
      </div>

      <!-- 登录表单 -->
      <el-form v-show="isLogin" ref="loginForm" :model="loginForm" :rules="loginRules" class="form-container">
        <el-form-item prop="loginName">
          <el-input v-model="loginForm.loginName" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item class="btn-group">
          <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loginLoading"> 登录 </el-button>
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-show="!isLogin" ref="registerForm" :model="registerForm" :rules="registerRules" class="form-container">
        <el-form-item prop="loginName">
          <el-input v-model="registerForm.loginName" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="请输入密码"
            type="password"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>
        <el-form-item prop="rePassword">
          <el-input
            v-model="registerForm.rePassword"
            placeholder="请确认密码"
            type="password"
            prefix-icon="el-icon-check"
          ></el-input>
        </el-form-item>
        <el-form-item class="btn-group">
          <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="registerLoading"> 注册 </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import personalApi from "@/api/personal"
export default {
  data() {
    // 确认密码校验
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      isLogin: true, // 切换登录/注册表单
      loginForm: {
        loginName: 'fish',
        password: '123456',
      },
      registerForm: {
        loginName: '',
        password: '',
        rePassword: '',
      },
      loginRules: {
        loginName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
        ],
      },
      registerRules: {
        loginName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
        ],
        rePassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' },
        ],
      },
      registerLoading: false,
      loginLoading: false
    }
  },
  methods: {
    // 处理登录
    async handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          try {
            this.loginLoading = true
            // 调用登录接口的示例
            const res = await this.$store.dispatch('login', this.loginForm)
            this.$message.success('登录成功')
            this.$router.push('/layout')
          } catch (error) {
            // this.$message.error('登录失败，请检查用户名或密码')
            this.loginLoading = false
          }
        }
      })
    },

    // 处理注册
    async handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          try {
            this.registerLoading = true
            // 调用注册接口的示例
            const res = await personalApi.register(this.registerForm)
            this.$message.success('注册成功，请登录')
            this.registerLoading = false
            this.isLogin = true // 注册成功后切换到登录表单
          } catch (error) {
            this.$message.error('注册失败，请稍后重试')
            this.registerLoading = false
          }
        }
      })
    },

    handleTabChange(val) {
      if (val) {
        this.$refs.registerForm?.clearValidate()
      } else {
        this.$refs.loginForm?.clearValidate()
      }
      this.isLogin = val
    },
  },
}
</script>

<style scoped lang="less">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .bg-container {
    width: 100%;
    height: 100%;
    background: url('@/assets/img/mbg.png') no-repeat center center;
    background-size: cover;
    transition: all 0.5s;

    .bg-overlay {
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
    }
  }

  .login-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    padding: 30px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .title-container {
      text-align: center;
      margin-bottom: 30px;

      .main-title {
        color: #1f6bbb; /* 渔具主题蓝色 */
        font-size: 28px;
        margin-bottom: 10px;
        font-weight: bold;
      }

      .sub-title {
        color: #666;
        font-size: 14px;
      }
    }

    .tab-container {
      display: flex;
      margin-bottom: 25px;

      .tab-item {
        flex: 1;
        text-align: center;
        padding: 10px 0;
        cursor: pointer;
        font-size: 16px;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.3s;

        &.active {
          color: #1f6bbb;
          border-bottom-color: #1f6bbb;
          font-weight: 500;
        }
      }
    }

    .form-container {
      width: 100%;

      .el-form-item {
        margin-bottom: 20px;
      }

      .btn-group {
        margin-top: 30px;

        .submit-btn {
          width: 100%;
          background-color: #1f6bbb;
          border-color: #1f6bbb;
          padding: 12px 0;
          font-size: 16px;

          &:hover {
            background-color: #185694;
            border-color: #185694;
          }
        }
      }
    }
  }
}

/* 适配移动端 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 20px;
  }
}
</style>
