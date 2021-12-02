<template>
  <div>
    <div class="admDiv">
      <div class="lncTop">
        <div class="getNew">
          <el-input v-model="kw" size="small" placeholder="管理员编码/管理员名称"></el-input>
        </div>
        <div class="getSele" style="margin-left:10px;">
          <el-select v-model="status" size="small">
            <el-option label="全部" value></el-option>
            <el-option label="正常" value="1"></el-option>
            <el-option label="停用" value="0"></el-option>
          </el-select>
        </div>
        <el-button type="primary" @click="getAdminList" size="small" icon="el-icon-search" style="margin-left:10px;">查询</el-button>

        <el-button type="warning" @click="showDialog()" size="small" icon="el-icon-plus" style="margin-left:10px;">新增</el-button>

        <el-button
          type="danger"
          @click="deleteAdminByIds()"
          size="small"
          icon="el-icon-delete"
          style="margin-left:10px;"
        >删除</el-button>
      </div>
      <div class="lncMid">
        <!--表格-->
        <el-table
          :data="adminList"
          ref="adminTable"
          @selection-change="handleSelectionChange"
          :height="height"
          border
          stripe
          row-key="id"
          :fit="true"
        >
          <el-table-column type="selection" :reserve-selection="true"></el-table-column>
          <el-table-column prop="admin_Code" label="管理员编码" align="center"></el-table-column>
          <el-table-column prop="admin_Name" label="管理员名称" align="center"></el-table-column>
          <el-table-column prop="status" label="状态" align="center" :formatter="formatStatus"></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="mini" icon="el-icon-edit"  @click="showDialog(scope.row)" plain>编辑</el-button>
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteAdminByIds(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
          <!-- 分页 -->
        <div class="pageNation">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="index"
            :page-sizes="[10, 20, 30, 40, 50]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableCopyTableList.length"
          ></el-pagination>
        </div>
      </div>
    
      <!--对话框-->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :label-position="'right'" label-width="80px">
          <el-form-item label="账户">
            <el-input
              size="small"
              placeholder="请输入账号"
              v-model="adminInfo.admin_Code"
              :disabled="adminCodeDisabled"
              prefix-icon="el-icon-user"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="名称">
            <el-input
              placeholder="请输入名称"
              size="small"
              v-model="adminInfo.admin_Name"
              prefix-icon="el-icon-user"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              placeholder="请输入密码"
              size="small"
              v-model="adminInfo.admin_Pwd"
              prefix-icon="el-icon-lock"
              show-password
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              placeholder="请输入确认密码"
              size="small"
              v-model="adminInfo.admin_ConfirmPwd"
              prefix-icon="el-icon-lock"
              show-password
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="角色">
            <!-- @change="change(adminInfo.role_Id)"  -->
            <el-select v-model="adminInfo.role_Id" size="small">
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.role_Name"
                :value="role.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="adminInfo.status" size="small">
              <el-option label="正常" value="1"></el-option>
              <el-option label="停用" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button type="danger" size="small" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="small" @click="addOrEditAdmin" :loading="addOrEditLoading">确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { ajax,storage } from "../../common";
import apiUrls from "../../config/apiUrls";

export default {
  name: "AdminList",
  data() {
    return {
      adminList: [], //管理员列表
      height: "calc( 100vh - 250px)",
      ids: [], //管理员选中id列表
      roleList: [], //角色列表
      kw: "", //查询关键字
      status: "",
      dialogTitle: "管理员信息",
      dialogVisible: false,
      adminCodeDisabled: false,
      addOrEditLoading:false,//添加或编辑确定按钮加载
      adminInfo: {
        //管理员信息
        id: "",
        admin_Code: "",
        admin_Name: "",
        admin_Pwd: "",
        admin_ConfirmPwd: "",
        status: "",
        role_Id: "",
        // amdin_Type: ""
      },
      index: 1, //当前页数
      size: 10, //页码
      tableCopyTableList: [], //表数据集合
    };
  },
  created() {
    this.getAdminList();
    this.getRoleList();
    
  },
  methods: {
    //获取管理员列表
    getAdminList() {
      var that = this;
      let data = {
        kw:that.kw,
        Status:that.status
      };
      ajax
        .post(apiUrls.GetAdminList, data,{nocrypt:true})
        .then(r => {
          // console.log(r);
          r = r.data;
          if (!r.success) {
            that.$message.error(r.returnMsg);
            return;
          }
          // this.adminList = r.returnData;
          that.tableCopyTableList = r.returnData;
          that.adminList = that.paging(that.size, that.index);
        })
        .catch(err => {
          console.log(err);
          that.$message.error("系统繁忙！请稍后再试");
        });
    },
    //获取角色列表
    getRoleList() {
      //查询启用的角色  
      ajax
        .post(apiUrls.GetRoleList, {}, {nocrypt:true})
        .then(r => {
          // console.log(r);
          r = r.data;
          if (!r.success) {
            this.$message.error("获取角色数据失败！" + r.returnMsg);
            return;
          }
          this.roleList = r.returnData;
          // console.log('1234',this.roleList);
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },
    //新增或编辑管理员
    addOrEditAdmin() {
      //按钮显示加载
      this.addOrEditLoading=true;

      //参数验证
      if (!this.checkAdminInfo()) {
        //按钮关闭加载
        this.addOrEditLoading=false;
        return;
      }

      let data = {
        Admin_Name: this.adminInfo.admin_Name,
        Admin_Pwd: this.adminInfo.admin_Pwd,
        Admin_Type: this.adminInfo.role_Id,
        Status: this.adminInfo.status
      };
      //如果有id就是编辑否则新增
      let url = "";
      var user = JSON.parse(storage.session.get("user"));
      if (this.adminInfo.id) {
        //编辑参数赋值
        data.ID = this.adminInfo.id;
        data.UpdateID = user.id;
        url = apiUrls.UpdateAdmin;
      } else {
        //新增参数赋值
        data.Admin_Code = this.adminInfo.admin_Code;
        data.CreateID = user.id;

        url = apiUrls.AddAdmin;
      }
      ajax
        .post(url, data,{nocrypt:true})
        .then(r => {
          //关闭确定按钮加载
          this.addOrEditLoading=false;

          r = r.data;
          if (!r.success) {
            this.$message.error(r.returnMsg);
            return;
          }
          this.$message.success("提交成功！");
          this.getAdminList(); //重新加载管理员列表
          this.dialogVisible = false; //关闭对话框
        })
        .catch(err => {
          //关闭确定按钮加载
          this.addOrEditLoading=false;

          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },
       // 页数改变事件
    handleSizeChange(size) {
      this.size = size;
      this.adminList = this.paging(size, this.index);
    },
    // 页码改变事件
    handleCurrentChange(current) {
      this.index = current;
      this.adminList = this.paging(this.size, current);
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
    //删除管理员信息
    deleteAdminByIds(id) {
      let idArr = [];
      if (id) {
        idArr = [id];
      } else {
        idArr = this.ids;
      }

      if (idArr.length == 0) {
        this.$message.warning("请选择管理员");
        return;
      }
      let data = {
        ids: idArr
      };

      this.$confirm(`是否继续删除${id ? "当前" : "所选"}管理员?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        //确定删除管理员
        ajax
          .post(apiUrls.DeleteAdminByIds, data,{nocrypt:true})
          .then(r => {
            r = r.data;
            if (!r.success) {
              this.$message.error(r.returnMsg);
              return;
            }
            this.$message.success("删除成功");
            this.getAdminList();
          })
          .catch(err => {
            console.log(err);
            this.$message.error("系统繁忙！请稍后再试");
          });
      });
    },


    //选择框的改变
    // change(value) {
    //   this.adminInfo.amdin_Type = value;
    // },
    //格式化状态列
    formatStatus(row){
      return row.status==0?"停用":row.status==1?"启用":"";
    },
    //添加或编辑显示对话框(不传row参数就是新增)
    showDialog(row) {
      console.log("row",row);
      this.adminInfo.id = row ? row.id : "";
      this.adminInfo.admin_Code = row ? row.admin_Code : "";
      this.adminInfo.admin_Name = row ? row.admin_Name : "";
      this.adminInfo.status = row ? (row.status.toString()):"1";
      this.adminInfo.role_Id = row ? row.admin_Type : "";
      // this.adminInfo.amdin_Type = row ? row.admin_Type : "";
      this.adminInfo.admin_Pwd = "";
      this.adminInfo.admin_ConfirmPwd = "";
      
      this.adminCodeDisabled = row ? true : false;//如果是编辑就不禁止修改账号

      //弹框显示
      this.dialogVisible = true;


      
    },
    //检查输入的参数
    checkAdminInfo() {
      if (!this.adminInfo.admin_Code) {
        this.$message.warning("请输入管理员编码");
        return false;
      }
      if (!this.adminInfo.admin_Name) {
        this.$message.warning("请输入管理员名称");
        return false;
      }
      //this.adminInfo.id有值就是编辑，编辑可以不用输入密码
      if (!this.adminInfo.admin_Pwd && !this.adminInfo.id) {
        this.$message.warning("请输入管理员密码");
        return false;
      }
      if (!this.adminInfo.admin_ConfirmPwd && !this.adminInfo.id) {
        this.$message.warning("请输入确认密码");
        return false;
      }
      if (this.adminInfo.admin_Pwd != this.adminInfo.admin_ConfirmPwd) {
        this.$message.warning("两次密码输入不一致，请重新输入");
        return false;
      }
      if (!this.adminInfo.role_Id) {
        this.$message.warning("请选择管理员角色");
        return false;
      }
      return true;
    },
    //保存选中的管理员id
    handleSelectionChange(rows) {
      this.ids = rows.map(row => row.id);
    }
  }
};
</script>

<style lang="scss">
.admDiv {
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
    .getSele {
      width: 100px;
      // margin-left: 10px;
      .el-input__inner {
        padding: 0 10px !important;
        width: 100px !important;
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
    // 表格头部勾选
    .el-table td,
    .el-table th {
      text-align: center !important;
    }
  }
}
</style>
