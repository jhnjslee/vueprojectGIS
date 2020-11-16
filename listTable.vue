<template>
  <div class="bodybox">
    <div class="boxSet">
      <div class="fix-container-allborder" style="width:100%;height:120px;">
        <div class="header-bg"></div>
        <div class="table-wrapper">
          <table class="tablefix" style="table-layout:fixed;">
            <thead>
              <tr>
                <th style="width:8%;">
                  <div class="th-text">재난ID</div>
                </th>
                <th style="width:10%;">
                  <div class="th-text">재난발생일시</div>
                </th>
                <th style="width:6%;">
                  <div class="th-text">재난종류</div>
                </th>
                <th style="width:5%;">
                  <div class="th-text">재난단계</div>
                </th>
                <th style="width:10%;">
                  <div class="th-text">위도</div>
                </th>
                <th style="width:10%;">
                  <div class="th-text">경도</div>
                </th>
                <th style="width:8%;">
                  <div class="th-text">발신자(명)</div>
                </th>
                <th style="width:8%;">
                  <div class="th-text">수신 성공(명)</div>
                </th>
                <th style="width:8%;">
                  <div class="th-text">수신 실패(명)</div>
                </th>
                <th style="width:8%;">
                  <div class="th-text">수신률</div>
                </th>
                <th style="width:8%;">
                  <div class="th-text">전송상태</div>
                </th>
                <th style="width:10%">
                  <div class="th-text">자세히</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(info,index) in calamityList2" :key="index">
                <td class="txcenter">{{info.number}}</td>
                <td class="txcenter">{{info.calday}}</td>
                <td class="txcenter">{{info.calType}}</td>
                <td class="txcenter">{{info.calLev}}</td>
                <td class="txcenter">{{info.callat}}</td>
                <td class="txcenter">{{info.callon}}</td>
                <td class="txcenter">{{info.sendall}}</td> <!--발신자 정보 --> 
                <td class="txcenter">{{info.success}}</td>
                <td class="txcenter">{{info.fail}}</td>
                <td class="txcenter">{{info.rate}}%</td>
                  <td v-if="info.calamity_state=='수신완료'" class="txcenter">전송</td> <!--전송 상태값-->
                  <td v-if="info.calamity_state != '수신완료'" class="txcenter">{{info.calamity_state}}</td> <!--전송 상태값-->
                <td class="txcenter">
                  <v-btn height="25px" @click="onButtonClick(index)">
                    조회
                  </v-btn>
                </td>
              </tr>
              <SweetModal height="80%" width="52%" ref="modal" modal-theme="light" overlay-theme="dark" style="padding-top: 10px; padding-bottom: 10px;">
               <div class="popTitle" style="background-color: white;"><span style="color: black;">선택 재난 상세 정보</span></div>
                <div class="modal-content">
                  <div class="modal-body">
                    <table style="width:100%">
                      <tr>
                        <td align="left" width="50%">
                          <h3>재난 위치</h3>
                          <div id="map2" style="width: 600px; height: 300px; " class="map"></div>
                        </td>

                        <td align="left" width="100px">
                          <h3>재난 정보</h3>
                          <div background-color: lightblue>
                          <p> 재난ID :{{calnumb}}</p>
                          <p> 재난 전송 상태 : {{calshowstate}}
                          <p> 위도 : {{callat2}}</p>
                          <p> 경도 : {{callon2}}</p>
                          <p> 단계 : {{callev2}}</p>
                          <p> 재난 종류 : {{calType2}}</p>
                          <p> 재난 발생 일시 : {{calDate2}}</p>
                          <p> 재난 범위 : {{calrange2}}m</p>
                          <p> 문안 : {{calType2}}가 발생하였습니다.</p>
                          <p> 수신 성공 : {{success2}}명 </p>
                          <p> 수신 실패 : {{fail2}}명</p>
                          <p> 수신률 : {{rate2}}%</p>
                          <p> 문안 :  <v-btn height="25px" @click="checkmessage">자세히 보기</v-btn></p>
                          </div>

                      
                        </td>
                      </tr>
                      
                      <tr>
                        <td align="center" colspan="2">
                        <input type="radio" id="two" value="Two" v-model="picked">
                        <label for="two">세그먼트 리스트 </label>
                        
                        <input type="radio" id="one" value="One" v-model="picked" style="margin-left: 15px;">
                        <label for="one">발송 대상자 리스트</label>
                         <br> 
                        </td>
                      </tr>
                      <tr>
                        <td  v-if="this.picked=='One'" colspan="2">
                          <h3>재난 대상자 리스트</h3>
                          <div class="fix-container-allborder" style="width:100%;height:300px;">
                            <div class="header-bg"></div>
                            <div class="table-wrapper">
                              <table class="tablefix" style="table-layout:fixed;">
                                <thead>
                                  <tr>
                                    <!-- <th style="width:10%;">
                                      <div class="th-text">선택</div>
                                    </th> -->
                                    <th style="width:35%;">
                                        <div class="th-text">대상자 UUID</div>
                                    </th>
                                    <th style="width:50%;">
                                        <div class="th-text">세그먼트 ID</div>
                                    </th>
                                    <th style="width:15%;">
                                        <div class="th-text"> 전송상태</div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(info2,index) in uuidshowList2"  :key="index" name="selectList" > 
                                      <!-- <td class="txcenter" v-if="info2.calNum==calnumb"><input type="checkbox" name="select" v-bind:value="info2.uuid" v-model="checkedlist"></td> -->
                                      <td class="txcenter" v-if="info2.calNum==calnumb">{{info2.uuid}}</td>
                                      <td class="txcenter" v-if="info2.calNum==calnumb">{{info2.segmentId}}</td>
                                      <td class="txcenter" v-if="info2.calNum==calnumb">{{info2.messagestate}}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        <tr style="float: right;">
                      <td>
                      <span class="btnNormal">
                        <!-- <input type="button" @click="allcheck" value="전체 선택" style="width: 120px;height: 45px;"/> -->
                      </span>
                      <span class="btnPopGreen">
                        <!-- <input type="button" @click="openResend" value="선택 인원 문안 발송" /> -->
                      </span>
                      </td>
                        </tr>
                      </td>
                        <td  v-if="this.picked=='Two'" align="center" colspan="2">
                          <h3>재난 세그먼트 리스트</h3>
                          <div class="fix-container-allborder" style="width:100%;height:300px;">
                            <div class="header-bg"></div>
                            <div class="table-wrapper">
                              <table class="tablefix" style="table-layout:fixed;">
                                <thead>
                                  <tr>
                                    <th style="width:33%;">
                                      <div class="th-text">세그먼트 ID</div>
                                    </th>
                                    <th style="width:33%;">
                                      <div class="th-text">해당 인원 수</div>
                                    </th>
                                    <th style="width:33%;">
                                      <div class="th-text"> 수신률</div>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(info2,index) in segmentshowarray" :key="index" >
                                      <td class="txcenter" v-if="info2.uuidcount!=0">{{info2.segmentId}}</td>
                                      <td class="txcenter" v-if="info2.uuidcount!=0">{{info2.uuidcount}}명</td>
                                      <td class="txcenter" v-if="info2.uuidcount!=0">{{info2.messagerate}}%</td>
                                  </tr>
                                </tbody> 
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </SweetModal>
            </tbody>
          </table>
          
          <SweetModal ref="checkmessage" title="문안 확인">
            <p v-html="calmessage2" style="text-align: left;"><p>
                            <div style="float:right;padding:10px 10px 0 0;">
                              <span class="btnPop">
                                <input type="button" @click="closeModal" value="닫기" /></span>
                            </div>
          </SweetModal>

          <SweetModal ref="resendmessage" title="재발신">
                            <p style="margin-bottom: 20px;">해당 인원들에게 문안을 재 발송하시겠습니까?</p>
                            <div style="padding:10px 0px 0 0;">
                              <span class="btnPopRed"><input type="button" @click="closeResend" value="닫기" style="margin-right: 5px;"/></span>
                              <span class="btnPopGreen"><input type="button" @click="resendlist" value="재발신" /></span>
                            </div>
          </SweetModal>
          <SweetModal icon="success" ref="success" title="성공">
            발신 대상자 전송 성공
          </SweetModal>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import {EventBus} from "./event-bus";
import mapprograming from "./Map2"
import { SweetModal, SweetModalTab } from 'sweet-modal-vue'

let  map ='';
let vectorLayer = "";
let count = 0;
let allchecked = false;

  export default {
    data () {
      return {
          picked : "",
          count : 1,
          standard_style: {
          strokeColor: 'red',
          strokeOpacity: 1,
          strokeWidth: 3,
          fillOpacity: 0.4,
          fillColor: "red"
        },
        orange_style: {
          strokeColor: 'orange',
          strokeOpacity: 1,
          strokeWidth: 3,
          fillOpacity: 0.4,
          fillColor: "orange"
        },
        yellow_style: {
          strokeColor: 'yellow',
          strokeOpacity: 1,
          strokeWidth: 3,
          fillOpacity: 0.4,
          fillColor: "yellow"
        },
        blue_style: {
          strokeColor: 'blue',
          strokeOpacity: 1,
          strokeWidth: 3,
          fillOpacity: 0.4,
          fillColor: "blue"
        },
        headers: [
          {
            text: '번호',
            align: 'start',
            sortable: false,
            value: 'number',
          },
          { text: '재난발생일시', value: 'calday' ,align:'center' },
          { text: '재난종류', value: 'calType' },
          { text: '위험단계', value: 'calLev' },
          { text: '위도', value: 'callat' },
          { text: '경도', value: 'callon' }, 
          { text: '수신완료', value: 'success' },
          { text: '미수신', value: 'fail' },
          { text: '수신률', value: 'rate'}
        ],
        calnumb :"",
        callat2 :0,
        callon2 :0,
        callev2 : "",
        calType2: "",
        calDate2:"",
        calrange2:"",
        calSendState : "",
        calmessage2: "",
        success2:"",
        fail2:"",
        rate2:0,
        calshowstate:"",
        calamityList2 : [],
        uuidshowList2: [],
        segmentList2: [],
        segmentshowarray : [],
        checkedlist:[],
        fail3 :"",
        calmessage3 :""
      }
    }, 
  components: {
    SweetModal,
    SweetModalTab
  },created(){
    
      EventBus.$on('use-eventbus-calamityList', calamityList => {
      this.calamityList2.splice(0);

      this.calamityList2=calamityList;
      // this.calamityList2.callat = this.calamityList2.callat.toFixed(4)
      // this.calamityList2.callon = this.calamityList2.callon.toFixed(4)
      
      for(var i = 0; i<this.calamityList2.length;i++){
        
        this.calamityList2[i].callon = (this.calamityList2[i].callon*1).toFixed(4)
        this.calamityList2[i].callat = (this.calamityList2[i].callat*1).toFixed(4)
        this.calamityList2[i].callon = this.calamityList2[i].callon+""
        this.calamityList2[i].callat = this.calamityList2[i].callat+""
      }
       })},
    mounted(){
      map =  new ngii_wmts.map("map2");
    },

  methods:{
    onButtonClick(index){
      
      this.picked = [];
      var checkvalue = document.getElementsByName("select")
      allchecked=false;
      this.checkedlist=[];
      this.segmentshowarray=[];

      for(var i = 0;i<checkvalue.length;i++){
        checkvalue[i].checked = false; 
      }

      this.$refs.modal.open();
      if (count != 0) {
				vectorLayer.removeAllFeatures();
      }
      this.calnumb = this.calamityList2[index].number;
      this.callat2 = this.calamityList2[index].callat;
      this.callon2 = this.calamityList2[index].callon;
      this.callev2 = this.calamityList2[index].calLev;
      this.calType2 = this.calamityList2[index].calType;
      this.calDate2 = this.calamityList2[index].calday;
      this.calrange2 = this.calamityList2[index].dangerRange;
      this.calmessage2 = this.calamityList2[index].calamitymessage;
      this.success2 = this.calamityList2[index].success; 
      this.fail2 = this.calamityList2[index].fail;
    
      this.calshowstate = this.calamityList2[index].calamity_state;
      
      this.rate2 = (Math.round((this.success2 / (this.success2 + this.fail2))*100)).toFixed(1);
      if(isNaN((Math.round((this.success2 / (this.success2 + this.fail2))*100)).toFixed(1))){
        this.rate2 = 0; 
      }  
      this.uuidshowList2 = this.calamityList2[index].uuidlists; 
      this.segmentList2 = this.calamityList2[index].segmentlist;
      
      
      for(var i =0; i < this.segmentList2.length;i++){
      if (i==0){


        var segmentshowindex = {
          segmentId :'',
          calnum : '',
          messagerate : 0,
          uuidcount : 0
        }
        
        segmentshowindex.calnum = this.segmentList2[i].calId;
        segmentshowindex.segmentId = this.segmentList2[i].pri;
        var success=0;
        var fail =0;
        for(var j =0; j < this.uuidshowList2.length;j++){
          if( segmentshowindex.calnum ==this.calnumb && // 전체 세그먼트 리스트에서 재난번호와 누른 재난이 같은경우
           this.segmentList2[i].pri==this.uuidshowList2[j].segmentId){ 

              segmentshowindex.uuidcount++
          
              if(this.uuidshowList2[j].messagestate=="수신완료"){
                success++
              }
              else if(this.uuidshowList2[j].messagestate=="미수신"){
                fail++
              }
            }
            segmentshowindex.messagerate = ((success/(success+fail)*100)).toFixed(1)
            if(isNaN(segmentshowindex.messagerate)){
              segmentshowindex.messagerate = 0;
            }
          }
          this.segmentshowarray.push(segmentshowindex)
      }
      else if( i>0 && this.segmentList2[i].pri != this.segmentList2[i-1].pri){



        var segmentshowindex = {
          segmentId :'',
          calnum : '',
          messagerate : 0,
          uuidcount : 0
        }
        
        segmentshowindex.calnum = this.segmentList2[i].calId;
        segmentshowindex.segmentId = this.segmentList2[i].pri;
        var success=0;
        var fail =0;
        for(var j =0; j < this.uuidshowList2.length;j++){
          if( segmentshowindex.calnum ==this.calnumb && // 전체 세그먼트 리스트에서 재난번호와 누른 재난이 같은경우
           this.segmentList2[i].pri==this.uuidshowList2[j].segmentId){ 

              segmentshowindex.uuidcount++
          
              if(this.uuidshowList2[j].messagestate=="수신완료"){
                success++
              }
              else if(this.uuidshowList2[j].messagestate=="미수신"){
                fail++
              }
            }
            segmentshowindex.messagerate = ((success/(success+fail)*100)).toFixed(1)
            if(isNaN(segmentshowindex.messagerate)){
              segmentshowindex.messagerate = 0;
            }
          }
          this.segmentshowarray.push(segmentshowindex)
      }
    }

        switch (this.calamityList2[index].calLev) {
				case "심각":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.standard_style
						)
					});
					break;
				case "경계":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.orange_style
						)
					});
					break;
				case "주의":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.yellow_style
						)
					});
					break;
				case "관심":
					vectorLayer = new OpenLayers.Layer.Vector("Overlay", {
						styleMap: new OpenLayers.StyleMap(
							this.blue_style
						)
					});
					break;
      } 
      
      var stringX=Number(this.calamityList2[index].callat)
      var stringY=Number(this.calamityList2[index].callon)
      var wgs84 = proj4('EPSG:4326','EPSG:5179', [stringX,stringY]);
      var pointX = wgs84[0]
      var pointY = wgs84[1]

      var ristrictX = pointX;
      var ristrictX2 = pointX;
      var ristrictY = pointY;
      var ristrictY2 = pointY;
      var ristrictString = ristrictX+","+ristrictY+","+ristrictX2+","+ristrictY2
      
      map.setOptions({
        restrictedExtent :OpenLayers.Bounds.fromString(ristrictString),
        zoom : 7
        });

      var point = new OpenLayers.Geometry.Point(pointX, pointY); 
			var mainCircle = OpenLayers.Geometry.Polygon.createRegularPolygon(point,this.calamityList2[index].dangerRange, 36, 0);
      var mainFeature = new OpenLayers.Feature.Vector(mainCircle);

			vectorLayer.addFeatures(mainFeature)      
      map.addLayer(vectorLayer);
      var pointZoom = new OpenLayers.LonLat(pointX, pointY)
      map.setCenter(pointZoom,1)
      count++;
    }, 
    checkmessage(){
      this.$refs.checkmessage.open();
    },
    closeModal(){
      this.$refs.checkmessage.close();
    },
    openResend(){
      if(this.checkedlist.length != 0){
      this.$refs.resendmessage.open();
      }
    },
    closeResend(){
      this.$refs.resendmessage.close();
    },

    //F랑 똑같이 
    resendlist(){
      var resendmessage ={
        eventId : "",
        dangerMessage : "",
        uuidList : []
      }
      resendmessage.eventId = this.calnumb;
      resendmessage.dangerMessage = this.calmessage2;
      resendmessage.uuidList   = this.checkedlist;
      console.log(resendmessage)
      
        this.$emit('resend-event', resendmessage)
        this.$refs.resendmessage.close();
        this.$refs.success.open();
        this.$refs.modal.close();
        this.calmessage2 = ""
        this.checkedlist = []
    },

    // resendlist(){
    //   var resendmessage ={
    //     resendlist : [],
    //     message : ""
    //   }

    //   resendmessage.message = this.calmessage2;
    //   resendmessage.resendlist = this.checkedlist;
    //   console.log(resendmessage)
      
    //     this.$emit('resend-event', resendmessage)
    //     this.$refs.resendmessage.close();
    //     this.$refs.success.open();
    //     this.$refs.modal.close();
    //     this.calmessage2 = ""
    //     this.checkedlist = []
    //   //여기서 보내고 리스트 갱신 해줘야함 
    // },
    
    allcheck(flag){
      var checkvalue = document.getElementsByName("select")
      if (allchecked==false){
        this.checkedlist=[];
        for(var i = 0;i<checkvalue.length;i++){
          checkvalue[i].checked = true; 
          this.checkedlist.push(checkvalue[i].defaultValue)
        }
        allchecked = true;
      }
      else{
        this.checkedlist=[];
        for(var i = 0;i<checkvalue.length;i++){
          checkvalue[i].checked = false; 
        }
        allchecked=false;
      }
    }
  },
}
</script>

<style>

#div.container{
  line-height: 50%;
}
#div.header{
clear:left
}
#div.footer{
clear:left
}
#div.left{
  float:left
}
#map2 {
    width:100%;
    height:500px;
}
.sweet-modal.is-alert .sweet-content {
    display: block;
    text-align: center;
    font-size: 16px;
    padding-top: 16px;
    padding-bottom: 16px;
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
</style>