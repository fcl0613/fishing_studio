<template>
  <div class="after-sales-container">
    <el-card>
      <div slot="header" class="card-header">
        <h2>退款售后订单</h2>
      </div>

      <!-- 售后订单列表 -->
      <div class="after-sales-list" v-loading="loading" element-loading-text="正在加载售后订单信息...">
        <div v-if="afterSalesList.length > 0" class="order-items">
          <div v-for="order in afterSalesList" :key="order.id" class="order-item">
            <!-- 订单头部信息 -->
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单编号：{{ order.orderNo }}</span>
                <span class="order-status">{{ getOrderStatusText(order.orderStatus) }}</span>
                <span class="order-time">申请时间：{{ order.createTime }}</span>
                <span class="issue-status" :class="getIssueStatusClass(order.issueStatus)">
                  {{ getIssueStatusText(order.issueStatus) }}
                </span>
              </div>
              <div class="order-amount">
                <span class="amount-label">申请金额：</span>
                <span class="amount-value">¥{{ formatPrice(order.payAmount) }}</span>
              </div>
            </div>

            <!-- 订单商品列表 -->
            <div class="order-products">
              <div v-for="item in order.orderItemList" :key="item.itemId" class="product-item">
                <div class="product-info">
                  <div class="product-name">{{ item.productName }}</div>
                  <div class="product-price-quantity">
                    <span class="price">¥{{ formatPrice(item.price) }}</span>
                    <span class="quantity">x{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单收货信息 -->
            <div class="order-shipping">
              <div class="shipping-label">收货信息：</div>
              <div class="shipping-info">
                <span class="receiver-name">{{ order.receiverName }}</span>
                <span class="receiver-phone">{{ formatPhone(order.receiverPhone) }}</span>
                <span class="receiver-address">
                  {{ order.receiverProvince }}{{ order.receiverCity }}{{ order.receiverCounty }}{{ order.receiverDetailAddress }}
                </span>
              </div>
            </div>

            <!-- 订单操作按钮 -->
            <div class="order-actions">
              <el-button v-if="order.issueStatus === 0" type="warning" @click="handleCancelAfterSales(order)"> 取消申请 </el-button>
              <el-button type="primary" @click="handleViewDetail(order)"> 查看申请详情 </el-button>
              <el-button type="info" @click="handleViewOrderDetail(order)"> 查看订单详情 </el-button>
            </div>
          </div>
        </div>

        <!-- 无订单情况 -->
        <el-empty v-else description="暂无退款售后订单信息"></el-empty>
      </div>

      <!-- 分页组件 -->
      <div v-if="afterSalesList.length > 0" class="pagination">
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

    <!-- 申请详情对话框 -->
    <el-dialog title="申请详情" :visible.sync="detailDialogVisible" width="500px" :close-on-click-modal="false">
      <div class="detail-info">
        <div class="detail-item">
          <span class="detail-label">订单编号：</span>
          <span class="detail-value">{{ detailInfo.orderNo }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请类型：</span>
          <span class="detail-value">{{ detailInfo.applyType === 1 ? '仅退款' : '退款退货' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请原因：</span>
          <span class="detail-value">{{ detailInfo.applyReason }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请状态：</span>
          <span class="detail-value">{{ getIssueStatusText(detailInfo.applyStatus) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">申请时间：</span>
          <span class="detail-value">{{ detailInfo.createTime }}</span>
        </div>
        <div v-if="detailInfo.finishTime" class="detail-item">
          <span class="detail-label">完成时间：</span>
          <span class="detail-value">{{ detailInfo.finishTime }}</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import orderApi from '@/api/order'
import { formatPrice } from '@/utils/priceUtil'

export default {
  name: 'AfterSales',
  data() {
    return {
      loading: false,
      afterSalesList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      // 订单状态映射
      orderStatusMap: {
        0: '待支付',
        1: '待发货',
        2: '待收货',
        3: '已完成',
        4: '已关闭',
        5: '已关闭',
      },
      // 售后状态映射
      issueStatusMap: {
        0: '待处理',
        1: '已完成',
        2: '已取消',
        3: '商家拒绝',
      },
      // 详情对话框
      detailDialogVisible: false,
      detailInfo: {},
    }
  },
  created() {
    this.getAfterSalesList()
  },
  methods: {
    // 获取售后订单列表
    async getAfterSalesList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
        }
        const res = await orderApi.afterSalesQuery(params)
        this.afterSalesList = res.data.list
        this.total = res.data.total
      } catch (error) {
        this.$message.error('获取售后订单列表失败，请稍后重试')
        console.error('获取售后订单列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 处理分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getAfterSalesList()
    },

    // 处理页码变化
    handleCurrentChange(current) {
      this.currentPage = current
      this.getAfterSalesList()
    },

    // 格式化价格（分转元）
    formatPrice(price) {
      return formatPrice(price)
    },

    // 格式化电话号码（隐藏中间四位）
    formatPhone(phone) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },

    // 获取订单状态文本
    getOrderStatusText(status) {
      return this.orderStatusMap[status] || '未知状态'
    },

    // 获取售后状态文本
    getIssueStatusText(status) {
      return this.issueStatusMap[status] || '未知状态'
    },

    // 获取售后状态样式类
    getIssueStatusClass(status) {
      switch (status) {
        case 0:
          return 'status-pending'
        case 1:
          return 'status-completed'
        case 2:
          return 'status-canceled'
        case 3:
          return 'status-rejected'
        default:
          return ''
      }
    },

    // 查看申请详情
    async handleViewDetail(order) {
      this.detailDialogVisible = true
      try {
        const res = await orderApi.afterSalesInfo({ id: order.id })
        this.detailInfo = res.data
      } catch (error) {
        this.$message.error('获取申请详情失败，请稍后重试')
        console.error('获取申请详情失败:', error)
      }
    },

    // 查看订单详情
    handleViewOrderDetail(order) {
      this.$router.push(`/layout/personal/order/info/${order.orderId}`)
    },

    // 取消售后申请
    handleCancelAfterSales(order) {
      this.$confirm('确定要取消该售后申请吗？', '取消申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          try {
            await orderApi.afterSalesCancel({ id: order.id })
            this.$message.success('售后申请已取消')
            this.getAfterSalesList()
          } catch (error) {
            this.$message.error('取消申请失败，请稍后重试')
          }
        })
        .catch(() => {
          // 用户取消操作
        })
    },
  },
}
</script>

<style scoped lang="less">
.after-sales-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.after-sales-list {
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
        flex-wrap: wrap;

        .order-no,
        .order-time {
          margin-right: 20px;
          color: #606266;
          margin-bottom: 5px;
        }

        .order-status {
          margin-right: 20px;
          color: #409eff;
          font-weight: 500;
          margin-bottom: 5px;
        }

        .issue-status {
          font-weight: 500;
          margin-bottom: 5px;

          &.status-pending {
            color: #e6a23c;
          }

          &.status-completed {
            color: #67c23a;
          }

          &.status-canceled {
            color: #909399;
          }

          &.status-rejected {
            color: #f56c6c;
          }
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
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px dashed #ebeef5;

        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
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
          }

          .product-price-quantity {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .price {
              color: #f56c6c;
              font-weight: 500;
              margin-right: 15px;
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
      align-items: flex-start;

      .shipping-label {
        color: #606266;
        margin-right: 10px;
        min-width: 70px;
      }

      .shipping-info {
        color: #303133;
        flex: 1;

        .receiver-name,
        .receiver-phone {
          margin-right: 20px;
          margin-bottom: 5px;
          display: inline-block;
        }

        .receiver-address {
          display: block;
          margin-top: 5px;
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

.detail-info {
  .detail-item {
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;

    .detail-label {
      color: #606266;
      width: 100px;
      text-align: right;
      margin-right: 15px;
      font-weight: 500;
    }

    .detail-value {
      color: #303133;
      flex: 1;
      word-break: break-word;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .after-sales-container {
    padding: 10px;
  }

  .order-item {
    .order-header {
      flex-direction: column;
      align-items: flex-start;

      .order-info {
        margin-bottom: 10px;
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
