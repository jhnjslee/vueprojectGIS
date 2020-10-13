<template>
  <div id="app" width="1903px">
    <div class="topGroup">
      <span class="tx1">Segment 긴급 메시지 전송 시스템 </span>
      <spinner :loading="LoadingStatus" style="position: absolute;margin-left: 900px;margin-top: 350px;z-index: 10000;"></spinner>
      <span class="right" style="margin-top:-7px;">
        <div class="example-modal-window">
  
    <notifications group="notifyApp" position="center center"/>
    
          <div v-if="!loginCondition">
  
            <button @click="openModal" style="color:black;">
              <h1>'</h1>
            </button>
  
            <v-btn class="mr-4" @click="requestUUIDinterval">통신 테스트</v-btn>
            <v-btn class="mr-4" @click="sendTest">1.리스트</v-btn>
            <v-btn class="mr-4" @click="makerandomlatlang">2.사용자</v-btn>
            <v-btn class="mr-4" @click="drawCircleP">3.재난</v-btn>
            
            <div v-if="modal">

              <MyModal @close="closeModal" v-if="modal" style="background: rgba(0,0,0,0.9);">
                <div class="loginBox">
                  <div class="loginTxt1">LOGIN</div>
                  <div class=loginTxt2>Segment 긴급 메시지 전송 시스템</div>

                  <form id="myForm" @submit.prevent="loginSession">
                    <div>
                    <input type="text" id="idP" v-model="idP" class="txtInputLogin" name="id" placeholder="아이디"
                    minlength="4"  maxlength="32" style="width:300px;" />
                  </div>
                  <div style="margin-top:5px;">
                    <input type="password" id="passP" v-model="passP" class="txtInputLogin" name="password"
                      placeholder="비밀번호 " style="width:300px;"  minlength="4"  maxlength="12" required/>
                  </div>
                   <div style="padding: 15px 0 0 0;">
                    <span class="btnPop"><input type="submit" class ="btnPop" value="로그인" /></span>
                  </div>
                  <div style="margin-top: 15px; color: red;">
                    {{logintry}}
                  </div>
                  </form>

                  <!--
                  <div>
                    <input type="text" id="id" v-model="id" class="txtInputLogin" name="id" placeholder="아이디 "
                      style="width:300px;" />
                  </div>
                  <div style="margin-top:5px;">
                    <input type="password" id="pass" v-model="password" class="txtInputLogin" name="password"
                      placeholder="비밀번호 " style="width:300px;" />
                  </div>
                  <div style="padding: 15px 0 0 0;">
                    <span class="btnPop"><input type="button" @click="tryLogin" value="로그인" /></span>
                  </div>-->

                </div>
              </MyModal>

            </div>
          </div>
            <div v-if="loginCondition" display="flex">
              <!--  <h3 style="font-weight:bold color:white;">{{id}}님 환영합니다.</h3>-->
              <span class="btnLogout">
                <input type="button" @click="openLogout" value="로그아웃" />
                </span>
            </div>
        </div>
      </span>

      <SweetModal icon="warning" ref="logout" title="로그아웃" style="margin-bottom:80px">
        <p>로그아웃하면 웹 서비스 이용이 불가 합니다. 그래도 로그아웃 하시겠습니까?</p>

        <div style="float:right;padding:15px 10px 18px 0;">
          <span class="btnPop"><input type="button" @click="closeModallogout" value="취소" /></span>
          <span class="btnPopRed"><input type="button" @click="tryLogout" value="확인" /></span>
        </div>
      </SweetModal>

      <SweetModal icon="warning" ref="modal" title="주의">
        재난이 발생하였습니다!
      </SweetModal>

      <SweetModal ref="intro" title="사용 설명서" v-on:close="yourClose(1)" >
        	<SweetModalTab title="화면 설명" name="tab1" id="tab1"><img src="../src/assets/intro2.png" style="width: 950px;"></SweetModalTab>
	        <SweetModalTab title="재난 설명" name="tab2" id="tab2"><img src="../src/assets/segmentexplane.png" style="width: 950px;"></SweetModalTab>
          <SweetModalTab title="기능 설명" name="tab3" id="tab3"><img src="../src/assets/intro3.png" style="width: 950px;"></SweetModalTab>
          <SweetModalTab title="기능 설명" name="tab4" id="tab4"><img src="../src/assets/intro4.png" style="width: 950px;"></SweetModalTab>
          <input type='checkbox' name='chkbox' id='todaycloseyn' value='Y'> 오늘 하루 이 창을 열지 않음    
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
              <!--세로 스크롤만 있는 테이블임. 가로스크롤 필요시 연락바람. ...으로 줄임표시 해둠 -->
              <listTable @resend-event="parentsMethod2"></listTable>
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
import router from './router/router.js'
import intro from './assets/intro.png';
import Login from './components/Login.vue';
import MyModal from './components/LoginForm';
import Spinner from './components/Spinner';

import {EventBus} from "./components/event-bus";
import {store} from './store/index.js'
import {SweetModal,SweetModalTab} from 'sweet-modal-vue'

var EPSG5179 = new OpenLayers.Projection('EPSG:5179');
var EPSG4326 = new OpenLayers.Projection('EPSG:4326');
let caldataList = new Array()
let uuidList = new Array()
let test = 0;
let socket = '';
let calamityList = new Array();
let uuidshowList = new Array();
let segmentshowList = new Array();
let tts = '';
let location = "";
let loginresponse = "";
let endOfCookie = "";
let spinnerState = false;
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
    SweetModalTab,
    Spinner,
  },
  mounted() {
    console.log("APPMOUNTED")
    location = document.location.href;
    // this.connect();
    // document.write( ip() );
    
    this.openModal();
  },
  created() {
    console.log("APPCREATE")
    spinnerState = this.$store.state.spinnerState;
    EventBus.$on('start:spinner', this.startSpinner);
    EventBus.$on('end:spinner', this.endSpinner);
  },

  data() {
    return {
      valid: false,
      loginresponse : "",
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
      uid: '',
      passwordT: '',
      requestUUID: '1',
      uuidCount: 0,
      setintervalid: '',
      idP:"",
      passP: "",
      logintry :"",
      LoadingStatus : false,
    }
  },
  methods: {
    checkForm() {
    },
    openModal() {
      this.modal = true
    },
    closeModal() {
      this.modal = false
    },
    closeModallogout(){
    this.$refs.logout.close();
    },
    startSpinner(){                                  
      this.LoadingStatus = true;
    },
    endSpinner(){
      this.LoadingStatus = false;
    },
    connect() {
      // EventBus.$emit('start:spinner');  
      var location2 = location.substring(7)
     // socket = new WebSocket("ws://"+location2+"websocket");
      // socket = new WebSocket("ws://192.168.0.3:8080/smart");
      socket = new WebSocket("ws://158.181.17.81:8080/smart")
      // socket = new WebSocket("wss://echo.websocket.org");
      //소켓이 nulls

      console.log('소켓 연결' + socket)
      
      socket.onopen = () => {
        this.status = "connected";
        
        // this.LoadingStatus=true;
        this.$store.dispatch('changeStateAction', 1);
        this.logs.push({
          event: "연결 완료: ",
          // data: "http://192.168.0.3:8080/socket"
          // data: 'ws://'+location2+'/websocket'
          // data: "ws://192.168.0.3:8080/smart"
          data: "ws://158.181.17.81:8080/smart"
          // data: 'wss://echo.websocket.org'

        }) //ip변경시 문제점 해결
        socket.onmessage = ({
          data
        }) => {
          this.logs.push({
            event: "메세지 수신",
            data
          });
          //----------------------------------------------------------------------수신 프로토콜 
          console.log(data+'수신')
          var temp = data.substring(0, 2)
        
          //관리자가 들어왔을때 라고 가정 로그인 세션 유지
          if (data.indexOf('200login') != -1) {
            this.closeModal()
            this.$session.set()
            this.message = "B$"
            this.sendMessage(this.message)


            this.loginCondition = true;
            this.message = "C$"
            this.sendMessage(this.message)
            //uuid 요청 프로토콜 
            this.requestUUIDinterval();

          } else if (data.indexOf('1000 Login') != -1) {
            alert('로그인 실패하셨습니다.')
            this.loginCondition = false;
            this.openModal();
          }

          //조건문 변경
          else if (temp == 'C$') {
            if (this.uuidCount == 0){
              if(this.getCookie("divpop1") !="Y"){
                this.$refs.intro.open();
              }
            }
            this.uuidCount++;
            
            console.log("uuid리스트 수신")
            data = data.substr(2)
            console.log(data)
            
            const obj = JSON.parse(data);
            uuidList = new Array();
            for (var i = 0; i < obj.uuidlist.length; i++) {
              var uuidindex = {
                uuidX: 0,
                uuidY: 0,
                uuidId: "",
                userid : ""
              }
              var a = Number(obj.uuidlist[i].lat); //35
              var b = Number(obj.uuidlist[i].lon); //128
              //왜 반대인것인가
              var wgs84 = proj4('EPSG:4326', 'EPSG:5179', [b, a]);

              uuidindex.uuidX = wgs84[0];
              uuidindex.uuidY = wgs84[1];

              uuidindex.uuidId = obj.uuidlist[i].uuid;
              uuidindex.userid = obj.uuidlist[i].userid;
              uuidList.push(uuidindex)
            }
            EventBus.$emit("use-eventbus-uuidTest", uuidList)
            this.closeModal()
            this.noti2();
          }
          
           else if (temp == 'D$') {
            //this.$store.dispatch('changeSpinnerAction', 0);
            //EventBus.$emit('start:spinner');
              this.LoadingStatus = true;
              this.$forceUpdate();
              this.noti1();
              setTimeout(()=> { // Code here 
                
              this.$nextTick(function () {
             
           
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
            var wgs84 = proj4('EPSG:4326', 'EPSG:5179', [b, a]);

            calIndex.calNum = obj.info.num;
            calIndex.lat = wgs84[0];
            calIndex.log = wgs84[1];

            calIndex.radius = obj.info.dangerRange;
            calIndex.callevel = obj.info.dangerStep;
            calIndex.calType = obj.info.occurType;
            calIndex.calTime = obj.info.occurDate;
            calIndex.context = obj.info.dangerMessage;

            var changecal = ["미확인", calIndex.calNum]
            this.$store.dispatch('changeCalStateAction', changecal);

            EventBus.$emit("use-eventbus", calIndex);

            this.closeModal()       
             })
            this.LoadingStatus = false;
            }, 1000);
          } 
          else if (temp == 'G$') {
            console.log("상태 리스트 수신")
            var data = data.substr(2)
            const obj = JSON.parse(data);
            
            var successcount = 0;
            var failcount = 0;
            var rate = [successcount, failcount];

            calamityList = [];
            segmentshowList = [];
            uuidshowList = [];

            for (var i = 0; i < obj.jlist.length; i++) {
              var calamity_info = {
                number: "",
                calamity_state : "",
                calday: "",
                calType: '',
                calLev: '',
                callat: '',
                callon: '',
                sendall : "",
                calamitymessage: "",
                dangerRange: "",
                success: "",
                fail: "",
                rate: 0,
                uuidlists: [],
                segmentlist: []
              };

              calamity_info.number = obj.jlist[i].num;
              calamity_info.calday = obj.jlist[i].occurDate;
              calamity_info.calType = obj.jlist[i].occurType;
              calamity_info.calLev = obj.jlist[i].dangerStep;
              calamity_info.callat = obj.jlist[i].lat;
              calamity_info.callon = obj.jlist[i].lon;

              calamity_info.calamitymessage = "\n"+obj.jlist[i].dangermessage;
              calamity_info.calamitymessage.replace(/(?:\r\n|\r|\n)/g, '<br/>')

              calamity_info.success = obj.jlist[i].scount;
              calamity_info.dangerRange = obj.jlist[i].dangerRange;
              calamity_info.fail = obj.jlist[i].fcount;
              calamity_info.sendall = obj.jlist[i].tcount;
              // 상태 리스트 
              for(var j =0;j<obj.info.length;j++){
                if(obj.info[j].num == obj.jlist[i].num){
                  calamity_info.calamity_state = obj.info[j].state
                }
              }

              if(calamity_info.calamity_state == "전송"){

                successcount += obj.jlist[i].scount;
                failcount += obj.jlist[i].fcount;
                calamity_info.rate = (calamity_info.success / (calamity_info.success + calamity_info.fail) * 100).toFixed(1);
              
                if(isNaN(calamity_info.rate)){
                  calamity_info.rate =0;
                }
              }

              for (var j = 0; j < obj.jlist[i].statelist.length; j++) {

                if (segmentshowList.indexOf(obj.jlist[i].statelist[j].pri) == -1) {
                  var segmentshowIndex = {
                    pri : "",
                    calId : ""
                  }

                  segmentshowIndex.pri = obj.jlist[i].statelist[j].pri;
                  segmentshowIndex.calId =  obj.jlist[i].num;

                  segmentshowList.push(segmentshowIndex)
                }

                if (obj.jlist[i].num == obj.jlist[i].statelist[j].num) {
                  var uuidInfo = {
                    calNum: "",
                    segmentId: "",
                    messagestate: "",
                    uuid: "",
                    userid: ""
                  }
                  uuidInfo.uuid = obj.jlist[i].statelist[j].uuid;
                  uuidInfo.calNum = calamity_info.number;
                  uuidInfo.segmentId = obj.jlist[i].statelist[j].pri;
                  uuidInfo.messagestate = obj.jlist[i].statelist[j].msgstate;
                  uuidInfo.userid =  obj.jlist[i].statelist[j].userid;
                  uuidshowList.push(uuidInfo);
                }

                calamity_info.uuidlists = uuidshowList;
                calamity_info.segmentlist = segmentshowList;
              }
              calamityList.push(calamity_info);
            }

            rate = [successcount, failcount];
            EventBus.$emit("use-eventbus-calamityList", calamityList)
            EventBus.$emit("use-eventbus-rate", rate)
          }
      
        };
        
          };
          this.LoadingStatus=false;
    },
    //----------------------------------------------------------------------

    disconnect() {
      console.log('연결 종료')
      
      EventBus.$emit('end:spinner'); 
      this.$store.dispatch('changeStateAction', 0);
      socket.close();
      this.loginCondition = false;
      this.status = "disconnected";
      this.logs = [];
    },
    /* 소켓통신 메시지 보내는 곳 */
    sendMessage(e) {
      //waitForOpenSocket(socket)
      console.log('전송')
      console.log(this.message)
      socket.send(this.message);
      this.logs.push({
        event: "메시지 전송",
        data: this.message
      });
      this.message = "";

    },
    //----------------------------------------------------------------------전송 프로토콜 
    tryLogin() {
      this.id = document.getElementById("id").value;
      this.password = document.getElementById("pass").value;
      var logm = {
        id: this.idP,
        password: this.passP
      };
      logm = JSON.stringify(logm)
      this.message = 'A${ "login":' + logm + "}";
      this.sendMessage(this.message);
      //로그인 시도 프로토콜 
    },
    noti1() {
      this.$notify({
          group: 'notifyApp',
          type: 'error',
          duration: 5000,
          title: '재난 발생',
          text: '재난정보를 수집 중 입니다.'
      })
    },
    noti2() {
      this.$notify({
          group: 'notifyApp',
          type: 'success',
          duration: 5000,
          title: '사용자 정보 업데이트',
          text: '사용자 위치 정보가 업데이트 되었습니다.'
      })
    },
    openLogout() {
      this.$refs.logout.open();
    },
    tryLogout() {
      this.$refs.logout.close();
      this.disconnect();
      this.openModal();
    },

    //uuid를 자식으로 부터 받아오는곳
    parentsMethod: function (message) {
      var state = this.$store.state.sendingCalState;
      var numb = this.$store.state.currentCalNumber;
      if (message == "reject") { //실패 프로토콜 
        var value = 'f${"info":{"num":"' + numb + '",' + '"state":"' + state + '"}}';
        this.message = String(value);
        this.sendMessage(this.message);
        this.message = "B$"
        this.sendMessage(this.message)

      } 
      else if(state=="미확인"){
        
        var value = 'E${"info":{"num":"' + numb + '",' + '"state":"' + state + '"},' + '"Segment":' + JSON.stringify(message) + '}';
        this.message = String(value);
        this.sendMessage(this.message);
        this.message = "B$"
        this.sendMessage(this.message);

      }
      else {
        var temp = JSON.stringify(message);
        var deserialize = JSON.parse(temp);

        var uuidtemplist = new Array();
        deserialize.forEach(function(element){
          element.uuidlist.forEach(function(element2){
            uuidtemplist.push(element2.uuid)          
          });
          delete element.uuidlist              
          element.uuidlist = uuidtemplist
        });

        var value = 'F${"info":{"num":"' + numb + '",' + '"state":"' + state + '"},' + '"Segment":' + JSON.stringify(deserialize) + '}';
        
        this.message = String(value);
        this.sendMessage(this.message);
        this.message = "B$"
        this.sendMessage(this.message);


      }

    },
    //재발송 uuid를 자식으로 부터 받아오는곳
    parentsMethod2: function (message) {
      var value = 'H${"resendList":' + JSON.stringify(message) + '}';
      this.message = String(value);
      this.sendMessage(this.message);

      this.message = "B$"
      this.sendMessage(this.message)
      // 자식으로 부터받은 메시지를 사용
    },
    //----------------------------------------------------------------------

//소켓통신이 열릴때까지 대기
    waitForOpenSocket(socket) {
      return new Promise((resolve, _reject) => {
        while (socket.readyState !== socket.OPEN) {
          /* no-op */
        }
        return resolve()
      })
    },

    drawCircleP() {
      //재난 정보를 생성하여 테스트 하는 코드
      var jbRandom = Math.random();
      var jcRandom = Math.random();
      var ranra = Math.random();
      var callevelR = Math.random();


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

      calIndex.calNum = this.calID++;
      this.lat = Math.floor(jbRandom * 9000 + 1095000)
      calIndex.lat = this.lat;

      this.log = Math.floor(jcRandom * 9000 + 1760000)
      calIndex.log = this.log;

      this.radius = Math.floor(ranra * 2000 + 1000)
      calIndex.radius = this.radius;

      var levR = Math.floor(callevelR * 3 + 1);

      switch (levR) {
        case 0: {
          calIndex.callevel = "심각"
        }
        case 1: {
          calIndex.callevel = "주의"
        }
        case 2: {
          calIndex.callevel = "경계"
        }
        case 3: {
          calIndex.callevel = "관심"
        }
      }

      var typera = Math.random();
      this.calType = Math.floor(typera * 1)
      switch (this.calType) {
        case 0: {
          this.calType = "홍수"
        }
        case 1: {
          this.calType = "경사지 붕괴"
        }
      }

      calIndex.calType = this.calType;
      calIndex.calTime = new Date()
      
      calIndex.context = "~\n가 일어났습니다. 대피가 \n 필요합니다."
      calIndex.context.replace(/(?:\r\n|\r|\n)/g, '<br />')

      EventBus.$emit("use-eventbus", calIndex);

      var changecal = ["미확인", "테스트1번"]
      this.$store.dispatch('changeCalStateAction', changecal);
    },

    makerandomlatlang() {
      //uuid를 서버로부터 받아와 다른 컴포넌트로 보내주는 곳
      uuidList = new Array()

      for (var i = 0; i < 200; i++) {
        var uuidindex = {
          uuidX: 0,
          uuidY: 0,
          uuidId: "",
          uuid:""
        }
        uuidindex.uuidX = Math.floor(Math.random() * 9000 + 1095000)
        uuidindex.uuidY = Math.floor(Math.random() * 9000 + 1760000)
        uuidindex.uuidId = i;

        uuidList.push(uuidindex)
      }
      EventBus.$emit("use-eventbus-uuidTest", uuidList)
    },

    //리스트 테스트용 주의해서 편집 
    sendTest() {

    },

    loginSession(){
          axios.post('http://158.181.17.81:8080/login',
            {
             id: this.idP,
             password: this.passP
           }
          ).then((response) => {
            console.log(response)
            if(this.idP=="" || this.passP==""){
              this.logintry="아이디 및 비밀번호가 잘못되었습니다.";
            } //null 일대 
            else if(response.data == '200'){
              this.connect()

              setTimeout(()=> { // Code here 
                this.closeModal()
                this.idP = ""
                this.passP = ""
                this.$session.set()
                this.message = "B$"
                this.sendMessage(this.message)
                this.loginCondition = true;
                this.message = "C$"
                this.sendMessage(this.message)
                this.logintry ="";
              //uuid 요청 프로토콜 
              }, 1000);
            this.$session.set('user_no', response.user_no)
            this.requestUUIDinterval();
             
            } else if(response.data == '1000'){
              this.logintry="아이디 및 비밀번호가 잘못되었습니다.";
            }
            else if(response.data == null){
              this.logintry="네트워크 통신 장애 잠시 후 다시 시도하세요.";
              
            }   
          },(err) =>{
            console.log('err', err)
            this.logintry="네트워크 통신 장애 잠시 후 다시 시도하세요.";
            
          })
        },

    //5분마다 UUID 요청
    requestUUIDinterval() {
      this.setintervalid = setInterval(function () {
        socket.send("C$");
        socket.onopen = () => {
          //ip변경시 문제점 해결
          socket.onmessage = ({
            data
          })
        }
      }, 300000);
    },

    apiSample(){
    $("#resultArea").html("");

    $.ajax({
        type: "GET",
        url: "http://map.ngii.go.kr/openapi/search.xml",
        data: {
            target:"poi",
            apikey:"iRZU9B0q0cc-Sli4OUVssw",
            onePageRows:"10",
            currentPage:"1",
            keyword:"국토지리정보원"
        },
        dataType : "jsonp",
        crossDomain:true,

        success: function(result) {
            var xmlData = jQuery.parseXML(result.xmlStr);
            var header = $(xmlData).find("header");
            var responseCode = header.find("responseCode").text();
            var responseMessage = header.find("responseMessage").text();

            if(responseCode!="0"&&responseCode!="100"){
                $("#resultArea").html(responseMessage);
            }else{
                var htmlStr = "";
                var poiArry = $(xmlData).find("contents").find("poi");
                if(poiArry.length==0){
                    $("#resultArea").html("검색결과가 없습니다.");
                }else{
                    htmlStr+="<table>";
                    for(var i=0;i<poiArry.length;i++){
                        htmlStr+="<tr>";
                        htmlStr+="<td>"+$(poiArry[i]).find("name").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("roadAdres").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("jibunAdres").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("zip").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("x").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("y").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("typeCode").text()+"</td>";
                        htmlStr+="<td>"+$(poiArry[i]).find("typeName").text()+"</td>";
                        htmlStr+="</tr>";
                    }
                    htmlStr+="</table>";
                    $("#resultArea").html(htmlStr);
                }
            }
          },
        error : function(xhr, ajaxSettings, thrownError){
        }
    });

    },

    setCookie( name, value, expiredays ){
    var todayDate = new Date();
    todayDate.setDate( todayDate.getDate() + expiredays );
    document.cookie = name + '=' + escape( value ) + '; path=/; expires=' + todayDate.toGMTString() + ';'
    },

    getCookie(name){ 
        var obj = name + "="; 
        var x = 0; 
        while ( x <= document.cookie.length ) 
        { 
            var y = (x+obj.length); 
            if ( document.cookie.substring( x, y ) == obj ) 
            { 
                if ((endOfCookie=document.cookie.indexOf( ";", y )) == -1 ) 
                    endOfCookie = document.cookie.length;
                return unescape( document.cookie.substring( y, endOfCookie ) ); 
            } 
            x = document.cookie.indexOf( " ", x ) + 1; 
            if ( x == 0 ) 
                break; 
        } 
        return ""; 
    },

    yourClose(key){
        if($("#todaycloseyn").prop("checked")){
            this.setCookie('divpop'+key, 'Y' , 1 );
        }
    }
    
  },
  beforeDestroy(){
    EventBus.$off('start:spinner');
    EventBus.$off('end:spinner');
  },

}
</script>

<style>
@import url(http://fonts.googleapis.com/earlyaccess/nanumgothic.css);
/*크롬등을 위한 구글 웹 폰트*/
body,div,dl,dt,dd,ul,ol,li,h1,h2,h3,h4,h5,h6,p,form,fieldset,input,th,
td {
  margin: 0;
  padding: 0;
  font-family: 'NanumGothic', '나눔고딕', 'NanumGothicWeb', '맑은 고딕', 'Malgun Gothic', Dotum, Verdana, AppleGothic, Sans-Serif;
  -webkit-text-size-adjust: none;
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
  min-width: 1100px;
}

.topGroup {
  background-color: #4e5175;
  padding: 15px;
}

.topGroup .tx1 {
  color: #ffffff;
  font-size: 16pt;
  display: inline-block;
  text-align: left;
  font-weight: bold;
}

.right {
  float: right;
}

.center {
  text-align: center;
}

.topMargin {
  margin-top: 18px;
}

.bodyBox {
  text-align: center;
  width: 100%;
}

.boxSet2 {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 2px 2px 7px 0px #e2e2e2;
  padding: 10px;
  height: 705px;
}

.boxSet {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 2px 2px 7px 0px #e2e2e2;
  padding: 10px;
}

.bodyTbl {
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;
  overflow: hidden;
  padding: 15px;
}

.bodyTbl tr td {
  vertical-align: top;
}

.boxTitle {
  color: #61709e;
  font-size: 14pt;
  text-align: left;
  padding-bottom: 7px;
  font-weight: bold;
}

.boxMap {
  width: 100%;
  height: 625px;
  border: 0px solid #dbdbe5;
}

.btnLogout input {
  padding: 10px 20px 10px 20px;
  margin-left: 2px;
  font-size: 12pt;
  color: #505050;
  font-weight: normal;
  background-color: #ffffff;
  border: none;
  border-radius: 20px;
  box-shadow: 0 0px #232d4b;
}

.btnLogout input:hover {
  background-color: #c4d3e2;
  cursor: pointer;
}

.btnLogout input:active,
.btnLogout input.active {
  background-color: #232d4b;
  box-shadow: 0 0px #232d4b;
  transform: translateY(1px);
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

.btnNormal input:hover {
  background-color: #3f4a6c;
  cursor: pointer;
}

.btnNormal input:active,
.btnNormal input.active {
  background-color: #3f4a6c;
  box-shadow: 0 0px #232d4b;
  transform: translateY(1px);
}

.alertTxt {
  background-color: #f5f1ea;
  height: 80px;
  width: 270px;
  text-align: center;
  vertical-align: middle;
  display: table-cell;
}

.alertTxt .txtDate {
  font-size: 14pt;
}

.alertTxt .txtTitle {
  font-size: 16pt;
  font-weight: 600;
  margin-top: 3px;
}

.boxPoint ul {
  list-style: none;
}

.boxPoint ul li {
  display: inline-block;
  padding: 5px;
}

.boxPoint ul .boxBlue {
  background-color: #ecf5f9;
  border: 1px solid #deecf2;
}

.boxPoint ul .blueTxt {
  color: #5d73c3;
  font-size: 12pt;
  padding: 0px 0 5px 0;
}

.boxGraph {
  background-color: #ecf5f9;
  border: 1px solid #deecf2;
  padding: 5px;
  height: 180px;
}

.txtCount {
  width: 120px;
  text-align: center;
  font-size: 20pt;
  color: #404146;
  font-weight: 600;
}

.txtCountBlue {
  width: 120px;
  text-align: center;
  font-size: 20pt;
  color: #006be6;
  font-weight: 600;
}

.txtCountRed {
  width: 120px;
  text-align: center;
  font-size: 20pt;
  color: #f47300;
  font-weight: 600;
}

.txtInputNormal {
  height: 32px;
  font-size: 12pt;
  border-style: none;
  border-radius: 5px;
  border: 1px solid #deecf2;
  font-family: 'NanumGothic', '나눔고딕', 'NanumGothicWeb', '맑은 고딕';
  padding-left: 5px;
  background-color: white;
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
  height: 100%;
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

.loginBox {
  text-align: center;
  padding-top: 30px;
  padding-bottom: 10px;
}

.loginTxt1 {
  color: #59627f;
  font-size: 26pt;
}

.loginTxt2 {
  color: #8792b3;
  font-size: 10pt;
  padding: 0px 0 15px 0;
}

.txtEtc {
  color: #e32a81;
  font-size: 11pt;
  padding: 5px 0 0 0;
}

.txtInputLogin {
  height: 40px;
  font-size: 13pt;
  border-style: none;
  border-radius: 5px;
  border: 1px solid #c4cbe1;
  font-family: 'NanumGothic', '나눔고딕', 'NanumGothicWeb', '맑은 고딕';
  padding-left: 5px;
  color: #022e56;
}

.txtInputLogin:focus {
  border: 1px solid #6b7db5;
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
  height: 100%;
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

.sweet-modal.is-visible {
  transform: translate(-50%, -50%);
  width: auto;
  opacity: 1;
}

.sweet-modal {
  max-width: 1000px;

}

.sweet-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9001;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  background: rgb(130 130 130 / 90%);
  opacity: 0;
  transition: opacity;
  transform: translate3D(0, 0, 0);
}
.sweet-modal-theme-light-has-title-has-content-has-icon-is-mobile-fullscreen-is-visible-is-alert{
  height: 300px;
}
</style>

