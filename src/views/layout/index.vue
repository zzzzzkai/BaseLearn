<template>
  <div class="app-wrapper">
    <sidebar class="sidebar-container"></sidebar>
    <div :class="this.$store.getters.isCollapse===false?'main-container':'main-containers'">
        <app-main></app-main>
    </div>
  </div>
</template>

<script>
import AppMain  from '@/views/layout/components/AppMain'//页面布局的右侧区域
import sidebar  from '@/views/layout/components/sidebar'//页面布局的左侧菜单

export default {
  name: 'layout',
  components: {
    sidebar,
    AppMain
  }
}
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  background: #f0f0f0;
}
</style>
