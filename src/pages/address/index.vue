<template>
  <div class="address-container">
    <div class="address-header">
      <h2>我的地址</h2>
      <el-button type="primary" @click="openAddAddressDialog" :disabled="addressList.length >= 5 || loading">
        新增地址
      </el-button>
    </div>

    <div class="address-content">
      <!-- 地址列表为空时 -->
      <div v-if="addressList.length === 0 && !loading" class="empty-address">
        <el-empty description="暂无收货地址，点击新增地址" :image-size="120">
          <el-button type="primary" @click="openAddAddressDialog">新增地址</el-button>
        </el-empty>
      </div>

      <!-- 地址列表 -->
      <div v-else class="address-list" v-loading="loading">
        <div
          v-for="address in addressList"
          :key="address.id"
          class="address-item"
          :class="{ 'default-address': address.receiveStatus === 1 }"
        >
          <div class="address-header">
            <div class="address-name-phone">
              <span class="address-name">{{ address.receiveName }}</span>
              <span class="address-phone">{{ address.receivePhone }}</span>
            </div>
            <div class="address-actions">
              <el-button type="text" size="small" @click="openEditAddressDialog(address)" :disabled="loading">
                编辑
              </el-button>
              <el-button type="text" size="small" @click="confirmDeleteAddress(address.id)" :disabled="loading">
                删除
              </el-button>
            </div>
          </div>

          <div class="address-detail">
            <span v-if="address.receiveStatus === 1" class="default-tag">默认</span>
            <span class="address-full">
              {{ address.province }}{{ address.city }}{{ address.county }}{{ address.detailAddress }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 地址编辑对话框 -->
    <el-dialog
      :title="addressDialogTitle"
      :visible.sync="showAddressDialog"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="addressForm" :model="addressForm" :rules="rules" label-width="90px">
        <el-form-item label="收货人" prop="receiveName">
          <el-input v-model="addressForm.receiveName" placeholder="请输入收货人姓名" />
        </el-form-item>

        <el-form-item label="手机号" prop="receivePhone">
          <el-input v-model="addressForm.receivePhone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="地区" required>
          <el-cascader
            placement="bottom"
            :options="areaOptions"
            v-model="areaCode"
            ref="addressCascader"
            @change="addressChoose"
          ></el-cascader>
        </el-form-item>

        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="addressForm.detailAddress" placeholder="请输入详细地址" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="addressForm.receiveStatus" :true-label="1" :false-label="0">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="submitAddressForm" :loading="dialogLoading"> 确定 </el-button>
      </span>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog title="确认删除" :visible.sync="showDeleteConfirm" width="30%" :close-on-click-modal="false">
      <span>确定要删除该地址吗？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDeleteConfirm = false">取消</el-button>
        <el-button type="danger" @click="deleteAddress" :loading="loading"> 确定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  provinceAndCityData,
  regionData,
  provinceAndCityDataPlus,
  regionDataPlus,
  CodeToText,
  TextToCode,
} from 'element-china-area-data'
import addressApi from '@/api/address'

export default {
  data() {
    return {
      addressList: [],
      showAddressDialog: false,
      showDeleteConfirm: false,
      addressDialogTitle: '新增地址',
      currentAddressId: null,
      loading: false,
      dialogLoading: false,
      areaOptions: regionDataPlus, // 省市区数据，实际项目中应从接口获取
      areaCode: [], // [provinceCode, cityCode, countyCode]
      areaName: [],
      addressForm: {
        receiveName: '',
        receivePhone: '',
        province: '',
        provinceCode: '',
        city: '',
        cityCode: '',
        county: '',
        countyCode: '',
        detailAddress: '',
        receiveStatus: 0,
      },
      rules: {
        receiveName: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
        ],
        receivePhone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
        ],
        detailAddress: [
          { required: true, message: '请输入详细地址', trigger: 'blur' },
          { min: 5, max: 100, message: '详细地址长度在 5 到 100 个字符', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getAddressList()
  },
  methods: {
    // 获取地址列表
    async getAddressList() {
      this.loading = true
      try {
        const res = await addressApi.query()
        if (res.code === 0) {
          this.addressList = res.data
        } else {
          this.$message.error(res.msg || '获取地址列表失败')
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
        this.$message.error('获取地址列表失败，请重试')
      } finally {
        this.loading = false
      }
    },

    // 打开新增地址对话框
    openAddAddressDialog() {
      this.addressDialogTitle = '新增地址'
      this.currentAddressId = null
      this.resetAddressForm()
      this.showAddressDialog = true
    },

    // 打开编辑地址对话框
    openEditAddressDialog(address) {
      this.addressDialogTitle = '编辑地址'
      this.currentAddressId = address.id
      this.addressForm = {
        receiveName: address.receiveName,
        receivePhone: address.receivePhone,
        province: address.province,
        provinceCode: address.provinceCode,
        city: address.city,
        cityCode: address.cityCode,
        county: address.county,
        countyCode: address.countyCode,
        detailAddress: address.detailAddress,
        receiveStatus: address.receiveStatus,
      }
      this.areaName = [address.province, address.city, address.county]
      this.areaCode = [address.provinceCode, address.cityCode, address.countyCode]
      this.showAddressDialog = true
    },

    // 重置地址表单
    resetAddressForm() {
      this.addressForm = {
        receiveName: '',
        receivePhone: '',
        province: '',
        provinceCode: '',
        city: '',
        cityCode: '',
        county: '',
        countyCode: '',
        detailAddress: '',
        receiveStatus: 0,
      }
      this.areaCode = []
      this.areaName = []
      if (this.$refs.addressForm) {
        this.$refs.addressForm.resetFields()
      }
    },

    addressChoose() {
      let ref = this.$refs['addressCascader']
      // console.log(ref.getCheckedNodes()[0].pathLabels)
      this.areaName = ref.getCheckedNodes()[0].pathLabels
    },

    // 提交地址表单
    submitAddressForm() {
      this.$refs.addressForm.validate(async (valid) => {
        if (valid) {
          // 验证省市区是否选择完整
          if (this.areaCode.length !== 3 || this.areaName.length !== 3) {
            this.$message.error('请选择完整的省/市/区')
            return
          }

          this.dialogLoading = true
          try {
            this.addressForm.provinceCode = this.areaCode[0]
            this.addressForm.cityCode = this.areaCode[1]
            this.addressForm.countyCode = this.areaCode[2]
            this.addressForm.province = this.areaName[0]
            this.addressForm.city = this.areaName[1]
            this.addressForm.county = this.areaName[2]
            let res
            if (this.currentAddressId) {
              // 修改地址
              this.addressForm.id = this.currentAddressId
              res = await addressApi.update(this.addressForm)
            } else {
              // 新增地址
              res = await addressApi.create(this.addressForm)
            }

            if (res.code === 0) {
              this.$message.success(this.currentAddressId ? '地址修改成功' : '地址新增成功')
              this.showAddressDialog = false
              this.getAddressList()
            } else {
              this.$message.error(res.msg || (this.currentAddressId ? '地址修改失败' : '地址新增失败'))
            }
          } catch (error) {
            console.error('操作地址失败:', error)
            this.$message.error('操作地址失败，请重试')
          } finally {
            this.dialogLoading = false
          }
        } else {
          return false
        }
      })
    },

    // 确认删除地址
    confirmDeleteAddress(addressId) {
      this.currentAddressId = addressId
      this.showDeleteConfirm = true
    },

    // 删除地址
    async deleteAddress() {
      this.loading = true
      try {
        const res = await addressApi.remove({
          id: this.currentAddressId,
        })
        if (res.code === 0) {
          this.$message.success('地址删除成功')
          this.getAddressList()
        } else {
          this.$message.error(res.msg || '地址删除失败')
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        this.$message.error('删除地址失败，请重试')
      } finally {
        this.loading = false
        this.showDeleteConfirm = false
        this.currentAddressId = null
      }
    },

    // 设置默认地址
    async setDefaultAddress(addressId) {
      this.loading = true
      try {
        const res = await addressApi.setDefault({
          id: addressId,
        })
        if (res.code === 0) {
          this.$message.success('设置默认地址成功')
          this.getAddressList()
        } else {
          this.$message.error(res.msg || '设置默认地址失败')
        }
      } catch (error) {
        console.error('设置默认地址失败:', error)
        this.$message.error('设置默认地址失败，请重试')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped lang="less">
.address-container {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  min-height: 100vh;
}

.address-header {
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
    font-weight: 600;
  }
}

.address-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.empty-address {
  padding: 60px 20px;
}

.address-list {
  padding: 20px;
}

.address-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  &.default-address {
    border-color: #409eff;
  }
}

.address-item .address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;

  h2 {
    margin: 0;
    font-size: 16px;
  }
}

.address-name-phone {
  display: flex;
  align-items: center;

  .address-name {
    font-size: 16px;
    color: #333;
    margin-right: 20px;
  }

  .address-phone {
    font-size: 14px;
    color: #666;
  }
}

.address-detail {
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.5;

  .default-tag {
    display: inline-block;
    padding: 2px 6px;
    background-color: #409eff;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    margin-right: 10px;
  }

  .address-full {
    color: #666;
  }
}

.address-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .address-container {
    padding: 10px;
  }

  .address-list {
    padding: 10px;
  }

  .address-item {
    padding: 10px;
    margin-bottom: 10px;
  }

  .address-name-phone {
    flex-direction: column;
    align-items: flex-start;

    .address-name {
      margin-right: 0;
      margin-bottom: 5px;
    }
  }
}
</style>
