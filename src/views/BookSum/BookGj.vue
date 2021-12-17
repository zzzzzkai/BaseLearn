<template>
  <div>
    <div class="TjBox">
      <!-- 单位日期 -->
      <div class="company">
        <div class="companyNow">
          <!-- 日期选择 -->
          <div class="companyDate">
            <el-button plain size="mini" @click="lastMonth">上一月</el-button>
            <el-select
              v-model="yearValue"
              size="mini"
              style="width: 100px; margin-left: 5px"
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
              style="width: 100px; margin-left: 5px"
              @change="Revisionmonth"
            >
              <el-option
                v-for="item in monthOptions"
                :key="item.monthValue"
                :label="item.label"
                :value="item.monthValue"
              ></el-option>
            </el-select>
            <el-button
              plain
              size="mini"
              style="margin-left: 5px"
              @click="nextMonth"
              >下一月</el-button
            >
            <el-button
              plain
              size="mini"
              style="margin-left: 5px"
              @click="setBtn"
              >设置预留</el-button
            >
            <el-upload
              class="upload-demo"
              action="https://localhost:5001/api/Test/t001"
              :on-change="change"
              multiple
              :limit="3"
              :file-list="fileList"
            >
              <el-button
                plain
                size="mini"
                style="margin-left: 5px"
                type="primary"
                >点击上传</el-button
              >
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
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
          <div
            class="sourceList"
            v-for="(items, indexs) in everyAll"
            :key="indexs"
          >
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
              <div class="sourceDiv" :class="switchHaoyuanClass(item)">
                {{ item.person_Sum }}
              </div>
              <div class="sourceDiv" :class="switchHaoyuanClass(item)">
                {{ item.person_Already }}
              </div>
              <div class="sourceDiv" :class="switchHaoyuanClass(item)">
                {{ item.person_Surplus }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-dialog :visible.sync="dialogVisible" width="40%">
        <!-- 选择日期 -->
        <div style="width: 100%; margin: 0 auto">
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
          <div style="margin-top: 10px">
            <el-checkbox v-model="checked">是否设为休息日</el-checkbox>
          </div>
          <div style="margin-top: 10px; color: red">
            (限额值为－1时,不设限额)
          </div>
          <!-- 人数分配 -->
          <div class="nowNumber">
            <div class="nowNumberOL">
              <div class="nowDivL"></div>
              <div
                class="nowDivR nowDivL"
                v-for="(item, index) in personSumData"
                :key="index"
              >
                {{ item.sumtime_Name }}
              </div>
            </div>
            <div class="nowNumberOL">
              <div class="nowDivL">人数</div>
              <div
                class="nowDivR nowDivL"
                v-for="(items, indexs) in personSumData"
                :key="indexs"
              >
                <el-input
                  v-model="items.person_Sum"
                  type="number"
                  min="-1"
                  placeholder="请输入内容"
                ></el-input>
              </div>
            </div>
            <div class="nowNumberOL">
              <div class="nowDivL">预约人数</div>
              <div
                class="nowDivR nowDivL"
                v-for="(Already, index) in personSumData"
                :key="index"
              >
                <span>{{ Already.person_Already }}</span>
              </div>
            </div>
            <div class="nowNumberOL" style="border-bottom: 0">
              <div class="nowDivL">剩余人数</div>
              <div
                class="nowDivR nowDivL"
                v-for="(Surplus, index) in personSumData"
                :key="index"
              >
                <span>{{ Surplus.person_Surplus }}</span>
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
  name: "BookGj",
  data() {
    return {
      fileList: [],
      drawer: false, //切换号源抽屉
      hoverIndex: -1, //表示当前hover的是第几个div 初始为 -1 或 null 不能为0 0表示第一个div
      sourceValue: "个人",
      everyWidth: "width:calc( 100% / 16)",
      yearOptions: [], //年份下拉
      yearValue: "",
      monthOptions: [], //月份下拉
      monthValue: "",
      ss: "red",
      dialogVisible: false, //弹窗
      timeValue: "", //选择日期
      checked: false, //是否设置休息日
      appointments: 0, //预约人数
      surplus: 0, //剩余人数
      inputNumber: 10, //人数
      appointments2: 0,
      inputNumber2: 0,
      surplus2: 0,

      everyAll: [
        {
          everyData: [],
        },
        {
          everyData: [],
        },
      ], //日期数据
      sumtimeData: [], //时段数据
      personSumData: [],
      listData: [],
    };
  },
  created() {
    // this.dateEvent();
    this.montj();
    this.monthOptionss();
    this.yearOptionss();
    this.dateEventt();
  },
  methods: {
    change(data) {
      console.log("====================================");
      console.log(data);
      console.log("====================================");
    },

    //获取值修改时的数据
    // changes(items,index){

    //   var that=this;
    //     var pda=[];
    //     pda=that.personSumData;
    //     if(JSON.stringify(pda).indexOf(items.sumtime_Code)>-1){
    //       for(var i=0;i<that.personSumData.length;i++){
    //         if(that.personSumData[i]==items.sumtime_Code){
    //           that.personSumData[i].person_Sum=items.person_Sum;
    //         }
    //       }
    //     }
    //   console.log(that.personSumData)
    // },
    // 上月
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
    //  // 判断号源是否可以点击使用
    matchDate(item) {
      var dates =
        this.yearValue + "-" + this.monthValue + "-" + item.person_Date;
      var datst = new Date();
      if (new Date(dates).getTime() > datst.getTime() - 24 * 60 * 60 * 1000) {
        this.timeValue = [dates, dates];
        this.dialogVisible = true;
        var pData = {
          SumData: {
            date_Time: dates,
            type: "person",
          },
        };

        ajax
          .post(apiUrls.GetBooknosum, pData)
          .then((r) => {
            this.personSumData = r.data.returnData;
            for (var i = 0; i < this.personSumData.length; i++) {
              if (this.personSumData[i].person_Flag == "F") {
                this.checked = false;
                // break;
              } else {
                this.checked = true;
              }
            }
          })
          .catch((err) => {});
      }
    },
    // 设置预留  仅个检
    setBtn() {
      let time = new Date();
      let y = time.getFullYear();
      let m = time.getMonth() + 1;
      let d = time.getDate();
      m = m < 10 ? `0${m}` : m;
      d = d < 10 ? `0${d}` : d;
      var nowTime = y + "-" + m + "-" + d;

      this.timeValue = [nowTime, nowTime];
      this.dialogVisible = true;
      var pData = {
        SumData: {
          date_Time: nowTime,
          type: "person",
        },
      };
      ajax
        .post(apiUrls.GetBooknosum, pData)
        .then((r) => {
          this.personSumData = r.data.returnData;
          // if (returnDatas[0].person_Flag == "T") {
          //   this.checked = true;
          // }
        })
        .catch((err) => {
          this.$message.error("获取预留号源失败");
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
    },
    datas() {
      var that = this;
      var listm = that.personSumData;
      var person = [];
      // var person_Sum = this.inputNumber; //总号源
      // var person_Sum2 = this.inputNumber2; //总号源2
      // var person_Already = this.appointments; //占用号源
      // var person_Already2 = this.appointments2; //占用号源2
      // var person_Surplus = this.surplus; //剩余号源1
      // var person_Surplus2 = this.surplus2; //剩余号源2
      var StartTime = that.timeValue[0];
      var EndTime = that.timeValue[1];
      for (var i = 0; i < listm.length; i++) {
        if (listm[i].person_Already > listm[i].person_Sum) {
          this.$message.warning("预留数不能小于已预约数");
          that.dialogVisible = true;
          return;
        }
        if (that.checked == true) {
          if (listm[i].person_Already > 0) {
            this.$message.warning(StartTime + "已有人预约禁止设置休假");
            that.person_Flag = "F";
            that.checked = false;
            that.dialogVisible = true;
            return;
          }
          var person_Flag = "T";
        } else {
          var person_Flag = "F";
        }

        person.push({
          person_Sum: listm[i].person_Sum,
          person_Already: listm[i].person_Already,
          person_Surplus: listm[i].person_Surplus,
          person_Type: "person",
          person_Flag: person_Flag,
          person_Code: listm[i].sumtime_Code,
          StartTime: StartTime,
          EndTime: EndTime,
        });
      }

      ajax
        .post(apiUrls.UpdateBooknoTotalTj, person)
        .then((r) => {
          if (r.data.success) {
            this.$message.success("修改号源成功");
            this.dateEventt();
          }
        })
        .catch((err) => {
          this.$message.error("修改号源失败");
        });
    },
    getDaysByMonth(year, month) {
      return new Date(year, month, 0).getDate();
    },
    dateEventt() {
      var that = this;
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      year = that.yearValue;
      month = that.monthValue;
      if (month < 10) {
        month = "0" + month;
      }
      if (day < 10) {
        day = "0" + day;
      }
      let maxDate = this.getDaysByMonth(year, month);

      day = Math.min(maxDate, day);

      var date = year + "-" + month + "-" + day;

      var pData = {
        SumData: {
          date_Time: date,
          type: "person",
        },
      };
      // 判断奇偶数 确定 表格宽度
      var everyAll = [
        {
          everyData: [],
        },
        {
          everyData: [],
        },
      ];
      ajax
        .post(apiUrls.GetMonthofDay, pData)
        .then((r) => {
          if (!r.data.success) {
            this.$message.error(r.data.returnMsg);
            return;
          }
          let everyIndex; //日期中间值
          if (r.data.returnData.length % 2 == 0) {
            that.everyWidth =
              `width:calc( 100% / ` + (r.data.returnData.length / 2 + 1) + `)`;
            everyIndex = r.data.returnData.length / 2;
          } else {
            that.everyWidth =
              `width:calc( 100% /` +
              ((r.data.returnData.length + 1) / 2 + 1) +
              `)`;
            everyIndex = (r.data.returnData.length + 1) / 2;
          }
          var person_Datee = null;
          for (let i = 0; i < everyIndex; i++) {
            if (r.data.returnData[i].person_Date === null) {
              person_Datee = null;
            } else {
              person_Datee = r.data.returnData[i].person_Date
                .replace(" ", ":")
                .replace(/\:/g, "-")
                .split("-")[2]
                .split("T")[0];
              if (r.data.returnData[i].person_Flag === "T") {
                everyAll[0].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].person_Week, //星期
                  person_Sum: "休假", //号源数
                  person_Already: "休假", //已约人数
                  person_Surplus: "休假", //剩余号源
                  person_Flag: r.data.returnData[i].person_Flag, //是否休假（T表示是休假）
                });
              } else {
                everyAll[0].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].person_Week, //星期
                  person_Sum: r.data.returnData[i].person_Sum, //号源数
                  person_Already: r.data.returnData[i].person_Already, //已约人数
                  person_Surplus: r.data.returnData[i].person_Surplus, //剩余号源
                  person_Flag: r.data.returnData[i].person_Flag, //是否休假（T表示是休假）
                });
              }
            }
          }
          for (var i = everyIndex; i < r.data.returnData.length; i++) {
            if (r.data.returnData[i].person_Date === null) {
              person_Datee = null;
            } else {
              person_Datee = r.data.returnData[i].person_Date
                .replace(" ", ":")
                .replace(/\:/g, "-")
                .split("-")[2]
                .split("T")[0];
              if (r.data.returnData[i].person_Flag === "T") {
                everyAll[1].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].person_Week, //星期
                  person_Sum: "休假", //号源数
                  person_Already: "休假", //已约人数
                  person_Surplus: "休假", //剩余号源
                  person_Flag: r.data.returnData[i].person_Flag, //是否休假（T表示是休假）
                });
              } else {
                everyAll[1].everyData.push({
                  person_Date: person_Datee, //体检日期
                  shift_no: r.data.returnData[i].person_Week, //星期
                  person_Sum: r.data.returnData[i].person_Sum, //号源数
                  person_Already: r.data.returnData[i].person_Already, //已约人数
                  person_Surplus: r.data.returnData[i].person_Surplus, //剩余号源
                  person_Flag: r.data.returnData[i].person_Flag, //是否休假（T表示是休假）
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
              person_Flag: "", //是否休假（T表示是休假）
            });
          }
          that.everyAll = everyAll;
        })
        .catch((err) => {
          this.$message.error("获取号源失败,请联系管理员");
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
    //     console.log(temporaryData.length / 2 + 1);
    //     this.everyWidth =
    //       `width:calc( 100% / ` + (temporaryData.length / 2 + 1) + `)`;
    //     everyIndex = temporaryData.length / 2;
    //     console.log(everyIndex + "ss");
    //     // console.log(this.everyWidth);
    //   } else {
    //     this.everyWidth =
    //       `width:calc( 100% /` + ((temporaryData.length + 1) / 2 + 1) + `)`;
    //     everyIndex = (temporaryData.length + 1) / 2;
    //     console.log(everyIndex + "tt");
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
  },
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
.future-date {
  color: green;
}
.nowDivR .nowDivL {
  background: -webkit-gradient(
    linear,
    left bottom,
    left top,
    color-stop(0, #eee),
    color-stop(1, #fff)
  );
  justify-content: center;
}
</style>
