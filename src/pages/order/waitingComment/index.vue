<template>
  <div class="waiting-comment-container" v-loading="loading" :fullscreen="false" text="正在加载待评价商品...">
    <el-card>
      <div slot="header" class="card-header">
        <h2>待评价商品</h2>
      </div>

      <!-- 加载状态 -->
      <!-- <el-loading v-loading="loading" :fullscreen="false" text="正在加载待评价商品..."></el-loading> -->

      <!-- 商品列表 -->
      <div v-if="!loading && commentList.length > 0" class="products-list">
        <div v-for="item in commentList" :key="item.id" class="product-card">
          <div class="product-image">
            <img :src="item.productCorver" :alt="item.productName" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-sku">{{ item.skuName }}</div>
            <div class="product-price-quantity">
              <span class="price">¥{{ formatPrice(item.skuPrice) }}</span>
              <span class="quantity">x{{ item.productQuantity }}</span>
            </div>
            <div class="order-info">
              <span>订单号：{{ item.orderNo }}</span>
            </div>
            <div class="product-actions">
              <el-button type="primary" @click="openCommentDialog(item)">评价</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && commentList.length === 0" class="empty-state">
        <el-empty description="暂无待评价商品"></el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :current-page="page"
          :page-size="size"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          >
        </el-pagination>
      </div>
    </el-card>

    <!-- 评论对话框 -->
    <el-dialog title="商品评价" :visible.sync="commentDialogVisible" width="500px" :close-on-click-modal="false">
      <div v-if="currentProduct" class="comment-dialog-content">
        <div class="product-preview">
          <img :src="currentProduct.productCorver" :alt="currentProduct.productName" />
          <div class="product-preview-info">
            <div class="product-name">{{ currentProduct.productName }}</div>
            <div class="product-sku">{{ currentProduct.skuName }}</div>
          </div>
        </div>

          <!-- 商品评分 -->
          <div class="comment-form-item">
            <div class="form-label">商品评分</div>
            <el-rate
              v-model="commentRating"
              :max="5"
              show-score
              text-color="#ff9900"
              score-template="{value}分"
            ></el-rate>
          </div>
          
          <!-- 评论内容 -->
          <div class="comment-form-item">
            <div class="form-label">评论内容</div>
            <el-input type="textarea" :rows="4" placeholder="请输入评论内容（限150字）" v-model="commentContent" maxlength="150" show-word-limit></el-input>
          </div>

        <!-- 图片上传 -->
        <div class="comment-form-item">
          <div class="form-label">商品图片（限3张）</div>
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :headers="{ Authorization: $store.getters.getToken }"
            :file-list="imageFileList"
            :on-success="handleImageUploadSuccess"
            :on-error="handleImageUploadError"
            :on-remove="handleImageRemove"
            :before-upload="beforeImageUpload"
            :limit="3"
            list-type="picture-card">
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="commentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComment">提交评论</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { formatPrice } from '@/utils/priceUtil'
import orderApi from '@/api/order'
import commentApi from '@/api/comment'

export default {
  data() {
    return {
      loading: false,
      commentList: [],
      total: 0,
      page: 1,
      size: 10,
      commentDialogVisible: false,
      currentProduct: null,
      commentContent: '',
      commentRating: 5, // 默认五星好评
      imageFileList: [],
      uploadUrl: '/api/file/imgup',
    }
  },
  created() {
    this.getCommentList()
  },
  methods: {
    // 获取待评价商品列表
    async getCommentList() {
      this.loading = true
      try {
        const params = {
          page: this.page,
          size: this.size,
        }
        const res = await orderApi.waitingComment(params)
        this.commentList = res.data.list
        this.total = res.data.total
      } catch (error) {
        this.$message.error('获取待评价商品列表失败')
        console.error('获取待评价商品列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 打开评论对话框
    openCommentDialog(product) {
      this.currentProduct = product
      this.commentContent = ''
      this.commentRating = 5 // 默认五星好评
      this.imageFileList = []
      this.commentDialogVisible = true
    },

    // 提交评论
    async submitComment() {
      if (!this.commentContent.trim()) {
        this.$message.warning('请输入评论内容')
        return
      }

      try {
        const params = {
          id: this.currentProduct.orderId,
          productId: this.currentProduct.productId,
          commentContent: this.commentContent,
          commentImg: this.imageFileList.map(file => file.response.data), // 图片URL列表
          score: this.commentRating // 用户选择的评分
        }
        await commentApi.create(params)

        this.$message.success('评论提交成功')
        this.commentDialogVisible = false
        // 刷新待评价商品列表
        this.getCommentList()
      } catch (error) {
        this.$message.error('评论提交失败')
        console.error('评论提交失败:', error)
      }
    },

    // 处理图片上传成功
    handleImageUploadSuccess(response, file, fileList) {
      // TODO: 根据实际接口返回调整
    //   console.log(response, file, fileList)
      this.imageFileList = fileList
    },

    // 处理图片上传失败
    handleImageUploadError(error, file, fileList) {
      this.$message.error('图片上传失败')
      console.error('图片上传失败:', error)
    },

    // 处理图片移除
    handleImageRemove(file, fileList) {
      this.imageFileList = fileList
    },

    // 图片上传前的校验
    beforeImageUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片格式的文件')
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < 2
      if (!isLt10M) {
        this.$message.error('图片大小不能超过2MB')
        return false
      }
      return true
    },

    // 格式化价格（分转元）
    formatPrice(price) {
      return formatPrice(price)
    },

    // 分页大小变化
    handleSizeChange(newSize) {
      this.size = newSize
      this.page = 1
      this.getCommentList()
    },

    // 当前页码变化
    handleCurrentChange(newPage) {
      this.page = newPage
      this.getCommentList()
    },
  },
}
</script>

<style scoped lang="less">
.waiting-comment-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-card {
  display: flex;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .product-image {
    width: 100px;
    height: 100px;
    margin-right: 15px;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
  }

  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .product-name {
      font-weight: 500;
      color: #303133;
      margin-bottom: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-sku {
      color: #909399;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .product-price-quantity {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .price {
        color: #f56c6c;
        font-weight: 500;
        margin-right: 20px;
      }

      .quantity {
        color: #909399;
      }
    }

    .order-info {
      color: #909399;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .product-actions {
      text-align: right;
    }
  }
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 30px;
  text-align: center;
  display: flex;
  justify-content: end;
}

.comment-dialog-content {
  .product-preview {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;

    img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 15px;
    }

    .product-preview-info {
      .product-name {
        font-weight: 500;
        margin-bottom: 5px;
      }

      .product-sku {
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .comment-form-item {
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .image-uploader {
    margin-top: 10px;
  }
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .waiting-comment-container {
    padding: 10px;
  }

  .product-card {
    flex-direction: column;

    .product-image {
      margin-bottom: 15px;
    }

    .product-actions {
      margin-top: 15px;
      text-align: center;
    }
  }

  .dialog-footer {
    text-align: center;
  }
}
</style>
