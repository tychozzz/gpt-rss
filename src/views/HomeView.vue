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
// const articleList = ref<Article[]>([
//   {
//     "title": "用了一下 AI 代码补全工具，真爽！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615262&idx=1&sn=57000b80f7ea58a79f1cfdce37c300de&chksm=8022a7dfb7552ec97300055eab95571a1fa4d35e597056486975488eecbafc610d9ce7929f56#rd",
//     "date": "2023-06-26",
//     "author": "前端技术"
//   },
//   {
//     "title": "前端正确处理“文字溢出”的思路",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615262&idx=2&sn=e9ca73e56772636c94f7ccfa5571b505&chksm=8022a7dfb7552ec9fd817017fa856c8fd19bf05fe9f35991f9308450256a1af1ec6bd3e353c9#rd",
//     "date": "2023-06-26",
//     "author": "前端技术"
//   },
//   {
//     "title": "前端 UI 框架 Svelte 4 正式发布",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615255&idx=1&sn=c460ea1eb81a7ee0407eb6f7deffc22f&chksm=8022a7d6b7552ec0c3f72c03110cd7ce9b034f19d638585eef1ce31e9d2f741062e33e472e8d#rd",
//     "date": "2023-06-25",
//     "author": "前端技术"
//   },
//   {
//     "title": "我放弃 Axios，改用 Alova",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615255&idx=2&sn=ece864a8781ebbfad252a64dfa81aa3e&chksm=8022a7d6b7552ec08d8073f0fb5bfdb06c152c895d4bb0683177e0d15e6bb2d00482d8073ad3#rd",
//     "date": "2023-06-25",
//     "author": "前端技术"
//   },
//   {
//     "title": "再也不用手动改 package.json 的版本号",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615244&idx=2&sn=d8608c620df274f7fa0e83648cfd3555&chksm=8022a7cdb7552edb028e6d8b7e7ee225a8307ef4a5c538cc90fe15352ccb34b3b3b4a3c6260e#rd",
//     "date": "2023-06-21",
//     "author": "前端技术"
//   },
//   {
//     "title": "Vue3 终于崛起了！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615244&idx=1&sn=bc70679b9ce2e93ff22ae311be0d6da0&chksm=8022a7cdb7552edb26c88734a0d6468bdd156c0d04f64c3f4bc99292b1ebf0f97c2a7666d66c#rd",
//     "date": "2023-06-21",
//     "author": "前端技术"
//   },
//   {
//     "title": "图文并茂：浏览器工作原理",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615146&idx=1&sn=9e6e862721233fe206729735ef2a04c8&chksm=8022b86bb755317dccb724bf14af4d7ef4f740d7017fc7d032f2aec99c44cb108454b7ba0198#rd",
//     "date": "2023-06-19",
//     "author": "前端技术"
//   },
//   {
//     "title": "这道面试题真的很变态吗？",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615146&idx=2&sn=daca2260adaaedbc53addd72adba2bcf&chksm=8022b86bb755317dcdd2e6c7c958ad847c4277dd2a05bd42d9d90e02e24dd41f52b47676ac72#rd",
//     "date": "2023-06-19",
//     "author": "前端技术"
//   },
//   {
//     "title": "【你不知道的promise】设计一个支持并发的前端接口缓存",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615145&idx=2&sn=1140b40b61817da7837e65356098d241&chksm=8022b868b755317ef270bf18cae0082f1628202842fc893afcaadb1893679badccb212790725#rd",
//     "date": "2023-06-16",
//     "author": "前端技术"
//   },
//   {
//     "title": "6月，前端岗位爆了。。。",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615145&idx=1&sn=25c9190d430e4d314e3496189c35bd4e&chksm=8022b868b755317e9b6818bf1a8ff333cc8558ca604bd5f12a2693e9dc26de31351e1aa70118#rd",
//     "date": "2023-06-16",
//     "author": "前端技术"
//   },
//   {
//     "title": "前端获取电池信息",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615139&idx=1&sn=d59472bceac228d96f835194269d0218&chksm=8022b862b7553174fd6fcfa7e58639720579cefe83a96ba0efd4158bf5ccfbabfa07a1fe25e1#rd",
//     "date": "2023-06-14",
//     "author": "前端技术"
//   },
//   {
//     "title": "能把队友气死的 8 种屎山代码 (React版)",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615139&idx=2&sn=2fccb2ebcffd595d75c205c398b10b25&chksm=8022b862b7553174322771211f0a8d5afbf135f8f718da14d38de1011ed9ca95505d48261a5e#rd",
//     "date": "2023-06-14",
//     "author": "前端技术"
//   },
//   {
//     "title": "React：我们的用法习惯可能是错误的",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615034&idx=2&sn=08f86910871f310d8d600c27f7de9052&chksm=8022b8fbb75531ed8aa4390dc992306c7a23434d120a8e5bb79ff97bb97a4b9015b118f2969d#rd",
//     "date": "2023-06-13",
//     "author": "前端技术"
//   },
//   {
//     "title": "面了一个阿里出来的大佬，见识到了基础天花板！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615034&idx=1&sn=4f70dc3e80e451fafd79f49b6ec994e4&chksm=8022b8fbb75531ed80cf49f96f37b178685cd1a62f1194bc2cb6bb7ec8bbf54e209179c537f9#rd",
//     "date": "2023-06-13",
//     "author": "前端技术"
//   },
//   {
//     "title": "前端加载超大图片(100M以上)实现秒开解决方案",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615004&idx=1&sn=1633b08b739e729eb85b90dc82e27238&chksm=8022b8ddb75531cb06f4fc1a61ac314ebeff326a638fa0e0a337df175833fb11d6b1b873705c#rd",
//     "date": "2023-06-12",
//     "author": "前端技术"
//   },
//   {
//     "title": "前端框架Svelte放弃TypeScript，JS赢！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651615004&idx=2&sn=293453a75e2c091da599da3850216bc7&chksm=8022b8ddb75531cbb982737ec71d1018adb51527f55d4034e2fbe0f0fca242e77af48c2d4798#rd",
//     "date": "2023-06-12",
//     "author": "前端技术"
//   },
//   {
//     "title": "Chrome启用全新编译器",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614977&idx=2&sn=898b96ad832dfd5d3d8d20c6df30601c&chksm=8022b8c0b75531d6b9ed720da02615e0dab278045ada2b5304040f86013e6b1329ad0d7bc4b8#rd",
//     "date": "2023-06-09",
//     "author": "前端技术"
//   },
//   {
//     "title": "偏爱 console.log 的你，肯定会觉得这个插件泰裤辣！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614977&idx=1&sn=ee991f3ec0c51fe4e5e29da97d4c433d&chksm=8022b8c0b75531d6df16a830c59ac9c81592b8f2a576dba3f87ee97b4ecb38ca239850fdf721#rd",
//     "date": "2023-06-09",
//     "author": "前端技术"
//   },
//   {
//     "title": "Chrome 将引入无边界模式",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614958&idx=2&sn=d0d87edf67462320d633eb4e76f2a8f2&chksm=8022b92fb7553039a61ffd141e013e9f1c6ae36579588f424f3bc80da26192339925a0045780#rd",
//     "date": "2023-06-07",
//     "author": "前端技术"
//   },
//   {
//     "title": "Vue3已成气候（超强）！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614958&idx=1&sn=a57ff973f63778d8e209976fd18b1f0a&chksm=8022b92fb7553039c5d86df3ed31bb613bbc8e9b1f2b6b7c8fda96dba084fff2140d773f92e0#rd",
//     "date": "2023-06-07",
//     "author": "前端技术"
//   },
//   {
//     "title": "十分钟，带你了解 Vue3 的新写法",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614936&idx=1&sn=570d1ca8a5a53380e85ee933f855af7c&chksm=8022b919b755300f8d3907989dcc7429ff96b1c422e09d2fcacb6f89891a453f668e8e551292#rd",
//     "date": "2023-06-05",
//     "author": "前端技术"
//   },
//   {
//     "title": "我是埋点SDK，看我如何让甲方爸爸的页面卡顿10s+",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614936&idx=2&sn=4ad159afb7ae26314805f4662ed596b1&chksm=8022b919b755300f94c5f036ad6610b2df2516471c8e76ab161b2d2b434b52a583c05cf45b0f#rd",
//     "date": "2023-06-05",
//     "author": "前端技术"
//   },
//   {
//     "title": "27 个实用的 Visual Studio Code 扩展插件，让我们的工作效率翻倍",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614892&idx=2&sn=fba9f0f1f399e7a2eb30b9d71b47b877&chksm=8022b96db755307bca0665a251cbc0d4463a146fb7ce3d7bd1da2912a2460831d2999ee1a9aa#rd",
//     "date": "2023-06-02",
//     "author": "前端技术"
//   },
//   {
//     "title": "三分钟，教你3种前端埋点方式！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614892&idx=1&sn=34474ca7b0a093c18a30b3b079cea6af&chksm=8022b96db755307b8e561fc66fdacfb1e14ca37172b8afd95eafe16a80662e3d42f6d3cbe538#rd",
//     "date": "2023-06-02",
//     "author": "前端技术"
//   },
//   {
//     "title": "2023前端开发岗现状",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614857&idx=1&sn=387287139583317cf69db90f0d197fd4&chksm=8022b948b755305e551d43240cbd22c63a5353a7917e6c5d82797d67c2d429c0c6ac816e98dd#rd",
//     "date": "2023-06-01",
//     "author": "前端技术"
//   },
//   {
//     "title": "Vue 选手转 React 常犯的 10 个错误，你犯过几个？",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614857&idx=2&sn=25457a891bf32b5d8810c9a395675856&chksm=8022b948b755305ef444d55b8973a6da30751dde2e843f468507a8996e0430a4129583ff0dc9#rd",
//     "date": "2023-06-01",
//     "author": "前端技术"
//   },
//   {
//     "title": "Vercel 推出前端直连数据库，回归 or 进步！？",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614796&idx=1&sn=218360fe17f6ba934078f05f701f982f&chksm=8022b98db755309b520e90c9a11c037b36123e7f81933e93b7062129211fa786c4e9302111a5#rd",
//     "date": "2023-05-31",
//     "author": "前端技术"
//   },
//   {
//     "title": "盘点那些前端项目上的规范工具",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614796&idx=2&sn=76f166fe095d3a3fe40b266bcf24852a&chksm=8022b98db755309b43283f44c188a56537bc2d9e0bdf0ff6ed828392c0b8547f790e25fd5ce1#rd",
//     "date": "2023-05-31",
//     "author": "前端技术"
//   },
//   {
//     "title": "这个库让你轻松搞定复杂动画！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614794&idx=1&sn=740723ca8678504911ac8a7e2ab170c5&chksm=8022b98bb755309d78e85a460268fbd4be6b9fa0f4ba5c527fe20ef3da5f4523a3950edc04ad#rd",
//     "date": "2023-05-29",
//     "author": "前端技术"
//   },
//   {
//     "title": "【webpack核心库】耗时7个小时，用近50张图来学习enhance-resolve中的数据流动和插件调度机制",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614794&idx=2&sn=2cd6440d7d0e77f3a8f17a72c9481841&chksm=8022b98bb755309d2fab8a1cb966525935b34b50513840f6bc520f6d0bb8824ad29e74a2170a#rd",
//     "date": "2023-05-29",
//     "author": "前端技术"
//   },
//   {
//     "title": "10 个超级实用的 reduce 使用技巧",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614793&idx=2&sn=9c08659f6255b0495f87cc1a0f6f977f&chksm=8022b988b755309e6481d6fc2ff09d5c75b39f302ba1ee9da799d85e861765969b035e69e17e#rd",
//     "date": "2023-05-26",
//     "author": "前端技术"
//   },
//   {
//     "title": "你们喜欢用 forEach 吗？说说我为啥不喜欢用 forEach~",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614793&idx=1&sn=11246bdd5694d0a821f9d5c73a8fb086&chksm=8022b988b755309e91f5d4e0d1ed68f275da6242ddcf8c050110c4b04919d9cdec5342c4d076#rd",
//     "date": "2023-05-26",
//     "author": "前端技术"
//   },
//   {
//     "title": "new Date() 我忍你很久了！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614656&idx=1&sn=f316ced563b91aeea03e870aeb80557d&chksm=8022ba01b755331726ccb0fd6bfee74b55de8dc9dff52c17deb559123605f33162f0832fc22e#rd",
//     "date": "2023-05-24",
//     "author": "前端技术"
//   },
//   {
//     "title": "被誉为JavaScript中最难理解的概念之一的闭包是什么鬼？",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614656&idx=2&sn=9cbad4c6da9f2b6d2b1b1ac94646fbe9&chksm=8022ba01b755331705c6dbbaf2ae4635c7b6361e239e564cc101d73515da6900597102819161#rd",
//     "date": "2023-05-24",
//     "author": "前端技术"
//   },
//   {
//     "title": "肝完《浏览器基本原理与实践》后，我总结了这 36 点",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614613&idx=2&sn=a9e34f2237a9f6faa7832e1e8a800a3e&chksm=8022ba54b7553342d8fb5d24c29a3093042793cacf6dcb49df4b154a4652b3751c980c06a8e3#rd",
//     "date": "2023-05-22",
//     "author": "前端技术"
//   },
//   {
//     "title": "放心，前端死不了",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614613&idx=1&sn=a4b6f0d414dda054260aed27446f2822&chksm=8022ba54b75533423275e6fa32bbe8f3f9a450de20200d40a221743814b587566ffe6584f5b6#rd",
//     "date": "2023-05-22",
//     "author": "前端技术"
//   },
//   {
//     "title": "疯了！前端45K面经，堪称涨薪天花板！",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614590&idx=1&sn=179211f06bdd0b014a25725f0a01e340&chksm=8022babfb75533a92143b3d810bbcf79c2ecc199e8e0ada0cfcb10a47c738320d514eef4aa70#rd",
//     "date": "2023-05-19",
//     "author": "前端技术"
//   },
//   {
//     "title": "6 个 ES13 中非常实用的新 JavaScript 特性",
//     "link": "https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651614590&idx=2&sn=765f212312d08386610e48642e30405e&chksm=8022babfb75533a9e0e5bdd8a5a1e2c8e3a7e1bee95d8bc91c1a784740a8dd15dd8ad7240315#rd",
//     "date": "2023-05-19",
//     "author": "前端技术"
//   },
// ])

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
  let tmpList = articleList.value
  articleList.value = []
  router.replace({
    path: '/',
    query: keyword.value ? { k: keyword.value } : {}
  })
  if (keyword.value) {
    const matches = keyword.value.match(/^\[(时间|来源|分类)\]\s(.+)/)
    const matchValue = matches && matches[2] ? matches && matches[2] : ""
    if (matches && datesMap.get(matchValue)) {
      articleList.value = datesMap.get(matchValue) || []
      console.log(articleList.value)
    } else if (matches && rssMap[matchValue]) {
      articleList.value = rssMap[matchValue]
    } else if (matches && tagsMap.get(matchValue)) {
      articleList.value = tagsMap.get(matchValue) || []
    } else {
      // eslint-disable-next-line
      let reg = new RegExp('(' + keyword.value.replace(/([?\[\]])/g, '\\$1') + ')', 'gi')
      tmpList.forEach((item) => {
        if (reg && reg.test(item.title)) {
          articleList.value.push({
            link: item.link,
            date: item.date,
            title: item.title.replace(reg, `<span style="color: #f44336">$1</span>`),
            author: item.author
          })
        }
      })
    }
  } else {
    articleList.value = tmpList
    return
  }
  toTop()
  pageNo.value = 1
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

const isBusy = computed(() => {
  const allLen = articleList.value.length
  const displayedLen = displayedArticleList.value.length
  return (allLen < pageSize.value || (displayedLen && displayedArticleList.value[displayedLen - 1].link === articleList.value[allLen - 1].link)) ? true : false
})

const pageSize = ref<number>(20)
const pageNo = ref<number>(1)

const loadMore = () => {
  if (isBusy.value) {
    console.log("数据加载完毕")
  } else {
    displayedArticleList.value = articleList.value.slice(0, pageNo.value * pageSize.value)
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
      :infinite-scroll-disabled="isBusy" :infinite-scroll-watch-disabled="isBusy" infinite-scroll-distance="20">
      <!-- 未搜到文章时的提示 -->
      <div class="empty" v-if="isLoad && !displayedArticleList.length">
        <van-icon name="info-o" class="icon" />
        <div style="margin-top: 1rem;">没有搜索到文章，换个关键词试试</div>
        <div style="margin-top: .5rem;">或者手动筛选～</div>
      </div>

      <van-cell-group>
        <van-cell v-for="(item, index) in displayedArticleList" :key="index" :title="item.title" is-link :url="item.link">
          <template #title>
            <div v-html="item.title"></div>
          </template>
          <template #label>
            <div>{{ item.date }}<span style="margin-left: .625rem;">{{ item.author }}</span></div>
          </template>
        </van-cell>
      </van-cell-group>

      <van-loading style="margin-top: 1.25rem; display: flex; justify-content: center; align-items: center;" v-if="displayedArticleList.length && !isBusy && isLoad">加载中...</van-loading>
      <van-divider v-if="displayedArticleList.length && isBusy">没有更多了~</van-divider>
    </div>
  </div>
</template>

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