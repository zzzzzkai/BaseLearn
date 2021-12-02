<template>
  <div>
    <div class="TjBox">
      <!-- 单位日期 -->
      <div class="company">
        <!--单位选择 -->
        <div class="companySwitch">
          单位：
          <el-button @click="drawer = true" type="primary" size="mini">
            {{
            darwerValue
            }}
          </el-button>
          <input type="hidden" v-model="lnc_Code" />
          <!--抽屉 -->
          <el-drawer title="单位号源" :visible.sync="drawer" :with-header="false">
            <div class="drawerAll">
              <div class="drawerTop">单位列表</div>
              <div class="drawerSearch">
                <!-- <div class="searchTwo">体检单位预约列表</div> -->
                <div class="searchTwo">
                  <el-input
                    placeholder="单位编码/单位名称"
                    prefix-icon="el-icon-search"
                    v-model="drawerIpnut"
                    size="mini"
                  ></el-input>
                  <el-button type="primary" plain size="mini" @click="querys">查询</el-button>
                </div>
              </div>
              <div class="drawerList">
                <div class="drawerTr1">
                  <div class="drawerTd1">
                    <span>单位编码</span>
                  </div>
                  <div class="drawerTd2">
                    <span>单位名称</span>
                  </div>
                </div>
                <div
                  v-for="(item, index) in drawerData"
                  :key="index"
                  class="drawerTr2"
                  :class="{ hoverIndex: index == hoverIndex }"
                  @mouseover="hoverIndex = index"
                  @mouseout="hoverIndex = -1"
                  @click="drawerBtn(index)"
                >
                  <div class="drawerTd3">
                    <!-- <span>{{ item.drawerCode }}</span> -->
                    <span>{{ item.lnc_Code }}</span>
                  </div>
                  <div class="drawerTd4">
                    <!-- <span>{{ item.drawerName }}</span>-->
                    <span>{{ item.lnc_Name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-drawer>
        </div>
        <div class="companyNow">
          <!-- 日期选择 -->
          <div class="companyDate">
            <el-button plain size="mini" @click="lastMonth">上一月</el-button>
            <el-select
              v-model="yearValue"
              size="mini"
              style="width:100px;margin-left:5px;"
              @change="Revisionyear"
            >
              <el-option
                v-for="item in yearOptions"
                :key="item.yearValue"
                :label="item.label"
                :value="item.yearValue"
              ></el-option>
            </el-select>
            <el-select
              v-model="monthValue"
              size="mini"
              style="width:100px;margin-left:5px;"
              @change="Revisionmonth"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item.monthValue"
                :label="item.label"
                :value="item.monthValue"
              ></el-option>
            </el-select>
            <el-button plain size="mini" style="margin-left:5px" @click="nextMonth">下一月</el-button>
          </div>
          <!-- 提示文字 -->
          <div class="companySpan">
            <span>提示：单击表格即可修改容量</span>
          </div>
        </div>
      </div>
      <!-- 号源 -->
      <div class="sourceAll">
        <div class="sourceName">
          <span class="sourceNow">{{ sourceValue }}</span>
        </div>
        <div class="sourceTable">
          <div class="sourceList" v-for="(items, indexs) in everyAll" :key="indexs">
            <div class="sourceEvery" :style="everyWidth">
              <div class="sourceDiv1">日期</div>
              <div class="sourceDiv1">星期</div>
              <div class="sourceDiv">预留</div>
              <div class="sourceDiv">已约</div>
              <div class="sourceDiv">剩余</div>
            </div>
            <div
              class="sourceEvery"
              :style="everyWidth"
              v-for="(item, index) in items.everyData"
              :key="index"
              @click="matchDate(item)"
            >
              <div class="sourceDiv1">{{ item.person_Date }}</div>
              <div class="sourceDiv1">{{ item.shift_no }}</div>
              <div class="sourceDiv" :class="switchHaoyuanClass(item)">{{ item.person_Sum }}</div>
              <div class="sourceDiv" :class="switchHaoyuanClass(item)">{{ item.person_Already }}</div>
              <div class="sourceDiv" :class="switchHaoyuanClass(item)">{{ item.person_Surplus }}</div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog :visible.sync="dialogVisible" width="40%">
        <!-- 选择日期 -->
        <div style="width:100%;margin:0 auto;">
          <div>
            选择日期：
            <el-date-picker
              v-model="timeValue"
              type="daterange"
              size="small"
              format="yyyy 年 MM 月 dd 日"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </div>
          <!-- 勾选 -->
          <div style="margin-top:10px;">
            <el-checkbox v-model="checked">是否设为休息日</el-checkbox>
          </div>
          <div style="margin-top:10px;color:red;">(限额值为－1时,不设限额)</div>
          <!-- 人数分配 -->
          <div class="nowNumber">
            <div class="nowNumberOL">
              <div class="nowDivL"></div>
              <!-- <div
                class="nowDivR nowDivL"
                style=" background:-webkit-gradient(linear,left bottom,left top,color-stop(0,#eee),color-stop(1,#fff));justify-content: center;"
              >
                上午8:00-9:00
              </div>-->
              <div
                class="nowDivR nowDivL"
                v-for="(item,index) in personSumData"
                :key="index"
                style=" background:-webkit-gradient(linear,left bottom,left top,color-stop(0,#eee),color-stop(1,#fff));justify-content: center;"
              >{{item.sumtime_Name}}</div>
            </div>
            <div class="nowNumberOL">
              <div class="nowDivL">人数</div>
              <!-- <div class="nowDivR nowDivL">
                <el-input
                  v-model="inputNumber"
                  type="number"
                  min="-1"
                  placeholder="请输入内容"
                ></el-input>
              </div>-->

              <div class="nowDivR nowDivL" v-for="(items,indexs) in personSumData" :key="indexs">
                <el-input
                  v-model="items.team_Sum"
                  type="number"
                  min="-1"
                  placeholder="请输入内容"
                
                ></el-input>
              </div>
            </div>
            <div class="nowNumberOL">
              <div class="nowDivL">预约人数</div>
              <!-- <div class="nowDivR nowDivL">
                <span>{{ appointments }}</span>
              </div>-->
              <div class="nowDivR nowDivL" v-for="(Already,index) in personSumData" :key="index">
                <span>{{ Already.team_Already}}</span>
              </div>
            </div>
            <div class="nowNumberOL" style="border-bottom:0;">
              <div class="nowDivL">剩余人数</div>
              <!-- <div class="nowDivR nowDivL">
                <span>{{ surplus }}</span>
              </div>-->
              <div class="nowDivR nowDivL" v-for="(Surplus,index) in personSumData" :key="index">
                <span>{{ Surplus.team_Surplus }}</span>
              </div>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogConfirm">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import temporaryData from "../../common/temporaryData.js"; //号源临时假数据
import { ajax } from "../../common/ajax";
import apiUrls from "../../config/apiUrls";
export default {
  name: "BookTj",
  data() {
    return {
      drawer: false, //切换号源抽屉
      darwerValue: "所有单位", //号源值
      drawerIpnut: "", //单位编码名称
      hoverIndex: -1, //表示当前hover的是第几个div 初始为 -1 或 null 不能为0 0表示第一个div
      sourceValue: "总号源",
      everyWidth: "width:calc( 100% / 16)",
      lnc_Code: "",
      dialogVisible: false, //弹窗
      timeValue: "", //选择日期
      checked: false, //是否设置休息日
      appointments: 0, //预约人数
      appointments2: 0,
      surplus: 0, //剩余人数
      inputNumber: 10, //人数
      inputNumbe2: 0,
      surplus2: 0,
      Timeslott: [],
      personSumData: [],
      yearOptions: [], //年份下拉
      yearValue: "",
      monthOptions: [], //月份下拉
      monthValue: "",
      drawerData: [], //单位列表
      everyAll: [
        {
          everyData: []
        },
        {
          everyData: []
        }
      ] //日期数据
    };
  },
  created() {
    this.dateEventt();
    this.loadBtn();
    //this.dateEvent();
    this.Timeslot();
    this.montj();
    this.monthOptionss();
    this.yearOptionss();
  },
  methods: {
    // changes(items, index) {
    //   var that = this;
    //   var pda = [];
    //   pda = that.personSumData;
    //   if (JSON.stringify(pda).indexOf(items.sumtime_Code) > -1) {
    //     for (var i = 0; i < that.personSumData.length; i++) {
    //       if (that.personSumData[i] == items.sumtime_Code) {
    //         that.personSumData[i].team_Sum = items.team_Sum;
    //       }
    //     }
    //   }
    //   console.log(that.personSumData);
    // },
    Timeslot() {
      var pData = {
        sumTime: {
          sumtime_Flag: "staff"
        }
      };
      ajax
        .post(apiUrls.Timeslot, pData)
        .then(r => {
          if (!r.data.success) {
            this.$message.error(r.data.returnMsg);
            return;
          }
          this.Timeslott = r.data.returnData;
        })
        .catch(err => {
          this.$message.error("系统错误");
        });
    },
     getDaysByMonth(year, month) {
            return new Date(year, month , 0).getDate();
        },
    dateEventt() {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }

      if (this.yearValue == "") {
        year = year;
      } else {
        year = this.yearValue;
      }

      if (this.monthValue == "") {
        month = month;
      } else {
        month = this.monthValue;
      }
      let maxDate = this.getDaysByMonth(year, month);

        day = Math.min(maxDate, day);

      var dates = year + "-" + month + "-" + day;

      // 判断奇偶数 确定 表格宽度
      var everyAll = [
        {
          everyData: []
        },
        {
          everyData: []
        }
      ];
      var pData = {
        SumData: {
          date_Time: dates,
          lnccode: this.lnc_Code
        }
      };
      let everyIndex; //日期中间值
      ajax
        .post(apiUrls.GetMonthofDayT, pData)
        .then(r => {
          if (!r.data.success) {
            this.$message.error(r.data.returnMsg);
            return;
          }

          if (r.data.returnData.length % 2 == 0) {
            this.everyWidth =
              `width:calc( 100% / ` + (r.data.returnData.length / 2 + 1) + `)`;
            everyIndex = r.data.returnData.length / 2;
          } else {
            this.everyWidth =
              `width:calc( 100% /` +
              ((r.data.returnData.length + 1) / 2 + 1) +
              `)`;
            everyIndex = (r.data.returnData.length + 1) / 2;
          }
          var person_Datee = null;
          for (let i = 0; i < everyIndex; i++) {
            if (r.data.returnData[i].team_Date === null) {
              person_Datee = null;
            } else {
              person_Datee = r.data.returnData[i].team_Date
                .replace(" ", ":")
                .replace(/\:/g, "-")
                .split("-")[2]
                .split("T")[0];
              if (r.data.returnData[i].team_Flag === "T") {
                everyAll[0].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].team_Week, //星期
                  person_Sum: "休假", //号源数
                  person_Already: "休假", //已约人数
                  person_Surplus: "休假", //剩余号源
                  person_Flag: r.data.returnData[i].team_Flag //是否休假（T表示是休假）
                });
              } else {
                everyAll[0].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].team_Week, //星期
                  person_Sum: r.data.returnData[i].team_Sum, //号源数
                  person_Already: r.data.returnData[i].team_Already, //已约人数
                  person_Surplus: r.data.returnData[i].team_Surplus, //剩余号源
                  person_Flag: r.data.returnData[i].team_Flag //是否休假（T表示是休假）
                });
              }
            }
          }
          for (var i = everyIndex; i < r.data.returnData.length; i++) {
            if (r.data.returnData[i].team_Date === null) {
              person_Datee = null;
            } else {
              person_Datee = r.data.returnData[i].team_Date
                .replace(" ", ":")
                .replace(/\:/g, "-")
                .split("-")[2]
                .split("T")[0];
              if (r.data.returnData[i].team_Flag === "T") {
                everyAll[1].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].team_Week, //星期
                  person_Sum: "休假", //号源数
                  person_Already: "休假", //已约人数
                  person_Surplus: "休假", //剩余号源
                  person_Flag: r.data.returnData[i].team_Flag //是否休假（T表示是休假）
                });
              } else {
                everyAll[1].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].team_Week, //星期
                  person_Sum: r.data.returnData[i].team_Sum, //号源数
                  person_Already: r.data.returnData[i].team_Already, //已约人数
                  person_Surplus: r.data.returnData[i].team_Surplus, //剩余号源
                  person_Flag: r.data.returnData[i].team_Flag //是否休假（T表示是休假）
                });
              }
            }
          }
          if (r.data.returnData.length % 2 != 0) {
            everyAll[1].everyData.push({
              person_Date: "", //体检日期
              shift_no: "", //星期
              person_Sum: "", //号源数
              person_Already: "", //已约人数
              person_Surplus: "", //剩余号源
              person_Flag: "" //是否休假（T表示是休假）
            });
          }
          this.everyAll = everyAll;
        })
        .catch(err => {
          this.$message("系统错误");
        });
    },

    //上一个月
    lastMonth() {
      var value = Number(this.monthValue) - 1;
      if (value === 0) {
        if (
          Number(this.yearValue - 1) < Number(this.yearOptions[0].yearValue)
        ) {
          this.yearValue = Number(this.yearOptions[0].yearValue);
          this.monthValue = 1;
        } else {
          this.monthValue = 12;
          this.yearValue = Number(this.yearValue) - 1;
        }
      } else {
        this.monthValue = value;
      }
      // console.log(this.monthValue)
      this.dateEventt();
    },

    // 下月
    nextMonth() {
      var value = Number(this.monthValue) + 1;

      if (value === 13) {
        if (
          Number(this.yearValue) ===
          Number(this.yearOptions[this.yearOptions.length - 1].yearValue)
        ) {
          // console.log(this.yearValue)
          this.yearValue = Number(
            this.yearOptions[this.yearOptions.length - 1].yearValue
          );
          this.monthValue = 12;
        } else {
          this.monthValue = 1;
          this.yearValue = Number(this.yearValue) + 1;
        }
      } else {
        this.monthValue = value;
      }
      this.dateEventt();
    },

    //修改年的日历
    Revisionyear() {
      this.dateEventt();
    },
    //修改月的日历
    Revisionmonth() {
      this.dateEventt();
    },
    loadBtn() {
      var pData = {
        data: {
          kw: this.drawerIpnut
        }
      };
      ajax
        .post(apiUrls.GetGetlncmenu, pData)
        .then(r => {
          if (!r.data.success) {
            this.$message.error(r.data.returnMsg);
            return;
          }
          this.drawerData = r.data.returnData;
        })
        .catch(err => {
          this.$message.error("获取单位失败,请联系管理员");
        });
    },
    // 日期数据渲染
    // dateEvent() {
    //   // 判断奇偶数 确定 表格宽度
    //   var everyAll = [
    //     {
    //       everyData: []
    //     },
    //     {
    //       everyData: []
    //     }
    //   ];
    //   let everyIndex; //日期中间值
    //   if (temporaryData.length % 2 == 0) {
    //     this.everyWidth =
    //       `width:calc( 100% / ` + (temporaryData.length / 2 + 1) + `)`;
    //     everyIndex = temporaryData.length / 2;
    //     // console.log(this.everyWidth);
    //   } else {
    //     this.everyWidth =
    //       `width:calc( 100% /` + ((temporaryData.length + 1) / 2 + 1) + `)`;
    //     everyIndex = (temporaryData.length + 1) / 2;
    //   }
    //   var person_Date, shift_no;
    //   // 第一列数据
    //   for (let i = 0; i < everyIndex; i++) {
    //    if (temporaryData[i].person_Date === null) {
    //       person_Date = null;
    //     } else {
    //       // 日期截取
    //       person_Date = temporaryData[i].person_Date
    //         .replace(" ", ":")
    //         .replace(/\:/g, "-")
    //         .split("-")[2];
    //     }
    //     if (temporaryData[i].shift_no === null) {
    //       shift_no = null;
    //     } else {
    //       switch (temporaryData[i].shift_no) {
    //         case 1:
    //           shift_no = "周一";
    //           break;
    //         case 2:
    //           shift_no = "周二";
    //           break;
    //         case 3:
    //           shift_no = "周三";
    //           break;
    //         case 4:
    //           shift_no = "周四";
    //           break;
    //         case 5:
    //           shift_no = "周五";
    //           break;
    //         case 6:
    //           shift_no = "周六";
    //           break;
    //         case 7:
    //           shift_no = "周日";
    //           break;
    //         default:
    //           break;
    //       }
    //     }

    //     if (temporaryData[i].person_Flag === "T") {
    //       everyAll[0].everyData.push({
    //         arr_code: temporaryData[i].arr_code,
    //         person_Date: person_Date, //体检日期
    //         shift_no: shift_no, //星期
    //         person_Sum: "休假", //号源数
    //         person_Already: "休假", //已约人数
    //         person_Surplus: "休假", //剩余号源
    //         add_num: temporaryData[i].add_num,
    //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    //       });
    //     } else {
    //       everyAll[0].everyData.push({
    //         arr_code: temporaryData[i].arr_code,
    //         person_Date: person_Date, //体检日期
    //         shift_no: shift_no, //星期
    //         person_Sum: temporaryData[i].person_Sum, //号源数
    //         person_Already: temporaryData[i].person_Already, //已约人数
    //         person_Surplus: temporaryData[i].person_Surplus, //剩余号源
    //         add_num: temporaryData[i].add_num,
    //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    //       });
    //     }
    //   }

    //   // 第二列数据
    //   for (let i = everyIndex; i < temporaryData.length; i++) {
    //     if (temporaryData[i].person_Date === null) {
    //       person_Date = null;
    //     } else {
    //       // 日期截取
    //       person_Date = temporaryData[i].person_Date
    //         .replace(" ", ":")
    //         .replace(/\:/g, "-")
    //         .split("-")[2];
    //     }
    //     if (temporaryData[i].shift_no === null) {
    //       shift_no = null;
    //     } else {
    //       switch (temporaryData[i].shift_no) {
    //         case 1:
    //           shift_no = "周一";
    //           break;
    //         case 2:
    //           shift_no = "周二";
    //           break;
    //         case 3:
    //           shift_no = "周三";
    //           break;
    //         case 4:
    //           shift_no = "周四";
    //           break;
    //         case 5:
    //           shift_no = "周五";
    //           break;
    //         case 6:
    //           shift_no = "周六";
    //           break;
    //         case 7:
    //           shift_no = "周日";
    //           break;
    //         default:
    //           break;
    //       }
    //     }

    //     if (temporaryData[i].person_Flag === "T") {
    //       everyAll[1].everyData.push({
    //         arr_code: temporaryData[i].arr_code,
    //         person_Date: person_Date, //体检日期
    //         shift_no: shift_no, //星期
    //         person_Sum: "休假", //号源数
    //         person_Already: "休假", //已约人数
    //         person_Surplus: "休假", //剩余号源
    //         add_num: temporaryData[i].add_num,
    //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    //       });
    //     } else {
    //       everyAll[1].everyData.push({
    //         arr_code: temporaryData[i].arr_code,
    //         person_Date: person_Date, //体检日期
    //         shift_no: shift_no, //星期
    //         person_Sum: temporaryData[i].person_Sum, //号源数
    //         person_Already: temporaryData[i].person_Already, //已约人数
    //         person_Surplus: temporaryData[i].person_Surplus, //剩余号源
    //         add_num: temporaryData[i].add_num,
    //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    //       });
    //     }
    //   }
    //   this.everyAll = everyAll;
    // },
    querys() {
      this.loadBtn();
    },
    // 点击选择单位
    drawerBtn(index) {
      this.darwerValue = this.drawerData[index].lnc_Name;
      this.lnc_Code = this.drawerData[index].lnc_Code;
      this.dateEventt();
      this.drawer = false;
    },

    // 日期数据渲染
    // dateEvent() {
    //   // 判断奇偶数 确定 表格宽度
    //   var everyAll = [
    //     {
    //       everyData: []
    //     },
    //     {
    //       everyData: []
    //     }
    //   ];
    //   let everyIndex; //日期中间值
    //   if (temporaryData.length % 2 == 0) {
    //     this.everyWidth =
    //       `width:calc( 100% / ` + (temporaryData.length / 2 + 1) + `)`;
    //     everyIndex = temporaryData.length / 2;
    //     // console.log(this.everyWidth);
    //   } else {
    //     this.everyWidth =
    //       `width:calc( 100% /` + ((temporaryData.length + 1) / 2 + 1) + `)`;
    //     everyIndex = (temporaryData.length + 1) / 2;
    //   }
    //   var person_Date, shift_no;
    //   // 第一列数据
    //   for (let i = 0; i < everyIndex; i++) {
    //     if (temporaryData[i].person_Date === null) {
    //       person_Date = null;
    //     } else {
    //       // 日期截取
    //       person_Date = temporaryData[i].person_Date
    //         .replace(" ", ":")
    //         .replace(/\:/g, "-")
    //         .split("-")[2];
    //     }
    //     if (temporaryData[i].shift_no === null) {
    //       shift_no = null;
    //     } else {
    //       switch (temporaryData[i].shift_no) {
    //         case 1:
    //           shift_no = "周一";
    //           break;
    //         case 2:
    //           shift_no = "周二";
    //           break;
    //         case 3:
    //           shift_no = "周三";
    //           break;
    //         case 4:
    //           shift_no = "周四";
    //           break;
    //         case 5:
    //           shift_no = "周五";
    //           break;
    //         case 6:
    //           shift_no = "周六";
    //           break;
    //         case 7:
    //           shift_no = "周日";
    //           break;
    //         default:
    //           break;
    //       }
    //     }

    // // // 日期数据渲染
    // // dateEvent() {
    // //   // 判断奇偶数 确定 表格宽度
    // //   var everyAll = [
    // //     {
    // //       everyData: []
    // //     },
    // //     {
    // //       everyData: []
    // //     }
    // //   ];
    // //   let everyIndex; //日期中间值
    // //   if (temporaryData.length % 2 == 0) {
    // //     this.everyWidth =
    // //       `width:calc( 100% / ` + (temporaryData.length / 2 + 1) + `)`;
    // //     everyIndex = temporaryData.length / 2;
    // //     // console.log(this.everyWidth);
    // //   } else {
    // //     this.everyWidth =
    // //       `width:calc( 100% /` + ((temporaryData.length + 1) / 2 + 1) + `)`;
    // //     everyIndex = (temporaryData.length + 1) / 2;
    // //   }
    // //   var person_Date, shift_no;
    // //   // 第一列数据
    // //   for (let i = 0; i < everyIndex; i++) {
    // //     if (temporaryData[i].person_Date === null) {
    // //       person_Date = null;
    // //     } else {
    // //       // 日期截取
    // //       person_Date = temporaryData[i].person_Date
    // //         .replace(" ", ":")
    // //         .replace(/\:/g, "-")
    // //         .split("-")[2];
    // //     }
    // //     if (temporaryData[i].shift_no === null) {
    // //       shift_no = null;
    // //     } else {
    // //       switch (temporaryData[i].shift_no) {
    // //         case 1:
    // //           shift_no = "周一";
    // //           break;
    // //         case 2:
    // //           shift_no = "周二";
    // //           break;
    // //         case 3:
    // //           shift_no = "周三";
    // //           break;
    // //         case 4:
    // //           shift_no = "周四";
    // //           break;
    // //         case 5:
    // //           shift_no = "周五";
    // //           break;
    // //         case 6:
    // //           shift_no = "周六";
    // //           break;
    // //         case 7:
    // //           shift_no = "周日";
    // //           break;
    // //         default:
    // //           break;
    // //       }
    // //     }

    // //     if (temporaryData[i].person_Flag === "T") {
    // //       everyAll[0].everyData.push({
    // //         arr_code: temporaryData[i].arr_code,
    // //         person_Date: person_Date, //体检日期
    // //         shift_no: shift_no, //星期
    // //         person_Sum: "休假", //号源数
    // //         person_Already: "休假", //已约人数
    // //         person_Surplus: "休假", //剩余号源
    // //         add_num: temporaryData[i].add_num,
    // //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    // //       });
    // //     } else {
    // //       everyAll[0].everyData.push({
    // //         arr_code: temporaryData[i].arr_code,
    // //         person_Date: person_Date, //体检日期
    // //         shift_no: shift_no, //星期
    // //         person_Sum: temporaryData[i].person_Sum, //号源数
    // //         person_Already: temporaryData[i].person_Already, //已约人数
    // //         person_Surplus: temporaryData[i].person_Surplus, //剩余号源
    // //         add_num: temporaryData[i].add_num,
    // //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    // //       });
    // //     }
    // //   }

    // //   // 第二列数据
    // //   for (let i = everyIndex; i < temporaryData.length; i++) {
    // //     if (temporaryData[i].person_Date === null) {
    // //       person_Date = null;
    // //     } else {
    // //       // 日期截取
    // //       person_Date = temporaryData[i].person_Date
    // //         .replace(" ", ":")
    // //         .replace(/\:/g, "-")
    // //         .split("-")[2];
    // //     }
    // //     if (temporaryData[i].shift_no === null) {
    // //       shift_no = null;
    // //     } else {
    // //       switch (temporaryData[i].shift_no) {
    // //         case 1:
    // //           shift_no = "周一";
    // //           break;
    // //         case 2:
    // //           shift_no = "周二";
    // //           break;
    // //         case 3:
    // //           shift_no = "周三";
    // //           break;
    // //         case 4:
    // //           shift_no = "周四";
    // //           break;
    // //         case 5:
    // //           shift_no = "周五";
    // //           break;
    // //         case 6:
    // //           shift_no = "周六";
    // //           break;
    // //         case 7:
    // //           shift_no = "周日";
    // //           break;
    // //         default:
    // //           break;
    // //       }
    // //     }

    // //     if (temporaryData[i].person_Flag === "T") {
    // //       everyAll[1].everyData.push({
    // //         arr_code: temporaryData[i].arr_code,
    // //         person_Date: person_Date, //体检日期
    // //         shift_no: shift_no, //星期
    // //         person_Sum: "休假", //号源数
    // //         person_Already: "休假", //已约人数
    // //         person_Surplus: "休假", //剩余号源
    // //         add_num: temporaryData[i].add_num,
    // //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    // //       });
    // //     } else {
    // //       everyAll[1].everyData.push({
    // //         arr_code: temporaryData[i].arr_code,
    // //         person_Date: person_Date, //体检日期
    // //         shift_no: shift_no, //星期
    // //         person_Sum: temporaryData[i].person_Sum, //号源数
    // //         person_Already: temporaryData[i].person_Already, //已约人数
    // //         person_Surplus: temporaryData[i].person_Surplus, //剩余号源
    // //         add_num: temporaryData[i].add_num,
    // //         person_Flag: temporaryData[i].person_Flag //是否休假（T表示是休假）
    // //       });
    // //     }
    // //   }
    // //   this.everyAll = everyAll;
    // // },

    // //  var pdData={
    // //    data:{
    // //      kw:this.drawerIpnut
    // //    }
    // //  }

    // }},

    monthOptionss() {
      for (var i = 1; i <= 12; i++) {
        var date = { monthValue: i, label: i };
        this.monthOptions.push(date);
      }
    },
    yearOptionss() {
      var date = new Date();
      var year = date.getFullYear();
      for (var i = year - 1; i < year + 3; i++) {
        var date = { yearValue: i, label: i };
        this.yearOptions.push(date);
      }
    },
    switchHaoyuanClass(item) {
      var dates =
        this.yearValue + "-" + this.monthValue + "-" + item.person_Date;
      var datst = new Date();
      //  console.log(dates)
      //  判断当前号源是否是今天之前
      if (new Date(dates).getTime() > datst.getTime() - 24 * 60 * 60 * 1000) {
        // console.log(true)
        var newDate = true;
      } else {
        var newDate = false;
      }
      if (newDate === true) {
        //  console.log(newDate)
        if (item.person_Flag === "T") {
          return "haoyuan-red";
        } else {
          return "";
        }
      } else if (newDate === false) {
        return "haoyuan-bg";
      }
    },
    montj() {
      var date = new Date();
      var thismonth = date.getMonth() + 1;
      var year = date.getFullYear();
      this.yearValue = year;
      this.monthValue = thismonth;
    },
    //  // 判断号源是否可以点击使用
    matchDate(item) {
      
      var dates =
      this.yearValue + "-" + this.monthValue + "-" + item.person_Date;
      var datst = new Date();
      if (new Date(dates).getTime() > datst.getTime() - 24 * 60 * 60 * 1000) {
        // console.log(true)
        // if (item.person_Flag !== "T") {

        //   // this.inputNumber = item.person_Sum;
        //   // this.appointments = item.person_Already;
        //   // this.surplus = item.person_Surplus;
        // }
        this.timeValue = [dates, dates];
        if (this.lnc_Code == "") {
          return;
        } else {
          this.dialogVisible = true;
          var pData = {
            SumData: {
              date_Time: dates,
              lnccode: this.lnc_Code,
              type: "group"
            }
          };

          ajax
            .post(apiUrls.GetTeamSumnosumm, pData)
            .then(r => {
              this.personSumData = r.data.returnData;

              for (var i = 0; i < this.personSumData.length; i++) {
                if (this.personSumData[i].team_Flag === "F") {
                  this.checked = false;
                  //  break
                } else {
                  this.checked = true;
                }
              }
            })
            .catch(err => {
              this.$message.error("获取点击号源失败");
            });
        }
      }
    },

    datas() {
      var lncCode = this.lnc_Code;
      var that = this;
      var listm = that.personSumData;
      var StartTime = that.timeValue[0];

      var EndTime = that.timeValue[1];
      var person = [];
      for (var i = 0; i < listm.length; i++) {
        if (listm[i].team_Already > listm[i].team_Sum) {
          this.$message.warning("预留数不能小于已预约数");
          that.dialogVisible = true;
          return;
        }
        if (that.checked == true) {
          if (listm[i].team_Already > 0) {
            this.$message.warning(StartTime + "已有人预约禁止设置休假");
            that.team_Flag = "F";
            that.checked = false;
            that.dialogVisible = true;
            return;
          }
          var team_Flag = "T";
        } else {
          var team_Flag = "F";
        }
        person.push({
          team_Sum: listm[i].team_Sum,
          team_Already: listm[i].team_Already,
          team_Surplus: listm[i].team_Surplus,
          team_Flag: team_Flag,
          sumtime_Code: listm[i].sumtime_Code,
          StartTime: StartTime,
          EndTime: EndTime,
          team_LncCode: lncCode
        });
      }

      ajax
        .post(apiUrls.UpdateBooknoTotalTTj, person)
        .then(r => {
          if (r.data.success) {
            this.$message.success("修改成功");
            this.dateEventt();
          }
        })
        .catch(err => {
          this.$message.error("修改号源失败");
        });
    },
    // 修改人数确认弹窗
    dialogConfirm() {
      this.dialogVisible = false;
      this.datas();
      this.dateEventt();
      //  dialogVisible: false,//弹窗
      // timeValue:'',//选择日期
      // checked:false,//是否设置休息日
      // appointments:0,//预约人数
      // surplus:0,//剩余人数
      // inputNumber:10,//人数
    }
  }
};
</script>

<style scoped>
.haoyuan-red {
  color: red;
}
.haoyuan-bg {
  background-color: baga(250, 250, 250, 0.3);
  color: #ccc;
  cursor: default !important;
}
</style>
