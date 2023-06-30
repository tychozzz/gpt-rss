<template>
  <div class="container">
    <!-- 搜索框 -->
    <van-search class="search-box" v-model="keyword" placeholder="搜索 AI 技术文章" shape="round" show-action @search="onSearch"
      @cancel="onCancle">

    </van-search>

    <!-- 左侧筛选框 -->
    <van-popup v-model:show="showPopup" class="my-popup" position="left">
      <van-cell-group title="发布时间">
        <template #title>
          <div class="title-box"><van-icon name="underway-o" />发布时间</div>
        </template>
        <van-cell v-for="(item, index) in ranges" :key="index" :title="item.title" is-link @click="handleFilter(item)" />
      </van-cell-group>
      <van-cell-group title="文章来源">
        <template #title>
          <div class="title-box"><van-icon name="records" />文章来源</div>
        </template>
        <van-cell v-for="(item, index) in rss" :key="index" :title="item.title" is-link @click="handleFilter(item)" />
      </van-cell-group>
      <van-cell-group title="文章分类">
        <template #title>
          <div class="title-box"><van-icon name="bar-chart-o" />文章分类</div>
        </template>
        <van-cell v-for="(item, index) in tags" :key="index" :title="item.tag" is-link @click="handleFilter(item)" />
      </van-cell-group>
    </van-popup>

    <!-- 固定右侧 -->
    <div class="tip-box">
      <van-icon class="tip-icon" name="bars" @click="doShowPopup" />
      <van-icon class="tip-icon" name="https://lty-image-bed.oss-cn-shenzhen.aliyuncs.com/blog/Github.svg" @click="gotoGithub"/>
      <van-icon class="tip-icon" name="arrow-up" @click="toTop" />
    </div>

    <!-- 文章列表 -->
    <div class="article-box" v-infinite-scroll="loadMore" :infinite-scroll-immediate-check="false"
      :infinite-scroll-disabled="scrollDisabled" :infinite-scroll-watch-disabled="scrollDisabled" infinite-scroll-distance="20">
      <!-- 未搜到文章时的提示 -->
      <div class="empty" v-if="isLoad && !displayedArticleList.length">
        <van-icon name="info-o" class="icon" />
        <div style="margin-top: 1rem;">没有搜索到文章，换个关键词试试</div>
        <div style="margin-top: .5rem;">或者手动筛选～</div>
      </div>

      <van-cell-group>
        <van-cell v-for="(item, index) in currentArticleList" :key="index" :title="item.title" is-link :url="item.link">
          <template #title>
            <div v-html="item.title"></div>
          </template>
          <template #label>
            <div>{{ item.date }}<span style="margin-left: .625rem;">{{ item.author }}</span></div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-loading style="margin-top: 1.25rem; display: flex; justify-content: center; align-items: center;" v-if="currentArticleList.length && !scrollDisabled && isLoad">加载中...</van-loading>
      <van-divider v-if="currentArticleList.length && scrollDisabled">没有更多了~</van-divider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import links from '../../data/links.json'
import rss from '../../data/rss.json'
import tags from '../../data/tags.json'
import dayjs from 'dayjs'
import { renderToSimpleStream } from 'vue/server-renderer'
import { match } from 'assert'

interface Article {
  title: string;
  link: string;
  date: string;
  author?: string;
}

interface Tag {
  tag: string;
  filename: string;
  keywords: string;
}

const articleList = ref<Article[]>([])

const TODAY = dayjs().format('YYYY-MM-DD')
const ranges = [{
  title: '今天',
  dates: TODAY
}, {
  title: '最近两天',
  dates: [dayjs().subtract(2, 'days').format('YYYY-MM-DD'), TODAY]
}, {
  title: '最近一周',
  dates: [dayjs().subtract(7, 'days').format('YYYY-MM-DD'), TODAY]
}, {
  title: '最近一月',
  dates: [dayjs().subtract(31, 'days').format('YYYY-MM-DD'), TODAY]
}]

const keyword = ref<string>("")

const displayedArticleList = ref<Article[]>([])

const currentArticleList = ref<Article[]>([])

const router = useRouter()

const showPopup = ref<boolean>(false)

const isLoad = ref<boolean>(false)

const onSearch = () => {
  console.log(keyword.value)
  handleSearch()
}

const onCancle = () => {
  console.log(keyword.value)
  keyword.value = ''
  handleSearch()
}

const handleFilter = (item: any) => {
  console.log(item)
  let label = ''
  if (item.dates) {
    label = '[时间] ' + item.title
  } else if (item.tag) {
    label = '[分类] ' + item.tag
  } else if (item.rss) {
    label = '[来源] ' + item.title
  }

  if (typeof item === 'string') {
    keyword.value = item
  } else {
    keyword.value = label
  }
  handleSearch()
  showPopup.value = false
}

const handleSearch = () => {
  displayedArticleList.value = []
  router.replace({
    path: '/',
    query: keyword.value ? { k: keyword.value } : {}
  })
  if (keyword.value) {
    const matches = keyword.value.match(/^\[(时间|来源|分类)\]\s(.+)/)
    const matchValue = matches && matches[2] ? matches && matches[2] : ""
    if (matches && datesMap.get(matchValue)) {
      displayedArticleList.value = datesMap.get(matchValue) || []
    } else if (matches && rssMap[matchValue]) {
      displayedArticleList.value = rssMap[matchValue]
    } else if (matches && tagsMap.get(matchValue)) {
      displayedArticleList.value = tagsMap.get(matchValue) || []
    } else {
      // eslint-disable-next-line
      let reg = new RegExp('(' + keyword.value.replace(/([?\[\]])/g, '\\$1') + ')', 'gi')
      articleList.value.forEach((item) => {
        if (reg && reg.test(item.title)) {
          displayedArticleList.value.push({
            link: item.link,
            date: item.date,
            title: item.title.replace(reg, `<span style="color: #f44336">$1</span>`),
            author: item.author
          })
        }
      })
      console.log(displayedArticleList.value)
    }
  } else {
    displayedArticleList.value = articleList.value
    console.log(displayedArticleList.value)
  }
  toTop()
  pageNo.value = 1
  console.log("displayedList", displayedArticleList.value)
  loadMore()
}

const toTop = () => {
  window.scrollTo(0, 0)
}

const gotoGithub = () => {
  window.location.href = "https://github.com/ltyzzzxxx/gpt-rss"
}

const doShowPopup = () => {
  showPopup.value = true
}

let datesMap: Map<string, Article[]> = new Map<string, Article[]>();
let rssMap: any = {}
let tagsMap: Map<string, Article[]> = new Map<string, Article[]>();

const loadData = async () => {
  console.log(links)
  links.forEach((source) => {
    rssMap[source.title] = source.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    source.items.forEach((item) => {
      articleList.value.push({
        title: item.title,
        link: item.link,
        date: item.date,
        author: source.title
      })

      let isInTag = false
      tags.forEach((tagItem: Tag) => {
        if (tagItem.keywords && (new RegExp(tagItem.keywords, 'gi')).test(item.title)) {
          isInTag = true
          if (!tagsMap.get(tagItem.tag)) {
            tagsMap.set(tagItem.tag, [])
          }
          tagsMap.get(tagItem.tag)?.push({ ...item, author: source.title })
          tagsMap.set(tagItem.tag, tagsMap.get(tagItem.tag)?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [])
        }
      })
      if (!isInTag) {
        if (!tagsMap.get('其它')) {
          tagsMap.set('其它', [])
        }
        tagsMap.get('其它')?.push({ ...item, author: source.title })
        tagsMap.set('其它', tagsMap.get('其它')?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [])
      }
      ranges.forEach((rangeItem) => {
        const dates = rangeItem.dates

        if ((typeof dates === 'string' && item.date === dates) || (typeof dates !== 'string' && item.date >= dates[0] && item.date <= dates[1])) {
          if (!datesMap.get(rangeItem.title)) {
            tagsMap.set(rangeItem.title, [])
          }
          datesMap.get(rangeItem.title)?.push({ ...item, author: source.title })
          datesMap.set(rangeItem.title, datesMap.get(rangeItem.title)?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [])
        }
      })
    })
  })
  articleList.value = articleList.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  isLoad.value = true
}

const scrollDisabled = computed(() => {
  const displayedLen = displayedArticleList.value.length
  const currentLen = currentArticleList.value.length
  return (currentLen && currentArticleList.value[currentLen - 1].link === displayedArticleList.value[displayedLen - 1].link) ? true : false
})

const pageSize = ref<number>(20)
const pageNo = ref<number>(1)

const loadMore = () => {
  console.log("执行 loadMore")
  if (scrollDisabled.value) {
    console.log("加载完成")
  } else {
    console.log("loadMore...")
    currentArticleList.value = displayedArticleList.value.slice(0, pageNo.value * pageSize.value)
    pageNo.value += 1
  }
}

onMounted(() => {
  // 加载数据
  const { k } = router.currentRoute.value.query
  if (typeof k === 'string') {
    keyword.value = k;
  }
  loadData().then(() => handleSearch())
})
</script>

<style scoped>
.container {
  width: 50%;
  margin: 0 auto;
}

.search-box {
  position: fixed;
  width: 100%;
  z-index: 9;
  margin: 0 auto;
  padding: .625rem;
  box-shadow: 0 .125rem .625rem 0 #f0f0f0
}

.article-box {
  padding: 4.375rem 0 .375rem;
  background: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  position: relative
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

.tip-box {
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 3.25rem;
  right: 5%;
  z-index: 9
}

.tip-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 2rem;
  cursor: pointer;
  background-color: #f8f8f8;
  margin-top: 1rem;
}

.tip-icon:hover {
  background-color: #f5f5f5
}


.title-box .van-icon {
  font-size: 1.125rem;
  vertical-align: middle;
  margin-right: .375rem;
  position: relative;
  top: -.125rem
}


.van-cell {
  color: #262626;
  text-align: left;
  cursor: pointer
}

.van-cell:active,
.van-cell:hover {
  background: #f7f8fa
}

.my-popup {
  width: 100%;
}

@media screen and (min-width: 800px) {
  .van-cell {
    font-size: 1rem;
  }

  .tip-box {
    right: 22%;
  }

  .tip-icon {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.5rem
  }

  .search-box {
    width: 50%;
  }
}

@media screen and (max-width: 800px) {
  .container {
    width: 100%;
    margin: 0 auto
  }
}
</style>