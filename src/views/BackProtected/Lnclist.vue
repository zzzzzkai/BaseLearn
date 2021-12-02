<template>
  <div>
    <div class="lncDiv">
      <div style="width:100%;">单位列表</div>
      <div class="lncTop">
        <el-input
          placeholder="单位名称(为空时默认加载全部)"
          style="width:240px"
          v-model="LncList.lnc_Name"
          size="small"
        ></el-input>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="GetNewData"
          style="margin-left:10px;"
          size="small"
        >查询</el-button>
        <el-button type="success" icon="el-icon-plus" @click="SyncLnc()" size="small">同步</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="DeleteLnc()" size="small">批量删除</el-button>
      </div>

      <div class="lncMid">
        <el-table
          :data="tableData"
           v-loading="loading"
            element-loading-text="拼命加载中"
          border
          stripe
          :fit="true"
          row-key="id"
          @selection-change="handleSelectionChangePeople"
          :height="height"
        >
          <el-table-column type="selection" width="55" align="center" :reserve-selection="true"></el-table-column>
          <el-table-column prop="lnc_Code" label="单位编码" width="200" align="center" sortable></el-table-column>
          <el-table-column prop="lnc_Name" label="单位名称" align="center" sortable></el-table-column>
          <el-table-column prop="lnc_State" label="是否为可体检的单位" align="center" sortable></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button @click="showAddorEditDialog(scope.row)" type="primary" plain>编辑</el-button>
              <el-button @click="DeleteLnc(scope.row.id)" type="danger" plain>删除</el-button>
              <!--单个删除-->
            </template>
          </el-table-column>
        </el-table>
        <div class="pageNation">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="index"
            :page-sizes="[50, 100, 200, 300, 500]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableCopyTableList.length"
          ></el-pagination>
        </div>

        <!--新增/编辑对话框-->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
          <el-form :label-position="'right'" label-width="80px">
            <el-form-item label="单位编码">
              <el-input v-model="LncList.lnc_Code" placeholder="请输入单位编码" size="small"></el-input>
            </el-form-item>
            <el-form-item label="单位名称">
              <el-input v-model="LncList.lnc_Name" placeholder="请输入单位名称" size="small"></el-input>
            </el-form-item>
            <el-form-item label="是否启用">
              <el-select v-model="LncList.lnc_State" size="small">
                <el-option label="启用" value="T"></el-option>
                <el-option label="禁用" value="F"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer">
            <el-button type="primary" size="small" @click="addOrEditLnc">确定</el-button>
            <el-button type="danger" size="small" @click="dialogVisible = false">取消</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { ajax } from "../../common";
// import{Toast} from 'vant';
import apiUrls from "../../config/apiUrls";
export default {
  name: "Lnclist",
  data() {
    return {
      ids: "", //id集合 用于批量删除或单个删除
      height: "calc( 100vh - 250px)",
      tableData: [], //表数据
      tableCopyTableList: [], //表数据集合
       tableConstData: [], //存放数据 用于筛选数据
      index: 1, //当前页数
      size: 50, //页码
      dialogVisible: false, //新增编辑对话框是否显示
      dialogTitle: "", //对话框的标题
      loading :false,
      //单位模型
      LncList: {
        id: "",
        lnc_Code: "",
        lnc_Name: "",
        lnc_State: ""
      }
    };
  },
  created() {
    this.GetLncList();
  },
  methods: {
    //获取选中行id
    handleSelectionChangePeople(rows) {
      console.log('row',rows)
      this.ids = rows.map(row => row.id);
    },
    //显示模态框
    showAddorEditDialog(row) {
      if (row == undefined) {
        this.dialogTitle = "新增单位";
      } else {
        this.dialogTitle = "查看/编辑单位";
      }
      this.LncList.id = row ? row.id : "";
      this.LncList.lnc_Code = row ? row.lnc_Code : "";
      this.LncList.lnc_Name = row ? row.lnc_Name : "";
      this.LncList.lnc_State =
        (row ? row.lnc_State : "启用") == "启用" ? "T" : "F";
      this.dialogVisible = true;
    },
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
    //获取所有单位信息
    GetLncList() {
      var that = this;
      that.loading=false;
      ajax
        .post(apiUrls.GetLncList)
        .then(r => {
          if (!r.data.success) {
            alert(r.data.returnMsg);
            return;
          }

          // 初始化数据
          that.tableConstData=r.data.returnData;
          that.tableCopyTableList = r.data.returnData;
          that.tableData = that.paging(that.size, that.index);
       
        })
        .catch(err => {
          alert("获取单位失败,请稍后重试");
        });
    },
    SyncLnc(){
 
     this.loading=true;
      ajax.post(apiUrls.SyncLnc).then(r=>{
                  
        if(r.data.success){
          this.$message.success(r.data.returnMsg);
         
             this.GetLncList();
        
        }
        

      });
     
    },
    //删除单位
    DeleteLnc(ids) {
      let idArr = [];
      if (ids) {
        idArr = [ids];
      } else {
        idArr = this.ids;
      }
      if (idArr.length == 0) {
        this.$message.warning("请选择单位");
        return;
      }

      this.$confirm("确定删除此单位吗, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        let pData = {
          data: {
            ids: idArr
          }
        };
        ajax
          .post(apiUrls.DeleteById, pData)
          .then(r => {
            if (!r.data.success) {
              this.$message.error(r.returnMsg);
              return;
            }
            this.$message.success("删除成功");
            this.GetLncList();
          })
          .catch(err => {
            console.log(err);
            this.$message.error("系统繁忙！请稍后再试");
          });
      });
    },
    //检查输入的参数
    checkAdminInfo() {
      if (!this.LncList.lnc_Code) {
        this.$message.warning("请输入单位编码");
        return false;
      }
      if (!this.LncList.lnc_Name) {
        this.$message.warning("请输入单位名称");
        return false;
      }
      return true;
    },
    //新增或者修改单位
    addOrEditLnc() {
      //参数验证
      if (!this.checkAdminInfo()) {
        return;
      }

      var addOrEdit = ""; //请求变量 新增/编辑 api地址不一样
      if (this.LncList.id) {
        addOrEdit = apiUrls.UpdateLnc;
      } else {
        this.LncList.id = "0";
        addOrEdit = apiUrls.AddLnc;
      }
      var pData = {
        tjlnc: this.LncList
      };
      ajax
        .post(addOrEdit, pData)
        .then(r => {
          if (!r.data.success) {
            alert(r.data.returnMsg);
            return;
          }
          this.$message.success("操作成功");
          this.dialogVisible = false; //成功后关闭对话框
          this.GetLncList(); //重新加载
        })
        .catch(err => {
          console.log(err);
          this.$message.error("系统繁忙！请稍后再试");
        });
    },
    //表格筛选
    GetNewData() {
      this.tableCopyTableList = this.tableConstData.filter(item => {
        //筛选
        return !this.LncList.lnc_Name || item.lnc_Name.includes(this.LncList.lnc_Name);
      });
      this.tableData = this.paging(this.size, this.index);
    }
  }
};
</script>

<style lang="scss">
.lncDiv {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 96%;
  margin: 20px auto;
  .lncTop {
    width: 100%;
    margin-top: 10px;
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
