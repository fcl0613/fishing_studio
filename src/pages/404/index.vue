<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <p class="error-description">可能是页面已被删除、移动或URL输入错误</p>
      <button class="back-button" @click="goBack">返回首页</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  created() {
    // 可以在这里添加页面访问统计等逻辑
    console.log('访问了不存在的页面:', this.$route.path)
  },
  methods: {
    goBack() {
      this.$router.push('/layout/home')
    }
  },
}
</script>

<style scoped lang="less">
.not-found-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: #409eff;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 10px;
  font-weight: 500;
}

.error-description {
  font-size: 1rem;
  color: #606266;
  margin: 0 0 30px;
}

.back-button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  &:hover {
    background-color: #66b1ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
  &:active {
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  .error-message {
    font-size: 1.2rem;
  }
  .not-found-content {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }
  .error-message {
    font-size: 1rem;
  }
  .error-description {
    font-size: 0.9rem;
  }
  .back-button {
    padding: 10px 25px;
    font-size: 0.9rem;
  }
}
</style>