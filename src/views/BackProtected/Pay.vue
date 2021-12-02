<template>
  <div>
    <div class="ordDiv">
      <div style="width:100%;">订单列表</div>
      <div class="lncTop">
        <div class="getNew">
          <el-input placeholder="姓名(为空时默认加载全部)" v-model="Orderlist.name" size="small"></el-input>
        </div>
        <div class="getSele">
          <el-select v-model="Orderlist.state" placeholder="全部" size="small">
            <el-option label="全部" value="全部"></el-option>
            <el-option label="缴费成功" value="缴费成功"></el-option>
            <el-option label="缴费失败" value="缴费失败"></el-option>
     
          </el-select>
        </div>
        <div class="getPicker">
          <el-date-picker
            v-model="beginTime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy 年 MM 月 dd 日"
            value-format="yyyy/MM/dd"
            :picker-options="pickerOptions"
            size="small"
          ></el-date-picker>
        </div>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="GetNewData"
          size="small"
          style="margin-left: 10px;"
        >查询</el-button>

        <el-button type="success" icon="el-icon-files" @click="exportExcel" size="small">Excel导出</el-button>

        <!-- <el-button
          type="danger"
          icon="el-icon-delete"
          @click="CancelOrder()"
          size="small"
          >批量撤销</el-button
        >-->
      </div>
      <div class="lncMid">
        <el-table
          :data="tableData"
          border
          stripe
          :default-sort="{ prop: 'id', order: 'descending' }"
          @selection-change="handleSelectionChangePeople"
          id="ordertable"
          :height="height"
          row-key="id"
          :fit="true"
        >
          <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
          <el-table-column prop="name" label="姓名" width="100" align="center" sortable></el-table-column>
          <el-table-column prop="openid" label="openid" width="100" align="center" sortable></el-table-column>
          <el-table-column prop="clus_Name" label="套餐名" align="center" sortable></el-table-column>
          <el-table-column prop="regno" label="regno" align="center" sortable></el-table-column>
          <el-table-column prop="pay_flag" label="缴费状态" align="center" sortable></el-table-column>
          <el-table-column prop="price" label="价格" align="center" sortable></el-table-column>
          <el-table-column prop="transaction_id" label="订单ID" align="center" sortable></el-table-column>
          <el-table-column prop="create_time" label="创建时间" align="center" sortable></el-table-column>
          <el-table-column prop="pay_time" label="支付时间" align="center" sortable></el-table-column>
          <el-table-column prop="out_trade_no" label="支付ID" align="center" sortable></el-table-column>
          <el-table-column prop="refund_time" label="退款时间" align="center" sortable></el-table-column>
          <el-table-column prop= "out_refund_no" label="退款ID" align="center" sortable></el-table-column>
          <el-table-column prop="rder_type" label="交易类型" align="center" sortable></el-table-column>
          <el-table-column prop="update_Time" label="更新时间" align="center" sortable></el-table-column>
            <!-- <el-table-column prop= "update_Time" label="更新时间" align="center" sortable></el-table-column> -->
 
          <!-- <el-table-column label="操作" width="120" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="CancelOrder(scope.row.id)"
                plain
                v-if="scope.row.state!='已撤销' && scope.row.state!='已导出'"
              >撤销</el-button>
            </template>
          </el-table-column>  -->
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
      </div>
    </div>
  </div>
</template>

<script>
import { ajax } from "../../common";
import apiUrls from "../../config/apiUrls";
import baseData from "../../../public/baseData.json";
import FileSaver from "file-saver";
import XLSX from "xlsx";
export default {
  name:'Pay',
  data() {
    return {
      ids: "", //id集合 用于批量删除或单个删除
      height: "calc( 100vh - 250px)",
      tableData: [], //表格数据源
      tableCopyTableList: [], //保存数据 用于分页
      tableConstData: [], //存放数据 用于筛选数据
      index: 1, //默认在第一页
      size: 50, //默认一页50条数据
      //订单模型
     Orderlist: {
        name: "", //姓名,
        company_Name: "", //单位名称
        state: "", //订单状态
        type: "" //订单类型
      },
      //日期控件的属性
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      beginTime: "" //日期控件的值
    };
  },
  created() {
    this.GetOrderList();
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
    //获取所有个检订单
    GetOrderList() {
      var that=this;
      ajax
        .post(apiUrls.pay)
        .then(r => {
          if (!r.data.success) {
            alert(r.data.returnMsg);
            return;
          }
          // 初始化数据
          that.tableConstData = r.data.returnData;
          that.tableCopyTableList = r.data.returnData;
          that.tableData = this.paging(this.size, this.index);
        })
        .catch(err => {
          alert("获取订单失败,请稍后重试");
        });
    },
    //撤销订单
    CancelOrder(id) {
      // let idArr = [];
      // if (ids) {
      //   idArr = [ids];
      // } else {
      //   idArr = this.ids;
      // }
      // if (idArr.length == 0) {
      //   this.$message.warning("请选择订单");
      //   return;
      // }

      this.$confirm("确定撤销此订单吗, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        let pData = {
          OrdData: {
            id: id
          }
        };

        ajax
          .post(apiUrls.CancelPerOrder, pData)
          .then(r => {
            if (!r.data.success) {
              alert(r.data.returnMsg);
              return;
            }
            this.$message.success("撤销成功");
            this.GetOrderList();
          })
          .catch(err => {
            alert("获取订单失败,请稍后重试");
          });
      });
    },
    //表格的事件
    handleSelectionChangePeople(rows) {
      this.ids = rows.map(row => row.id);
    },
    //导出表格
    exportExcel() {
      /* out-table关联导出的dom节点  */
      var wb = XLSX.utils.table_to_book(document.querySelector("#ordertable"));
      /* get binary string as output */
      var wbout = XLSX.write(wb, {
        bookType: "xlsx",
        bookSST: true,
        type: "array"
      });
      try {
        FileSaver.saveAs(
          new Blob([wbout], { type: "application/octet-stream" }),
          "个检预约名单.xlsx"
        );
      } catch (e) {
        if (typeof console !== "undefined") console.log(e, wbout);
      }
      return wbout;
    },
    //表格筛选
    GetNewData() {
     
      this.tableCopyTableList = this.tableConstData.filter(item => {
        //把item.begin_Time格式化成xxxx-xx-xx格式
        // let beginTimeArr=item.begin_Time.split("/");
        // let beginYear=beginTimeArr[0];
        // let beginMonth=beginTimeArr[1]<10?("0"+beginTimeArr[1]):beginTimeArr[1];
        // let beginDate=beginTimeArr[2]<10?("0"+beginTimeArr[2]):beginTimeArr[2];
        // let beginTime=`${beginYear}-${beginMonth}-${beginDate}`;
        //筛选

        return (
          (!this.Orderlist.name || item.name.includes(this.Orderlist.name)) &&
          ((this.Orderlist.state || "全部") == "全部" ||
            item.pay_flag == this.Orderlist.state) &&
          (!this.beginTime ||
            (Date.parse(item.begin_Time) >= Date.parse(this.beginTime[0]) &&
              Date.parse(item.begin_Time) <= Date.parse(this.beginTime[1])))
        );
      });
      this.tableData = this.paging(this.size, this.index);
    }
  }
};
</script>

<style lang="scss">
.ordDiv {
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
    // justify-content: space-between;
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
      margin-left: 10px;
      .el-input__inner {
        padding: 0 10px !important;
        width: 100px !important;
      }
    }
    .getPicker {
      width: 300px;
      margin-left: 10px;
      .el-range-editor.el-input__inner {
        padding: 3px 6px !important;
        width: 300px;
        display: flex;
        justify-content: space-between;
      }
      .el-date-editor .el-range-separator {
        padding: 0 !important;

        margin-left: 5px;
        margin-right: 5px;
      }
      .el-date-editor .el-range-input {
        width: 50% !important;
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
