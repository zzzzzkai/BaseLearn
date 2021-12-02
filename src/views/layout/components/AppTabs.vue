<template>
    	<!-- 二级路由跳转 -->
				<transition name="fade" mode="out-in">
					<keep-alive :include="keepAliveList">
						<router-view :key="$route.path" />
					</keep-alive>
				</transition>
</template>

<script>
import { storage } from '@/common';
export default {
  name: 'AppTabs',
  computed: {
    keepAliveList(){
        return this.$store.getters.keepAliveList;
    }
  }
}
</script>