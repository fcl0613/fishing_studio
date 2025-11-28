<template>
  <div class="product-card" @click="$emit('click', product)">
    <img :src="product.productCover" alt="商品图片" class="product-img" />
    <div class="product-name" :title="product.productName">{{ product.productName }}</div>
    <div class="product-price">¥{{ conversion(product.showPrice) }}</div>
  </div>
</template>

<script>
import { conversion } from '@/utils/priceUtil'

export default {
  name: 'ProductCard',
  props: {
    // 接收商品数据作为参数
    product: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        productName: '',
        productCover: '',
        showPrice: 0,
      }),
    },
  },
  methods: {
    conversion,
  },
}
</script>

<style scoped lang="less">
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    cursor: pointer;
  }

  .product-img {
    width: 100%;
    height: 200px;
    // object-fit: cover;
    display: block;
  }

  .product-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 10px 15px;
    font-size: 14px;
    color: #333;
  }

  .product-price {
    padding: 0 15px 15px;
    color: #f56c6c;
    font-weight: bold;
    font-size: 16px;
  }
}
</style>
