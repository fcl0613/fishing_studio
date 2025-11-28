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
    <div class="product-grid">
      <product-card v-for="product in productList" :key="product.id" :product="product" @click="handleProductClick(product)" />
    </div>
  </div>
</template>

<script>
import categoryApi from '@/api/category'
import brandApi from '@/api/brand'
import productApi from '@/api/product'
import ProductCard from '@/components/productCard/index.vue'

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
        categoryId: null,
        productName: null,
        sort: 0,
        page: 1,
        size: 20,
      },
      priceSortAsc: true,
      newAsc: true,
      productList: [],
    }
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
      productApi.queryProduct(this.queryForm).then((res) => {
        this.productList = res.data.list || []
        this.total = res.data.total || 0
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
        this.configButtons = this.allCategoryList.flat()
        this.activeSubCategory = ''
      } else {
        this.configButtons = this.categoryList.filter((item) => item.categoryName === tab.name)[0].children.flat()
        this.activeSubCategory = ''
      }
    },
    switchSubCategory(item) {
      console.log(item)
      this.activeSubCategory = item.categoryName
      // TODO query product by category  activeName==brand 则查询品牌下的商品
    },
    togglePriceSort() {
      this.sortType = 'price'
      this.priceSortAsc = !this.priceSortAsc
    },
    toggleNewSort() {
      this.sortType = 'new'
      this.newAsc = !this.newAsc
    },
    resetSort() {
      this.sortType = ''
      this.priceSortAsc = true
      this.newAsc = true
    },
    handleProductClick(product) {
      console.log(product)
    }
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
}
</style>
