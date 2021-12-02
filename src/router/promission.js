import router from '.'
import store from '../store'
const _import = require('./_import_' + process.env.NODE_ENV) //获取组件的方法
import Layout from '@/views/layout' //Layout是架构组件，不在后台返回，在文件里单独引入
import { storage } from '../common'


router.beforeEach(async(to, from, next) => {
  if (storage.session.get('userRole') != null) {
    next()
  } else {
    if (to.path === '/login') {
      next()
      return
    } else {
      next('/login')
      return
    }
  }

  if (store.getters.addRoutes.length == 0) {
    
    var accessRoutes=await store.dispatch('promission/setAddRoutes')
    routerGo(to, next, accessRoutes) //执行路由跳转方法
  } else {
    next();
  }
})


function routerGo(to, next, getRouter) {
  var accessRoutes = filterAsyncRouter(getRouter) //过滤路由
    router.addRoutes(accessRoutes) //动态添加路由
  //store.dispatch('setAddRoutes', accessRoutes)

  next({
    ...to, //ES6扩展运算符。将一个数组转为用逗号分隔的参数序列。
    replace: true //replace 一个布尔类型，默认为false。如果replace设置为true，那么导航不会留下history记录，点击浏览器回退按钮不会再回到这个路由
  })
}

function filterAsyncRouter(asyncRouterMap) { //遍历后台传来的路由字符串，转换为组件对象
  const accessedRouters = asyncRouterMap.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') { //Layout组件特殊处理
        route.component = Layout
      } else {
        route.component = _import(route.component)
      }
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })

  return accessedRouters
}