<template>
  <div class="order-list-container">
    <el-card>
      <div slot="header" class="card-header">
        <h2>我的订单</h2>
      </div>

      <!-- 订单状态Tab -->
      <div class="order-status-tabs">
        <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
          <el-tab-pane label="全部订单" name="-1"></el-tab-pane>
          <el-tab-pane label="待支付" name="0"></el-tab-pane>
          <el-tab-pane label="待发货" name="1"></el-tab-pane>
          <el-tab-pane label="待收货" name="2"></el-tab-pane>
          <el-tab-pane label="已完成" name="3"></el-tab-pane>
          <el-tab-pane label="已关闭" name="4"></el-tab-pane>
        </el-tabs>
      </div>

      <!-- 订单列表 -->
      <div class="order-list" v-loading="loading">
        <div v-if="orderList.length > 0" class="order-items">
          <div v-for="order in orderList" :key="order.id" class="order-item" element-loading-text="正在加载订单信息...">
            <!-- 订单头部信息 -->
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单编号：{{ order.orderNo }}</span>
                <span class="order-time">下单时间：{{ order.createTime }}</span>
                <span class="order-status">{{ getOrderStatusText(order.orderStatus) }}</span>
              </div>
              <div class="order-amount">
                <span class="amount-label">实付金额：</span>
                <span class="amount-value">¥{{ formatPrice(order.payAmount) }}</span>
              </div>
            </div>

            <!-- 订单商品列表 -->
            <div class="order-products">
              <div v-for="item in order.orderItemList" :key="item.id" class="product-item">
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

            <!-- 订单收货信息 -->
            <!-- <div class="order-shipping">
              <div class="shipping-label">收货信息：</div>
              <div class="shipping-info">
                <span class="receiver-name">{{ order.receiverName }}</span>
                <span class="receiver-phone">{{ order.receiverPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</span>
                <span class="receiver-address">
                  {{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverCounty }}{{ order.receiverDetailAddress }}
                </span>
              </div>
            </div> -->

            <!-- 订单操作按钮 -->
            <div class="order-actions">
              <el-button v-if="order.orderStatus === 0" type="primary" @click="handlePay(order)"> 立即支付 </el-button>
              <el-button v-if="order.orderStatus === 0" type="info" @click="handleCancel(order)"> 取消订单 </el-button>
              <el-button v-if="order.orderStatus === 2" type="success" @click="handleConfirmReceive(order)"> 确认收货 </el-button>
              <el-button v-if="[1, 2].includes(order.orderStatus)" type="text" @click="handleRefundService(order)"> 退款申请 </el-button>
              <!-- <el-button v-if="order.orderStatus === 3" type="text" @click="handleRebuy(order)"> 再次购买 </el-button> -->
              <el-button type="text" @click="handleOrderDetail(order)"> 订单详情 </el-button>
            </div>
          </div>
        </div>

        <!-- 无订单情况 -->
        <el-empty v-else description="暂无订单信息"></el-empty>
      </div>

      <!-- 分页组件 -->
      <div v-if="orderList.length > 0" class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"></el-pagination>
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
  name: 'OrderList',
  data() {
    return {
      loading: false,
      activeTab: '-1', // 默认显示全部订单
      orderList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      orderStatus: -1, // -1表示全部订单
      orderStatusMap: {
        0: '待支付',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已关闭',
        5: '已关闭',
      },
      qrFlag: false,
      qrUrl: '',
      paySuccessMessageLock: false,
    }
  },
  created() {
    this.getOrderList()
  },
  beforeDestroy() {
    if (this.timer !== null) {
      clearInterval(this.timer)
    }
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      this.loading = true
      try {
        const params = {
          orderStatus: this.orderStatus == -1 ? null : this.orderStatus,
          page: this.currentPage,
          size: this.pageSize,
        }
        const res = await orderApi.query(params)
        this.orderList = res.data.list
        this.total = res.data.total
      } catch (error) {
        this.$message.error('获取订单列表失败，请稍后重试')
        console.error('获取订单列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 处理Tab点击事件
    handleTabClick(tab) {
      this.orderStatus = parseInt(tab.name)
      this.currentPage = 1 // 切换Tab时回到第一页
      this.getOrderList()
    },

    // 处理分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getOrderList()
    },

    // 处理页码变化
    handleCurrentChange(current) {
      this.currentPage = current
      this.getOrderList()
    },

    // 格式化价格（分转元）
    formatPrice(price) {
      return formatPrice(price)
    },

    // 获取订单状态文本
    getOrderStatusText(status) {
      return this.orderStatusMap[status] || '未知状态'
    },

    // 处理支付操作
    handlePay(order) {
      this.qrUrl = fsConstant.qrCodeUrl + order.id
      this.qrFlag = true
      this.payDialogVisible = true
      this.verifyPay(order.id)
    },

    // 处理取消订单
    handleCancel(order) {
      this.$confirm('确定要取消该订单吗？', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            await orderApi.cancel({ id: order.id })
            this.$message.success('订单已取消')
            this.getOrderList()
          } catch (error) {
            this.$message.error('取消订单失败，请稍后重试')
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    },

    // 处理确认收货
    handleConfirmReceive(order) {
      this.$confirm('确认已收到商品吗？', '确认收货', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      })
        .then(async () => {
          try {
            await orderApi.confirmReceive({ id: order.id })
            this.$message.success('已确认收货')
            this.getOrderList()
          } catch (error) {
            this.$message.error('确认收货失败，请稍后重试')
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    },

    // 处理退款申请
    handleRefundService(order) {
      this.$message.info('退款申请功能开发中...')
    },

    // 处理再次购买
    handleRebuy(order) {
      this.$message.info('再次购买功能开发中...')
      // 实际项目中这里应该将商品加入购物车
    },

    // 处理查看订单详情
    handleOrderDetail(order) {
      this.$message.info('订单详情功能开发中...')
      // 实际项目中这里应该跳转到订单详情页面
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
.order-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status-tabs {
  margin-bottom: 20px;
}

.order-list {
  .order-item {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-bottom: 20px;
    overflow: hidden;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #f5f7fa;

      .order-info {
        display: flex;
        align-items: center;

        .order-no,
        .order-time {
          margin-right: 20px;
          color: #606266;
        }

        .order-status {
          color: #409eff;
          font-weight: 500;
        }
      }

      .order-amount {
        .amount-label {
          color: #606266;
        }

        .amount-value {
          font-size: 18px;
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }

    .order-products {
      padding: 15px 20px;
      border-bottom: 1px solid #e4e7ed;

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

    .order-shipping {
      padding: 15px 20px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      align-items: center;

      .shipping-label {
        color: #606266;
        margin-right: 10px;
      }

      .shipping-info {
        color: #303133;

        .receiver-name,
        .receiver-phone {
          margin-right: 20px;
        }
      }
    }

    .order-actions {
      padding: 15px 20px;
      display: flex;
      justify-content: flex-end;

      button {
        margin-left: 10px;
      }
    }
  }
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-list-container {
    padding: 10px;
  }

  .order-item {
    .order-header {
      flex-direction: column;
      align-items: flex-start;

      .order-info {
        margin-bottom: 10px;
        flex-wrap: wrap;

        .order-no,
        .order-time {
          margin-bottom: 5px;
        }
      }
    }

    .order-shipping {
      flex-direction: column;
      align-items: flex-start;

      .shipping-label {
        margin-bottom: 5px;
      }
    }

    .order-actions {
      flex-wrap: wrap;
      justify-content: center;

      button {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
