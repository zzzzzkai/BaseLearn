<template>
    <el-menu
    mode="vertical"
    unique-opened
    :default-active="$route.path"
    background-color="#324157"
    text-color="#bfcbd9"
    active-text-color="#20a0ff"
    @select="handleSelect"
    :collapse="this.$store.getters.isCollapse"
    :class="this.$store.getters.isCollapse === false?'sidebar-container':'sidebar-containers'"
  >
    <sidebar-item :routes="routes"></sidebar-item>
  </el-menu>
</template>

<script>
import sidebarItem from "./sidebarItem";
export default {
  data(){
    return{
      indexBreadcrumbs:[],
      // isCollapse:false,
    }
  },
  components: { sidebarItem },
   watch: {
        $route () {
            this.handChange()
        },
        
    },
  computed: {
    routes() {
      // console.log(this.$store.getters.addRoutes);
      return this.$store.getters.addRoutes;
    },
    breadcrumbList () {
            let breadcrumbs = []
            let menuList =  this.$store.getters.addRoutes;
      this.indexBreadcrumbs.map(item => {
        // console.log('item',item)
        // console.log('menuList',menuList)
                for (let i = 0; i < menuList.length; i++) {
                    if (item === menuList[i].name) {
                        breadcrumbs.push(menuList[i])
                        if (menuList[i].children) {
                            menuList = menuList[i].children
                        }
                        break;
                    }
                }
            })
            return breadcrumbs
    },

  },
 
  methods:{
     handChange () {
      //  console.log('breadcrumbList',this.breadcrumbList)
       
            // this.$emit('breadcrumbList', this.breadcrumbList) breadNow
       this.$store.commit('promission/breadNow', this.breadcrumbList);
        },
        
    handleSelect(index, indexPath){
      this.indexBreadcrumbs = indexPath;
      console.log('当前选中路径',index,indexPath)
    }
  },
    created () {
        this.handChange();
    }
}
</script>
<style >
body {
  margin: 0 !important;
}
.allPage {
  width: 100%;
  height: 100%;
  display: flex;
}
  .el-menu--collapse {
  height: 100vh;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  max-height: 100vh;
  height: 100vh;
  width: 180px;
  float: left;
}
</style>
<style lang="scss">

</style>