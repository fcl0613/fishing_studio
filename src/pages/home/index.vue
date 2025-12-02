<template>
  <div class="home-container">
    <!-- 轮播图部分 -->
    <div class="carousel-container">
      <el-carousel height="400px">
        <el-carousel-item v-for="(item, index) in carouselList" :key="index">
          <img :src="item.bannerUrl" alt="轮播图" class="carousel-img" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 精品推荐区域 -->
    <div class="product-section">
      <h2 class="section-title">精品推荐</h2>
      <div class="product-grid">
        <product-card
          v-for="product in recommendProducts"
          :key="product.id"
          :product="product"
          @click="handleProductClick"
        />
      </div>
    </div>

    <!-- 精品推荐区域 -->
    <div class="product-section">
      <h2 class="section-title">最新上架</h2>
      <div class="product-grid">
        <product-card
          v-for="product in newProducts"
          :key="product.id"
          :product="product"
          @click="handleProductClick(product)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { conversion } from '@/utils/priceUtil'
import frontAPI from '@/api/front'
import ProductCard from '@/components/productCard/index.vue'

export default {
  components: {
    // 注册组件
    ProductCard,
  },
  data() {
    return {
      // 轮播图数据
      carouselList: [],
      // 推荐商品数据
      recommendProducts: [],
      imgPreStuff: '',
      newProducts: [],
    }
  },
  created() {
    this.initBanner()
    this.initRecommendProduct()
    this.initNewProduct()
  },
  methods: {
    conversion,
    async initBanner() {
      const res = await frontAPI.banner()
      this.carouselList = res.data
    },
    async initRecommendProduct() {
      const res = await frontAPI.recommendProduct()
      if (res.data.length > 8) {
        this.recommendProducts = res.data.slice(0, 8)
      } else {
        this.recommendProducts = res.data
      }
    },
    async initNewProduct() {
      const res = await frontAPI.newProduct()
      if (res.data.length > 8) {
        this.newProducts = res.data.slice(0, 8)
      } else {
        this.newProducts = res.data
      }
    },
    handleProductClick(product) {
      this.$router.push({
        path: '/layout/product/' + product.id,
      })
    },
  },
}
</script>

<style scoped lang="less">
.home-container {
  width: 100%;
}

// 轮播图部分
.carousel-container {
  width: 100%;
  margin-bottom: 40px;

  .el-carousel {
    width: 1200px;
    margin: 0 auto; // 轮播图居中
  }

  .carousel-img {
    width: 100%;
    height: 400px;
    object-fit: cover; // 图片自适应填充
  }
}

// 精品推荐区域
.product-section {
  width: 1200px;
  margin: 0 auto 60px; // 整个区域居中

  .section-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #1f6bbb;
    display: inline-block;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px; // 增加间距
  }
}
</style>
