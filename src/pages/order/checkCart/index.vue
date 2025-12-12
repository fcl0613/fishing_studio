<template>
  <div class="order-confirm-container" v-loading="loading" element-loading-text="正在加载订单信息...">
    <el-card>
      <div slot="header" class="card-header">
        <h2>订单确认</h2>
      </div>

      <!-- 加载状态 -->
      <!-- <el-loading v-loading="loading" :fullscreen="false" text="正在加载订单信息..."></el-loading> -->

      <!-- 地址选择 -->
      <div v-if="orderItems.length > 0" class="address-section">
        <h3>收货地址</h3>
        <div class="address-selector" @click="openAddressSelector">
          <div v-if="selectedAddress" class="selected-address">
            <div class="address-header">
              <span class="receiver-name">{{ selectedAddress.receiveName }}</span>
              <span class="receiver-phone">{{ selectedAddress.receivePhone }}</span>
            </div>
            <div class="address-detail">
              <span class="address-full">
                {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.county }}{{ selectedAddress.detailAddress }}
              </span>
            </div>
          </div>
          <div v-else class="no-address">
            <i class="el-icon-plus"></i>
            <span>选择收货地址</span>
          </div>
          <i class="el-icon-arrow-right"></i>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-if="orderItems.length > 0" class="order-items">
        <h3>商品信息</h3>
        <el-table :data="orderItems" border style="width: 100%">
          <el-table-column prop="productName" label="商品名称" min-width="200">
            <template slot-scope="scope">
              <div class="product-info">
                <img :src="scope.row.productCorver" :alt="scope.row.productName" class="product-image" />
                <span>{{ scope.row.productName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="skuName" label="规格" min-width="150"></el-table-column>
          <el-table-column prop="productCount" label="数量" width="80" align="center"></el-table-column>
          <el-table-column prop="skuPrice" label="单价" width="120" align="right">
            <template slot-scope="scope"> ¥{{ formatPrice(scope.row.skuPrice) }} </template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="right">
            <template slot-scope="scope"> ¥{{ formatPrice(scope.row.skuPrice * scope.row.productCount) }} </template>
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

    <!-- 地址选择器对话框 -->
    <el-dialog title="选择收货地址" :visible.sync="showAddressSelector" width="800px" :close-on-click-modal="false">
      <!-- 地址列表 -->
      <div class="address-selector-dialog">
        <div class="address-list" v-if="addressList != null || addressList.length > 0">
          <div
            v-for="address in addressList"
            :key="address.id"
            class="address-item"
            :class="{ selected: selectedAddress && selectedAddress.id === address.id }"
            @click="selectAddress(address)">
            <div class="address-header">
              <div class="address-name-phone">
                <span class="address-name">{{ address.receiveName }}</span>
                <span class="address-phone">{{ address.receivePhone }}</span>
                <span v-if="address.receiveStatus === 1" class="default-tag">默认</span>
              </div>
            </div>
            <div class="address-detail">
              <span class="address-full"> {{ address.province }}{{ address.city }}{{ address.county }}{{ address.detailAddress }} </span>
            </div>
          </div>

          <!-- 新增地址按钮 -->
          <div class="add-address-btn" @click="goToAddressManager">
            <i class="el-icon-plus"></i>
            <span>管理收货地址</span>
          </div>
        </div>
        <el-empty v-else description="当前暂无收获地址，请先添加收获地址"></el-empty>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddressSelector = false">取消</el-button>
        <el-button type="primary" @click="confirmAddressSelection" :disabled="!selectedAddress">确认选择</el-button>
      </span>
    </el-dialog>

    <el-dialog title="扫码支付 暂只支持支付宝" :visible.sync="payDialogVisible" width="30%" :before-close="handleClose">
      <div v-show="qrFlag" style="display: flex; justify-content: center">
        <el-image style="width: 200px; height: 200px" :src="qrUrl" fit="fit"></el-image>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import orderApi from '@/api/order'
import { formatPrice } from '@/utils/priceUtil'
import addressApi from '@/api/address'
import fsConstant from '@/constant/fsConstant'

export default {
  name: 'OrderCheckCart',
  data() {
    return {
      loading: false,
      orderItems: [],
      cartIds: [],
      shippingFee: 1000, // 运费（单位：分）
      addressList: [],
      selectedAddress: null,
      currentAddressId: null,
      showAddressSelector: false,
      payDialogVisible: false,
      orderId: null,
      qrFlag: false,
      qrUrl: '',
    }
  },
  computed: {
    totalPrice() {
      return this.orderItems.reduce((total, item) => {
        return total + item.skuPrice * item.productCount
      }, 0)
    },
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
    this.initAddress()
  },
  beforeDestroy() {
    if (this.timer !== null) {
      clearInterval(this.timer)
    }
  },
  methods: {
    initAddress() {
      addressApi.query().then(res => {
        this.addressList = res.data
      })
    },
    // 获取订单确认信息
    async getOrderInfo() {
      this.loading = true
      try {
        const res = await orderApi.checkCart({ cartIds: this.cartIds })
        if (res.data == null || res.data.length == 0) {
          this.$message.warning('请选择要购买的商品')
          this.$router.push('/layout/cart')
          return
        }
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
      if (this.currentAddressId == null) {
        this.$message.error('请先选择收货地址')
        return
      }
      try {
        // 这里可以添加地址选择、支付方式选择等逻辑
        // 假设已经获取到了必要的订单信息
        const orderItemDTO = []
        this.orderItems.forEach(element => {
          orderItemDTO.push({ productId: element.productId, skuId: element.skuId, productCount: element.productCount })
        })
        const orderData = {
          cartIdList: this.cartIds,
          // 其他订单信息，如地址ID、支付方式等
          orderItems: orderItemDTO,
          orderAddress: this.currentAddressId,
        }

        const res = await orderApi.create(orderData)
        this.$message.success('订单提交成功')
        this.orderId = res.data
        this.qrUrl = fsConstant.qrCodeUrl + res.data
        this.payDialogVisible = !this.payDialogVisible
        this.qrFlag = true
        this.verifyPay(res.data)
      } catch (error) {
        this.$message.error('订单提交失败，请稍后重试')
        console.error('订单提交失败:', error)
      }
    },
    openAddressSelector() {
      this.showAddressSelector = !this.showAddressSelector
    },
    goToAddressManager() {
      this.$router.push('/layout/personal/address')
    },
    confirmAddressSelection() {
      this.currentAddressId = this.selectedAddress.id
      this.showAddressSelector = !this.showAddressSelector
    },
    selectAddress(address) {
      this.selectedAddress = address
    },
    handleClose() {
      this.payDialogVisible = false
      if (this.timer !== null) {
        clearInterval(this.timer)
      }
      // this.$router.push({
      //   path: '/home/userProfiles/orderlist',
      // })
    },
    verifyPay(id) {
      let that = this
      this.timer = setInterval(() => {
        orderApi.listenPay(id).then(res => {
          if (res.data == 0) {
            this.$message({
              type: 'success',
              onClose: () => {
                this.payDialogVisible = false
                // TODO 跳转到订单列表页面
                this.$router.push('/layout')
              },
            })
          }
        })
      }, 1000)
    },
  },

  // 监听路由变化，当从地址管理页面返回时重新获取地址列表
  watch: {
    $route(to, from) {
      if (to.path === '/layout/order/checkCart' && from.path === '/layout/personal/address') {
        this.initAddress()
      }
    },
  },
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

/* 地址选择器样式 */
.address-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;

  h3 {
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
  }
}

.address-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background-color: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #409eff;
  }

  .selected-address {
    flex: 1;
  }

  .no-address {
    display: flex;
    align-items: center;
    color: #909399;

    i {
      margin-right: 5px;
    }
  }

  .el-icon-arrow-right {
    color: #c0c4cc;
  }
}

.selected-address {
  .address-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .receiver-name {
      font-weight: 500;
      margin-right: 15px;
    }

    .receiver-phone {
      color: #606266;
    }
  }

  .address-detail {
    .address-full {
      color: #606266;
      line-height: 1.5;
    }
  }
}

/* 地址选择器对话框样式 */
.address-selector-dialog {
  .address-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .address-item {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
    }

    &.selected {
      border-color: #409eff;
      background-color: rgba(64, 158, 255, 0.05);
    }
  }

  .address-name-phone {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .address-name {
      font-weight: 500;
      margin-right: 15px;
    }

    .address-phone {
      color: #606266;
      margin-right: 15px;
    }

    .default-tag {
      display: inline-block;
      padding: 2px 6px;
      background-color: #409eff;
      color: white;
      font-size: 12px;
      border-radius: 4px;
    }
  }

  .address-detail {
    .address-full {
      color: #606266;
      line-height: 1.5;
    }
  }

  .add-address-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    i {
      margin-right: 8px;
    }
  }
}
</style>
