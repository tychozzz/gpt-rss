<script setup lang="ts">
import { ref } from 'vue'
const keyword = ref("")

const onSearch = () => {
  console.log(keyword.value)
}

const onClear = () => {
  console.log(keyword.value)
}
</script>

<template>
  <div class="container">
    <!-- 搜索框 -->
    <van-search v-model="keyword" placeholder="搜索 AI 技术文章" show-action @search="onSearch" @clear="onClear">

    </van-search>

    <!-- 未搜到文章时的提示 -->
    <div class="empty">
      <van-icon name="info-o" class="icon" style="font-size: 1.125rem; vertical-align: middle; margin-right: .375rem; position: relative; top: -.125rem" />
      <div>没有搜索到文章，换个关键词试试或者手动筛选～</div>
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

}
</style>