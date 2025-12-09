<template>
  <div class="product-detail-page" v-loading="loading">
    <el-page-header style="margin-bottom: 20px;" @back="goBack">
</el-page-header>
    <!-- 商品信息部分 -->
    <div class="product-info-section">
      <div class="product-images">
        <!-- 大图展示区域 -->
        <div class="main-image">
          <img :src="currentMainImage" alt="商品主图" class="main-img" />
        </div>
        <!-- 缩略图列表 -->
        <div class="thumbnail-list">
          <div
            v-for="(image, index) in product.productAlbum"
            :key="index"
            class="thumbnail-item"
            :class="{ active: index === currentImageIndex }"
            @mouseenter="switchMainImage(index)"
          >
            <img :src="image" alt="缩略图" class="thumbnail-img" />
          </div>
        </div>
      </div>

      <!-- 商品文字信息区域 -->
      <div class="product-details">
        <h1 class="product-title">{{ product.productName }}</h1>
        <p class="product-subtitle">{{ product.subTitle }}</p>

        <div class="price-section">
          <span class="price-label">价格：</span>
          <span class="price">¥{{ currentPrice.toFixed(2) }}</span>
        </div>

        <div class="stock-section" v-if="currentStock > 0">
          <span class="stock-label">库存：</span>
          <span class="stock">{{ currentStock }} 件</span>
        </div>
        <div class="stock-section out-of-stock" v-else>
          <span class="stock-label">库存：</span>
          <span class="stock">暂时缺货</span>
        </div>

        <div class="sku-section">
          <div class="sku-item">
            <span class="sku-label">规格选项：</span>
            <div class="sku-options">
              <span
                v-for="(sku, index) in product.skuList"
                :key="index"
                class="sku-option"
                :class="{ active: selectedSkuIndex === index, disabled: sku.skuStock <= 0 }"
                @click="selectSku(index)"
                :disabled="sku.skuStock <= 0"
              >
                {{ sku.skuName }}
                <span class="sku-stock" v-if="sku.skuStock <= 0">（缺货）</span>
              </span>
            </div>
          </div>
        </div>

        <div class="operation-section">
          <div class="quantity-control">
            <button class="quantity-btn" @click="decreaseQuantity" :disabled="quantity <= 1 || currentStock <= 0">
              -
            </button>
            <input
              type="number"
              v-model.number="quantity"
              class="quantity-input"
              min="1"
              :max="currentStock"
              :disabled="currentStock <= 0"
            />
            <button
              class="quantity-btn"
              @click="increaseQuantity"
              :disabled="quantity >= currentStock || currentStock <= 0"
            >
              +
            </button>
          </div>

          <div class="action-buttons">
            <button class="btn buy-now-btn" @click="buyNow" :disabled="currentStock <= 0">立即购买</button>
            <button class="btn add-cart-btn" @click="addToCart" :disabled="currentStock <= 0">加入购物车</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品详情和评论部分 -->
    <div class="product-content-section">
      <el-tabs v-model="activeTab" class="content-tabs">
        <el-tab-pane label="商品详情" name="details">
          <div class="detail-images">
            <img
              v-for="(image, index) in product.productDesc"
              :key="index"
              :src="image"
              alt="商品详情图"
              class="detail-img"
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="商品评论" name="comments">
          <div class="comments-section">
            <div class="comment-item" v-for="(comment, index) in productComments" :key="index">
              <div class="comment-header">
                <span class="comment-user">{{ comment.user }}</span>
                <span class="comment-date">{{ comment.date }}</span>
              </div>
              <div class="comment-rating">
                <el-rate v-model="comment.rating" disabled show-score score-template="{value}"></el-rate>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-images" v-if="comment.images && comment.images.length > 0">
                <img
                  v-for="(img, imgIndex) in comment.images"
                  :key="imgIndex"
                  :src="img"
                  alt="评论图片"
                  class="comment-img"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import productApi from '@/api/product'
import cartApi from '@/api/cart'
export default {
  data() {
    return {
      // 当前选中的主图索引
      currentImageIndex: 0,
      // 当前主图URL
      currentMainImage: '',
      // 数量
      quantity: 1,
      // 当前激活的标签页
      activeTab: 'details',
      // 当前选中的SKU索引
      selectedSkuIndex: 0,
      // 商品数据
      product: {
        productName: '',
        subTitle: '',
        productCover: '',
        productAlbum: [],
        productDesc: [],
        skuList: [],
      },
      // 商品评论列表
      productComments: [
        {
          user: '钓友小王',
          date: '2024-01-15',
          rating: 5,
          content: '竿子非常轻，手感很好，上鱼时腰力足，回鱼快，性价比很高！',
          images: ['https://picsum.photos/id/20/200/200', 'https://picsum.photos/id/21/200/200'],
        },
        {
          user: '老钓手',
          date: '2024-01-10',
          rating: 4,
          content: '做工精细，包装精美，调性合适，唯一的小缺点是竿稍有点软，总体来说很满意。',
          images: [],
        },
        {
          user: '新手入门',
          date: '2024-01-05',
          rating: 5,
          content: '作为新手，这款竿子非常好上手，质量也不错，客服态度很好，推荐新手购买！',
          images: ['https://picsum.photos/id/22/200/200'],
        },
      ],
      loading: false,
    }
  },
  computed: {
    // 获取当前选中SKU的价格（从分转换为元）
    currentPrice() {
      if (this.product.skuList && this.product.skuList.length > 0 && this.product.skuList[this.selectedSkuIndex]) {
        // 将分转换为元（除以100）
        return this.product.skuList[this.selectedSkuIndex].skuPrice / 100
      }
      return 0
    },
    // 获取当前选中SKU的库存
    currentStock() {
      if (this.product.skuList && this.product.skuList.length > 0 && this.product.skuList[this.selectedSkuIndex]) {
        return this.product.skuList[this.selectedSkuIndex].skuStock
      }
      return 0
    },
  },
  created() {
    this.initProductInfo()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    initProductInfo() {
      this.loading = true
      productApi.infoProduct({ id: this.$route.params.id }).then((res) => {
        this.product = res.data || {}
        // 初始化主图
        this.currentMainImage = this.product.productCover
        // 初始化数量不超过库存
        this.quantity = Math.min(this.quantity, this.currentStock)
        this.loading = false
      })
    },
    // 切换主图
    switchMainImage(index) {
      this.currentImageIndex = index
      this.currentMainImage = this.product.productAlbum[index]
    },
    // 选择SKU
    selectSku(index) {
      // 只有库存大于0的SKU才能被选中
      if (this.product.skuList[index].skuStock > 0) {
        this.selectedSkuIndex = index
        // 重置数量，确保不超过新选中SKU的库存
        this.quantity = 1
      }
    },
    // 减少数量
    decreaseQuantity() {
      if (this.quantity > 1 && this.currentStock > 0) {
        this.quantity--
      }
    },
    // 增加数量
    increaseQuantity() {
      if (this.quantity < this.currentStock) {
        this.quantity++
      }
    },
    // 立即购买
    buyNow() {
      if (this.currentStock <= 0) {
        this.$message.warning('该SKU暂时缺货')
        return
      }

      const orderInfo = {
        product: this.product,
        quantity: this.quantity,
        selectedSku: this.product.skuList[this.selectedSkuIndex],
      }
      console.log('立即购买:', orderInfo)
      this.$message.success('即将跳转到订单确认页面')
    },
    // 加入购物车
    addToCart() {
      if (this.currentStock <= 0) {
        this.$message.warning('该SKU暂时缺货')
        return
      }

      const cartItem = {
        productId: this.product.id,
        productCount: this.quantity,
        skuId: this.product.skuList[this.selectedSkuIndex].id,
      }
      console.log('加入购物车:', cartItem)
      cartApi.create(cartItem).then((res) => {
        if (res.code === 0) {
          this.$message.success('成功加入购物车')
        } else {
          this.$message.error(res.msg || '加入购物车失败')
        }
      })
    },
  },
  watch: {
    // 监听库存变化，调整数量
    currentStock(newStock) {
      if (this.quantity > newStock) {
        this.quantity = Math.max(1, newStock)
      }
    },
  },
}
</script>

<style scoped lang="less">
.product-detail-page {
  padding: 0 20px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

/* 商品信息部分 */
.product-info-section {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e0e0e0;
}

/* 商品图片区域 */
.product-images {
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  width: 100%;
  height: 500px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail-item:hover,
.thumbnail-item.active {
  border-color: #1890ff;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品详情文字区域 */
.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.product-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.price-label {
  font-size: 16px;
  color: #666;
}

.price {
  font-size: 32px;
  font-weight: 600;
  color: #ff4d4f;
}

/* 库存显示 */
.stock-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stock-section.out-of-stock {
  color: #ff4d4f;
}

.stock-label {
  font-size: 16px;
  color: #666;
}

.stock {
  font-size: 16px;
  color: #52c41a;
}

/* SKU选择区域 */
.sku-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sku-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.sku-label {
  width: 80px;
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
}

.sku-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1;
}

.sku-option {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.sku-option:hover:not(.disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.sku-option.active {
  border-color: #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
}

.sku-option.disabled {
  background-color: #f5f5f5;
  color: #bfbfbf;
  cursor: not-allowed;
  border-color: #d9d9d9;
}

.sku-stock {
  font-size: 12px;
  color: #ff4d4f;
}

/* 操作区域 */
.operation-section {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-top: 20px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.quantity-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quantity-input {
  width: 60px;
  height: 32px;
  border: none;
  text-align: center;
  font-size: 14px;
}

.quantity-input:focus {
  outline: none;
}

.quantity-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #bfbfbf;
}

.action-buttons {
  display: flex;
  gap: 20px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.buy-now-btn {
  background: #ff4d4f;
  color: white;
}

.buy-now-btn:hover:not(:disabled) {
  background: #ff7875;
}

.add-cart-btn {
  background: #1890ff;
  color: white;
}

.add-cart-btn:hover:not(:disabled) {
  background: #40a9ff;
}

/* 商品详情和评论部分 */
.product-content-section {
  margin-top: 40px;
}

.content-tabs {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.content-tabs .el-tabs__header {
  margin: 0;
  background: #fafafa;
}

.content-tabs .el-tabs__nav-wrap {
  padding: 0 20px;
}

.content-tabs .el-tabs__nav {
  height: 56px;
}

.content-tabs .el-tabs__item {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  font-size: 16px;
  color: #666;
}

.content-tabs .el-tabs__item:hover {
  color: #1890ff;
}

.content-tabs .el-tabs__item.is-active {
  color: #1890ff;
}

.content-tabs .el-tabs__active-bar {
  height: 3px;
  background: #1890ff;
}

.content-tabs .el-tabs__content {
  padding: 30px;
  background: white;
}

/* 商品详情图片 */
.detail-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-img {
  width: 100%;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 商品评论 */
.comments-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  padding: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-user {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.comment-date {
  font-size: 14px;
  color: #999;
}

.comment-rating {
  margin-bottom: 12px;
}

.comment-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 16px;
}

.comment-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-img {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.comment-img:hover {
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail-page {
    padding: 10px;
  }

  .product-info-section {
    flex-direction: column;
    gap: 20px;
  }

  .product-images {
    width: 100%;
  }

  .main-image {
    height: 300px;
  }

  .operation-section {
    flex-direction: column;
    gap: 15px;
  }

  .action-buttons {
    width: 100%;
  }

  .btn {
    flex: 1;
  }
}
</style>
