<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const keyword = ref<string>("")

const router = useRouter()

const onSearch = () => {
  console.log(keyword.value)
  handleSearch()
}

const onClear = () => {
  console.log(keyword.value)
  keyword.value = ''
  handleSearch()
}

const handleSearch = () => {
  console.log(keyword.value)
}

onMounted(() => {
  // 加载
  const { k } = router.currentRoute.value.query
  keyword.value = k.toString()
  handleSearch()
})
</script>

<template>
  <div class="container">
    <!-- 搜索框 -->
    <van-search class="search-box" v-model="keyword" placeholder="搜索 AI 技术文章" shape="round" @search="onSearch"
      @clear="onClear">

    </van-search>

    <!-- 未搜到文章时的提示 -->
    <div class="empty">
      <van-icon name="info-o" class="icon" />
      <div style="margin-top: 1rem;">没有搜索到文章，换个关键词试试</div>
      <div style="margin-top: .5rem;">或者手动筛选～</div>
    </div>

    <!-- 文章列表 -->
    <div class="">

    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
}

.search-box {
  position: fixed;
  width: 100%;
  z-index: 9;
  margin: 0 auto;
  padding: .625rem;
  box-shadow: 0 .125rem .625rem 0 #f0f0f0
}

.empty {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 25%
}

.empty .icon {
  color: #007fff;
  font-size: 3.125rem
}
</style>