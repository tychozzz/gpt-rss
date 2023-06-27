import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Search, Icon, Popup, Cell, CellGroup, Tag, Divider, Skeleton, Loading } from 'vant'
import 'vant/lib/index.css';


const app = createApp(App)

app.use(router).use(Search).use(Icon).use(Popup).use(Cell).use(CellGroup).use(Tag).use(Divider).use(Skeleton).use(Loading)

app.mount('#app')
