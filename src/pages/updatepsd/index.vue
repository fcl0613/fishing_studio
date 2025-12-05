<template>
  <div class="updatepsd-container">
    <div class="updatepsd-header">
      <h2>修改密码</h2>
    </div>
    
    <div class="updatepsd-content">
      <el-form
        ref="updatePsdForm"
        :model="passwordForm"
        :rules="rules"
        class="updatepsd-form"
        label-width="140px"
      >
        <el-form-item label="原密码" prop="originPsd">
          <el-input
            v-model="passwordForm.originPsd"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPsd">
          <el-input
            v-model="passwordForm.newPsd"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="checkPsd">
          <el-input
            v-model="passwordForm.checkPsd"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确认修改</el-button>
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
      passwordForm: {
        originPsd: '',
        newPsd: '',
        checkPsd: ''
      },
      rules: {
        originPsd: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
        //   { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        newPsd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
          { validator: this.validateNewPassword, trigger: 'blur' }
        ],
        checkPsd: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      submitLoading: false
    }
  },
  methods: {
    // 验证新密码不能与原密码相同
    validateNewPassword(rule, value, callback) {
      if (value && this.passwordForm.originPsd === value) {
        callback(new Error('新密码不能与原密码相同'))
      } else {
        callback()
      }
    },
    
    // 验证确认密码与新密码一致
    validateConfirmPassword(rule, value, callback) {
      if (value && value !== this.passwordForm.newPsd) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    
    // 提交表单
    submitForm() {
      this.$refs.updatePsdForm.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            const res = await userApi.updatepsd(this.passwordForm)
            if (res.code === 0) {
              this.$message.success('密码修改成功')
              this.resetForm()
            } else {
              this.$message.error(res.msg || '密码修改失败')
            }
          } catch (error) {
            console.error('修改密码失败:', error)
            this.$message.error('密码修改失败，请重试')
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
      this.$refs.updatePsdForm.resetFields()
    }
  }
}
</script>

<style scoped lang="less">
.updatepsd-container {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  min-height: 100vh;
}

.updatepsd-header {
  margin-bottom: 30px;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }
}

.updatepsd-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.updatepsd-form {
  .el-form-item {
    margin-bottom: 25px;
  }
  
  .el-button {
    margin-right: 15px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .updatepsd-container {
    padding: 10px;
  }
  
  .updatepsd-content {
    padding: 20px;
  }
}
</style>