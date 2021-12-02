<template>
  <div>
    <div class="rolDiv">
      <div class="lncTop">
        <div class="getNew">
          <el-input
            prefix-icon="el-icon-search"
            placeholder="角色名称/角色说明"
            v-model="kw"
            size="small"
          ></el-input>
        </div>
        <div class="getSele" style="margin-left:10px;">
          <el-select v-model="status" size="small">
            <el-option label="全部" value></el-option>
            <el-option label="正常" value="1"></el-option>
            <el-option label="停用" value="0"></el-option>
          </el-select>
        </div>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="getRoleList"
          size="small"
          style="margin-left:10px;"
          >查询</el-button
        >

        <el-button
          type="warning"
          icon="el-icon-plus"
          @click="showEditDialog()"
          size="small"
          style="margin-left:10px;"
          >新增</el-button
        >

        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="deleteRoleByIds()"
          size="small"
          style="margin-left:10px;"
          >删除</el-button
        >
      </div>
      <div class="lncMid">
        <el-table
          :data="roleList"
          @selection-change="handleSelectionChange"
          :height="height"
          border
          stripe
          row-key="id"
          :fit="true"
        >
          <el-table-column type="selection" :reserve-selection="true"></el-table-column>
          <el-table-column
            prop="role_Name"
            label="名称"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="description"
            label="描述"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            align="center"
            :formatter="formatStatus"
          ></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="showEditDialog(scope.row)" icon="el-icon-edit" plain
                >编辑</el-button
              >
              <el-button size="mini" @click="showPowerDialog(scope.row.id)" icon="el-icon-setting" type="primary" plain
                >权限设置</el-button
              >
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="deleteRoleByIds(scope.row.id)"
                >删除</el-button
              >
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
          <el-form-item label="角色名称">
            <el-input
              placeholder="请输入角色名称"
              size="small"
              v-model="roleInfo.role_Name"
            ></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              placeholder="请输入描述"
              size="small"
              v-model="roleInfo.description"
            ></el-input>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="roleInfo.status" size="small">
              <el-option label="正常" value="1"></el-option>
              <el-option label="停用" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button type="danger" size="small" @click="dialogVisible = false"
            >取消</el-button
          >
          <el-button type="primary" size="small" @click="addOrEditRole" :loading="addOrEditLoading"
            >确定</el-button
          >
        </div>
      </el-dialog>

      <!--权限设置对话框-->
      <div class="powerDiv">
        <el-dialog title="权限设置" :visible.sync="powerDialogVisible">
          <el-checkbox-group v-model="newPowerList">
            <el-card
              class="margin-top"
              v-for="(power, i) in powerList"
              :key="i"
            >
              <div slot="header">
                <span style="font-size:14px;">{{ power.meta_title }}</span>
              </div>
              <div class="margin-top">
                <el-checkbox
                  v-for="(child, j) in power.children"
                  :key="j"
                  :label="child.id"
                  border
                  size="small"
                  >{{ child.meta_title }}</el-checkbox
                >
              </div>
            </el-card>
          </el-checkbox-group>
          <div slot="footer">
            <el-button
              type="danger"
              size="small"
              @click="powerDialogVisible = false"
              >取消</el-button
            >
            <el-button type="primary" size="small" @click="setPower"
              >确定</el-button
            >
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { ajax,storage } from "../../common";
import apiUrls from "../../config/apiUrls";

export default {
  name: "RoleList",
  data() {
    return {
      roleList: [],//下拉框遍历角色
      height: "calc( 100vh - 250px)",
      kw: "",
      status: "",
      dialogVisible: false,
      addOrEditLoading:false,//新增或编辑确定保存显示加载防止重复提交
      dialogTitle: "角色信息",
      ids: [],//存放ids集合 用于批量操作
      //角色信息
      roleInfo: {
        id: null,
        role_Name: "",
        description: "",
        status: ""
      },
      powerDialogVisible: false, //权限设置对话框
      powerList: [], //所有权限列表
      newPowerList: [], //权限分配列表集合
      index: 1, //当前页数
      size: 10, //页码
      tableCopyTableList: [], //表数据集合
    };
  },
  created() {
    this.getRoleList();

    //获取所有菜单渲染设置权限弹框
    this.getMenuList();
  },
  methods: {
    //获取角色列表
    getRoleList() {
      var that = this;
      let data = {
        kw:that.kw,
        Status:that.status
      };
      ajax
        .post(apiUrls.GetRoleList, data,{nocrypt:true})
        .then(r => {
          r = r.data;
          if (!r.success) {
            that.$message.error(r.returnMsg);
            return;
          }
          // that.roleList = r.returnData;
          that.tableCopyTableList = r.returnData;
          that.roleList = that.paging(that.size, that.index);
        })
        .catch(err => {
          console.log(err);
          that.$message.error("系统繁忙！请稍后再试");
        });
    },
    //获取菜单列表渲染设置权限弹框
    getMenuList() {
      ajax
        .post(apiUrls.GetMenuListById, {},{nocrypt:true})
        .then(r => {
          //console.log(r);
          r = r.data;
          if (!r.success) {
            this.$message.error("加载权限列表失败");
            return;
          }
          this.powerList = r.returnData;
        })
        .catch(err => {
          console.log(err);
          this.$message.error("加载权限数据失败");
        });
    },
    //根据角色id获取菜单id列表
    getMenuIdsByRoleId(id) {
      ajax
        .post(apiUrls.GetMenuIdsByRoleId, {ID: id},{nocrypt:true})
        .then(r => {
          r = r.data;
          if (!r.success) {
            this.$message.error("获取角色权限数据失败");
            return;
          }
          this.newPowerList = r.returnData;
          this.roleInfo.id = id;
          this.powerDialogVisible = true;
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },
    // 页数改变事件
    handleSizeChange(size) {
      this.size = size;
      this.roleList = this.paging(size, this.index);
    },
    // 页码改变事件
    handleCurrentChange(current) {
      this.index = current;
      this.roleList = this.paging(this.size, current);
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
    //新增或编辑管理员
    addOrEditRole() {
      //按钮显示加载
      this.addOrEditLoading=true;

      //参数验证
      if (!this.checkRoleInfo()) {
        //按钮关闭加载
        this.addOrEditLoading=false;
        return;
      }

      let data = {
        Role_Name: this.roleInfo.role_Name,
        Description: this.roleInfo.description,
        Status: this.roleInfo.status
      };
      //如果有id就是编辑否则新增
      let url = "";
      var user = JSON.parse(storage.session.get("user"));
      if (this.roleInfo.id) {
        data.ID = this.roleInfo.id;
        data.UpdateID = user.id;

        url = apiUrls.UpdateRole;
      } else {
        data.CreateID = user.id;

        url = apiUrls.AddRole;
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
          this.getRoleList(); //重新加载管理员列表
          this.dialogVisible = false; //关闭对话框
        })
        .catch(err => {
          //关闭确定按钮加载
          this.addOrEditLoading=false;

          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },
    //删除管理员信息
    deleteRoleByIds(id) {
      let idArr = [];
      if (id) {
        idArr = [id];
      } else {
        idArr = this.ids;
      }

      if (idArr.length == 0) {
        this.$message.warning("请选择角色");
        return;
      }
      let data = {
        ids: idArr
      };

      this.$confirm(`是否继续删除${id ? "当前" : "所选"}角色?`,"提示",{
        confirmButtonText:"确定",
        cancelButtonText:"取消",
        type:"warning"
      }).then(()=>{
        ajax
        .post(apiUrls.DeleteRoleByIds, data,{nocrypt:true})
        .then(r => {
          r = r.data;
          if (!r.success) {
            this.$message.error(r.returnMsg);
            return;
          }
          this.$message.success("删除成功");
          this.getRoleList();
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
      })
    },
    //设置权限
    setPower() {
      let pData = {
        ID:this.roleInfo.id,
        ids:this.newPowerList
      };

      ajax
        .post(apiUrls.SetPower, pData,{nocrypt:true})
        .then(r => {
          r = r.data;
          if (!r.success) {
            this.$message.error(r.returnMsg);
            return;
          }
          this.$message.success("设置成功");
          this.powerDialogVisible = false;
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },


    //显示编辑对话框
    showEditDialog(row) {
      this.roleInfo.id = row ? row.id : "";
      this.roleInfo.description = row ? row.description : "";
      this.roleInfo.role_Name = row ? row.role_Name : "";
      this.roleInfo.status = (row ? row.status.toString() : "1");
      this.dialogVisible = true;
    },
    //显示权限设置对话框
    showPowerDialog(id) {
      this.getMenuIdsByRoleId(id);
    },
    //检查输入的参数
    checkRoleInfo() {
      if (!this.roleInfo.role_Name) {
        this.$message.warning("请输入角色名称");
        return false;
      }
      if (!this.roleInfo.description) {
        this.$message.warning("请输入描述");
        return false;
      }
      return true;
    },
    //保存选中的角色id
    handleSelectionChange(rows) {
      this.ids = rows.map(row => row.id);
    },
    //格式化状态列
    formatStatus(row){
      return row.status==0?"停用":row.status==1?"启用":"";
    }
  }
};
</script>
<style lang="scss">
.rolDiv {
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
    .el-table td, .el-table th{
      text-align: center !important;
    }
  }
}
.powerDiv {
  .el-dialog__body {
    padding: 0 20px !important;
    .el-card__header {
      padding: 15px 20px !important;
    }
    .el-card__body {
      padding: 10px !important;
    }
  }
}
</style>

<style scoped>
.margin-top {
  margin-top: 10px;
}
</style>
