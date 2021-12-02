import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const fixedRouter=[
  {
    path: '/login',
    name: 'login',
    component: (resolve) => require(['../views/Login/login.vue'], resolve)
  }
]

export default new VueRouter({
  routes: fixedRouter
})