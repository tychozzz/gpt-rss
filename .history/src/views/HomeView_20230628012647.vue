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

}

onMounted(() => {
  // 加载
  const { k } = router.currentRoute.value.query
  console.log(k)
  handleSearch()
})
</script>

<template>
  <div class="container">
    <!-- 搜索框 -->
    <van-search v-model="keyword" placeholder="搜索 AI 技术文章" show-action @search="onSearch" @clear="onClear">

    </van-search>

    <!-- 未搜到文章时的提示 -->
    <div class="empty">
      <van-icon name="info-o" class="icon" />
      <div style="margin-top: 1rem;">没有搜索到文章，换个关键词试试</div>
      <div style="margin-top: .5rem;">或者手动筛选～</div>
    </div>

    <!-- 文章列表 -->

  </div>
</template>

<style scoped>
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