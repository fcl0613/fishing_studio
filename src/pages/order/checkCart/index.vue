<template>
  <div class="order-confirm-container">
    <el-card>
      <div slot="header" class="card-header">
        <h2>订单确认</h2>
      </div>
      
      <!-- 加载状态 -->
      <el-loading v-loading="loading" :fullscreen="false" text="正在加载订单信息..."></el-loading>
      
      <!-- 商品列表 -->
      <div v-if="orderItems.length > 0" class="order-items">
        <h3>商品信息</h3>
        <el-table :data="orderItems" border style="width: 100%">
          <el-table-column prop="productName" label="商品名称" min-width="200">
            <template slot-scope="scope">
              <div class="product-info">
                <img :src="scope.row.productCorver" :alt="scope.row.productName" class="product-image">
                <span>{{ scope.row.productName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="skuName" label="规格" min-width="150"></el-table-column>
          <el-table-column prop="productCount" label="数量" width="80" align="center"></el-table-column>
          <el-table-column prop="skuPrice" label="单价" width="120" align="right">
            <template slot-scope="scope">
              ¥{{ formatPrice(scope.row.skuPrice) }}
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="right">
            <template slot-scope="scope">
              ¥{{ formatPrice(scope.row.skuPrice * scope.row.productCount) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 无商品情况 -->
      <el-empty v-else description="暂无商品信息"></el-empty>
      
      <!-- 订单金额汇总 -->
      <div v-if="orderItems.length > 0" class="order-summary">
        <div class="summary-item">
          <span>商品总额：</span>
          <span class="price">¥{{ formatPrice(totalPrice) }}</span>
        </div>
        <!-- <div class="summary-item">
          <span>运费：</span>
          <span class="price">¥{{ formatPrice(shippingFee) }}</span>
        </div> -->
        <div class="summary-item total">
          <span>应付金额：</span>
          <span class="price total-price">¥{{ formatPrice(totalPrice) }}</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="orderItems.length > 0" class="order-actions">
        <el-button @click="goBack">返回购物车</el-button>
        <el-button type="primary" @click="submitOrder">提交订单</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import orderApi from '@/api/order'
import { formatPrice } from '@/utils/priceUtil' // 假设已有价格格式化工具

export default {
  name: 'OrderCheckCart',
  data() {
    return {
      loading: false,
      orderItems: [],
      cartIds: [],
      shippingFee: 1000, // 运费（单位：分）
    }
  },
  computed: {
    totalPrice() {
      return this.orderItems.reduce((total, item) => {
        return total + (item.skuPrice * item.productCount)
      }, 0)
    }
  },
  created() {
    // 从路由参数中获取cartIds
    this.cartIds = this.$route.query.cartIds ? JSON.parse(this.$route.query.cartIds) : []
    if (this.cartIds.length > 0) {
      this.getOrderInfo()
    } else {
      this.$message.warning('请选择要购买的商品')
      this.$router.push('/layout/cart')
    }
  },
  methods: {
    // 获取订单确认信息
    async getOrderInfo() {
      this.loading = true
      try {
        const res = await orderApi.checkCart({ cartIds: this.cartIds })
        this.orderItems = res.data
      } catch (error) {
        this.$message.error('获取订单信息失败，请稍后重试')
        console.error('获取订单信息失败:', error)
      } finally {
        this.loading = false
      }
    },
    
    // 格式化价格（分转元）
    formatPrice(price) {
      return formatPrice(price)
    },
    
    // 返回购物车
    goBack() {
      this.$router.push('/layout/cart')
    },
    
    // 提交订单
    async submitOrder() {
      try {
        // 这里可以添加地址选择、支付方式选择等逻辑
        // 假设已经获取到了必要的订单信息
        const orderData = {
          cartIds: this.cartIds,
          // 其他订单信息，如地址ID、支付方式等
        }
        
        const res = await orderApi.create(orderData)
        this.$message.success('订单提交成功')
        // 跳转到订单详情页或支付页
        this.$router.push(`/order/list`)
      } catch (error) {
        this.$message.error('订单提交失败，请稍后重试')
        console.error('订单提交失败:', error)
      }
    }
  }
}
</script>

<style scoped lang="less">
.order-confirm-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-items {
  margin-bottom: 20px;
  
  h3 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
  }
}

.product-info {
  display: flex;
  align-items: center;
  
  .product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin-right: 10px;
    border-radius: 4px;
  }
}

.order-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  width: fit-content;
  margin-left: auto;
  
  .summary-item {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    min-width: 300px;
    
    .price {
      font-weight: 500;
    }
    
    &.total {
      font-size: 18px;
      font-weight: bold;
      
      .total-price {
        color: #f56c6c;
      }
    }
  }
}

.order-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>