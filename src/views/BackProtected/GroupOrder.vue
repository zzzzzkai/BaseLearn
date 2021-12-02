<template>
  <div>
    <div class="ordDiv">
      <div style="width:100%;">订单列表</div>
      <div class="lncTop">
        <div class="getNew">
          <el-input
            placeholder="姓名(为空时默认加载全部)"
            v-model="Orderlist.name"
            size="small"
          ></el-input>
        </div>
        <div class="getSeleLnc">
          <el-select v-model="Orderlist.company_Name" placeholder="全部" size="small" filterable clearable>
            <el-option label="全部" value="全部"></el-option>
            <el-option
              v-for="item in lnclist"
              :key="item.lnc_Code"
              :label="item.lnc_Name"
              :value="item.lnc_Name"
            ></el-option>
          </el-select>
        </div>
        <div class="getSele">
          <el-select v-model="Orderlist.state" placeholder="全部" size="small">
            <el-option label="全部" value="全部"></el-option>
            <el-option label="已预约" value="已预约"></el-option>
            <el-option label="已撤销" value="已撤销"></el-option>
            <el-option label="已导出" value="已导出"></el-option>
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

        <el-button
          type="success"
          icon="el-icon-files"
          @click="exportExcel"
          size="small"
          style="margin-left: 10px;"
        >Excel导出</el-button>

        <el-button type="danger" icon="el-icon-delete" @click="CancelOrder()" size="small">批量撤销</el-button>
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
          <el-table-column
            type="selection"
            width="55"
            :reserve-selection="true"
          ></el-table-column>

         <el-table-column
            :prop="item.propValue"
            :label="item.label"
            :width="item.width"
            align="center"
            sortable
            v-for="(item, index) in propData"
            :key="index"
          ></el-table-column>

          <el-table-column label="操作" fixed="right" align="center">
            <template slot-scope="scope">
              <el-button
                type="primary"
                @click="CancelOrder(scope.row.id)"
                plain
                v-if="scope.row.state!='已撤销' && scope.row.state!='已导出'"
              >撤销</el-button>
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
  name:'GroupOrder',
  data() {
    return {
      ids: "", //id集合 用于批量删除或单个删除
      height: "calc( 100vh - 250px)",
      tableData: [], //表格数据源
      lnclist: [], //单位下拉框
      tableCopyTableList: [], //保存数据 用于分页
      tableConstData: [], //存放数据 用于筛选数据
      index: 1, //默认在第一页
      size: 100, //默认一页50条数据
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
      beginTime: [], //日期控件的值
      propData: [ //width  有需要就加，其余的自适应
        {
          propValue: "name",
          label: "姓名",
        },
        {
          propValue: "idCard",
          label: "身份证",
          width:"180"
        },
        {
          propValue: "tel",
          label: "联系电话",
        },
         {
          propValue: "type",
          label: "订单类型",
        },
        {
          propValue: "clus_Name",
          label: "套餐名称",
        },
        {
          propValue: "begin_Time",
          label: "体检时间",
        },
        {
          propValue: "company_Name",
          label: "单位名称",
        },
        {
          propValue: "state",
          label: "订单状态",
        }
      ],
    };
  },
  created() {
    this.setDate();
    this.GetOrderList();
  },
  methods: {
     //设置日期
    setDate(){
      var date=new Date();  
      date.setDate(date.getDate() - 7); //获取半个月
      //js计算今天的日期
      this.beginTime[0]=date.toLocaleDateString();
      this.beginTime[1]=new Date().toLocaleDateString();
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
    //获取所有团体订单
    GetOrderList() {
      var that = this;
      if(that.beginTime==null){location.reload();return};
      var pData={
        startDate:that.beginTime[0],
        endDate:that.beginTime[1]
      }

      ajax
        .post(apiUrls.GetGroupOrder,pData,{nocrypt:true})
        .then(r => {
          if (!r.data.success) {
            alert(r.data.returnMsg);
            return;
          }

          that.lnclist = r.data.returnData.lnclist;//单位列表
          var data=r.data.returnData.orderlist;
          if(data.length==0){
            return;
          }
          let returnMap = r.data.returnData.orderlist;
          returnMap = returnMap.sort(function (a, b) {
            return a.id < b.id ? 1 : -1;
          });

         let returnArray = returnMap.map((val) => {
            val.begin_Time =val.begin_Time.substr(0, 10);
            switch (val.type) {
              case "person":
                val.type = "个人体检";
                break;
              case "healthcard":
                val.type = "健康证体检";
                break;
              case "staff":
                val.type = "入职体检";
                break;
              case "nucleicAcid":
                val.type = "核酸体检";
                break;
              default:
                break;
            }
             
            switch (val.state) {
              case "F":
                val.state = "已预约";
                break;
              case "C":
                val.state = "已撤销";
                break;
              case "export":
                val.state = "已导出";
                break;
              case "E":
                val.state = "异常订单";
                break;
              case "Refund":
                val.state = "已退费";
                break;
              case "T":
                val.state = "已超时";
                break;
              case "S":
                val.state = "待支付";
                break;
              default:
                break;
            }
            return val;
          });

          // 初始化数据
          that.tableConstData = returnArray;
          that.tableCopyTableList = returnArray;
          that.tableData = this.paging(this.size, this.index);
        })
        .catch(err => {
          alert("获取订单失败,请稍后重试");
        });
    },
    //撤销订单
    CancelOrder(ids) {
      let idArr = [];
      if (ids) {
        idArr = [ids];
      } else {
        idArr = this.ids;
      }
      if (idArr.length == 0) {
        this.$message.warning("请选择订单");
        return;
      }

      this.$confirm("确定撤销此订单吗, 是否继续?", "提示", {
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
          .post(apiUrls.CancelGrpOrder, pData)
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
      require.ensure([], () => {
        const { export_json_to_excel } = require("../../common/Export2Excel");//js存放的位置
        const tHeader = ["姓名","身份证","电话号码","单位名称","套餐名称","体检时间","订单状态","订单类型"]; //生成Excel表格的头部标题栏
        const filterVal = ["name","idCard","tel","company_Name","clus_Name","begin_Time","state","type"]; //生成Excel表格的内容栏（根据自己的数据内容属性填写）
        const list = this.tableData; //需要导出Excel的数据
        const data = this.formatJson(filterVal, list);
        export_json_to_excel(tHeader, data, "团检订单表格"); //这里可以定义你的Excel表的默认名称
      });
    },
     formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]));
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
          ((this.Orderlist.company_Name || "全部") == "全部" ||
            item.company_Name == this.Orderlist.company_Name) &&
          ((this.Orderlist.state || "全部") == "全部" ||
            item.state == this.Orderlist.state) &&
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

<style lang="scss" scoped>
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
      // margin-left: 10px;
      .el-input__inner {
        padding: 0 5px !important;
        text-align: center;
        width: 180px !important;
      }
    }

    .getSeleLnc {
      width: 180px;
      margin-left: 10px;
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
