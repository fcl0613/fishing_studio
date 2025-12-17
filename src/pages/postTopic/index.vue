<template>
  <div class="post-topic-container">
    <div class="topic-list">
      <div 
        v-for="topic in topicList" 
        :key="topic.id"
        class="topic-item"
        @click="goToPostList(topic.id)"
      >
        <div class="topic-icon">
          <img :src="topic.icon" :alt="topic.name" />
        </div>
        <div class="topic-info">
          <div class="topic-name">{{ topic.name }}</div>
          <div class="topic-desc">{{ topic.description }}</div>
          <div class="topic-post-count">
            <span class="count">{{ topic.postCount }}</span> 
            <span class="label">&nbsp;帖子</span>
          </div>
        </div>
        <div class="topic-arrow">
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import postApi from '@/api/post/index'

export default {
  data() {
    return {
      topicList: []
    }
  },
  created() {
    this.loadTopicList()
  },
  methods: {
    // 加载论坛主题列表
    loadTopicList() {
      postApi.postTopicAll().then(res => {
        this.topicList = res.data || []
      }).catch(error => {
        console.error('获取论坛主题列表失败:', error)
        this.$message.error('获取论坛主题列表失败，请稍后重试')
      })
    },
    // 跳转到帖子列表页面
    goToPostList(topicId) {
      // 这里只写出方法，具体实现等帖子列表页面完成后做修改
      console.log('跳转到帖子列表页面，主题ID:', topicId)
      // 示例跳转代码（需要根据实际路由配置调整）
      // this.$router.push({ path: '/postList', query: { topicId: topicId } })
    }
  },
}
</script>

<style scoped lang="less">
.post-topic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topic-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.topic-icon {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.topic-info {
  flex: 1;
  
  .topic-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
  }
  
  .topic-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  
  .topic-post-count {
    font-size: 12px;
    color: #999;
    
    .count {
      color: #409EFF;
      font-weight: bold;
    }
  }
}

.topic-arrow {
  color: #ccc;
  font-size: 16px;
}
</style>