<template>
  <div style="margin-top:10px;">
    <el-container>
      <el-header>
        <div style="margin-top:10px;">修改资料</div>
      </el-header>
      <el-main style="width:100%">
        <el-row>
          <el-col :span="20">
            <el-form label-width="30%">
              <el-form-item label="管理员编号:">
                <el-input
                  v-model="user.Admin_Code"
                  size="small"
                  prefix-icon="el-icon-user"
                  disabled
                ></el-input>
              </el-form-item>
              <el-form-item label="管理员名称:">
                <el-input size="small" v-model="user.Admin_Name" prefix-icon="el-icon-user"></el-input>
              </el-form-item>
              <el-form-item label="角色:">
                <el-select size="small" v-model="user.Admin_Type" disabled>
                  <el-option
                    v-for="item in roleList"
                    :key="item.id"
                    :label="item.role_Name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="密码:">
                <el-input
                  placeholder="请输入密码（不填则不修改）"
                  size="small"
                  v-model="user.Admin_Pwd"
                  type="password"
                  prefix-icon="el-icon-lock"
                  show-password
                  clearable
                ></el-input>
              </el-form-item>
              <el-form-item label="确认密码:">
                <el-input
                  placeholder="请输入确认密码"
                  size="small"
                  v-model="user.Admin_ConfirmPwd"
                  type="password"
                  prefix-icon="el-icon-lock"
                  show-password
                  clearable
                ></el-input>
              </el-form-item>
              <!-- <el-form-item label="OpenId">
                <el-input></el-input>
              </el-form-item>-->
              <el-form-item label>
                <el-button size="small" type="primary" @click="updateAdmin"
                  >保存内容</el-button
                >
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ajax,storage } from "../../common";
import apiUrls from "../../config/apiUrls";

export default {
  name: "EditInfomation",
  data() {
    return {
      roleList: [],//下拉框遍历角色
      //用户列表
      user: {
        Admin_Code: "",
        Admin_Name: "",
        Admin_Type: "",
        Admin_Pwd: "",
        Admin_ConfirmPwd: "",
        Status: 1,
        ID: "",
        UpdateID: ""
      }
    };
  },
  created() {
    this.getRoleList();
    this.getAdminInfo();
  },
  methods: {
    //检查输入的参数
    checkAdminInfo() {
      if (!this.user.Admin_Name) {
        this.$message.warning("请输入管理员名称");
        return false;
      }
      if (this.user.Admin_ConfirmPwd != this.user.Admin_Pwd) {
        this.$message.warning("两次密码不一致，请重新输入");
        return false;
      }
      return true;
    },
    //获取角色列表
    getRoleList() {
      ajax
        .post(apiUrls.GetRoleList, {},{nocrypt:true})
        .then(r => {
          r = r.data;
          if (!r.success) {
            this.$message.error(r.returnMsg);
            return;
          }
          this.roleList = r.returnData;
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },
    //获取本地用户信息
    getAdminInfo() {
      var user = JSON.parse(storage.session.get("user"));
      this.user.Admin_Code = user.admin_Code;
      this.user.Admin_Name = user.admin_Name;
      this.user.Admin_Type = user.admin_Type;
      this.user.ID = user.id;
      this.user.UpdateID = user.id;
    },
    //保存修改
    updateAdmin() {
      //参数验证
      if (!this.checkAdminInfo()) {
        return;
      }

      ajax
        .post(apiUrls.UpdateAdmin, this.user,{nocrypt:true})
        .then(r => {
          r = r.data;
          if (!r.success) {
            this.$message.error(r.returnMsg);
            return;
          }
          this.$message.success("已保存当前修改！");

          //修改本地缓存的用户名称
          let user = JSON.parse(storage.session.get("user"));
          user.admin_Name=this.user.Admin_Name;
          storage.session.set("user",JSON.stringify(user));
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    }
  }
};
</script>

<style scoped></style>
