<template>
  <div class="search-container">
    <div class="category-box">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="全部" name="all"> </el-tab-pane>
        <el-tab-pane v-for="item in categoryList" :key="item.id" :label="item.categoryName" :name="item.categoryName">
        </el-tab-pane>
        <el-tab-pane label="品牌" name="brand"> </el-tab-pane>
      </el-tabs>
      <div class="category-brand-list">
        <div class="sub-category-row">
          <span
            v-for="item in configButtons"
            :key="item.id"
            :class="{ active: activeSubCategory === item.categoryName }"
            @click="switchSubCategory(item)"
            >{{ item.categoryName }}</span
          >
        </div>
      </div>
    </div>
    <div class="filter-bar">
      <div class="filters">
        <span :class="{ active: sortType === 'new' }" @click="toggleNewSort">
          上新
          <div style="display: flex; flex-direction: column; color: #bbb">
            <i :class="{ active: sortType === 'new' && newAsc === true }">▲</i>
            <i :class="{ active: sortType === 'new' && newAsc === false }">▼</i>
          </div>
        </span>
        <span :class="{ active: sortType === 'price' }" @click="togglePriceSort">
          价格
          <div style="display: flex; flex-direction: column; color: #bbb">
            <i :class="{ active: sortType === 'price' && priceSortAsc === true }">▲</i>
            <i :class="{ active: sortType === 'price' && priceSortAsc === false }">▼</i>
          </div>
        </span>
        <span @click="resetSort"> 重置 </span>
      </div>
      <div class="results-count">共{{ total }}个商品</div>
    </div>
    <div v-loading="loading">
      <div class="product-grid" v-if="productList.length > 0">
        <product-card
          v-for="product in productList"
          :key="product.id"
          :product="product"
          @click="handleProductClick(product)"
        />
      </div>
      <el-empty v-else description="暂无商品"></el-empty>
    </div>
    <div class="page-box">
      <el-pagination
      :hide-on-single-page="true"
        :small="true"
        :current-page.sync="queryForm.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="queryForm.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import categoryApi from '@/api/category'
import brandApi from '@/api/brand'
import productApi from '@/api/product'
import ProductCard from '@/components/productCard/index.vue'
import { EventBus } from '@/utils/event-bus'

export default {
  components: {
    // 注册组件
    ProductCard,
  },
  data() {
    return {
      activeName: 'all',
      categoryList: [],
      allCategoryList: [],
      brandList: [],
      // 配置管理标签页的按钮数据
      configButtons: [],
      activeSubCategory: '',
      showMoreSubCategories: false,
      sortType: '',
      total: 0,
      queryForm: {
        brandId: null,
        category: null,
        productName: null,
        sort: 0,
        page: 1,
        size: 20,
      },
      priceSortAsc: false,
      newAsc: false,
      productList: [],
      loading: false,
    }
  },
  mounted() {
    // 监听搜索事件
    EventBus.$on('search', (keyword) => {
      this.queryForm.productName = keyword
      this.queryProduct()
    })
  },
  created() {
    this.initCategory()
    this.initBrand()
    this.queryProduct()
  },
  computed: {},
  methods: {
    initCategory() {
      categoryApi.all().then((res) => {
        this.categoryList = res.data || []
        res.data.forEach((item) => {
          this.allCategoryList.push(item.children)
        })
        if (this.allCategoryList.length > 20) {
          this.configButtons = this.allCategoryList.slice(0, 20)
        } else {
          this.configButtons = this.allCategoryList.flat()
        }
      })
    },
    initBrand() {
      brandApi.all().then((res) => {
        this.brandList = res.data || []
      })
    },
    queryProduct() {
      if (this.sortType === 'price') {
        this.queryForm.sort = this.priceSortAsc ? 3 : 4
      } else if (this.sortType === 'new') {
        this.queryForm.sort = this.newAsc ? 2 : 1
      } else {
        this.queryForm.sort = 0
      }
      if (this.$route.query.productName) {
        this.queryForm.productName = this.$route.query.productName
      }
      this.loading = true
      productApi.queryProduct(this.queryForm).then((res) => {
        this.productList = res.data.list || []
        this.total = res.data.total || 0
        this.loading = false
      })
    },
    handleClick(tab, event) {
      console.log(tab, event)
      if (tab.name === 'brand') {
        this.activeSubCategory = ''
        this.configButtons = this.brandList.map((item) => ({
          id: item.id,
          categoryName: item.brandName,
        }))
      } else if (tab.name === 'all') {
        EventBus.$emit('clearSearchText')
        this.configButtons = this.allCategoryList.flat()
        this.activeSubCategory = ''
        this.queryForm.brandId = null
        this.queryForm.productName = null
        this.queryForm.category = null
        this.queryForm.page = 1
        this.queryForm.sort = 0
        this.queryProduct()
      } else {
        this.configButtons = this.categoryList.filter((item) => item.categoryName === tab.name)[0].children.flat()
        this.activeSubCategory = ''
      }
    },
    switchSubCategory(item) {
      console.log(item)
      EventBus.$emit('clearSearchText')
      this.activeSubCategory = item.categoryName
      // TODO query product by category  activeName==brand 则查询品牌下的商品
      if (this.activeName === 'brand') {
        this.queryForm.brandId = item.id
        this.queryForm.productName = null
        this.queryForm.category = null
      } else {
        this.queryForm.category = item.id
        this.queryForm.productName = null
        this.queryForm.brandId = null
      }
      this.queryForm.page = 1
      this.queryProduct()
    },
    togglePriceSort() {
      this.sortType = 'price'
      this.priceSortAsc = !this.priceSortAsc
      this.queryProduct()
    },
    toggleNewSort() {
      this.sortType = 'new'
      this.newAsc = !this.newAsc
      this.queryProduct()
    },
    resetSort() {
      this.sortType = ''
      this.priceSortAsc = false
      this.newAsc = false
      this.queryProduct()
    },
    handleProductClick(product) {
      console.log(product)
    },
    handleSizeChange(val) {
      this.queryForm.size = val
      this.queryProduct()
    },
    handleCurrentChange(val) {
      this.queryForm.page = val
      this.queryProduct()
    },
  },
  beforeDestroy() {
    EventBus.$off('search')
  },
}
</script>

<style scoped lang="less">
.search-container {
  width: 100%;
  .category-brand-list {
    margin-top: 15px;
    .sub-category-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px 30px;
      margin-bottom: 15px;
      span {
        color: #666;
        cursor: pointer;
        font-size: 14px;
        padding: 3px 0;
        &.active {
          color: #165dff;
          font-weight: 500;
        }
      }
    }
  }
  .filter-bar {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px 0;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    .filters {
      display: flex;
      gap: 20px;
      span {
        color: #bbb;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        i {
          margin-left: 5px;
          font-style: normal;
          font-size: 8px;
          &.active {
            color: #165dff;
            font-weight: 500;
          }
        }
        &.active {
          color: #165dff;
          font-weight: 500;
        }
      }
    }
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px; // 增加间距
  }
  .page-box {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
