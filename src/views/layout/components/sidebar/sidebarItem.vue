<template>
  <div class="menu-wrapper">
    <template v-for="item in routes" v-show="!item.hidden&&item.children">
      <el-submenu :index="item.name||item.path" :key="item.name" class="submenuOne"> 
        
        <template slot="title">
          <i :class="item.meta_icon"></i>
          <span v-if="item.meta_title&&item.isRedirect!=true">{{item.meta_title}}</span>
         <!-- 判断，当侧边栏展开时，首页 -->
        <router-link v-if="item.isRedirect==true&&isCollapse==false" :to="item.redirect">{{item.meta_title}}</router-link>
            
        </template>
        <!-- 判断，当侧边栏收起时，首页-->
        <router-link v-if="item.isRedirect==true&&isCollapse==true" :to="item.redirect" style="padding-left: 20px;
    color: rgb(191, 203, 217);
    background-color: rgb(50, 65, 87);"><span>{{item.meta_title}}</span></router-link>

        <div v-if="item.isRedirect!=true">
          <template v-for="child in item.children">
            <!--v-if="!child.hidden"-->
            <sidebar-item
              :is-nest="true"
              class="nest-menu"
              v-if="child.children&&child.children.length>0"
              :routes="[child]"
              :key="child.path"
            ></sidebar-item>

            <router-link :to="item.path+'/'+child.path" :key="child.name">
              <!--v-else-->
              <el-menu-item :index="item.path+'/'+child.path">
              <!-- v-if="child.meta_title" -->
                <span  class="alTitle">{{child.meta_title}}</span>
              </el-menu-item>
            </router-link>
          </template>
        </div>


      </el-submenu>
    </template>
  </div>
</template>

<script>
export default {
  name: "sidebarItem",
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isCollapse:this.$store.getters.isCollapse
    }
  },
  created() {
    // debugger
    console.log('this.routes',this.routes);
  },
};
</script>
 <style lang="scss">
//  子菜单的文字离左边大于主菜单离左边的距离
.el-submenu .el-menu-item{
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    line-height: 0 !important;
    height: 30px !important;
    min-width: 128px !important;
    padding: 0 !important;
    font-size: 12px !important;
}
  // .alTitle{
  //       padding-left: 25px;
  // }
  .menu-wrapper{
    .submenuOne:nth-child(1){
           .el-submenu__title{
     i:nth-child(3){
    font-size: 0 !important;
  }
    }
    }

  }
// 侧边栏收缩后 控制hover选项的宽度
.el-menu--popup{
  min-width: 120px !important;
}
 
</style>
 
