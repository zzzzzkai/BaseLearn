<template>
	<section class="app-main">
		<!-- 退出按钮 -->
		<el-container class="app_content">
			<el-header class="app-header">
				<div style="width: 85%;" class="app-header-div">
					<div class="header-top-div">
						<div class="header-div-blean">
							<el-button :icon="bleanIcon" @click="appBlean"></el-button>
						</div>
						<el-breadcrumb separator="/" style="width:80%;margin-left:15px;">
							<el-breadcrumb-item :to="pathTo">首页</el-breadcrumb-item>
							<el-breadcrumb-item v-for="item in breadcrumbList" :key="item.id">{{ item.meta_title }}</el-breadcrumb-item>
							<el-breadcrumb-item>{{ pathNow }}</el-breadcrumb-item>
						</el-breadcrumb>
					</div>

					<div class="header-bottom-div">
						<el-tabs
							v-model="editableTabsValue"
							type="card"
							closable
							@edit="handleTabsEdit"
							@tab-click="toTabs"
						>
							<el-tab-pane
								:key="item.name"
								v-for="(item) in editableTabs"
								:label="item.title"
								:name="item.name"
							></el-tab-pane>
						</el-tabs>
					</div>
				</div>
				<div style="width: 15%;align-items: flex-end;" class="app-header-div">
					<el-button @click="outSystem" size="mini" plain type="primary" style="height: 30px;">退出登录</el-button>
				</div>
			</el-header>
			<!-- 内容区域 -->
			<el-main>
				<!-- 二级路由跳转 -->
				<app-tabs></app-tabs>
			</el-main>
		</el-container>
	</section>
</template>

<script>
import { storage } from '@/common';
import AppTabs from '@/views/layout/components/AppTabs.vue';
export default {
	components: {
		AppTabs
	},
	name: 'AppMain',
	data() {
		return {
			breadcrumbList: [],
			pathNow: '',
			pathTo: '',
			bleanIcon: 'el-icon-s-fold', //折叠侧边栏icon el-icon-s-unfold
			isCollapse: false, //折叠侧边栏初始值
			editableTabsValue: 'home', //初始tabs页面
			editableTabs: [
				{
					title: '首页',
					name: 'home',
					pathGo: '/home/home'
				}
			] //当前tabs数组
		};
	},
	created() {
		this.breadEvent();
		this.$store.commit('promission/isCollapseNow', this.isCollapse);
	},
	mounted() {},
	computed: {
		keepAliveList() {
			return this.$store.getters.keepAliveList;
		},
	},
	methods: {
		breadEvent() {
			// 获取当前地址栏路由页 刷新不折叠导航
			// let start = window.location.href.lastIndexOf('/');
			// let path = window.location.href.slice(start + 1);
			// console.log('path',path)
			// 获取当前地址栏的path
			// let startNowL = window.location.href.lastIndexOf('#');
			// let pathNowL = window.location.href.slice(startNowL + 1);
			// console.log('pathNowL',pathNowL)

			let pathNowL = this.$route.path;
			let path = pathNowL.split('/')[pathNowL.split('/').length - 1];
			console.log('pathNowL',pathNowL)
			console.log('path',path)


			var childerlist = this.$store.getters.addRoutes;
			for (var i = 0; i < childerlist.length; i++) {
				for (var z = 0; z < childerlist[i].children.length; z++) {
					if (childerlist[i].children[z].name == path) {
						// 判断是否为首页 进行赋值
						this.pathNow = childerlist[i].children[z].meta_title;
						this.breadcrumbList = this.$store.getters.breadcrumbList;
						this.pathTo = { path: '../home/home' };
					} else if (childerlist[i].children[z].name == undefined) {
						this.pathNow = '';
						this.breadcrumbList = [];
						this.pathTo = '';
					}
				}
			}
			// 给tabs添加数值  去重
			let editData = []; //盛放去重后数据的新数组
			let tabsData = this.editableTabs;
			tabsData.push({
				title: this.pathNow,
				name: path,
				pathGo: pathNowL
			});
			var item1, item2;
			for (item1 of tabsData) {
				let flag = true; //建立标记 判断数据是否重复， true为不重复
				for (item2 of editData) {
					//循环新数组的内容
					if (item1.name == item2.name) {
						//比较，给相同的false标记
						flag = false;
					}
				}
				if (flag) {
					editData.push(item1); //不重复的放入数组。
				}
			}
			var keepAliveListData = [];
			for (let i = 0; i < editData.length; i++) {
				keepAliveListData.push(editData[i].name);
			}
			this.$store.commit(
				'promission/setKeepAliveLists',
				keepAliveListData
			);
			this.editableTabs = editData;
			this.editableTabsValue = path;
		},
		// 折叠侧边栏
		appBlean() {
			this.isCollapse = !this.isCollapse;
			if (this.isCollapse === true) {
				this.bleanIcon = 'el-icon-s-unfold';
			} else {
				this.bleanIcon = 'el-icon-s-fold';
			}
			this.$store.commit('promission/isCollapseNow', this.isCollapse);
		},
		//退出按钮点击事件
		outSystem() {
			storage.session.clear();
			this.$store.commit('promission/resetAddRoutes');
			this.$router.push({ path: '/login' });
		},
		// 动态标签关闭
		handleTabsEdit(targetName, action) {
			if (targetName === 'home') return;
			if (action === 'remove') {
				let tabs = this.editableTabs;
				let activeName = this.editableTabsValue;
				if (activeName === targetName) {
					tabs.forEach((tab, index) => {
						if (tab.name === targetName) {
							let nextTab = tabs[index + 1] || tabs[index - 1];
							if (nextTab) {
								activeName = nextTab.name;
							}
						}
					});
				}
				this.editableTabsValue = activeName;
				this.editableTabs = tabs.filter(tab => tab.name !== targetName);
				var allEdit = this.editableTabs.map(i => i.name);
				this.$store.commit('promission/setKeepAliveLists', allEdit);

				// 点击关闭按钮后跳转到数组最后一个
				if (
					this.$route.fullPath !=
					this.editableTabs[this.editableTabs.length - 1].pathGo
				) {
					this.$router.push({
						path:
							'..' +
							this.editableTabs[this.editableTabs.length - 1]
								.pathGo
					});
				}
				// console.log(
				// 	'this.$store.getters.keepAliveList',
				// 	this.$store.getters.keepAliveList
				// );
			}
		},
		toTabs(e) {
			this.$router.push({
				path: '..' + this.editableTabs[e.index].pathGo
			});
		}
	},
	watch: {
		$route() {
			this.breadEvent();
		}
	}
};
</script>
<style>
.app-header {
	text-align: right;
	font-size: 12px;
	background-color: #ffffff;
	box-shadow: 3px 3px 5px #888888;
	height: 70px !important;
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.el-main {
	padding: 0 !important;
	height: calc(100vh - 70px);
}
</style>
<style lang="scss">
.app-header-div {
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	.header-top-div {
		width: 100%;
		height: 50%;
		display: flex;
		align-items: center;
		.header-div-blean {
			.el-button {
				padding: 0 !important;
				font-size: 23px;
				border: 0;
			}
		}
	}

	.header-bottom-div {
		width: 100%;
		height: 50%;
		.el-tabs {
			width: 100%;
			height: 100%;
			.el-tabs__header {
				margin: 0 !important;
				.el-tabs__item {
					height: 30px !important;
					line-height: 30px !important;
				}
				// 首页不可删除
				#tab-home {
					.el-icon-close {
						width: 0;
					}
				}
			}
		}
	}
}
</style>
