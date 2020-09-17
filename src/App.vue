<template>
  <div id="app" width="1903px">
    <div class="topGroup">
      <span class="tx1">Segment 긴급 메시지 전송 시스템</span>
      <span class="right" style="margin-top:-7px;">
        <div class="example-modal-window">
          <div v-if="!loginCondition">
            <button @click="openModal" style="color:black;">
              <h1>로그인 상태 </h1>
            </button>

            <v-btn class="mr-4" @click="drawCircleP">CalTest</v-btn>
            <v-btn class="mr-4" @click="makerandomlatlang">Uuid</v-btn>
            <v-btn class="mr-4" @click="sendTest">WStest</v-btn>
            <div v-if="modal">
              <!-- 컴포넌트 MyModal -->
              <MyModal @close="closeModal" v-if="modal">


                <div class="loginBox">
                  <div class="loginTxt1">LOGIN</div>
                  <div class=loginTxt2>Segment 긴급 메시지 전송 시스템</div>

                  <div>
                    <input type="text" id="id" class="txtInputLogin" placeholder="아이디 "  style="width:300px;" /></div>
                  <div style="margin-top:5px;">
                    <input type="password" id="pass" class="txtInputLogin" placeholder="비밀번호 " style="width:300px;" />
                  </div>
          

                  <div style="padding: 15px 0 0 0;">
                    <span class="btnPop"><input type="button" @click="tryLogin" value="로그인" /></span>
                    <span class="btnPop"><input type="button" @click="closeModal" value="취 소" /></span>
                  </div>
                </div>

              </MyModal>
            </div>
          </div>

          <div v-if="loginCondition" display="flex">
          <!--  <h3 style="font-weight:bold color:white;">{{id}}님 환영합니다.</h3>-->
            <span class="btnLogout"><input type="button"  @click="openLogout" value="로그아웃" /></span>
          </div>
        </div>
      </span>
        <SweetModal icon="warning" ref="logout" title="로그아웃">
        <p>로그아웃하면 웹에 표시되는 정보는 잃어버릴 수 있습니다. 또한 웹 서비스 이용이 불가 합니다. 그래도 로그아웃 하시겠습니까?</p>

        <div style="float:right;padding:10px 10px 0 0;">
          <span class="btnPop"><input type="button" @click="closeModal" value="취소" /></span>
          <span class="btnPopRed"><input type="button" @click="tryLogout" value="확인" /></span>
        </div>
      </SweetModal>


      <SweetModal icon="warning" ref="modal" title="주의">
        재난이 발생하였습니다!
      </SweetModal>
    </div>

    <div class="bodyBox">
      <table class="bodyTbl">
        <colgroup>
          <col />
          <col style="width:300px;" />
        </colgroup>
        <tr>
          <td style="padding:0px 10px 0px 0px;">
            <div class="boxSet2">
              <div class="boxMap">
                <Map2 :pointX="lat" :pointY="log" :radius="radius" :level2="level"></Map2>
              </div>
            </div>
          </td>
          <td style="padding:0px 0px 0px 10px;">
            <div class="boxSet">
              <Calamity @childs-event="parentsMethod"></Calamity>


            </div>
          </td>
        </tr>
        <tr>
          <td colspan='2' style="padding-top:20px;">
            <div class="boxSet">
              <div class="boxTitle">최신 재난 리스트</div>
              <!--세로 스크롤만 있는 테이블임. 가로스크롤 필요시 연락바람. ...으로 줄임표시 해둠 -->
              <listTable></listTable>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Map2 from './components/Map2';
import Calamity from './components/Calamity';
import listTable from './components/listTable';
import Login from './components/Login.vue';
import MyModal from './components/LoginForm';
import { EventBus } from "./components/event-bus";
import { store } from './store/index.js'
import { SweetModal, SweetModalTab } from 'sweet-modal-vue'
var EPSG5179 = new OpenLayers.Projection('EPSG:5179');
var EPSG4326 = new OpenLayers.Projection('EPSG:4326');
let caldataList = new Array()
let uuidList = new Array()
let test = 0;

let calamityList = new Array();
let uuidshowList = new Array();
//listtabel 전용
export default {
  name: 'App',
  components: {
    Map2,
    Calamity,
    listTable,
    Login, //modal
    MyModal,
    SweetModal,
    
  },
  mounted() {
    console.log("Parent mounted")
    this.connect();
    //this.openModal();
  },
  data() {
    return {
      valid: false,
      checkbox: false,
      show1: false,
      password: 'Password',
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 4 || 'Min 8 characters',
      },
      modal: false,
      id: '',
      password: '',
      title: "제목이오",
      message: "",
      logs: [],
      status: "disconnected",
      now: '',
      lat: 990000.60652286,
      log: 1720034.9139856,
      loginCondition: false,
      radius: 10,
      level: 0,
      dateTime: '',
      calType: 0,
      calID: 0,
      caldataList: [],
      uuid: {
        x: 0,
        y: 0,
        uuid: ''
      },
      uid:'',
      passwordT :'',
    }
  },
  //

  methods: {
    openModal() {
      this.modal = true
    },
    closeModal() {
      this.modal = false
    },
    connect() {
      //this.socket = new WebSocket("ws://158.181.17.81:8080/smart/websocket");
      this.socket = new WebSocket("wss://echo.websocket.org");
      //소켓이 null
      console.log('소켓 연결' + this.socket)
      
      this.socket.onopen = () => {
        this.status = "connected";
        this.$store.dispatch('changeStateAction',1);
        this.logs.push({
          event: "연결 완료: ",
          // data: 'ws://158.181.17.81:8080/smart/websocket'
          data: 'wss://echo.websocket.org'
        }) //ip변경시 문제점 해결
        this.socket.onmessage = ({
          data
        }) => {
          this.logs.push({
            event: "메세지 수신",
            data
          });

//----------------------------------------------------------------------수신 프로토콜 
          console.log(data + '수신')
          var temp=data.substring(0,2)
          //관리자가 들어왔을때 라고 가정 로그인 세션 유지



          if (data.indexOf('200login') != -1) {
            this.closeModal()
            alert('admin님 환영합니다.')
            this.message = "1$"
            this.sendMessage(this.message)
            //uuid 요청 프로토콜 
            this.loginCondition = true;
          } 

          else if (data.indexOf('1000 Login') != -1) {
            alert('로그인 실패하셨습니다.')
            this.loginCondition = false;
          }
          
          //조건문 변경
          else if (temp=='1$') {
            console.log("uuid리스트 수신")
            data = data.substr(2)

            const obj = JSON.parse(data);
            uuidList = new Array();
            for (var i = 0; i < obj.uuidlist.length; i++) {
              var uuidindex = {
                uuidX: 0,
                uuidY: 0,
                uuidId: ""
              }
              var a = Number(obj.uuidlist[i].lat); //35
              var b = Number(obj.uuidlist[i].lon); //128
              //왜 반대인것인가
              var wgs84 = proj4('EPSG:4326','EPSG:5179', [b,a]); 

              uuidindex.uuidX = wgs84[0];
              uuidindex.uuidY = wgs84[1];
              
              uuidindex.uuidId = obj.uuidlist[i].uuid;
              uuidList.push(uuidindex)
            }
            EventBus.$emit("use-eventbus-uuidTest", uuidList)
            this.closeModal()
          } 
          else if (temp=='2$') {
            this.$refs.modal.open();
            console.log("재난 수신")
            data = data.substr(2)
            const obj = JSON.parse(data);
            var calIndex = {
              calNum: 0,
              lat: 0,
              log: 0,
              radius: 0,
              callevel: '',
              calType: '',
              calTime: '',
              context: ''
            }
            
            
            var a = Number(obj.info.lat); //35
            var b = Number(obj.info.lon); //128
            var wgs84 = proj4('EPSG:4326','EPSG:5179',[b,a]); 
            calIndex.lat = wgs84[0];
            calIndex.log = wgs84[1];
            
            calIndex.radius = obj.info.dangerRange;
            calIndex.callevel = obj.info.dangerStep;
            calIndex.calType = obj.info.occurType;
            calIndex.calTime = obj.info.occurDate;
            calIndex.context = obj.info.dangerMessage;

            EventBus.$emit("use-eventbus", calIndex);

            this.closeModal()
          }

          else if (temp =='4$') {
            console.log("상태 리스트 수신")
            var data = data.substr(2)
            const obj = JSON.parse(data);
            var fullcount = 0;
            var failcount = 0;
            var rate = [fullcount,failcount];

            calamityList= [];
          
            uuidshowList= [];

            for(var i =0; i<obj.jlist.length;i++){
                var calamity_info =
              {
                number: "",
                calday: "",
                calType: '',
                calLev: '',
                callat: '',
                callon:'',
                dangerRange : "",
                success: "",
                fail: "",
                rate: "",
                uuidlists: []
              };
          
              calamity_info.number = obj.jlist[i].num;
              calamity_info.calday = obj.jlist[i].occurDate;
              calamity_info.calType = obj.jlist[i].occurType;
              calamity_info.calLev = obj.jlist[i].dangerStep;
              calamity_info.callat = obj.jlist[i].lat;
              calamity_info.callon = obj.jlist[i].lon;
              calamity_info.success = obj.jlist[i].scount;
              calamity_info.dangerRange = obj.jlist[i].dangerRange;
              calamity_info.fail= obj.jlist[i].fcount;
              
              fullcount+=obj.jlist[i].scount +obj.jlist[i].fcount;
              failcount+=obj.jlist[i].fcount;
              calamity_info.rate = (calamity_info.success / (calamity_info.success + calamity_info.fail)*100).toFixed(5);
              
              
              for(var j=0;j<obj.jlist[i].statelist.length;j++){
                if(obj.jlist[i].num==obj.jlist[i].statelist[j].num){
                var uuidInfo ={
                calNum: "",
                segmentId: "",
                mesageState: "",
                uuid :"",
                }
                  uuidInfo.uuid = obj.jlist[i].statelist[j].uuid;
                  uuidInfo.calNum = calamity_info.number;
                  uuidInfo.segmentId = obj.jlist[i].statelist[j].pri;
                  uuidInfo.mesageState = obj.jlist[i].statelist[j].msgstate;
                  uuidshowList.push(uuidInfo);  
                }
              
              calamity_info.uuidlists=uuidshowList;
              }
              calamityList.push(calamity_info);
            }

            rate = [fullcount,failcount];
        
          EventBus.$emit("use-eventbus-calamityList", calamityList)
          EventBus.$emit("use-eventbus-rate", rate)
          }
        };
      };
      console.log(this.status)
      
//----------------------------------------------------------------------
    },
    disconnect() {
      console.log('연결 종료')
      this.$store.dispatch('changeStateAction',0);
       
      this.socket.close();
      this.status = "disconnected";
      this.logs = [];
    },
    sendMessage(e) {
      //waitForOpenSocket(socket)
      console.log(this.message + '전송')

      this.socket.send(this.message);
      this.logs.push({
        event: "메시지 전송",
        data: this.message
      });
      this.message = "";

    },
//----------------------------------------------------------------------전송 프로토콜 
    tryLogin() {
      this.now = new Date();
      this.id = document.getElementById("id").value;
      this.password = document.getElementById("pass").value;
      var logm = {id : this.id , password : this.password};
      logm = JSON.stringify(logm)
      this.message = '0${ "login":' + logm +"}";
      this.sendMessage(this.message);
      //로그인 시도 프로토콜 
    },
    openLogout(){
      this.$refs.logout.open();
    },
    tryLogout(){

    },

    //uuid를 자식으로 부터 받아오는곳
    parentsMethod: function (message) {
      var value = '3${"Segment":' + JSON.stringify(message) + '}';
      this.message = String(value);
      this.sendMessage(this.message);
      // 자식으로 부터받은 메시지를 사용
    },

//----------------------------------------------------------------------

    waitForOpenSocket(socket) {
      return new Promise((resolve, _reject) => {
        while (socket.readyState !== socket.OPEN) {
          /* no-op */ }
        return resolve()
      })
    },
    
    drawCircleP() {
      //재난 정보를 받아오는곳
      this.$refs.modal.open();
      var jbRandom = Math.random();
      var jcRandom = Math.random();
      var ranra = Math.random();
      var callevelR = Math.random();

      var calIndex = {
        calNum: 0,
        lat: 0,
        log: 0,
        radius: 0,
        callevel: 0,
        calType: 0,
        calTime: '',
        context: ''
      }

      calIndex.calNum = this.calID++;
      this.lat = Math.floor(jbRandom * 9000 + 1095000)
      calIndex.lat = this.lat;

      this.log = Math.floor(jcRandom * 9000 + 1760000)
      calIndex.log = this.log;

      this.radius = Math.floor(ranra * 2000 + 1000)
      calIndex.radius = this.radius;

      calIndex.callevel = Math.floor(callevelR * 4 + 1)

      var typera = Math.random();
      this.calType = Math.floor(typera * 2)
      calIndex.calType = this.calType;
      calIndex.calTime = new Date()

      calIndex.context = "~가 일어났습니다. 대피가 필요합니다."
      EventBus.$emit("use-eventbus", calIndex);
    },
    makerandomlatlang() {
      //uuid를 서버로부터 받아와 다른 컴포넌트로 보내주는 곳
      uuidList = new Array()

      for (var i = 0; i < 102; i++) {
        var uuidindex = {
          uuidX: 0,
          uuidY: 0,
          uuidId: ""
        }
        uuidindex.uuidX = Math.floor(Math.random() * 9000 + 1095000)
        uuidindex.uuidY = Math.floor(Math.random() * 9000 + 1760000)
        uuidindex.uuidId = i;
        uuidList.push(uuidindex)
      }
      EventBus.$emit("use-eventbus-uuidTest", uuidList)
    },
    sendTest(){
      var text = '4${"jlist":[{"num":"1","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","segmentid":"OpenLayers_Feature_Vector_501928","dangerStep":"심각","dangerRange":"1931","occurType":"0","occurDate":"2020-09-15T01:45:44.237Z","lat":"128.61979416690815","lon":"35.837556614203145","dangermessage":"~가 일어났습니다. 대피가 필요합니다.","statelist":[{"num":"1","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","uuid":"157","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5023282020-09-15T01:45:44.237Z","uuid":"94","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5032882020-09-15T01:45:44.237Z","uuid":"75","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5040082020-09-15T01:45:44.237Z","uuid":"27","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5040482020-09-15T01:45:44.237Z","uuid":"86","msgstate":"미전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5046882020-09-15T01:45:44.237Z","uuid":"113","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5052482020-09-15T01:45:44.237Z","uuid":"198","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5059282020-09-15T01:45:44.237Z","uuid":"53","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5071282020-09-15T01:45:44.237Z","uuid":"9","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5077682020-09-15T01:45:44.237Z","uuid":"102","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5079682020-09-15T01:45:44.237Z","uuid":"82","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5085682020-09-15T01:45:44.237Z","uuid":"47","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5100882020-09-15T01:45:44.237Z","uuid":"103","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5102482020-09-15T01:45:44.237Z","uuid":"114","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5122082020-09-15T01:45:44.237Z","uuid":"188","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5127282020-09-15T01:45:44.237Z","uuid":"126","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5138482020-09-15T01:45:44.237Z","uuid":"0","msgstate":"미전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5148082020-09-15T01:45:44.237Z","uuid":"60","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5163282020-09-15T01:45:44.237Z","uuid":"138","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"177","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"183","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5180882020-09-15T01:45:44.237Z","uuid":"133","msgstate":"전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5199282020-09-15T01:45:44.237Z","uuid":"28","msgstate":"미전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5206882020-09-15T01:45:44.237Z","uuid":"112","msgstate":"전송"}],"scount":11,"fcount":1},{"num":"2","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","segmentid":"OpenLayers_Feature_Vector_501928","dangerStep":"주의","dangerRange":"1931","occurType":"0","occurDate":"2020-09-15T01:45:44.237Z","lat":"128.61979416690815","lon":"35.837556614203145","dangermessage":"~가 일어났습니다. 대피가 필요합니다.","statelist":[{"num":"2","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","uuid":"157","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5023282020-09-15T01:45:44.237Z","uuid":"94","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5032882020-09-15T01:45:44.237Z","uuid":"75","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5040082020-09-15T01:45:44.237Z","uuid":"27","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5040482020-09-15T01:45:44.237Z","uuid":"86","msgstate":"미전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5046882020-09-15T01:45:44.237Z","uuid":"113","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5052482020-09-15T01:45:44.237Z","uuid":"198","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5059282020-09-15T01:45:44.237Z","uuid":"53","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5071282020-09-15T01:45:44.237Z","uuid":"9","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5077682020-09-15T01:45:44.237Z","uuid":"102","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5079682020-09-15T01:45:44.237Z","uuid":"82","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5085682020-09-15T01:45:44.237Z","uuid":"47","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5100882020-09-15T01:45:44.237Z","uuid":"103","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5102482020-09-15T01:45:44.237Z","uuid":"114","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5122082020-09-15T01:45:44.237Z","uuid":"188","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5127282020-09-15T01:45:44.237Z","uuid":"126","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5138482020-09-15T01:45:44.237Z","uuid":"0","msgstate":"미전송"},{"num":"1","pri":"OpenLayers_Feature_Vector_5148082020-09-15T01:45:44.237Z","uuid":"60","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5163282020-09-15T01:45:44.237Z","uuid":"138","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"177","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"183","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5180882020-09-15T01:45:44.237Z","uuid":"133","msgstate":"전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5199282020-09-15T01:45:44.237Z","uuid":"28","msgstate":"미전송"},{"num":"2","pri":"OpenLayers_Feature_Vector_5206882020-09-15T01:45:44.237Z","uuid":"112","msgstate":"전송"}],"scount":21,"fcount":3},{"num":"1","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","segmentid":"OpenLayers_Feature_Vector_501928","dangerStep":"심각","dangerRange":"1931","occurType":"0","occurDate":"2020-09-15T01:45:44.237Z","lat":"128.61979416690815","lon":"35.837556614203145","dangermessage":"~가 일어났습니다. 대피가 필요합니다.","statelist":[{"num":"3","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","uuid":"157","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5023282020-09-15T01:45:44.237Z","uuid":"94","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5032882020-09-15T01:45:44.237Z","uuid":"75","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5040082020-09-15T01:45:44.237Z","uuid":"27","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5040482020-09-15T01:45:44.237Z","uuid":"86","msgstate":"미전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5046882020-09-15T01:45:44.237Z","uuid":"113","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5052482020-09-15T01:45:44.237Z","uuid":"198","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5059282020-09-15T01:45:44.237Z","uuid":"53","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5071282020-09-15T01:45:44.237Z","uuid":"9","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5077682020-09-15T01:45:44.237Z","uuid":"102","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5079682020-09-15T01:45:44.237Z","uuid":"82","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5085682020-09-15T01:45:44.237Z","uuid":"47","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5100882020-09-15T01:45:44.237Z","uuid":"103","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5102482020-09-15T01:45:44.237Z","uuid":"114","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5122082020-09-15T01:45:44.237Z","uuid":"188","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5127282020-09-15T01:45:44.237Z","uuid":"126","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5138482020-09-15T01:45:44.237Z","uuid":"0","msgstate":"미전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5148082020-09-15T01:45:44.237Z","uuid":"60","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5163282020-09-15T01:45:44.237Z","uuid":"138","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"177","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"183","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5180882020-09-15T01:45:44.237Z","uuid":"133","msgstate":"전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5199282020-09-15T01:45:44.237Z","uuid":"28","msgstate":"미전송"},{"num":"3","pri":"OpenLayers_Feature_Vector_5206882020-09-15T01:45:44.237Z","uuid":"112","msgstate":"전송"}],"scount":3,"fcount":1},{"num":"4","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","segmentid":"OpenLayers_Feature_Vector_501928","dangerStep":"심각","dangerRange":"1931","occurType":"0","occurDate":"2020-09-15T01:45:44.237Z","lat":"128.61979416690815","lon":"35.837556614203145","dangermessage":"~가 일어났습니다. 대피가 필요합니다.","statelist":[{"num":"4","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","uuid":"157","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5023282020-09-15T01:45:44.237Z","uuid":"94","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5032882020-09-15T01:45:44.237Z","uuid":"75","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5040082020-09-15T01:45:44.237Z","uuid":"27","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5040482020-09-15T01:45:44.237Z","uuid":"86","msgstate":"미전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5046882020-09-15T01:45:44.237Z","uuid":"113","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5052482020-09-15T01:45:44.237Z","uuid":"198","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5059282020-09-15T01:45:44.237Z","uuid":"53","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5071282020-09-15T01:45:44.237Z","uuid":"9","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5077682020-09-15T01:45:44.237Z","uuid":"102","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5079682020-09-15T01:45:44.237Z","uuid":"82","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5085682020-09-15T01:45:44.237Z","uuid":"47","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5100882020-09-15T01:45:44.237Z","uuid":"103","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5102482020-09-15T01:45:44.237Z","uuid":"114","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5122082020-09-15T01:45:44.237Z","uuid":"188","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5127282020-09-15T01:45:44.237Z","uuid":"126","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5138482020-09-15T01:45:44.237Z","uuid":"0","msgstate":"미전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5148082020-09-15T01:45:44.237Z","uuid":"60","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5163282020-09-15T01:45:44.237Z","uuid":"138","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"177","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"183","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5180882020-09-15T01:45:44.237Z","uuid":"133","msgstate":"전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5199282020-09-15T01:45:44.237Z","uuid":"28","msgstate":"미전송"},{"num":"4","pri":"OpenLayers_Feature_Vector_5206882020-09-15T01:45:44.237Z","uuid":"112","msgstate":"전송"}],"scount":31,"fcount":1},{"num":"5","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","segmentid":"OpenLayers_Feature_Vector_501928","dangerStep":"심각","dangerRange":"1931","occurType":"0","occurDate":"2020-09-15T01:45:44.237Z","lat":"128.61979416690815","lon":"35.837556614203145","dangermessage":"~가 일어났습니다. 대피가 필요합니다.","statelist":[{"num":"5","pri":"OpenLayers_Feature_Vector_5019282020-09-15T01:45:44.237Z","uuid":"157","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5023282020-09-15T01:45:44.237Z","uuid":"94","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5032882020-09-15T01:45:44.237Z","uuid":"75","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5040082020-09-15T01:45:44.237Z","uuid":"27","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5040482020-09-15T01:45:44.237Z","uuid":"86","msgstate":"미전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5046882020-09-15T01:45:44.237Z","uuid":"113","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5052482020-09-15T01:45:44.237Z","uuid":"198","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5059282020-09-15T01:45:44.237Z","uuid":"53","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5071282020-09-15T01:45:44.237Z","uuid":"9","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5077682020-09-15T01:45:44.237Z","uuid":"102","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5079682020-09-15T01:45:44.237Z","uuid":"82","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5085682020-09-15T01:45:44.237Z","uuid":"47","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5100882020-09-15T01:45:44.237Z","uuid":"103","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5102482020-09-15T01:45:44.237Z","uuid":"114","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5122082020-09-15T01:45:44.237Z","uuid":"188","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5127282020-09-15T01:45:44.237Z","uuid":"126","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5138482020-09-15T01:45:44.237Z","uuid":"0","msgstate":"미전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5148082020-09-15T01:45:44.237Z","uuid":"60","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5163282020-09-15T01:45:44.237Z","uuid":"138","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"177","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5167682020-09-15T01:45:44.237Z","uuid":"183","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5180882020-09-15T01:45:44.237Z","uuid":"133","msgstate":"전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5199282020-09-15T01:45:44.237Z","uuid":"28","msgstate":"미전송"},{"num":"5","pri":"OpenLayers_Feature_Vector_5206882020-09-15T01:45:44.237Z","uuid":"112","msgstate":"전송"}],"scount":7,"fcount":1}]} '
      this.message = text;
      this.sendMessage(); 
    },
  }
}
</script>

<style>
@import url(http://fonts.googleapis.com/earlyaccess/nanumgothic.css); /*크롬등을 위한 구글 웹 폰트*/

body, div, dl, dt, dd, ul, ol, li, h1, h2, h3, h4, h5, h6, p, 
form, fieldset, input, th, td{
    margin:0;
    padding:0;font-family:'NanumGothic', '나눔고딕','NanumGothicWeb', '맑은 고딕', 'Malgun Gothic', Dotum, Verdana, AppleGothic, Sans-Serif;
     -webkit-text-size-adjust:none;
}
input:focus{outline:none;}
select:focus{outline:none;}
textarea:focus{outline:none;}

body{background-color:#f2f2f2;width:100%;min-width:1100px;}
.topGroup{background-color:#303a59;padding:15px;}
.topGroup .tx1{color:#ffffff;font-size:16pt; display: inline-block; text-align: left}
.right{float:right;}
.center{text-align:center;}
.topMargin{margin-top:18px;}

.bodyBox{text-align:center;width:100%;}
.boxSet2{background-color:#ffffff;border-radius: 10px;box-shadow: 2px 2px 7px 0px #e2e2e2;padding:10px; height: 705px;}

.boxSet{background-color:#ffffff;border-radius: 10px;box-shadow: 2px 2px 7px 0px #e2e2e2;padding:10px;}
.bodyTbl{width:100%;border-spacing:0;table-layout:fixed;overflow:hidden;padding:15px;}
.bodyTbl tr td{vertical-align:top;}
.boxTitle{color:#61709e;font-size:14pt;text-align:left;padding-bottom:7px;}
.boxMap{width:100%;height:625px;border:0px solid #dbdbe5;}

.btnLogout input{
 padding:10px 20px 10px 20px;
 margin-left:2px;
 font-size:12pt;
 color:#505050;
 font-weight:normal;
 background-color: #ffffff;
 border: none;
 border-radius: 20px;
 box-shadow: 0 0px #232d4b;
}

.btnLogout input:hover{
 background-color: #c4d3e2;
 cursor:pointer;
}
  
.btnLogout input:active,
.btnLogout input.active{
 background-color: #232d4b;
 box-shadow: 0 0px #232d4b;
 transform: translateY(1px);  
}

.btnNormal input{
 padding:10px 0px 10px 0px;
 width:100%;
 font-size:12pt;
 color:#ffffff;
 font-weight:normal;
 background-color: #59627f;
 border: none;
 border-radius: 5px;
 box-shadow: 0 0px #232d4b;
}

.btnNormal input:hover{
 background-color: #3f4a6c;
 cursor:pointer;
}
  
.btnNormal input:active,
.btnNormal input.active{
 background-color: #3f4a6c;
 box-shadow: 0 0px #232d4b;
 transform: translateY(1px);  
}

.alertTxt{background-color:#f5f1ea;height:80px;width:270px;text-align:center;vertical-align:middle;display:table-cell;}
.alertTxt .txtDate{font-size:14pt;}
.alertTxt .txtTitle{font-size:16pt;font-weight:600;margin-top:3px;}
.boxPoint ul{list-style:none;}
.boxPoint ul li{display:inline-block;padding:5px;}

.boxPoint ul .boxBlue{background-color:#ecf5f9;border: 1px solid #deecf2;}
.boxPoint ul .blueTxt{color:#5d73c3;font-size:12pt;padding:0px 0 5px 0;}

.boxGraph{background-color:#ecf5f9;border: 1px solid #deecf2;padding:5px;height:180px;}
.txtCount{width:120px;text-align:center;font-size:20pt;color:#404146;font-weight:600;}
.txtCountBlue{width:120px;text-align:center;font-size:20pt;color:#006be6;font-weight:600;}
.txtCountRed{width:120px;text-align:center;font-size:20pt;color:#f47300;font-weight:600;}
.txtInputNormal{
 height:32px;
 font-size:12pt;
 border-style:none;
 border-radius: 5px;
 border:1px solid #deecf2;
 font-family:'NanumGothic', '나눔고딕','NanumGothicWeb', '맑은 고딕';
 padding-left:5px;
 background-color: white;
 color:#022e56;	
}

.txtInputNormal:focus{border: 1px solid #b2dbed;}

.fix-container-allborder{
 border-right: 1px solid #cecece;
 border-left: 1px solid #cecece;
 border-bottom: 1px solid #cecece;
 border-top: 2px solid #c9d2de;
 position: relative;
 padding-top: 25px; /* header-bg height값 */
 background-color:#fff;
}
.header-bg{
 background: #eef0f1;
 height: 25px; /* header-bg height값 */
 position: absolute;
 top: 0;
 right: 0;
 left: 0;  
}
.table-wrapper{overflow-x: hidden;overflow-y: auto;height: 100%;}
.tablefix{width: 100%;border-collapse: collapse;}

.tablefix td {
 border-bottom: 1px solid #dee3f3;
 padding:4px;		
 font-size:11pt;
 font-weight:normal;
 color:#4b4b4b;
 text-align:left;
 vertical-align:middle;
}
	
.tablefix td img{vertical-align:middle;}

.tdleftbar{border-left: 1px solid #dee3f3; }
.tablefix th { padding: 0px; }
.tablefix .th-text {
 position: absolute;
 top: 0;
 width: inherit;
 line-height: 25px; /* header-bg height값 */
 border-left: 1px solid #dee3f3;
 font-size:10pt;
 font-weight:normal;
 color:#404146;	
 text-align:center;
 }
.tablefix th:first-child .th-text { border-left: none;}
.tablefix .txcenter{text-align:center;}
.tdcolor td {background-color:#eef3f9;}
.tablefix tbody tr:nth-child(even){background-color: #eef3f9;}
.txtOverflowHidden /*말줄임*/
{
    white-space: nowrap;            
    overflow: hidden;              /* "overflow" value must be different from "visible" */ 
    -o-text-overflow: ellipsis;    /* Opera under 10.7 */
    text-overflow:  ellipsis;    /* IE, Safari */
    padding-right:10px;
	padding-left:5px;
}


/*팝업용 css 시작*/

.btnPop input{
padding:10px 30px 10px 30px;
margin-left:2px;
font-size:14pt;
color:#e1e8ff;
font-weight:normal;
background-color: #46537c;
border: none;
border-radius: 5px;
box-shadow: 0 0px #232d4b;
}

.btnPop input:hover{
background-color: #232d4b;
cursor:pointer;
  }
  
.btnPop input:active,
.btnPop input.active{
background-color: #232d4b;
  box-shadow: 0 0px #232d4b;
  transform: translateY(1px);  
}

.loginBox{text-align:center;padding-top:30px;padding-bottom:30px;}
.loginTxt1{color:#59627f;font-size:26pt;}
.loginTxt2{color:#8792b3;font-size:10pt;padding:0px 0 15px 0;}

.txtEtc{color:#e32a81;font-size:11pt;padding:5px 0 0 0;}

.txtInputLogin{
 height:40px;
 font-size:13pt;
 border-style:none;
 border-radius: 5px;
 border:1px solid #c4cbe1;
 font-family:'NanumGothic', '나눔고딕','NanumGothicWeb', '맑은 고딕';
 padding-left:5px;
 color:#022e56;	
}

.txtInputLogin:focus{border: 1px solid #6b7db5;}

.fix-container-allborder{
 border-right: 1px solid #cecece;
 border-left: 1px solid #cecece;
 border-bottom: 1px solid #cecece;
 border-top: 2px solid #c9d2de;
 position: relative;
 padding-top: 25px; /* header-bg height값 */
 background-color:#fff;
}
.header-bg{
 background: #eef0f1;
 height: 25px; /* header-bg height값 */
 position: absolute;
 top: 0;
 right: 0;
 left: 0;  
}
.table-wrapper{overflow-x: hidden;overflow-y: auto;height: 100%;}
.tablefix{width: 100%;border-collapse: collapse;}

.tablefix td {
 border-bottom: 1px solid #dee3f3;
 padding:4px;		
 font-size:11pt;
 font-weight:normal;
 color:#4b4b4b;
 text-align:left;
 vertical-align:middle;
}
	
.tablefix td img{vertical-align:middle;}

.tdleftbar{border-left: 1px solid #dee3f3; }
.tablefix th { padding: 0px; }
.tablefix .th-text {
 position: absolute;
 top: 0;
 width: inherit;
 line-height: 25px; /* header-bg height값 */
 border-left: 1px solid #dee3f3;
 font-size:10pt;
 font-weight:normal;
 color:#404146;	
 text-align:center;
 }
.tablefix th:first-child .th-text { border-left: none;}
.tablefix .txcenter{text-align:center;}
.tdcolor td {background-color:#eef3f9;}
.tablefix tbody tr:nth-child(even){background-color: #eef3f9;}
.txtOverflowHidden /*말줄임*/
{
    white-space: nowrap;            
    overflow: hidden;              /* "overflow" value must be different from "visible" */ 
    -o-text-overflow: ellipsis;    /* Opera under 10.7 */
    text-overflow:  ellipsis;    /* IE, Safari */
    padding-right:10px;
	padding-left:5px;
}
    

</style>

