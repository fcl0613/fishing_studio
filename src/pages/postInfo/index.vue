<template>
  <div class="post-info-container">
    <el-card class="post-card">
      <div class="post-header">
        <h1 class="post-title">{{ postDetail.postTitle }}</h1>
        <div class="post-stats">
          <el-button :type="postDetail.hasLiked ? 'primary' : 'default'" size="small" @click="handleLike">
            <i class="el-icon-thumb" :class="{ active: postDetail.hasLiked }"></i>
            <span>{{ postDetail.likeCount }}</span>
          </el-button>
          <el-button type="default" size="small">
            <i class="el-icon-chat-dot-round"></i>
            <span>{{ postDetail.commentCount }}</span>
          </el-button>
        </div>
      </div>

      <div class="post-author">
        <el-avatar :src="postDetail.authorAvatar" size="medium"></el-avatar>
        <div class="author-info">
          <span class="author-name">{{ postDetail.author }}</span>
          &nbsp;&nbsp;
          <span class="publish-time">{{ postDetail.publishTime }}</span>
        </div>
      </div>

      <div class="post-content">
        <div class="content-text" v-html="postDetail.postContent"></div>
        <div class="content-images" v-if="postDetail.postPic && postDetail.postPic.length > 0">
          <el-image
            v-for="(image, index) in postDetail.postPic"
            :key="index"
            :src="image.trim()"
            class="content-image"
            fit="cover"
            :preview-src-list="[image.trim()]"></el-image>
        </div>
      </div>
    </el-card>

    <el-card class="comment-card">
      <div slot="header" class="comment-header">
        <span>评论列表</span>
      </div>
      <div class="comment-list">
        <div v-if="commentList.length === 0" class="no-comments">暂无评论</div>
        <div class="comment-item" v-for="comment in commentList" :key="comment.id" v-else>
          <el-avatar :src="comment.avatar" size="small"></el-avatar>
          <div class="comment-content">
            <div class="comment-header">
              <div>
                <span class="comment-author">{{ comment.loginName }}</span>
                &nbsp;&nbsp;
                <span class="comment-time">{{ comment.createTime }}</span>
              </div>
              <el-button v-if="comment.userId === 1" type="text" size="small" @click="handleDeleteComment(comment.id)"> 删除 </el-button>
            </div>
            <div class="comment-text">
              <div v-if="comment.replyId !== 0 && comment.replyComment" class="reply-info">
                回复 <span class="reply-author">{{ comment.replyComment.loginName }}</span
                >：
                <span class="reply-content">{{ comment.replyComment.content }}</span>
              </div>
              <div>{{ comment.content }}</div>
            </div>
            <div class="comment-actions">
              <el-button type="text" size="small" @click="handleReply(comment)"> 回复 </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-container" v-if="commentTotal > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="commentTotal"
          :current-page="currentPage"
          :page-size="pageSize"
          @current-change="handlePageChange"></el-pagination>
      </div>
    </el-card>

    <el-card class="reply-card">
      <div slot="header" class="reply-header">
        <span>{{ replyTo ? `回复 ${replyTo.loginName}` : '发表评论' }}</span>
        <el-button v-if="replyTo" type="text" size="small" @click="cancelReply"> 取消回复 </el-button>
      </div>
      <el-form :model="commentForm" label-position="top">
        <el-form-item label="">
          <el-input type="textarea" :rows="4" placeholder="请输入您的评论" v-model="commentForm.content"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmitComment">发表评论</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import postApi from '@/api/post/index'

export default {
  name: 'PostInfo',
  data() {
    return {
      postDetail: {
        postTitle: '',
        postContent: '',
        postPic: [],
        likeCount: 0,
        hasLiked: 0,
        author: '',
        authorAvatar: '',
        publishTime: '',
        commentCount: 0,
      },
      commentList: [],
      commentTotal: 0,
      currentPage: 1,
      pageSize: 10,
      commentForm: {
        content: '',
      },
      replyTo: null,
      postId: null,
    }
  },
  created() {
    // 获取路由参数中的帖子ID
    this.postId = parseInt(this.$route.query.postId)
    if (this.postId) {
      this.loadPostDetail()
      this.loadComments()
    }
  },
  methods: {
    // 加载帖子详情
    loadPostDetail() {
      postApi
        .postDetail({ id: this.postId })
        .then(res => {
          this.postDetail = res.data
        })
        .catch(err => {
          console.error('获取帖子详情失败:', err)
          this.$message.error('获取帖子详情失败')
        })
    },
    // 加载评论列表
    loadComments() {
      postApi
        .postCommentQuery({
          postId: this.postId,
          page: this.currentPage,
          size: this.pageSize,
        })
        .then(res => {
          this.commentList = res.data.list
          this.commentTotal = res.data.total
        })
        .catch(err => {
          console.error('获取评论列表失败:', err)
          this.$message.error('获取评论列表失败')
        })
    },
    // 处理点赞
    handleLike() {
      if (this.postDetail.hasLiked) {
        // 取消点赞
        postApi
          .postUnlike({ id: this.postId })
          .then(res => {
            this.postDetail.hasLiked = 0
            this.postDetail.likeCount--
            this.$message.success('取消点赞成功')
          })
          .catch(err => {
            console.error('取消点赞失败:', err)
            this.$message.error('取消点赞失败')
          })
      } else {
        // 点赞
        postApi
          .postLike({ id: this.postId })
          .then(res => {
            this.postDetail.hasLiked = 1
            this.postDetail.likeCount++
            this.$message.success('点赞成功')
          })
          .catch(err => {
            console.error('点赞失败:', err)
            this.$message.error('点赞失败')
          })
      }
    },
    // 处理评论分页
    handlePageChange(page) {
      this.currentPage = page
      this.loadComments()
    },
    // 处理回复
    handleReply(comment) {
      this.replyTo = {
        id: comment.id,
        loginName: comment.loginName,
      }
      this.$nextTick(() => {
        this.$refs.commentInput.focus()
      })
    },
    // 取消回复
    cancelReply() {
      this.replyTo = null
      this.commentForm.content = ''
    },
    // 发表评论
    handleSubmitComment() {
      if (!this.commentForm.content.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }

      const commentData = {
        postId: this.postId,
        content: this.commentForm.content,
        replyId: this.replyTo ? this.replyTo.id : 0,
      }

      postApi
        .postCommentCreate(commentData)
        .then(res => {
          this.$message.success('评论发表成功，待管理员审核')
          this.commentForm.content = ''
          this.replyTo = null
          this.loadComments()
        })
        .catch(err => {
          console.error('评论发表失败:', err)
          this.$message.error('评论发表失败')
        })
    },
    // 删除评论
    handleDeleteComment(commentId) {
      this.$confirm('确定要删除这条评论吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          postApi
            .postCommentRemove({ id: commentId })
            .then(res => {
              this.$message.success('评论删除成功')
              this.loadComments()
              // 更新评论数量
              this.postDetail.commentCount--
            })
            .catch(err => {
              console.error('评论删除失败:', err)
              this.$message.error('评论删除失败')
            })
        })
        .catch(() => {
          // 取消删除
        })
    },
  },
}
</script>

<style scoped>
.post-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.post-card {
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.post-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.post-stats {
  display: flex;
  gap: 10px;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.author-name {
  font-weight: bold;
  color: #333;
}

.publish-time {
  color: #999;
  font-size: 14px;
}

.post-content {
  line-height: 1.8;
  color: #333;
}

.content-images {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.content-image {
  width: 100%;
  /* max-height: 400px; */
  cursor: pointer;
}

.no-comments {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}

.comment-card {
  margin-bottom: 20px;
}

.comment-header {
  font-weight: bold;
}

.comment-list {
  margin-bottom: 20px;
}

.comment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: bold;
  color: #333;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-text {
  margin-bottom: 10px;
  line-height: 1.6;
}

.reply-info {
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  font-size: 14px;
}

.reply-author {
  color: #409eff;
  font-weight: bold;
}

.reply-content {
  color: #606266;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.reply-card {
  margin-bottom: 20px;
}

.reply-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 点赞按钮激活状态 */
.el-icon-thumb.active {
  color: #f56c6c;
}
</style>
