<template>
  <div class="post-list-container">
    <!-- 左侧主题列表 -->
    <div class="left-sidebar">
      <div class="sidebar-title">论坛主题</div>
      <div class="topic-list">
        <div v-for="topic in topicList" :key="topic.id" class="topic-item" :class="{ active: selectedTopicId === topic.id }" @click="selectTopic(topic.id)">
          <div class="topic-name">{{ topic.name }}</div>
          <div class="topic-post-count">{{ topic.postCount }}</div>
        </div>
      </div>
    </div>

    <!-- 右侧帖子内容 -->
    <div class="right-content">
      <!-- 头部：当前主题信息 -->
      <div class="content-header">
        <div class="header-left">
          <div class="topic-info">
            <div class="topic-name">{{ selectedTopicName }}</div>
            <div class="topic-post-count">共 {{ totalPosts }} 个帖子</div>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="goToPostEdit">发帖</el-button>
        </div>
      </div>

      <!-- 帖子列表 -->
      <div class="post-list">
        <div v-for="post in postList" :key="post.id" class="post-item">
          <div class="post-title" @click="viewPostDetail(post.id)">
            <span v-if="post.topStatus === 1" class="top-tag">精</span>
            {{ post.postTitle }}
          </div>
          <div class="post-meta">
            <span class="author">发布者：{{ post.loginName }}</span>
            <span class="create-time">{{ formatTime(post.createTime) }}</span>
            <span class="like-count"> <i class="el-icon-thumb"></i> {{ post.postLike }} </span>
            <span class="comment-count"> <i class="el-icon-chat-dot-round"></i> {{ post.commentCount }} </span>
          </div>
          <div class="">
            <div v-show="post.lastLoginName !== null && post.lastLoginName !== ''">
              <span class="last-reply">最后回复：{{ post.lastLoginName }}</span>
              <span class="last-time">{{ formatTime(post.lastTime) }}</span>
            </div>
            <div class="post-actions">
              <el-button size="small" type="text" @click="viewPostDetail(post.id)">查看</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPosts">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import postApi from '@/api/post/index'

export default {
  data() {
    return {
      // 主题相关
      topicList: [],
      selectedTopicId: null,
      selectedTopicName: '',
      postTitle: this.$route.query.postTitle || '',
      // 帖子相关
      postList: [],
      currentPage: 1,
      pageSize: 10,
      totalPosts: 0,
    }
  },
  created() {
    this.loadTopicList()
    const topicId = this.$route.query.topicId
    if (topicId) {
      // 如果有topicId参数，延迟选择主题，确保主题列表已经加载完成
      setTimeout(() => {
        this.selectTopic(parseInt(topicId))
      }, 100)
    }
  },
  mounted() {
    // 检查URL参数中是否有topicId
    const topicId = this.$route.query.topicId
    if (topicId) {
      // 如果有topicId参数，延迟选择主题，确保主题列表已经加载完成
      setTimeout(() => {
        this.selectTopic(parseInt(topicId))
      }, 100)
    }
  },
  methods: {
    // 加载主题列表
    loadTopicList() {
      postApi
        .postTopicAll()
        .then(res => {
          this.topicList = res.data || []
          if (this.topicList.length > 0) {
            // 默认选择第一个主题
            this.selectTopic(this.topicList[0].id)
          }
        })
        .catch(error => {
          console.error('获取主题列表失败:', error)
          this.$message.error('获取主题列表失败，请稍后重试')
        })
    },

    // 选择主题
    selectTopic(topicId) {
      this.selectedTopicId = topicId
      const selectedTopic = this.topicList.find(topic => topic.id === topicId)
      if (selectedTopic) {
        this.selectedTopicName = selectedTopic.name
      }
      // 重置分页并加载帖子
      this.currentPage = 1
      this.postTitle = ''
      this.loadPostList()
    },

    // 加载帖子列表
    loadPostList() {
      if (!this.selectedTopicId) return

      const params = {
        postCategory: this.selectedTopicId,
        postTitle: this.postTitle,
        page: this.currentPage,
        size: this.pageSize,
      }

      postApi
        .postSearch(params)
        .then(res => {
          this.postList = res.data?.list || []
          this.totalPosts = res.data?.total || 0
        })
        .catch(error => {
          console.error('获取帖子列表失败:', error)
          this.$message.error('获取帖子列表失败，请稍后重试')
        })
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return ''
      // 简单的时间格式化，可根据需求扩展
      return timeStr
    },

    // 查看帖子详情
    viewPostDetail(postId) {
      console.log('查看帖子详情，帖子ID:', postId)
      // 示例跳转代码（需要根据实际路由配置调整）
      // this.$router.push({ path: '/postDetail', query: { postId: postId } })
    },

    // 跳转到发帖页面
    goToPostEdit() {
      console.log('跳转到发帖页面')
      this.$router.push('/postLayout/post/edit')
    },

    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val
      this.loadPostList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadPostList()
    },
  },
}
</script>

<style scoped lang="less">
.post-list-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 左侧主题列表 */
.left-sidebar {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;

  .sidebar-title {
    padding: 16px;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #e6e6e6;
  }

  .topic-list {
    padding: 8px 0;
  }

  .topic-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }

    &.active {
      background-color: #e6f7ff;
      color: #1890ff;
    }
  }

  .topic-post-count {
    font-size: 12px;
    color: #999;
    background-color: #f0f0f0;
    padding: 2px 6px;
    border-radius: 10px;
  }
}

/* 右侧内容 */
.right-content {
  flex: 1;
  padding: 20px;

  /* 头部 */
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .topic-info {
      .topic-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .topic-post-count {
        font-size: 14px;
        color: #999;
      }
    }
  }

  /* 帖子列表 */
  .post-list {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .post-item {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;

      transition: background-color 0.3s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #fafafa;
      }

      .post-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
        cursor: pointer;
        .top-tag {
          display: inline-block;
          background-color: #ff4d4f;
          color: #fff;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 8px;
        }
      }

      .post-meta {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;

        span {
          margin-right: 16px;
        }

        .like-count,
        .comment-count {
          color: #999;

          i {
            margin-right: 4px;
          }
        }
      }

      .post-last-update {
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: space-between;
        align-items: center;

        span {
          margin-right: 16px;
        }

        .post-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  /* 分页 */
  .pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  }
}
</style>
