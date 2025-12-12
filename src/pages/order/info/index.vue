<template>
  <div class="order-info-container">
    <el-card v-loading="loading" element-loading-text="正在加载订单信息...">
      <div slot="header" class="card-header">
        <h2>订单详情</h2>
      </div>

      <!-- 订单基本信息 -->
      <div v-if="orderDetail" class="order-basic-info">
        <div class="order-main-info">
          <div class="order-number">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderDetail.orderNo }}</span>
          </div>
          <div class="order-status">
            <span class="label">订单状态：</span>
            <span class="value">{{ getOrderStatusText(orderDetail.orderStatus) }}</span>
          </div>
        </div>

        <div class="order-date-info">
          <div class="create-time">
            <span class="label">下单时间：</span>
            <span class="value">{{ formatDate(orderDetail.createTime) }}</span>
          </div>
          <div class="payment-time" v-if="orderDetail.paymentTime">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatDate(orderDetail.paymentTime) }}</span>
          </div>
          <div class="delivery-time" v-if="orderDetail.deliveryTime">
            <span class="label">发货时间：</span>
            <span class="value">{{ formatDate(orderDetail.deliveryTime) }}</span>
          </div>
          <div class="receive-time" v-if="orderDetail.receiveTime">
            <span class="label">收货时间：</span>
            <span class="value">{{ formatDate(orderDetail.receiveTime) }}</span>
          </div>
        </div>

        <div class="order-payment-info">
          <div class="payment-type">
            <span class="label">支付方式：</span>
            <span class="value">{{ getPaymentTypeText(orderDetail.payType) }}</span>
          </div>
          <div class="total-amount">
            <span class="label">商品总价：</span>
            <span class="value">¥{{ formatPrice(orderDetail.totalAmount) }}</span>
          </div>
          <div class="pay-amount">
            <span class="label">实付金额：</span>
            <span class="value highlight">¥{{ formatPrice(orderDetail.payAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- 收货地址信息 -->
      <div v-if="orderDetail" class="shipping-info">
        <div class="section-title">收货地址</div>
        <div class="address-content">
          <div class="receiver-info">
            <span class="receiver-name">{{ orderDetail.receiverName }}</span>
            <div class="phone-container">
              <span class="receiver-phone">{{ formatPhone(orderDetail.receiverPhone) }}</span>
              <i class="eye-icon" :class="{ show: showPhone }" @click="togglePhoneVisibility"></i>
            </div>
          </div>
          <div class="address-text">
            {{ orderDetail.receiverProvince }}{{ orderDetail.receiverCity }}{{ orderDetail.receiverCounty }}{{ orderDetail.receiverDetailAddress }}
          </div>
        </div>
      </div>

      <!-- 订单商品列表 -->
      <div v-if="orderDetail" class="order-products">
        <div class="section-title">商品信息</div>
        <div class="products-list">
          <div v-for="item in orderDetail.orderItemList" :key="item.id" class="product-item">
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
            </div>
          </div>
        </div>
      </div>

      <!-- 订单备注 -->
      <div v-if="orderDetail && orderDetail.note" class="order-note">
        <div class="section-title">订单备注</div>
        <div class="note-content">{{ orderDetail.note }}</div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="orderDetail" class="order-actions">
        <el-button v-if="orderDetail.orderStatus === 0" type="primary" @click="handlePay"> 立即支付 </el-button>
        <el-button v-if="orderDetail.orderStatus === 0" type="info" @click="handleCancel"> 取消订单 </el-button>
        <el-button v-if="orderDetail.orderStatus === 2" type="success" @click="handleConfirmReceive"> 确认收货 </el-button>
        <el-button v-if="[1, 2].includes(orderDetail.orderStatus)" type="text" @click="handleRefundService()"> 退款申请 </el-button>
        <!-- <el-button v-if="orderDetail.orderStatus === 3" type="text" @click="handleRebuy"> 再次购买 </el-button> -->
        <el-button type="text" @click="goBack"> 返回订单列表 </el-button>
      </div>
    </el-card>

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
import fsConstant from '@/constant/fsConstant'

export default {
  data() {
    return {
      loading: false,
      orderDetail: null,
      orderNo: '',
      showPhone: false, // 控制电话号码是否显示
      orderStatusMap: {
        0: '待支付',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已关闭',
        5: '已关闭',
      },
      paymentTypeMap: {
        1: '支付宝支付',
        2: '微信支付',
        3: '银行卡支付',
      },
      qrFlag: false,
      qrUrl: '',
      paySuccessMessageLock: false,
      payDialogVisible: false
    }
  },
  created() {
    // 从路由参数中获取订单编号
    this.orderNo = this.$route.params.orderId
    // 获取订单详情
    this.getOrderDetail()
  },
  methods: {
    // 获取订单详情
    async getOrderDetail() {
      this.loading = true
      try {
        const params = {
          id: this.orderNo,
        }
        const res = await orderApi.orderInfo(params)
        this.orderDetail = res.data
      } catch (error) {
        this.$message.error('获取订单详情失败，请稍后重试')
        console.error('获取订单详情失败:', error)
      } finally {
        this.loading = false
        console.log(this.loading)
      }
    },

    // 格式化价格（分转元）
    formatPrice(price) {
      return formatPrice(price)
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    // 获取订单状态文本
    getOrderStatusText(status) {
      return this.orderStatusMap[status] || '未知状态'
    },

    // 获取支付方式文本
    getPaymentTypeText(type) {
      return this.paymentTypeMap[type] || '未知支付方式'
    },

    // 格式化电话号码
    formatPhone(phone) {
      if (!phone) return ''
      if (this.showPhone) {
        return phone
      } else {
        // 隐藏中间四位
        return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      }
    },

    // 切换电话号码显示/隐藏
    togglePhoneVisibility() {
      this.showPhone = !this.showPhone
    },

    // 处理支付操作
    handlePay() {
      this.qrUrl = fsConstant.qrCodeUrl + order.id
      this.qrFlag = true
      this.payDialogVisible = true
      this.verifyPay(order.id)
    },

    // 处理取消订单
    handleCancel() {
      this.$confirm('确定要取消该订单吗？', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            await orderApi.cancel({ id: this.orderDetail.id })
            this.$message.success('订单已取消')
            // 刷新订单详情
            this.getOrderDetail()
          } catch (error) {
            this.$message.error('取消订单失败，请稍后重试')
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    },

    // 处理确认收货
    handleConfirmReceive() {
      this.$confirm('确认已收到商品吗？', '确认收货', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      })
        .then(async () => {
          try {
            await orderApi.confirmReceive({ id: this.orderDetail.id })
            this.$message.success('已确认收货')
            // 刷新订单详情
            this.getOrderDetail()
          } catch (error) {
            this.$message.error('确认收货失败，请稍后重试')
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    },

    // 处理退款申请
    handleRefundService() {
      this.$message.info('退款申请功能开发中...')
    },

    // 处理再次购买
    handleRebuy() {
      this.$message.info('再次购买功能开发中...')
      // 实际项目中这里应该将商品加入购物车
    },

    // 返回订单列表
    goBack() {
      this.$router.push('/layout/personal/order/list')
    },
    handleClose() {
      this.payDialogVisible = false
      this.qrFlag = false
      if (this.timer !== null) {
        clearInterval(this.timer)
      }
      this.paySuccessMessageLock = false
      this.getOrderList()
    },
    verifyPay(id) {
      let that = this
      this.timer = setInterval(() => {
        orderApi.listenPay(id).then(res => {
          if (res.data == 0) {
            if (!this.paySuccessMessageLock) {
              this.paySuccessMessageLock = true
              this.$message({
                type: 'success',
                message: '支付成功',
                onClose: () => {
                  this.handleClose()
                },
              })
            }
          }
        })
      }, 1000)
    },
  },
}
</script>

<style scoped lang="less">
.order-info-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-basic-info {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;

  .order-main-info {
    display: flex;
    margin-bottom: 15px;

    .order-number,
    .order-status {
      margin-right: 40px;

      .label {
        color: #606266;
        margin-right: 8px;
      }

      .value {
        color: #303133;
        font-weight: 500;
      }
    }

    .order-status .value {
      color: #409eff;
    }
  }

  .order-date-info {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 15px;

    div {
      margin-right: 40px;
      margin-bottom: 10px;

      .label {
        color: #606266;
        margin-right: 8px;
      }

      .value {
        color: #303133;
      }
    }
  }

  .order-payment-info {
    display: flex;

    div {
      margin-right: 40px;

      .label {
        color: #606266;
        margin-right: 8px;
      }

      .value {
        color: #303133;
      }

      &.pay-amount .value {
        color: #f56c6c;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
}

.shipping-info,
.order-products,
.order-note {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 20px;

  .section-title {
    padding: 15px 20px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 500;
    color: #303133;
  }

  .address-content,
  .products-list,
  .note-content {
    padding: 20px;
  }
}

.shipping-info {
  .address-content {
    .receiver-info {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .receiver-name {
        margin-right: 20px;
        color: #303133;
      }

      .phone-container {
        display: flex;
        align-items: center;

        .receiver-phone {
          color: #303133;
        }

        .eye-icon {
          margin-left: 8px;
          width: 16px;
          height: 16px;
          cursor: pointer;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23909399" d="M8 2C3.35 2 0 5.35 0 8s3.35 6 8 6 8-3.35 8-6-3.35-6-8-6zm0 11C4.18 13 1 10.15 1 8s3.18-5 7-5 7 2.85 7 5-3.18 5-7 5zm0-3c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>');
          background-repeat: no-repeat;
          background-size: cover;

          &.show {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="%23409eff" d="M8 2C3.35 2 0 5.35 0 8s3.35 6 8 6 8-3.35 8-6-3.35-6-8-6zm0 11C4.18 13 1 10.15 1 8s3.18-5 7-5 7 2.85 7 5-3.18 5-7 5zm0-3c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>');
          }
        }
      }
    }

    .address-text {
      color: #606266;
      line-height: 1.5;
    }
  }
}

.order-products {
  .products-list {
    .product-item {
      display: flex;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      .product-image {
        width: 80px;
        height: 80px;
        margin-right: 15px;

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
          margin-bottom: 5px;
        }

        .product-price-quantity {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            color: #f56c6c;
            font-weight: 500;
          }

          .quantity {
            color: #909399;
          }
        }
      }
    }
  }
}

.order-note {
  .note-content {
    color: #303133;
    line-height: 1.5;
  }
}

.order-actions {
  margin-top: 20px;
  text-align: right;

  button {
    margin-left: 10px;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-info-container {
    padding: 10px;
  }

  .order-basic-info {
    .order-main-info,
    .order-date-info,
    .order-payment-info {
      flex-direction: column;

      div {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  }

  .order-actions {
    text-align: center;

    button {
      margin-bottom: 10px;
    }
  }
}
</style>
