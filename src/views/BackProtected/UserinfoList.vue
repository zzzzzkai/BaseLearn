<template>
  <div>
    <div class="useDiv">
      <div style="width:100%;">用户列表</div>
      <div class="lncTop">
        <div class="getNew">
          <el-input placeholder="姓名(为空时默认加载全部)" v-model="name" size="small"></el-input>
        </div>

        <el-button type="primary" @click="GetNewData" size="small" style="margin-left:10px;">查询</el-button>
      </div>
      <div class="lncMid">
        <!-- @selection-change="handleSelectionChangePeople" row-key="id"-->
        <el-table :data="tableData" border stripe :fit="true"  :height="height">
          <!-- <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column> -->
          <el-table-column prop="name" label="姓名" align="center" width="100" sortable></el-table-column>
          <el-table-column prop="openid" label="openid" width="300" align="center" sortable></el-table-column>
          <el-table-column prop="idCard" label="身份证" align="center" width="180" sortable></el-table-column>
          <el-table-column prop="tel" label="电话号码" align="center" sortable></el-table-column>
          <el-table-column prop="loginTime" label="最新登录时间" align="center" sortable></el-table-column>
        </el-table>
        <div class="pageNation">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="index"
            :page-sizes="[50, 100, 200, 300,500]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableCopyTableList.length"
          ></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ajax } from "../../common";
import apiUrls from "../../config/apiUrls";
export default {
  name:'UserinfoList',
  data() {
    return {
      tableData: [], //表格数据源
      tableCopyTableList: [], //保存数据 用于分页
        tableConstData: [], //存放数据 用于筛选数据
      index: 1, //默认在第一页
      size: 50, //默认一页50条数据
      name: "", //搜索框的值
      height: "calc( 100vh - 250px)",
      // ids: "", //id集合 用于批量删除或单个删除
    };
  },
  created() {
    this.GetAllUser();
  },
  methods: {
    // 页数改变事件
    handleSizeChange(size) {
      this.size = size;
      this.tableData = this.paging(size, this.index);
    },
    // 页码改变事件
    handleCurrentChange(current) {
      this.index = current;
      this.tableData = this.paging(this.size, current);
    },
    // 本地分页的方法
    paging(size, current) {
      const tableList = JSON.parse(JSON.stringify(this.tableCopyTableList));
      const tablePush = [];
      tableList.forEach((item, index) => {
        if (size * (current - 1) <= index && index <= size * current - 1) {
          tablePush.push(item);
        }
      });
      return tablePush;
    },
    //获取用户信息
    GetAllUser() {
      var that=this;
      ajax
        .post(apiUrls.GetUserInfoList)
        .then(r => {
          if (!r.data.success) {
            alert(r.data.returnMsg);
            return;
          }

          console.log(r);
          // 初始化数据
          that.tableConstData=r.data.returnData;
          that.tableCopyTableList = r.data.returnData;
          that.tableData = this.paging(this.size, this.index);
        })
        .catch(err => {
          alert("获取用户失败失败,请稍后重试");
        });
    },
     //保存选中的角色id
    // handleSelectionChangePeople(rows) {
    //   console.log("当前用户管理勾选的值",rows)
    //   this.ids = rows.map(row => row.id);
    // },
       //表格筛选
    GetNewData() {
      this.tableCopyTableList = this.tableConstData.filter(item => {
        //筛选
        return !this.name || item.name.includes(this.name);
      });
      this.tableData = this.paging(this.size, this.index);
    }
  }
};
</script>

<style lang="scss">
.useDiv {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 96%;
  margin: 20px auto;
  .lncTop {
    width: 100%;
    margin-top: 10px;
    display: flex;
    .getNew {
      width: 180px;
      .el-input__inner {
        padding: 0 5px !important;
        text-align: center;
        width: 180px !important;
      }
    }
  }
  .lncMid {
    margin-top: 20px;
    width: 100%;
    .pageNation {
      margin-top: 10px;
      .el-pagination {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>