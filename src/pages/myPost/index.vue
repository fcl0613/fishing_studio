<template>
  <div class="my-post-container">
    <div class="header">
      <h2 class="page-title">我的文章</h2>
      <el-button type="primary" @click="goPublish">去发布</el-button>
    </div>

    <el-empty description="暂无文章，快去发布吧" v-if="postList.length === 0">
        <el-button type="primary" @click="goPublish">去发布</el-button>
    </el-empty>

    <div v-else>
      <!-- 文章列表 -->
      <el-table :data="postList" stripe style="width: 100%">
        <el-table-column prop="postTitle" label="文章标题" min-width="400">
          <template slot-scope="scope">
            <span class="post-title">{{ scope.row.postTitle }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="postLike" label="点赞数量" width="120">
          <template slot-scope="scope">
            <el-icon class="like-icon el-icon-star-on"></el-icon>
            {{ scope.row.postLike }}
          </template>
        </el-table-column>

        <el-table-column prop="postStatus" label="文章状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.postStatus)" size="small">
              {{ getStatusText(scope.row.postStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row.id)"> 编辑 </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import postApi from '@/api/post'

export default {
  name: 'MyPost',
  data() {
    return {
      postList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
    }
  },
  created() {
    this.loadPostList()
  },
  methods: {
    // 加载文章列表
    loadPostList() {
      const params = {
        page: this.currentPage,
        size: this.pageSize,
      }

      postApi
        .postQuery(params)
        .then(res => {
          if (res && res.data && res.data.list) {
            this.postList = res.data.list
            this.total = res.data.total
          }
        })
        .catch(error => {
          console.error('获取文章列表失败:', error)
          this.$message.error('获取文章列表失败，请稍后重试')
        })
    },

    // 处理分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.loadPostList()
    },

    // 处理当前页码变化
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage
      this.loadPostList()
    },

    // 获取文章状态文本
    getStatusText(status) {
      switch (status) {
        case 0:
          return '审核中'
        case 1:
          return '上架'
        case 2:
          return '下架'
        default:
          return '未知状态'
      }
    },

    // 获取文章状态标签类型
    getStatusTagType(status) {
      switch (status) {
        case 0:
          return 'warning'
        case 1:
          return 'success'
        case 2:
          return 'info'
        default:
          return 'default'
      }
    },

    // 处理编辑文章
    handleEdit(postId) {
      // 跳转到文章编辑页面，传递文章ID
      this.$router.push({
        path: '/postLayout/post/edit',
        query: { postId: postId },
      })
    },

    // 处理删除文章
    handleDelete(postId) {
      this.$confirm('确定要删除这篇文章吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 调用删除API
          postApi
            .postRemove({ id: postId })
            .then(res => {
              this.$message.success('文章删除成功')
              // 重新加载文章列表
              this.loadPostList()
            })
            .catch(error => {
              console.error('删除文章失败:', error)
              this.$message.error('删除文章失败，请稍后重试')
            })
        })
        .catch(() => {})
    },
    // 去发布文章
    goPublish() {
      this.$router.push({
        path: '/postLayout/post/edit',
      })
    },
  },
}
</script>

<style scoped>
.my-post-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.post-title {
  font-size: 16px;
  color: #2c3e50;
}

.like-icon {
  color: #f1c40f;
  margin-right: 4px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
