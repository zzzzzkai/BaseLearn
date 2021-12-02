<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import {storage,ajax} from './common'
import apiUrls from './config/apiUrls'
import {authService} from './service'
import qs from 'qs'

export default {
  components: {
    // HeaderBar
  },
    data() {
    return {
    }
  },
    created(){
       
    },
    mounted(){
       var token= authService.getToken();
       if(token==null)
       {
         //去获取token
         this.apiGetToken();
       }
    },
  methods:{
    //获取token授权登录
      apiGetToken(){
         var that=this;
          var data = {
            //认证类型 
            grant_type: 'password',
            client_id: 'clientanduser',
            client_secret:'secret',
            username: "m1",
            password: "password",
            scope:"api1"
          }
          //注意这里需要使用fromdata的请求
        ajax.post("/connect/token", qs.stringify(data),{headers:{ 'content-type':'application/x-www-form-urlencoded'}}).then(r=>{
          r=r.data;
          console.log(r);
          authService.setToken(r); 
        }).catch(e=>{
          console.log(e);
        });

      },
  }

};
</script>

<style>
body{
  margin:0px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  font-size: 14px !important;
  color: #4a4a4a !important;
  /*margin-top: 60px; */
}
</style>
