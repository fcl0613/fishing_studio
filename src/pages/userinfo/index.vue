<template>
  <div class="userinfo-container">
    <div class="userinfo-header">
      <h2>个人信息</h2>
    </div>
    
    <div class="userinfo-content">
      <!-- 头像上传区域 -->
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadAvatar"
        >
          <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <div class="avatar-tip">点击上传头像</div>
      </div>
      
      <!-- 用户信息表单 -->
      <el-form
        ref="userInfoForm"
        :model="userInfo"
        :rules="rules"
        class="userinfo-form"
        label-width="120px"
      >
        <el-form-item label="登录名" prop="loginName">
          <el-input v-model="userInfo.loginName" disabled />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userInfo.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userInfo.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存修改</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import userApi from '@/api/personal'

export default {
  data() {
    return {
      userInfo: {
        loginName: '',
        nickname: '',
        email: '',
        phone: '',
        avatar: ''
      },
      rules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        ]
      },
      submitLoading: false,
      avatarLoading: false
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    // 获取用户信息
    async getUserInfo() {
      try {
        const res = await userApi.info()
        if (res.code === 0) {
          this.userInfo = res.data
        } else {
          this.$message.error(res.msg || '获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败，请重试')
      }
    },
    
    // 头像上传前验证
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    
    // 自定义头像上传请求
    async uploadAvatar(options) {
      this.avatarLoading = true
      try {
        const formData = new FormData()
        formData.append('avatar', options.file)
        
        const res = await userApi.updateAvatar(formData)
        if (res.code === 0) {
          options.onSuccess(res)
        } else {
          this.$message.error(res.msg || '头像上传失败')
          options.onError(res)
        }
      } catch (error) {
        console.error('头像上传失败:', error)
        this.$message.error('头像上传失败，请重试')
        options.onError(error)
      } finally {
        this.avatarLoading = false
      }
    },
    
    // 头像上传成功处理
    handleAvatarSuccess(res) {
      if (res.code === 0) {
        this.userInfo.avatar = res.data
        this.$message.success('头像上传成功')
      }
    },
    
    // 提交表单
    submitForm() {
      this.$refs.userInfoForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const res = await userApi.update({
              nickname: this.userInfo.nickname,
              email: this.userInfo.email,
              phone: this.userInfo.phone
            })
            if (res.code === 0) {
              this.$message.success('信息修改成功')
            } else {
              this.$message.error(res.msg || '信息修改失败')
            }
          } catch (error) {
            console.error('修改用户信息失败:', error)
            this.$message.error('信息修改失败，请重试')
          } finally {
            this.submitLoading = false
          }
        } else {
          return false
        }
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.userInfoForm.resetFields()
      this.getUserInfo() // 重新获取用户信息，恢复原始数据
    }
  }
}
</script>

<style scoped lang="less">
.userinfo-container {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
//   padding: 20px;
//   background-color: #f5f5f5;
  // min-height: 100vh;
}

.userinfo-header {
  margin-bottom: 30px;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }
}

.userinfo-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #409EFF;
    }
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    line-height: 120px;
    text-align: center;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    border-radius: 6px;
    object-fit: cover;
  }
}

.avatar-tip {
  margin-top: 10px;
  font-size: 14px;
  color: #909399;
}

.userinfo-form {
  .el-form-item {
    margin-bottom: 25px;
  }
  
  .el-button {
    margin-right: 15px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .userinfo-container {
    padding: 10px;
  }
  
  .userinfo-content {
    padding: 20px;
  }
  
  .avatar-uploader {
    .avatar,
    .avatar-uploader-icon {
      width: 100px;
      height: 100px;
      line-height: 100px;
    }
  }
}
</style>