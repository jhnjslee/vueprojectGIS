<template>
  <div>

    <div class="boxTitle">실시간 재난발생</div>
    <div class="alertTxt" id="calinfo">
      <div class="txtDate">{{dateTime}}</div>
      <div class="txtTitle">{{caltypes}} 발생 {{callevel}}단계</div>
    </div>

    <div class="boxTitle topMargin">실시간 발생 재난</div>
    <div class="boxPoint">
      <ul>
        <li class="boxBlue">
          <div class="blueTxt center">재난 반경</div>
          <div class="txtInputNormal center" value="" placeholder="" style="width:113px;" readonly>
            {{calradius}}m
          </div>
        </li>
        <li class="boxBlue">
          <div class="blueTxt center">발신 대상자</div>
          <div class="txtInputNormal center" value="" placeholder="" style="width:113px;" readonly>
            {{alltarget}}명
          </div>
        </li>
        <li class="boxBlue">
          <div class="blueTxt center">위도</div>
          <div class="txtInputNormal center" value="" placeholder="" style="width:113px;" readonly>
            {{pointX}}
          </div>
        </li>
        <li class="boxBlue">
          <div class="blueTxt center">경도</div>
          <div class="txtInputNormal center" value="" placeholder="" style="width:113px;" readonly>
            {{pointY}}
          </div>
        </li>
      </ul>
    </div>
    <div style="margin-top:10px;">
      <span class="btnNormal">
        <input type="button" id="button_joinus" @click="openModal" value="발신 대상자 문자 전송" disabled="" style="background-color:#59627f44" />
      </span>

      <!--sweet으로 바꾸기-->
      <MyModal @close="closeModal" v-if="modal" style="width: 100%;">
        <div class="popTitle"><span>발신 대상자 문자 전송</span>
          <button value="X" @click="closeModal" style="float: right;padding-right: 10px;">X</button>
        </div>
        <div style="padding:10px;">
          <div class="popSubTitle">재난 대상자 목록</div>
          <div class="fix-container-allborder" style="width:100%;height:300px;">
            <div class="header-bg"></div>
            <div class="table-wrapper">
              <div>
                <div v-if="uuidArrayList.length == 0">
                  전송 대상자가 없습니다.
                </div>
                
                <div v-if="uuidArrayList.length > 0">
                  <table class="tablefix" style="table-layout:fixed;">
                    <thead>
                      <tr>
                        <th style="width:8%;">
                          <div class="th-text">번호</div>
                        </th>
                        <th style="width:23%;">
                          <div class="th-text">대상자 ID</div>
                        </th>
                        <th style="width:24%;">
                          <div class="th-text">대상자 위도</div>
                        </th>
                        <th style="width:24%;">
                          <div class="th-text">대상자 경도</div>
                        </th>
                        <th style="width:21%;">
                          <div class="th-text">소속 세그먼트 ID</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(info,index) in uuidArrayList" :key="index">
                        <td class="txcenter">{{index+1}}</td>
                        <td class="txcenter tdleftbar">{{info.userid}}</td>
                        <td class="txcenter tdleftbar">{{info.uuidlat}}</td>
                        <td class="txcenter tdleftbar">{{info.uuidlog}}</td>
                        <td class="txcenter tdleftbar">{{info.uuidseg}}</td>
                      </tr>
                    </tbody>
                  </table>

                </div>
              </div>

            </div>
            <div v-if="uuidArrayList.length > 0" style="float:right;padding:10px 10px 0 0;">
              <span class="btnPopRed"><input type="button" @click="openCencelModal" value="목록 삭제" /></span>
              <span class="btnPopGreen"><input type="button" @click="openCheckModal" value="발송 승인" /></span>
            </div>
          </div>
        </div>
      </MyModal>

    </div>
    <div class="boxTitle topMargin">전체 사용자 통계</div>
    <div class="boxGraph">
      <ul>
        <canvas id="myChart" style="display: block;" width="258" height="150" class="chartjs-render-monitor"></canvas>
      </ul>
      <ul>
        <div class="blueTxt">전체 대상 인원 {{fullcount}}(명)</div>
      </ul>
    </div>
    <div class="boxPoint" style="margin-top:20px;">

      <ul>
        <li class="boxBlue">
          <div class="blueTxt center">수신 성공(명)</div>
          <div class="txtCountBlue">{{successcount}}</div>
        </li>
        <li class="boxBlue">
          <div class="blueTxt center">미수신(명)</div>
          <div class="txtCountRed">{{failcount}}</div>
        </li>
      </ul>
    </div>

    <v-container style="padding:5px">

      <SweetModal icon="success" ref="modal" title="성공">
        메세지 전송 성공
      </SweetModal>

      <SweetModal icon="success" ref="modaldelete" title="삭제 성공">
        전송대상자 삭제 성공
      </SweetModal>

      <SweetModal ref="checkmodal" title="전송">
         <table  style="table-layout:fixed;">
                    <tbody>
                      <tr>
                        <td> 
                          <v-card v-html="this.message" style="text-align: left;"> "{{message}}"</v-card>
                        </td>
                       </tr>               
                      <tr>
                        <td>
        <div style="display:flex;float:right;padding:10px 10px 0 0;">
          <div style="
    align-self: center;
    padding-right: 200px;
    font-weight: bold;
    font-size: large;
"><p>해당 인원 {{uuidlength}}명 에게 문안을 보내시겠습니까?</p></div>
          <span class="btnPopRed"><input type="button" @click="closeModal1" value="취소" /></span>
          <span class="btnPopGreen"><input type="button" @click="doSend" value="확인" /></span>
        </div>
                   
                        </td>
                       </tr>
                    </tbody>
                  </table>

        
      </SweetModal>

      <SweetModal ref="cencelModal" title="삭제">
        <p>정말 해당 인원 {{uuidlength}}명 을 전송 대상자에서 삭제 시키겠습니까?</p>
        <div style="float:right;padding:10px 10px 0 0;">
          <span class="btnPopRed"><input type="button" @click="closeModal2" value="취소" /></span>
          <span class="btnPopGreen"><input type="button" @click="doSendcancel" value="확인" /></span>
        </div>
      </SweetModal>
      <!-- 컴포넌트 MyModal -->
    
    </v-container>
  </div>
</template>

<script>
import {
  EventBus
} from "./event-bus";
import MyModal from './markerClick.vue'
import {
  SweetModal,
  SweetModalTab
} from 'sweet-modal-vue'

var EPSG5179 = new OpenLayers.Projection('EPSG:5179');
var EPSG4326 = new OpenLayers.Projection('EPSG:4326');
let now = ""
export default {
  data() {
    return {
      segmentSendingList: [],
      successcount: 0,
      failcount: 0,
      fullcount : 0,
      pointX: 0,
      pointY: 0,
      dateTime: " ",
      types: "",
      level: 0,
      callevel: "",
      caltypes: "",
      calNum: 0,
      danger: 0,
      calpri: "",
      littledanger: 0,
      normal: 0,
      safe: 0,
      alltarget: 0,
      calradius: 0,
      message: '',
      modal: false,
      uuidlength: 0,
      headers: [{
          text: '사용자번호',
          value: 'uuid',
          align: 'center'
        },
        {
          text: '위도',
          value: 'uuidlat'
        },
        {
          text: '경도',
          value: 'uuidlog'
        },
        {
          text: '세그먼트',
          value: 'uuidseg'
        },
      ],
      text2: '',
      text3: '',
      text4: '',
    }
  },
  components: {
    MyModal,
    SweetModal,
    SweetModalTab
  },
  created() {
    
    EventBus.$on('calamity-test', calamityAllinfo => {

      var cl = document.getElementById('calinfo');

      var button_joinus = document.getElementById('button_joinus');
      button_joinus.disabled = false;
      button_joinus.style.backgroundColor="#59627f";
      var uuidsendingList = new Array();
      this.uuidArrayList = new Array();
      this.calpri = calamityAllinfo.callPri;
      this.calNum = calamityAllinfo.calNumber;

      this.message = calamityAllinfo.calMessageInfo;
      
      this.alltarget = calamityAllinfo.targetUser;
      this.calradius = calamityAllinfo.calRange;
      this.segmentSendingList = calamityAllinfo.segmentSendingFeature;

      for (var i = 0; i < calamityAllinfo.uuidAllInfo.length; i++) {
        if (calamityAllinfo.uuidAllInfo[i].uuidcontainseg != -1) {

          var uuidArrayListIndex = {
            uuid: "",
            uuidlat: '',
            uuidlog: '',
            uuidseg: '',
            userid: ""
          }

          var stringX = Number(calamityAllinfo.uuidAllInfo[i].x)
          var stringY = Number(calamityAllinfo.uuidAllInfo[i].y)
          var wgs84 = proj4('EPSG:5179', 'EPSG:4326', [stringX, stringY]);

          var pointX = wgs84[0].toFixed(5)
          var pointY = wgs84[1].toFixed(5)

          uuidArrayListIndex.uuid = calamityAllinfo.uuidAllInfo[i].uuid;
          uuidArrayListIndex.uuidlat = pointX;
          uuidArrayListIndex.uuidlog = pointY;
          uuidArrayListIndex.uuidseg = calamityAllinfo.uuidAllInfo[i].uuidcontainseg;
          uuidArrayListIndex.userid = calamityAllinfo.uuidAllInfo[i].userid;

          this.uuidArrayList.push(uuidArrayListIndex);

          uuidsendingList.uuid = calamityAllinfo.uuidAllInfo[i].uuid
          uuidsendingList.push(calamityAllinfo.uuidAllInfo[i].uuid)
        }
      }
      this.uuidlength = this.uuidArrayList.length;
      this.alltarget = uuidsendingList.length;
      now = new Date();
      var wgs84 = proj4('EPSG:5179', 'EPSG:4326', [calamityAllinfo.callat, calamityAllinfo.callon]);

      this.pointX = wgs84[0].toFixed(5)
      this.pointY = wgs84[1].toFixed(5)
      this.level = calamityAllinfo.callevel
      this.types = calamityAllinfo.calType
      this.dateTime = calamityAllinfo.caldate.toLocaleString()

      //재난 종류 ?? 
      switch (this.types) {
        case "경사지 붕괴":
          this.caltypes = "경사지 붕괴"
          break;
        case "홍수":
          this.caltypes = "홍수"
          break;
        case "Slope":
          this.caltypes = "경사지 붕괴"
          break;
        case "Flood":
          this.caltypes = "홍수"
          break;
        case "Fire":
          this.caltypes = "화재"
          break;

        default:
      }
      switch (this.level) {
        case "심각":
          this.callevel = "심각"
          cl.style.color = "#FF0000";
          break;
        case "경계":
          this.callevel = "경계"
          cl.style.color = "#FFBF00";
          break;
        case "주의":
          this.callevel = "주의"
          cl.style.color = "#b2b809";
          break;
        case "관심":
          this.callevel = "관심"
          cl.style.color = "#0080FF";
          break;
      }
      
      this.$store.state.calaAuto ? this.doSend() :this.directdoSend()
      
    });

    //그래프를 그리기 위해 비율을 받는 곳 
    EventBus.$on('use-eventbus-rate', rate => {
      this.successcount = rate[0];
      this.failcount = rate[1];
      this.fullcount = this.successcount + this.failcount;
      if (ctx != undefined) {
        ctx = undefined
      }
      var percentage = Math.round(this.successcount / (this.successcount + this.failcount) * 100)
      if(isNaN(percentage)){
        percentage = 0;
      }
      var ctx = document.getElementById('myChart').getContext('2d');
      var myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['수신자', '미수신자'],
          datasets: [{
            label: '# of Votes',
            data: [this.successcount, this.failcount],
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          legend: {
            display: false
          }
        }
      });

      Chart.pluginService.register({
        beforeDraw: function (chart) {

          var width = chart.chart.width,
          height = chart.chart.height,
          ctx = chart.chart.ctx;
          ctx.clearRect(0, 0, width, height);
          // 컨텍스트 리셋
          ctx.beginPath();

          ctx.restore();
          var fontSize = (height / 114).toFixed(2);
          ctx.font = fontSize + "em sans-serif";
          ctx.textBaseline = "middle";

          var text = percentage + "%",
          textX = Math.round((width - ctx.measureText(text).width) / 2),
          textY = height / 2;
          this.text2 = textX
          this.text3 = textY
          ctx.fillText(text, textX, textY);
          ctx.save();
        }
      });


    });
  },

  mounted() {

  },
  methods: {
    openModal() {
      this.modal = true
    },
    closeModal() {
      this.modal = false
    },
    closeModal1() {
      this.$refs.checkmodal.close();
    },
    closeModal2() {
      this.$refs.cencelModal.close();
    },
    //해당 재난의 발송상태를 YES 보내는것
    directafetrSendYes() {
      var sendingserverIndex = {
        segmentid: ""
      }

    },
    //해당 재난의 발송상태를 NO 보내는것
    
    doSend() {
      //uuid 리스트 보내기 
      var sendingserverArray = new Array()

      // 
      for (var i = 0; i < this.segmentSendingList.length; i++) {
        var sendingserverIndex = {

          segmentId: 0,
          dangerStep: 0,
          dangerRange: 0,
          occurType: 0,
          occurDate: 0,
          lat: 0,
          lon: 0,
          eventId: "",
          dangerMessage: "",
          uuidList: []
        }

        var wgs84 = proj4('EPSG:5179', 'EPSG:4326', [this.segmentSendingList[i].callatIndex, this.segmentSendingList[i].callogIndex]);

        var changecal = ["전송", this.calpri]
        this.$store.dispatch('changeCalStateAction', changecal);
        sendingserverIndex.segmentId = this.segmentSendingList[i].segId;
        sendingserverIndex.dangerStep = this.segmentSendingList[i].callLevelIndex;
        sendingserverIndex.dangerRange = this.segmentSendingList[i].calRadiusIndex;
        sendingserverIndex.occurType = this.segmentSendingList[i].mainType;
        sendingserverIndex.occurDate = this.segmentSendingList[i].callTimeIndex;
        sendingserverIndex.lat = wgs84[0];
        sendingserverIndex.lon = wgs84[1];
        sendingserverIndex.eventId = this.calpri;
        sendingserverIndex.dangerMessage = this.message;
        sendingserverIndex.uuidList = this.segmentSendingList[i].segmentUserList;
        //이부분 
        if (sendingserverArray.findIndex(i => i.segmentId == sendingserverIndex.segmentId) == -1) {
          sendingserverArray.push(sendingserverIndex)
        }
      }
      this.segmentSendingList = [];
      this.uuidArrayList = [];

      this.$emit('childs-event', sendingserverArray)
      this.$refs.modal.open();
      if(this.$store.state.calaAuto == false){
        this.closeModal();
        this.$refs.checkmodal.close();

      }
      
      var button_joinus = document.getElementById('button_joinus');
      button_joinus.disabled = true;
      button_joinus.style.backgroundColor="#59627f44";
    },

    directdoSend() {
      var sendingserverArray = new Array()

      for (var i = 0; i < this.segmentSendingList.length; i++) {
        var sendingserverIndex = {
          segmentId: 0,
          dangerStep: 0,
          dangerRange: 0,
          occurType: 0,
          occurDate: 0,
          lat: 0,
          lon: 0,
          eventId : "",
          dangerMessage: "",
          uuidList: []
        }

        var wgs84 = proj4('EPSG:5179', 'EPSG:4326', [this.segmentSendingList[i].callatIndex, this.segmentSendingList[i].callogIndex]);


        var changecal = ["미전송", this.calpri]
        this.$store.dispatch('changeCalStateAction', changecal);
        sendingserverIndex.segmentId = this.segmentSendingList[i].segId;
        sendingserverIndex.dangerStep = this.segmentSendingList[i].callLevelIndex;
        sendingserverIndex.dangerRange = this.segmentSendingList[i].calRadiusIndex;
        sendingserverIndex.occurType = this.segmentSendingList[i].mainType;
        sendingserverIndex.occurDate = this.segmentSendingList[i].callTimeIndex;
        sendingserverIndex.lat = wgs84[0];
        sendingserverIndex.lon = wgs84[1];
        sendingserverIndex.eventId = this.calpri;
        sendingserverIndex.dangerMessage = this.message;
        sendingserverIndex.uuidList = this.segmentSendingList[i].segmentUserList;

        if (sendingserverArray.findIndex(i => i.segmentId == sendingserverIndex.segmentId) == -1) {
          sendingserverArray.push(sendingserverIndex)
        }
      }

      this.$emit('childs-event', sendingserverArray)
    },

    openCheckModal() {
      this.$refs.checkmodal.open();
    },
    openCencelModal() {
      this.$refs.cencelModal.open();
    },
    closeCheckModal() {
      this.closeModal();
      return;

    },
    deletelist() {
      this.$refs.cencelModal.close();
      this.segmentSendingList = [];
      this.uuidArrayList = [];


      this.$refs.modaldelete.open();
      this.closeModal();
    },


    doSendcancel() {
      //거절 보내기 
      this.$refs.cencelModal.close();
      var changecal = ["미전송", this.calpri];
      this.$store.dispatch('changeCalStateAction', changecal);
      this.segmentSendingList = [];
      this.uuidArrayList = [];

      this.$emit('childs-event', "reject")
      this.$refs.checkmodal.close();
      this.$refs.modaldelete.open();
      this.closeModal();
      
      var button_joinus = document.getElementById('button_joinus');
      button_joinus.disabled = true;
      button_joinus.style.backgroundColor="#59627f44";
    },
  }
}
</script>

  <style>
  
  #calinfo {
    color: 0;
  }

  input:focus {
    outline: none;
  }

  select:focus {
    outline: none;
  }

  textarea:focus {
    outline: none;
  }

  body {
    background-color: #f2f2f2;
    width: 100%;
  }

.btnNormal input {
  padding: 10px 0px 10px 0px;
  width: 100%;
  font-size: 12pt;
  color: #ffffff;
  font-weight: normal;
  background-color: #59627f;
  border: none;
  border-radius: 5px;
  box-shadow: 0 0px #232d4b;
}

  .txtInputNormal {
    height: 32px;
    font-size: 12pt;
    border-style: none;
    border-radius: 5px;
    border: 1px solid #deecf2;
    font-family: 'NanumGothic', '나눔고딕', 'NanumGothicWeb', '맑은 고딕';
    padding-left: 5px;
    color: #022e56;
  }

  .txtInputNormal:focus {
    border: 1px solid #b2dbed;
  }

  .fix-container-allborder {
    border-right: 1px solid #cecece;
    border-left: 1px solid #cecece;
    border-bottom: 1px solid #cecece;
    border-top: 2px solid #c9d2de;
    position: relative;
    padding-top: 25px;
    /* header-bg height값 */
    background-color: #fff;
  }

  .header-bg {
    background: #eef0f1;
    height: 25px;
    /* header-bg height값 */
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
  }

  .table-wrapper {
    overflow-x: hidden;
    overflow-y: auto;
    height: 800px;
  }

  .tablefix {
    width: 100%;
    border-collapse: collapse;
  }

  .tablefix td {
    border-bottom: 1px solid #dee3f3;
    padding: 4px;
    font-size: 11pt;
    font-weight: normal;
    color: #4b4b4b;
    text-align: left;
    vertical-align: middle;
  }

  .tablefix td img {
    vertical-align: middle;
  }

  .tdleftbar {
    border-left: 1px solid #dee3f3;
  }

  .tablefix th {
    padding: 0px;
  }

  .tablefix .th-text {
    position: absolute;
    top: 0;
    width: inherit;
    line-height: 25px;
    /* header-bg height값 */
    border-left: 1px solid #dee3f3;
    font-size: 10pt;
    font-weight: normal;
    color: #404146;
    text-align: center;
  }

  .tablefix th:first-child .th-text {
    border-left: none;
  }

  .tablefix .txcenter {
    text-align: center;
  }

  .tdcolor td {
    background-color: #eef3f9;
  }

  .tablefix tbody tr:nth-child(even) {
    background-color: #eef3f9;
  }

  .txtOverflowHidden

  /*말줄임*/
    {
    white-space: nowrap;
    overflow: hidden;
    /* "overflow" value must be different from "visible" */
    -o-text-overflow: ellipsis;
    /* Opera under 10.7 */
    text-overflow: ellipsis;
    /* IE, Safari */
    padding-right: 10px;
    padding-left: 5px;
  }

  /*팝업용 css 시작*/
  .popTitle {
    width: 100%;
    padding: 20px 0 20px 0px;
    color: #fff;
    background-color: #303a59;
    font-size: 16pt;
  }

  .popTitle span {
    padding-left: 10px;
  }

  .btnPop input {
    padding: 10px 30px 10px 30px;
    margin-left: 2px;
    font-size: 14pt;
    color: #e1e8ff;
    font-weight: normal;
    background-color: #46537c;
    border: none;
    border-radius: 5px;
    box-shadow: 0 0px #232d4b;
  }

  .btnPop input:hover {
    background-color: #232d4b;
    cursor: pointer;
  }

  .btnPop input:active,
  .btnPop input.active {
    background-color: #232d4b;
    box-shadow: 0 0px #232d4b;
    transform: translateY(1px);
  }

  .btnPopRed input {
    padding: 10px 30px 10px 30px;
    margin-left: 2px;
    font-size: 14pt;
    color: #e1e8ff;
    font-weight: normal;
    background-color: #ff4545;
    border: none;
    border-radius: 5px;
    box-shadow: 0 0px #e42c2c;
  }

  .btnPopRed input:hover {
    background-color: #e42c2c;
    cursor: pointer;
  }

  .btnPopRed input:active,
  .btnPopRed input.active {
    background-color: #e42c2c;
    box-shadow: 0 0px #e42c2c;
    transform: translateY(1px);
  }

  .btnPopGreen input {
    padding: 10px 30px 10px 30px;
    margin-left: 2px;
    font-size: 14pt;
    color: #e1e8ff;
    font-weight: normal;
    background-color: #33d456;
    border: none;
    border-radius: 5px;
    box-shadow: 0 0px #33d456;
  }

  .btnPopGreen input:hover {
    background-color: #33d456;
    cursor: pointer;
  }

  .btnPopGreen input:active,
  .btnPopGreen input.active {
    background-color: #33d456;
    box-shadow: 0 0px #33d456;
    transform: translateY(1px);
  }

  .popSubTitle {
    font-size: 13pt;
    color: #61709e;
    margin-bottom: 5px;
  }

  </style>

