<template>
  <div class="cart-container" v-loading.fullscreen.lcok="loading" element-loading-text="拼命加载中">
    <div class="cart-header">
      <h2>购物车</h2>
      <div class="cart-info">共 {{ cartList.length }} 件商品</div>
    </div>

    <!-- 购物车为空时 - 使用Element UI的Empty组件 -->
    <div v-if="cartList.length === 0" class="empty-cart">
      <el-empty description="购物车还是空的，快去选购吧！" :image-size="120">
        <router-link to="/layout/home">
          <el-button type="primary" size="medium">去购物</el-button>
        </router-link>
      </el-empty>
    </div>

    <!-- 购物车商品列表 -->
    <div v-else class="cart-content">
      <!-- 商品列表 -->
      <div class="cart-items">
        <div
          v-for="item in cartList"
          :key="item.id"
          class="cart-item"
          :class="{ 'disabled-item': item.hasPublish === 0 || item.hasStock === 0 }"
        >
          <!-- 商品选择框 - 使用Element UI的Checkbox -->
          <div class="item-select">
            <el-checkbox
              v-model="selectedItems"
              :label="item.id"
              :disabled="item.hasPublish === 0 || item.hasStock === 0"
              ><br
            /></el-checkbox>
          </div>

          <!-- 商品图片 -->
          <div class="item-image">
            <img :src="item.productCorver" :alt="item.productName" />
            <!-- 商品不存在遮罩 -->
            <div v-if="item.hasPublish === 0" class="item-mask not-exist">
              <span>商品不存在</span>
            </div>
            <!-- 无库存遮罩 -->
            <div v-else-if="item.hasStock === 0" class="item-mask out-of-stock">
              <span>无库存</span>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="item-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="sku-info">{{ item.skuName }}</div>
            <div class="item-price">¥{{ formatPrice(item.skuPrice) }}</div>
          </div>

          <!-- 数量控制 - 使用Element UI的InputNumber -->
          <div class="item-quantity">
            <el-input-number
              v-model="item.productCount"
              :min="1"
              :max="item.maxStock"
              :disabled="item.hasPublish === 0 || item.hasStock === 0"
              @change="updateCartQuantity(item)"
              size="small"
            ></el-input-number>
          </div>

          <!-- 小计 -->
          <div class="item-subtotal">¥{{ formatPrice(item.skuPrice * item.productCount) }}</div>

          <!-- 删除按钮 - 使用Element UI的Button -->
          <div class="item-actions">
            <el-button type="text" size="small" @click="confirmDelete(item.id)" :disabled="loading"> 删除 </el-button>
          </div>
        </div>
      </div>

      <!-- 底部结算栏 -->
      <div class="cart-footer">
        <!-- 全选 -->
        <div class="select-all">
          <el-checkbox
            v-model="isAllSelectedValue"
            @change="toggleSelectAll"
            :disabled="cartList.length === 0 || selectableItems.length === 0"
          >
            全选
          </el-checkbox>
        </div>

        <!-- 删除选中 -->
        <div class="delete-selected">
          <el-button
            type="text"
            size="small"
            @click="deleteSelectedItems"
            :disabled="selectedItems.length === 0 || loading"
          >
            删除选中
          </el-button>
        </div>

        <!-- 合计 -->
        <div class="total-section">
          <div class="total-price">
            合计：<span class="price-highlight">¥{{ formatPrice(totalPrice) }}</span>
          </div>
          <div class="total-count">已选 {{ selectedCount }} 件商品</div>

          <!-- 结算按钮 - 使用Element UI的Button -->
          <el-button type="primary" @click="checkout" :disabled="selectedItems.length === 0 || loading">
            结算
          </el-button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 - 使用Element UI的Dialog -->
    <el-dialog title="确认删除" :visible.sync="showDeleteConfirm" width="30%" :close-on-click-modal="false">
      <span>确定要删除该商品吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDelete">取消</el-button>
        <el-button type="danger" @click="deleteItem" :loading="loading">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cartApi from '@/api/cart'
export default {
  data() {
    return {
      cartList: [],
      selectedItems: [], // 选中的商品ID列表
      showDeleteConfirm: false,
      currentDeleteItemId: null,
      loading: false,
      isAllSelectedValue: false, // 全选状态
    }
  },
  computed: {
    // 计算总价
    totalPrice() {
      return this.selectedItems.reduce((total, itemId) => {
        const item = this.cartList.find((i) => i.id === itemId)
        return item ? total + item.skuPrice * item.productCount : total
      }, 0)
    },
    // 选中商品数量
    selectedCount() {
      return this.selectedItems.length
    },
    // 可选择的商品数量
    selectableItems() {
      return this.cartList.filter((item) => item.hasPublish === 1 && item.hasStock === 1)
    },
    // 是否所有可选择商品都被选中
    isAllSelected() {
      if (this.cartList.length === 0 || this.selectableItems.length === 0) return false
      return this.selectableItems.every((item) => this.selectedItems.includes(item.id))
    },
  },
  watch: {
    // 监听选中状态，更新全选按钮的值
    isAllSelected(newVal) {
      this.isAllSelectedValue = newVal
    },
  },
  created() {
    this.initCartData()
  },
  methods: {
    // 初始化购物车数据
    async initCartData() {
      this.loading = true
      try {
        const res = await cartApi.query()
        if (res.code === 0) {
          this.cartList = res.data
        } else {
          this.$message.error(res.msg || '获取购物车数据失败')
        }
      } catch (error) {
        console.error('获取购物车数据失败:', error)
        this.$message.error('获取购物车数据失败，请重试')
      } finally {
        this.loading = false
      }
    },

    // 格式化价格（分转元）
    formatPrice(priceInCents) {
      return (priceInCents / 100).toFixed(2)
    },

    // 全选/取消全选
    toggleSelectAll() {
      if (this.isAllSelectedValue) {
        this.selectedItems = this.selectableItems.map((item) => item.id)
      } else {
        this.selectedItems = []
      }
    },

    // 调用接口更新购物车商品数量
    async updateCartQuantity(item) {
      // 由于使用el-input-number，最小值和最大值已经由组件处理
      this.loading = true
      try {
        // 实际项目中调用接口
        // await updateCartItem(item.id, item.productCount)
        console.log('更新商品数量:', item.id, item.productCount)
        const res = await cartApi.update({
          id: item.id,
          count: item.productCount,
        })
        if (res.code !== 0) {
          this.$message.error(res.msg || '更新购物车商品数量失败')
          // 恢复原数量
          this.initCartData()
          return
        }
      } catch (error) {
        console.error('更新商品数量失败:', error)
        this.$message.error('更新商品数量失败，请重试')
        // 恢复原数量
        this.initCartData()
      } finally {
        this.loading = false
      }
    },

    // 确认删除对话框
    confirmDelete(itemId) {
      this.currentDeleteItemId = itemId
      this.showDeleteConfirm = true
    },

    // 取消删除
    cancelDelete() {
      this.showDeleteConfirm = false
      this.currentDeleteItemId = null
    },

    // 删除单个商品
    async deleteItem() {
      this.loading = true
      try {
        const res = await cartApi.remove({
          id: this.currentDeleteItemId,
        })
        if (res.code !== 0) {
          this.$message.error(res.msg || '删除购物车商品失败')
          // 恢复原数量
          this.initCartData()
          return
        }

        // 从列表中移除
        const index = this.cartList.findIndex((item) => item.id === this.currentDeleteItemId)
        if (index > -1) {
          this.cartList.splice(index, 1)
        }

        this.$message.success('删除成功')
      } catch (error) {
        console.error('删除商品失败:', error)
        this.$message.error('删除商品失败，请重试')
      } finally {
        this.loading = false
        this.showDeleteConfirm = false
        this.currentDeleteItemId = null
      }
    },

    // 删除选中的商品
    async deleteSelectedItems() {
      if (this.selectedItems.length === 0) {
        return
      }

      try {
        await this.$confirm(`确定要删除选中的${this.selectedItems.length}件商品吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })

        this.loading = true
        // 实际项目中调用接口
        const res = await cartApi.batchRemove({
          ids: this.selectedItems,
        })
        if (res.code !== 0) {
          this.$message.error(res.msg || '删除购物车商品失败')
          // 恢复原数量
          this.initCartData()
          return
        }

        // 从列表中移除选中的商品
        this.cartList = this.cartList.filter((item) => !this.selectedItems.includes(item.id))
        this.selectedItems = []
        this.$message.success('删除成功')
      } catch (error) {
        // 用户取消操作时不会报错
        if (error !== 'cancel') {
          console.error('删除商品失败:', error)
          this.$message.error('删除商品失败，请重试')
        }
      } finally {
        this.loading = false
      }
    },

    // 结算
    checkout() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要结算的商品')
        return
      }

      // 获取选中的商品
      const selectedProducts = this.cartList.filter((item) => this.selectedItems.includes(item.id))

      // 保存到localStorage或Vuex，以便在下一页使用
      localStorage.setItem('checkoutProducts', JSON.stringify(selectedProducts))

      // 跳转到结算页面
      console.log('跳转到结算页面:', selectedProducts)
      this.$message.success('即将前往结算页面')
      // this.$router.push('/checkout')
    },
  },
}
</script>

<style scoped lang="less">
.cart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;

  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }

  .cart-info {
    color: #666;
    font-size: 14px;
  }
}

/* 空购物车样式 */
.empty-cart {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 60px 20px;
}

/* 购物车内容 */
.cart-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 购物车商品项 */
.cart-items {
  border-bottom: 1px solid #e0e0e0;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #fafafa;
  }

  &.disabled-item {
    opacity: 0.6;
    background-color: #f5f5f5;
  }
}

/* 商品选择框 */
.item-select {
  width: 60px;
  display: flex;
  justify-content: center;
}

/* 商品图片 */
.item-image {
  width: 120px;
  height: 120px;
  margin-right: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  .item-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 14px;
    font-weight: 500;
  }
}

/* 商品信息 */
.item-info {
  flex: 1;
  min-width: 0;

  .product-name {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sku-info {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }

  .item-price {
    font-size: 16px;
    color: #ff6700;
    font-weight: 500;
  }
}

/* 数量控制 - 调整Element UI InputNumber的位置 */
.item-quantity {
  width: 120px;
  margin-right: 40px;
}

/* 小计 */
.item-subtotal {
  width: 100px;
  text-align: right;
  font-size: 16px;
  color: #ff6700;
  font-weight: 500;
  margin-right: 40px;
}

/* 底部结算栏 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fafafa;

  .select-all {
    margin-right: 20px;
  }

  .total-section {
    display: flex;
    align-items: center;

    .total-price {
      margin-right: 20px;
      font-size: 16px;
      color: #333;

      .price-highlight {
        font-size: 24px;
        color: #ff6700;
        font-weight: 600;
      }
    }

    .total-count {
      margin-right: 30px;
      font-size: 14px;
      color: #666;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-container {
    padding: 10px;
  }

  .cart-item {
    flex-wrap: wrap;
    padding: 15px 10px;
  }

  .item-image {
    width: 80px;
    height: 80px;
    margin-right: 10px;
  }

  .item-quantity {
    width: 100px;
    margin-right: 20px;
  }

  .item-subtotal {
    width: 80px;
    margin-right: 20px;
  }

  .cart-footer {
    flex-wrap: wrap;
    padding: 15px 10px;
  }

  .total-section {
    width: 100%;
    margin-top: 20px;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .cart-item {
    padding: 10px 5px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .product-name {
    font-size: 14px;
  }

  .item-quantity {
    width: 90px;
    margin-right: 10px;
  }

  .item-subtotal {
    width: 70px;
    margin-right: 10px;
    font-size: 14px;
  }
}
</style>
