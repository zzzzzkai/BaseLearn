import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios';
import ElementUI from 'element-ui';
import './router/promission' //这里进行路由后台获取的模拟
import 'element-ui/lib/theme-chalk/index.css';
import './styles/index.scss' //global.css
import {
  ajax
} from './common/ajax'



//封装初始化
//动态配置json文件信息
init();

function getServerConfig(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then((result) => {
      //console.log(result)  // 看打印出来的结果
      let config = result.data;
      Vue.prototype.baseData = config
      console.log("init ok") // 验证是否已经把属性挂在了Vue上
      resolve();
    }).catch((error) => {
      console.log(error);
      reject()
    })
  })
}

async function init() {
  await getServerConfig('./baseData.json');
  ajax.setBaseUrl(Vue.prototype.baseData.apiHost);
  Vue.config.productionTip = false
  Vue.use(ElementUI)
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
}