import {
    ajax,
    storage
  } from "../../common";
  import apiUrls from "../../config/apiUrls";

const state = {
    addRoutes: [],
    breadcrumbList: [],
    isCollapse :false,
    keepAliveList:[],//保存缓存的列表
}

const mutations = {
    setAddRoutes(state, accessRoutes) {
        const contantRoute = {
            component: "Layout",
            id: 1,
            meta_icon: "el-icon-s-promotion",
            meta_title: "首页",
            name: "home",
            parentID: 0,
            path: "/home",
            redirect: "/home/home",
            sortIndex: 1,
            status: 1,
            viewPowerID: 0,
            isRedirect: true,
            children: [{
                path: "home",
                component: "Home/Home",
            }],
            // meta:{ 
            //     keepAlive: true 
            //  }
        };
        // debugger
        accessRoutes.unshift(contantRoute);
        state.addRoutes = accessRoutes;
    },
    resetAddRoutes(state) {
        state.addRoutes = [];
    },
    breadNow(state, msg) {
        state.breadcrumbList = msg;
    },
    isCollapseNow(state,msg){
        state.isCollapse = msg;
    },
    setKeepAliveLists(state,msg){
        state.keepAliveList = msg;
    },
}

const actions = {
    setAddRoutes({
        commit
    }) {
        return new Promise((resolve, reject) => {
            var user = JSON.parse(storage.session.get("user"));
            var pData = {
                data: {
                    id: user.id
                }
            };
            ajax
                .post(apiUrls.GetMenuListById, pData)
                .then(r => {
                    console.log(r);
                    commit('setAddRoutes', r.data.returnData)
                    resolve(r.data.returnData);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}